import {
  Injectable,
  Inject,
  forwardRef,
  ForbiddenException
} from '@nestjs/common';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { QueueEventService, EntityNotFoundException } from 'src/kernel';
import { UserDto } from 'src/modules/user/dtos';
import { FileDto } from 'src/modules/file';
import { FileService } from 'src/modules/file/services';
import { UserService } from 'src/modules/user/services';
import {
  PerformerBlockSettingService,
  PerformerService
} from 'src/modules/performer/services';
import { FavouriteService } from 'src/modules/favourite/services';
import { PerformerDto } from 'src/modules/performer/dtos';
import { uniq } from 'lodash';
import { Request } from 'express';
import { ROLE } from 'src/kernel/constants';
import { MessageModel, IRecipient } from '../models';
import { MESSAGE_MODEL_PROVIDER } from '../providers/message.provider';
import { MessageCreatePayload } from '../payloads/message-create.payload';
import {
  MESSAGE_PRIVATE_STREAM_CHANNEL,
  MESSAGE_CHANNEL,
  MESSAGE_EVENT,
  CONVERSATION_TYPE
} from '../constants';
import { MessageDto } from '../dtos';
import { ConversationService } from './conversation.service';
import { MessageListRequest } from '../payloads/message-list.payload';

@Injectable()
export class MessageService {
  constructor(
    @Inject(forwardRef(() => PerformerService))
    private readonly performerService: PerformerService,
    private readonly conversationService: ConversationService,
    @Inject(MESSAGE_MODEL_PROVIDER)
    private readonly messageModel: Model<MessageModel>,
    private readonly queueEventService: QueueEventService,
    @Inject(forwardRef(() => FileService))
    private readonly fileService: FileService,
    private readonly userService: UserService,
    private readonly favouriteService: FavouriteService,
    private readonly performerBlockSettingService: PerformerBlockSettingService
  ) {}

  public async createStreamMessageFromConversation(
    conversationId: string | ObjectId,
    payload: MessageCreatePayload,
    sender: IRecipient,
    user: UserDto | PerformerDto,
    req?: Request
  ) {
    const conversation = await this.conversationService.findById(
      conversationId
    );

    if (!conversation) {
      throw new EntityNotFoundException();
    }

    const found = conversation.recipients.find(
      recipient => recipient.sourceId.toString() === sender.sourceId.toString()
    );
    if (!found) {
      throw new EntityNotFoundException();
    }

    if (sender.source === 'user') {
      const { performerId } = conversation;
      const blocked = await this.performerBlockSettingService.checkBlockByPerformerId(
        performerId,
        sender.sourceId,
        req
      );
      if (blocked) {
        throw new ForbiddenException();
      }
    }

    const message = await this.messageModel.create({
      ...payload,
      senderId: sender.sourceId,
      senderSource: sender.source,
      conversationId: conversation._id
    });
    await message.save();

    const dto = new MessageDto(message);
    dto.senderInfo = user.toResponse();
    await this.queueEventService.publish({
      channel: MESSAGE_PRIVATE_STREAM_CHANNEL,
      eventName: MESSAGE_EVENT.CREATED,
      data: dto
    });
    return dto;
  }

  public async createPublicStreamMessageFromConversation(
    conversationId: string | ObjectId,
    payload: MessageCreatePayload,
    sender: IRecipient,
    user: UserDto | PerformerDto,
    req?: Request
  ) {
    const conversation = await this.conversationService.findById(
      conversationId
    );
    if (!conversation) {
      throw new EntityNotFoundException();
    }

    if (sender.source === 'user') {
      const { performerId } = conversation;
      const blocked = await this.performerBlockSettingService.checkBlockByPerformerId(
        performerId,
        sender.sourceId,
        req
      );
      if (blocked) {
        throw new ForbiddenException();
      }
    }

    const message = await this.messageModel.create({
      ...payload,
      senderId: sender.sourceId,
      senderSource: sender.source,
      conversationId: conversation._id
    });
    await message.save();

    const dto = new MessageDto(message);
    dto.senderInfo = user.toResponse();
    await this.queueEventService.publish({
      channel: MESSAGE_PRIVATE_STREAM_CHANNEL,
      eventName: MESSAGE_EVENT.CREATED,
      data: dto
    });
    return dto;
  }

