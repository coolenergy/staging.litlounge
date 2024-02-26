import { Inject, Injectable } from '@nestjs/common';
import { QueueEvent, QueueEventService } from 'src/kernel';
import { Model } from 'mongoose';
import { SocketUserService } from 'src/modules/socket/services/socket-user.service';
import {
  USER_LIVE_STREAM_CHANNEL,
  PERFORMER_LIVE_STREAM_CHANNEL,
  LIVE_STREAM_EVENT_NAME
} from 'src/modules/stream/constant';
import { UserService } from 'src/modules/user/services';
import { PerformerService } from 'src/modules/performer/services';
import { ConversationService } from 'src/modules/message/services';
import { generateUuid } from 'src/kernel/helpers/string.helper';
import { STREAM_MODEL_PROVIDER } from '../providers/stream.provider';
import { StreamModel } from '../models';
import { StreamService } from '../services';

const USER_LIVE_STREAM_DISCONNECTED = 'USER_LIVE_STREAM_CONNECTED';
const MODEL_LIVE_STREAM_DISCONNECTED = 'MODEL_LIVE_STREAM_CONNECTED';
const USER_LEFT_ROOM = 'USER_LEFT_ROOM';

@Injectable()
export class StreamConnectListener {
  constructor(
    private readonly queueEventService: QueueEventService,
    private readonly userService: UserService,
    private readonly performerService: PerformerService,
    private readonly socketUserService: SocketUserService,
    private readonly streamService: StreamService,
    private readonly conversationService: ConversationService,
    @Inject(STREAM_MODEL_PROVIDER)
    private readonly streamModel: Model<StreamModel>
  ) {
    this.queueEventService.subscribe(
      USER_LIVE_STREAM_CHANNEL,
      USER_LIVE_STREAM_DISCONNECTED,
      this.userDisconnectHandler.bind(this)
    );
    this.queueEventService.subscribe(
      PERFORMER_LIVE_STREAM_CHANNEL,
      MODEL_LIVE_STREAM_DISCONNECTED,
      this.modelDisconnectHandler.bind(this)
    );
  }

  leftRoom(conversation: any, username: string, isMember = true) {
    const { _id, type } = conversation;
    const roomName = this.conversationService.serializeConversation(_id, type);
    return Promise.all([
      this.socketUserService.emitToRoom(
        roomName,
        `message_created_conversation_${_id}`,
        {
          _id: generateUuid(),
          text: `${username} has left this conversation`,
          conversationId: _id,
          isSystem: true
        }
      ),
      isMember && this.socketUserService.emitToRoom(roomName, USER_LEFT_ROOM, {
        username,
        conversationId: _id
      })
    ]);
  }

  async userDisconnectHandler(event: QueueEvent) {
    if (event.eventName !== LIVE_STREAM_EVENT_NAME.DISCONNECTED) {
      return;
    }

    const sourceId = event.data;
    const user = await this.userService.findById(sourceId);
    if (!user) {
      return;
    }

    const connectedRedisRooms = await this.socketUserService.userGetAllConnectedRooms(
      sourceId
    );

    if (!connectedRedisRooms.length) {
      return;
    }

    await Promise.all(
      connectedRedisRooms.map(id =>
        this.socketUserService.removeConnectionFromRoom(id, sourceId)
      )
    );

    const conversationIds = connectedRedisRooms.map(id =>
      this.conversationService.deserializeConversationId(id)
    );
    const conversations = await this.conversationService.findByIds(
      conversationIds
    );
    if (conversations.length) {
      await Promise.all(
        conversations.map(conversation =>
          this.leftRoom(conversation, user.username)
        )
      );
    }
  }

  async modelDisconnectHandler(event: QueueEvent) {
    if (event.eventName !== LIVE_STREAM_EVENT_NAME.DISCONNECTED) {
      return;
    }

    const sourceId = event.data;
    const model = await this.performerService.findById(sourceId);
    if (!model) {
      return;
    }

    const connectedRedisRooms = await this.socketUserService.userGetAllConnectedRooms(
      sourceId
    );

    if (!connectedRedisRooms.length) {
      return;
    }

    await Promise.all(
      connectedRedisRooms.map(r =>
        this.socketUserService.removeConnectionFromRoom(r, sourceId)
      )
    );

    const conversationIds = connectedRedisRooms.map(id =>
      this.conversationService.deserializeConversationId(id)
    );
    const conversations = await this.conversationService.findByIds(
      conversationIds
    );
    if (conversations.length) {
      await Promise.all(
        conversations.map(conversation =>
          this.leftRoom(conversation, model.username, false)
        )
      );
    }
    /**
     * To do
     * Update status
     */
    await this.streamModel.updateMany(
      { isStreaming: true, performerId: sourceId },
      { $set: { isStreaming: false, lastStreamingTime: new Date() } }
    );
  }
}
