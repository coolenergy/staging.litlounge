import {
  Injectable,
  Inject,
  forwardRef,
  NotFoundException
} from '@nestjs/common';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { toObjectId } from 'src/kernel/helpers/string.helper';
import { UserService, UserSearchService } from 'src/modules/user/services';
import {
  PerformerService,
  PerformerSearchService
} from 'src/modules/performer/services';
import { UserDto } from 'src/modules/user/dtos';
import { PerformerDto } from 'src/modules/performer/dtos';
import { StreamDto } from 'src/modules/stream/dtos';
import { EntityNotFoundException, PageableData } from 'src/kernel';
import { ConversationSearchPayload } from '../payloads';
import { ConversationDto } from '../dtos';
import { CONVERSATION_TYPE } from '../constants';
import { ConversationModel, NotificationMessageModel } from '../models';
import {
  CONVERSATION_MODEL_PROVIDER,
  NOTIFICATION_MESSAGE_MODEL_PROVIDER
} from '../providers';

export interface IRecipient {
  source: string;
  sourceId: ObjectId | string;
}

@Injectable()
export class ConversationService {
  constructor(
    @Inject(CONVERSATION_MODEL_PROVIDER)
    private readonly conversationModel: Model<ConversationModel>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => UserSearchService))
    private readonly userSearchService: UserSearchService,
    @Inject(forwardRef(() => PerformerSearchService))
    private readonly performerSearchService: PerformerSearchService,
    @Inject(forwardRef(() => PerformerService))
    private readonly performerService: PerformerService,
    @Inject(NOTIFICATION_MESSAGE_MODEL_PROVIDER)
    private readonly notiticationMessageModel: Model<NotificationMessageModel>
  ) {}

  public async find(params: any): Promise<ConversationModel[]> {
    return this.conversationModel.find(params);
  }

  public async findOne(params: any): Promise<ConversationModel> {
    return this.conversationModel.findOne(params);
  }

  public async createPrivateConversation(
    sender: IRecipient,
    receiver: IRecipient
  ): Promise<ConversationDto> {
    let conversation = await this.conversationModel
      .findOne({
        type: CONVERSATION_TYPE.PRIVATE,
        recipients: {
          $all: [
            {
              source: sender.source,
              sourceId: toObjectId(sender.sourceId)
            },
            {
              source: receiver.source,
              sourceId: receiver.sourceId
            }
          ]
        }
      })
      .lean()
      .exec();
    if (!conversation) {
      conversation = await this.conversationModel.create({
        type: CONVERSATION_TYPE.PRIVATE,
        recipients: [sender, receiver],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // TODO - define DTO?
    const dto = new ConversationDto(conversation);
    dto.totalNotSeenMessages = 0;
    if (receiver.source === 'performer') {
      const per = await this.performerService.findById(receiver.sourceId);
      if (per) {
        dto.recipientInfo = new PerformerDto(per).toResponse(false);
      }
    }
    if (receiver.source === 'user') {
      const user = await this.userService.findById(receiver.sourceId);
      if (user) dto.recipientInfo = new UserDto(user).toResponse(false);
    }
    return dto;
  }

  // get all the list
  public async getList(
    req: ConversationSearchPayload,
    sender: IRecipient
  ): Promise<PageableData<any>> {
    let query = {
      recipients: {
        $elemMatch: {
          source: sender.source,
          sourceId: toObjectId(sender.sourceId)
        }
      }
    } as any;
    if (req.keyword) {
      let usersSearch = null;
      if (sender.source === 'user') {
        usersSearch = await this.performerSearchService.searchByKeyword({
          q: req.keyword
        });
      }
      if (sender.source === 'performer') {
        usersSearch = await this.userSearchService.searchByKeyword({
          q: req.keyword
        });
      }
      const Ids = usersSearch && usersSearch ? usersSearch.map(u => u._id) : [];
      query = {
        $and: [
          {
            recipients: {
              $elemMatch: {
                source: sender.source === 'user' ? 'performer' : 'user',
                sourceId: { $in: Ids }
              }
            }
          },
          {
            recipients: {
              $elemMatch: {
                source: sender.source,
                sourceId: toObjectId(sender.sourceId)
              }
            }
          }
        ]
      };
    }
    if (req.type) {
      query.type = req.type;
    }
    const [data, total] = await Promise.all([
      this.conversationModel
        .find(query)
        .lean()
        .sort({ lastMessageCreatedAt: -1, updatedAt: -1 }),
      this.conversationModel.countDocuments(query)
    ]);

    // find recipient info
    const recipientIds = data.map(c => {
      const re = c.recipients.find(
        rep => rep.sourceId.toString() !== sender.sourceId.toString()
      );
      return re && re.sourceId;
    });
    const conversationIds = data.map(d => d._id);
    let users = [];
    let performers = [];
    const notifications = conversationIds.length
      ? await this.notiticationMessageModel.find({
          conversationId: { $in: conversationIds }
        })
      : [];
    if (sender.source === 'user') {
      performers = recipientIds.length
        ? await this.performerService.findByIds(recipientIds)
        : [];
    }
    if (sender.source === 'performer') {
      users = recipientIds.length
        ? await this.userService.findByIds(recipientIds)
        : [];
    }

    const conversations = data.map(d => {
      const conversation = new ConversationDto(d);
      const recipient = conversation.recipients.find(
        rep => rep.sourceId.toString() !== sender.sourceId.toString()
      );
      let recipientInfo = null;
      if (recipient) {
        if (users.length) {
          recipientInfo = new UserDto(users.find(
            u => u._id.toString() === recipient.sourceId.toString()
          )).toResponse();
        }
        if (performers.length) {
          recipientInfo = new PerformerDto(performers.find(
            p => p._id.toString() === recipient.sourceId.toString()
          )).toSearchResponse();
        }

        const conversationNotifications =
          notifications.length &&
          notifications.filter(
            noti =>
              noti.conversationId.toString() === conversation._id.toString()
          );

        const recipientNoti =
          conversationNotifications &&
          conversationNotifications.find(
            c => c.recipientId.toString() === sender.sourceId.toString()
          );

        return {
          ...conversation,
          recipientInfo,
          totalNotSeenMessages: recipientNoti
            ? recipientNoti.totalNotReadMessage
            : 0
        };
      }
      return conversation;
    });

    return {
      data: conversations,
      total
    };
  }

  public async findById(id: string | ObjectId) {
    return this.conversationModel
      .findOne({
        // type: CONVERSATION_TYPE.PRIVATE,
        _id: id
      })
      .lean()
      .exec();
  }

  public async findByIds(ids: string[] | ObjectId[]) {
    return this.conversationModel.find({
      _id: { $in: ids }
    });
  }

  public async findDetail(id: string  | ObjectId, sender: IRecipient) {
    const conversation = await this.conversationModel.findOne({ _id: id });
    if (!conversation) {
      throw new EntityNotFoundException();
    }

    // array reduce
    const recipientIds = conversation.recipients.filter(r => sender.source !== r.source ).map(r => r.sourceId)
    let recipents = [];
    if (recipientIds.length && sender.source === 'user') {
      recipents = await this.performerService.findByIds(recipientIds);
    }
    if (recipientIds.length && sender.source === 'performer') {
      recipents = await this.userService.findByIds(recipientIds);
    }
    const dto = new ConversationDto(conversation);
    if (recipents.length) {
      dto.recipientInfo = new UserDto(recipents[0]).toResponse();
    }
    return dto;
  }

  public async findPerformerPublicConversation(performerId: string | ObjectId) {
    return this.conversationModel
      .findOne({
        type: `stream_${CONVERSATION_TYPE.PUBLIC}`,
        performerId
      })
      .lean()
      .exec();
  }

  public async createStreamConversation(stream: StreamDto, recipients?: any) {
    return this.conversationModel.create({
      streamId: stream._id,
      performerId: stream.performerId ? stream.performerId : null,
      recipients: recipients || [],
      name: `stream_${stream.type}_performerId_${stream.performerId}`,
      type: `stream_${stream.type}`,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  public async getPrivateConversationByStreamId(streamId: string | ObjectId) {
    const conversation = await this.conversationModel.findOne({ streamId });
    if (!conversation) {
      throw new NotFoundException();
    }
    return new ConversationDto(conversation);
  }

  public async addRecipient(
    conversationId: string | ObjectId,
    recipient: IRecipient
  ) {
    return this.conversationModel.updateOne(
      { _id: conversationId },
      { $addToSet: { recipients: recipient } }
    );
  }

  public serializeConversation(id: string | ObjectId, type: string) {
    return `conversation:${type}:${id}`;
  }

  deserializeConversationId(str: string) {
    const strs = str.split(':');
    if (!strs.length) return '';

    return strs[strs.length - 1];
  }
}