  public async createPrivateFileMessage(
    sender: IRecipient,
    recipient: IRecipient,
    file: FileDto,
    payload: MessageCreatePayload,
    req?: any
  ): Promise<MessageDto> {
    const conversation = await this.conversationService.createPrivateConversation(
      sender,
      recipient
    );
    if (!file) throw new Error('File is valid!');
    if (!file.isImage()) {
      await this.fileService.removeIfNotHaveRef(file._id);
      throw new Error('Invalid image!');
    }

    if (sender.source === 'user') {
      const { performerId } = conversation;
      const blocked = await this.performerBlockSettingService.checkBlockByPerformerId(
        performerId,
        sender.sourceId,
        req
      );
      if (blocked) {
        throw new ForbiddenException();
      }
    }

    const message = await this.messageModel.create({
      ...payload,
      type: 'photo',
      senderId: sender.sourceId,
      fileId: file._id,
      senderSource: sender.source,
      conversationId: conversation._id
    });
    await message.save();

    const dto = new MessageDto(message);
    dto.imageUrl = file.getUrl();
    await this.queueEventService.publish({
      channel: MESSAGE_CHANNEL,
      eventName: MESSAGE_EVENT.CREATED,
      data: dto
    });
    return dto;
  }

  public async loadMessages(req: MessageListRequest, user: UserDto) {
    const conversation = await this.conversationService.findById(
      req.conversationId
    );
    if (!conversation) {
      throw new EntityNotFoundException();
    }

    const found = conversation.recipients.find(
      recipient => recipient.sourceId.toString() === user._id.toString()
    );
    if (!found) {
      throw new EntityNotFoundException();
    }

    const query = { conversationId: conversation._id };
    const sort = {
      [req.sortBy || 'updatedAt']: req.sort
    };
    const [data, total] = await Promise.all([
      this.messageModel
        .find(query)
        .sort(sort)
        .lean()
        .limit(parseInt(req.limit as string, 10))
        .skip(parseInt(req.offset as string, 10)),
      this.messageModel.countDocuments(query)
    ]);

    const fileIds = uniq(data.map(d => d.fileId));
    const userIds = [];
    const performerIds = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const d of data) {
      if (d.senderSource === ROLE.PERFORMER) {
        performerIds.push(d.senderId);
      }
      if (d.senderSource === ROLE.USER) {
        userIds.push(d.senderId);
      }
    }

    const files = await this.fileService.findByIds(fileIds);
    const [users, performers] = await Promise.all([
      userIds.length ? this.userService.findByIds(uniq(userIds)) : [],
      performerIds.length
        ? this.performerService.findByIds(uniq(performerIds))
        : []
    ]);
    const messages = data.map(message => {
      const file =
        message.fileId &&
        files.find(f => f._id.toString() === message.fileId.toString());

      const senderInfo =
        message.senderId &&
        (message.senderSource === ROLE.PERFORMER
          ? new PerformerDto(performers.find(performer => performer._id.equals(message.senderId))).toSearchResponse()
          : new UserDto(users.find(u => u._id.equals(message.senderId))).toResponse());

      return {
        ...message,
        imageUrl: file && file.getUrl(),
        senderInfo
      };
    });

