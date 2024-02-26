import {
  Injectable,
  Inject,
  forwardRef,
  ForbiddenException
} from '@nestjs/common';
import { PerformerService } from 'src/modules/performer/services';
import { FilterQuery, Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { EntityNotFoundException } from 'src/kernel';
import { v4 as uuidv4 } from 'uuid';
import { ConversationService } from 'src/modules/message/services';
import { QueueEventService } from 'src/kernel/infras/queue';
import { UserDto } from 'src/modules/user/dtos';
import { RequestService } from './request.service';
import { SocketUserService } from '../../socket/services/socket-user.service';
import {
  PRIVATE_CHAT,
  GROUP_CHAT,
  PUBLIC_CHAT,
  defaultStreamValue,
  BroadcastType
} from '../constant';
import { Webhook, IStream, StreamDto } from '../dtos';
import { StreamModel } from '../models';
import { STREAM_MODEL_PROVIDER } from '../providers/stream.provider';
import {
  StreamOfflineException,
  ParticipantJoinLimitException,
  StreamServerErrorException
} from '../exceptions';
import { TokenNotEnoughException } from '../exceptions/token-not-enough';
import { TokenCreatePayload } from '../payloads';

@Injectable()
export class StreamService {
  constructor(
    @Inject(forwardRef(() => PerformerService))
    private readonly performerService: PerformerService,
    @Inject(STREAM_MODEL_PROVIDER)
    private readonly streamModel: Model<StreamModel>,
    private readonly conversationService: ConversationService,
    private readonly socketUserService: SocketUserService,
    private readonly requestService: RequestService,
    private readonly queueEventService: QueueEventService
  ) {}

  public async findById(id: string | ObjectId): Promise<StreamModel> {
    const stream = await this.streamModel.findOne({ _id: id });
    if (!stream) {
      throw new EntityNotFoundException();
    }
    return stream;
  }

  public async findBySessionId(sessionId: string): Promise<StreamModel> {
    const stream = await this.streamModel.findOne({ sessionId });
    if (!stream) {
      throw new EntityNotFoundException();
    }

    return stream;
  }

  public async findByPerformerId(
    performerId: string | ObjectId,
    payload: FilterQuery<StreamModel> = {}
  ): Promise<StreamModel> {
    const stream = await this.streamModel.findOne({ performerId, ...payload });
    return stream;
  }

  public async getSessionId(
    performerId: string | ObjectId,
    type: string
  ): Promise<string> {
    let stream = await this.streamModel.findOne({ performerId, type });
    if (!stream) {
      const data: IStream = {
        sessionId: uuidv4(),
        performerId,
        type
      };
      stream = await this.streamModel.create(data);
    }

    return stream.sessionId;
  }

  async create(payload: {
    sessionId: string;
    performerId: string | ObjectId;
    type: string;
  }) {
    return this.streamModel.create(payload);
  }

  public async goLive(performerId: ObjectId) {
    let stream = await this.streamModel.findOne({
      performerId,
      type: PUBLIC_CHAT
    });

    if (!stream) {
      const data: IStream = {
        sessionId: uuidv4(),
        performerId,
        type: PUBLIC_CHAT
      };
      stream = await this.streamModel.create(data);
    }
    let conversation = await this.conversationService.findOne({
      type: 'stream_public',
      performerId
    });
    if (!conversation) {
      conversation = await this.conversationService.createStreamConversation(
        new StreamDto(stream)
      );
    }

    const data = {
      ...defaultStreamValue,
      streamId: stream._id,
      name: stream._id,
      description: '',
      type: BroadcastType.LiveStream,
      status: 'finished'
    };

    const result = await this.requestService.create(data);
    if (result.status) {
      throw new StreamServerErrorException({
        message: result.data?.data?.message,
        error: result.data,
        status: result.data?.status
      });
    }

    return { conversation, sessionId: stream._id };
  }

  public async joinPublicChat(performerId: string | ObjectId) {
    const stream = await this.streamModel.findOne({
      performerId,
      type: PUBLIC_CHAT
    });
    if (!stream) {
      throw new EntityNotFoundException();
    }

    if (!stream.isStreaming) {
      throw new StreamOfflineException();
    }

    return { sessionId: stream._id };
  }

  public async requestPrivateChat(
    user: UserDto,
    performerId: string | ObjectId
  ) {
    const performer = await this.performerService.findById(performerId);
    if (!performer) {
      throw new EntityNotFoundException();
    }

    if (user.balance < performer.privateCallPrice) {
      throw new TokenNotEnoughException();
    }

    const data: IStream = {
      sessionId: uuidv4(),
      performerId,
      userIds: [user._id],
      type: PRIVATE_CHAT,
      isStreaming: true
    };
    const stream = await this.streamModel.create(data);
    const recipients = [
      { source: 'performer', sourceId: new ObjectId(performerId) },
      { source: 'user', sourceId: user._id }
    ];
    const conversation = await this.conversationService.createStreamConversation(
      new StreamDto(stream),
      recipients
    );

    return { conversation, sessionId: stream.sessionId };
  }

  public async accpetPrivateChat(id: string, performerId: ObjectId) {
    const conversation = await this.conversationService.findById(id);
    if (!conversation) {
      throw new EntityNotFoundException();
    }

    const recipent = conversation.recipients.find(
      r =>
        r.sourceId.toString() === performerId.toString() &&
        r.source === 'performer'
    );
    if (!recipent) {
      throw new ForbiddenException();
    }

    const stream = await this.findById(conversation.streamId);
    if (!stream && stream.performerId !== performerId) {
      throw new EntityNotFoundException();
    }

    if (!stream.isStreaming) {
      throw new StreamOfflineException();
    }

    return { conversation, sessionId: stream.sessionId };
  }

  public async startGroupChat(performerId: ObjectId) {
    const groupChatRooms = await this.streamModel.find({
      performerId,
      type: GROUP_CHAT,
      isStreaming: true
    });

    if (groupChatRooms.length) {
      Promise.all(
        groupChatRooms.map(stream => {
          stream.set('isStreaming', false);
          return stream.save();
        })
      );
    }

    const data: IStream = {
      sessionId: uuidv4(),
      performerId,
      userIds: [],
      type: GROUP_CHAT,
      isStreaming: true
    };
    const stream = await this.streamModel.create(data);
    const recipients = [{ source: 'performer', sourceId: performerId }];
    const conversation = await this.conversationService.createStreamConversation(
      new StreamDto(stream),
      recipients
    );

    return { conversation, sessionId: stream.sessionId };
  }

  public async joinGroupChat(performerId: string, user: UserDto) {
    const performer = await this.performerService.findById(performerId);
    if (!performer) {
      throw new EntityNotFoundException();
    }

    if (user.balance < performer.groupCallPrice) {
      throw new TokenNotEnoughException();
    }

    const stream = await this.streamModel.findOne({
      performerId,
      type: GROUP_CHAT,
      isStreaming: true
    });

    if (!stream || (stream && !stream.isStreaming)) {
      throw new StreamOfflineException('Model is not available in Group chat');
    }

    const conversation = await this.conversationService.findOne({
      streamId: stream._id
    });
    if (!conversation) {
      throw new EntityNotFoundException();
    }

    const numberOfParticipant = conversation.recipients.length - 1;
    const { maxParticipantsAllowed } = performer;
    if (
      maxParticipantsAllowed &&
      numberOfParticipant > maxParticipantsAllowed
    ) {
      throw new ParticipantJoinLimitException();
    }

    // const event: QueueEvent = {
    //   channel: LIVE_STREAM_CHANNEL,
    //   eventName: LIVE_STREAM_EVENT_NAME.CONNECTED,
    //   data: stream
    // };
    // this.queueEventService.publish(event);
    const joinedTheRoom = conversation.recipients.find(
      recipient => recipient.sourceId.toString() === user._id.toString()
    );
    if (!joinedTheRoom) {
      const recipient = {
        source: 'user',
        sourceId: user._id
      };
      await this.conversationService.addRecipient(conversation._id, recipient);
    }

    return { conversation, sessionId: stream.sessionId };
  }

  public async webhook(
    sessionId: string,
    payload: Webhook
  ): Promise<StreamModel> {
    const stream = await this.streamModel.findOne({ sessionId });
    if (!stream) {
      return;
    }

    switch (payload.action) {
      case 'liveStreamStarted':
        if (stream.type === PUBLIC_CHAT) stream.isStreaming = true;
        break;
      case 'liveStreamEnded':
        if (stream.type === PUBLIC_CHAT) {
          stream.isStreaming = false;
          stream.lastStreamingTime = new Date();
        }
        break;
      default:
        break;
    }

    await stream.save();
  }

  public async getOneTimeToken(payload: TokenCreatePayload, userId: string) {
    const { id } = payload;
    let streamId = id;
    if (id.indexOf(PRIVATE_CHAT) === 0 || id.indexOf('group') === 0) {
      [, streamId] = id.split('-');
    }

    const [stream, conversation] = await Promise.all([
      this.streamModel.findOne({ _id: streamId }),
      this.conversationService.findOne({ streamId })
    ]);

    if (!stream || !conversation) {
      throw new EntityNotFoundException();
    }

    const roomId = this.conversationService.serializeConversation(
      conversation._id,
      conversation.type
    );
    const connections = await this.socketUserService.getRoomUserConnections(
      roomId
    );
    const memberIds: string[] = [];
    Object.keys(connections).forEach(v => {
      memberIds.push(v);
    });

    if (!memberIds.includes(userId)) {
      throw new ForbiddenException();
    }

    const resp = await this.requestService.generateOneTimeToken(id, payload);
    return resp.data;
  }
}