    return {
      data: messages.map(m => new MessageDto(m)),
      total
    };
  }

  public async loadPublicMessages(req: MessageListRequest) {
    const conversation = await this.conversationService.findById(
      req.conversationId
    );
    if (!conversation) {
      throw new EntityNotFoundException();
    }

    const sort = {
      [req.sortBy || 'updatedAt']: req.sort
    };

    const query = { conversationId: conversation._id };
    const [data, total] = await Promise.all([
      this.messageModel
        .find(query)
        .sort(sort)
        .lean()
        .limit(parseInt(req.limit as string, 10))
        .skip(parseInt(req.offset as string, 10)),
      this.messageModel.countDocuments(query)
    ]);

    const senderIds = data.map(d => d.senderId);
    const [users, performers] = await Promise.all([
      senderIds.length ? this.userService.findByIds(senderIds) : [],
      senderIds.length ? this.performerService.findByIds(senderIds) : []
    ]);

    const messages = data.map(message => {
      let user = null;
      user = users.find(u => u._id.toString() === message.senderId.toString());
      if (!user) {
        user = performers.find(
          p => p._id.toString() === message.senderId.toString()
        );
      }

      return {
        ...message,
        senderInfo:
          user && user.roles && user.roles.includes('user')
            ? new UserDto(user).toResponse()
            : new PerformerDto(user).toResponse()
      };
    });

    return {
      data: messages.map(m => new MessageDto(m)),
      total
    };
  }

  public async createPrivateMessageFromConversation(
    conversationId: string | ObjectId,
    payload: MessageCreatePayload,
    sender: IRecipient,
    req?: any
  ) {
    const conversation = await this.conversationService.findById(
      conversationId
    );
    if (!conversation) {
      throw new EntityNotFoundException();
    }

    const found = conversation.recipients.find(
      recipient => recipient.sourceId.toString() === sender.sourceId.toString()
    );
    if (!found) {
      throw new EntityNotFoundException();
    }

    if (sender.source === 'user') {
      const { performerId } = conversation;
      const blocked = await this.performerBlockSettingService.checkBlockByPerformerId(
        performerId,
        sender.sourceId,
        req
      );
      if (blocked) {
        throw new ForbiddenException();
      }
    }

    const message = await this.messageModel.create({
      ...payload,
      senderId: sender.sourceId,
      senderSource: sender.source,
      conversationId: conversation._id
    });
    await message.save();

    const dto = new MessageDto(message);
    await this.queueEventService.publish({
      channel: MESSAGE_CHANNEL,
      eventName: MESSAGE_EVENT.CREATED,
      data: dto
    });
    return dto;
  }

  public async sendMessageToAllFollowers(
    performerId: string | ObjectId,
    payload: MessageCreatePayload
  ) {
    const followerIds = await this.favouriteService.getAllFollowerIdsByPerformerId(
      performerId
    );
    if (!followerIds.length) {
      return false;
    }
    const sender: IRecipient = {
      source: 'performer',
      sourceId: performerId
    };
    const conversations = await Promise.all(
      followerIds.map(id =>
        this.conversationService.findOne({
          type: CONVERSATION_TYPE.PRIVATE,
          recipients: {
            $all: [
              {
                source: 'user',
                sourceId: id
              },
              sender
            ]
          }
        })
      )
    );

    const newFolowerIds = followerIds.filter(
      (_, index) => !conversations[index]
    );
    const newConversations = await Promise.all(
      newFolowerIds.map(id =>
        this.conversationService.createPrivateConversation(
          { sourceId: performerId, source: 'performer' },
          { sourceId: id, source: 'user' }
        )
      )
    );
    await Promise.all(
      [...newConversations, ...conversations].map(
        conversation =>
          conversation &&
          this.createPrivateMessageFromConversation(
            conversation._id,
            payload,
            sender
          )
      )
    );
    return true;
  }

  public async deleteMessage(messageId: string, user: UserDto) {
    const message = await this.messageModel.findById(messageId);
    if (!message) {
      throw new EntityNotFoundException();
    }
    if (
      user.roles &&
      !user.roles.includes('admin') &&
      message.senderId.toString() !== user._id.toString()
    ) {
      throw new ForbiddenException();
    }
    await message.remove();
    // Emit event to user
    await this.queueEventService.publish({
      channel: MESSAGE_PRIVATE_STREAM_CHANNEL,
      eventName: MESSAGE_EVENT.DELETED,
      data: new MessageDto(message)
    });
    return message;
  }

  public async deleteAllMessageInConversation(
    conversationId: string,
    user: UserDto
  ) {
    const conversation = await this.conversationService.findById(
      conversationId
    );
    if (!conversation) {
      throw new EntityNotFoundException();
    }
    if (
      user.roles &&
      !user.roles.includes('admin') &&
      conversation.performerId.toString() !== user._id.toString()
    ) {
      throw new ForbiddenException();
    }
    await this.messageModel.deleteMany({ conversationId: conversation._id });
    return { success: true };
  }
}
