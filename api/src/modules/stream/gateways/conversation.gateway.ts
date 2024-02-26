import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { forwardRef, Inject } from '@nestjs/common';
import { SocketUserService } from 'src/modules/socket/services/socket-user.service';
import { RequestService } from 'src/modules/stream/services';
import { AuthService } from 'src/modules/auth/services';
import { ConversationService } from 'src/modules/message/services';
import { Socket } from 'socket.io';
import { Model } from 'mongoose';
import { UserService } from 'src/modules/user/services';
import { UserDto } from 'src/modules/user/dtos';
import { PerformerService } from 'src/modules/performer/services';
import { generateUuid } from 'src/kernel/helpers/string.helper';
import { pick } from 'lodash';
import { AuthCreateDto } from 'src/modules/auth/dtos';
import { STREAM_MODEL_PROVIDER } from '../providers/stream.provider';
import { StreamModel } from '../models';
import {
  PRIVATE_CHAT,
  defaultStreamValue,
  BroadcastType,
  OFFLINE,
  GROUP_CHAT
} from '../constant';

const JOINED_THE_ROOM = 'JOINED_THE_ROOM';
const MODEL_JOIN_ROOM = 'MODEL_JOIN_ROOM';
const MODEL_LEFT_ROOM = 'MODEL_LEFT_ROOM';
const JOIN_ROOM = 'JOIN_ROOM';
const REJOIN_ROOM = 'REJOIN_ROOM';
const LEAVE_ROOM = 'LEAVE_ROOM';

@WebSocketGateway()
export class StreamConversationWsGateway {
  constructor(
    private readonly socketUserService: SocketUserService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly conversationService: ConversationService,
    private readonly userService: UserService,
    private readonly performerService: PerformerService,
    private readonly requestService: RequestService,
    @Inject(STREAM_MODEL_PROVIDER)
    private readonly streamModel: Model<StreamModel>
  ) {}

  @SubscribeMessage(JOIN_ROOM)
  async handleJoinPrivateRoom(
    client: Socket,
    payload: { conversationId: string }
  ) {
    try {
      const { conversationId } = payload;
      const { token } = client.handshake.query;
      if (!token) {
        return;
      }

      const [user, conversation] = await Promise.all([
        this.authService.getSourceFromJWT(token),
        this.conversationService.findById(conversationId)
      ]);

      if (!user || !conversation) {
        return;
      }

      const stream = await this.streamModel.findOne({
        _id: conversation.streamId
      });
      if (!stream) return;

      const roomName = this.conversationService.serializeConversation(
        conversationId,
        conversation.type
      );
      client.join(roomName);
      await this.socketUserService.emitToRoom(
        roomName,
        `message_created_conversation_${conversation._id}`,
        {
          text: `${user.username} has joined this conversation`,
          _id: generateUuid(),
          conversationId: conversation._id,
          isSystem: true
        }
      );

      if (user.isPerformer && `${user._id}` === `${conversation.performerId}`) {
        await this.socketUserService.emitToRoom(roomName, MODEL_JOIN_ROOM, {
          conversationId
        });
        const type = conversation.type.split('_');
        await this.performerService.setStreamingStatus(user._id, type[1]);
      }

      const connections = await this.socketUserService.getRoomUserConnections(
        roomName
      );
      const memberIds: string[] = [];
      Object.keys(connections).forEach(id => {
        const value = connections[id].split(',');
        if (value[0] === 'member') {
          memberIds.push(id);
        }
      });
      const members = await this.userService.findByIds(memberIds);
      const streamId = `${stream.type}-${stream._id}-${user._id}`;
      const data = {
        ...defaultStreamValue,
        streamId,
        name: streamId,
        description: '',
        type: BroadcastType.LiveStream,
        status: 'finished'
      };
      const result = await this.requestService.create(data);
      if (result.status) {
        throw result.error || result.data;
      }

      await this.socketUserService.emitToUsers(user._id, JOINED_THE_ROOM, {
        streamId,
        conversationId,
        // total: client.adapter.rooms[roomName]
        //   ? client.adapter.rooms[roomName].length
        //   : 0,
        total: members.length,
        members: members.map(m => new UserDto(m).toResponse()),
        streamList: stream.streamIds
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
  }

  @SubscribeMessage(REJOIN_ROOM)
  async handleReJoinPrivateRoom(
    client: Socket,
    payload: { conversationId: string }
  ) {
    try {
      const { conversationId } = payload;
      const { token } = client.handshake.query;
      if (!token) {
        return;
      }

      const [decodeded, conversation] = await Promise.all([
        this.authService.verifyJWT(token),
        this.conversationService.findById(conversationId)
      ]);

      if (!conversation) {
        return;
      }

      let user: any;
      const authUser = pick(decodeded, [
        'source',
        'sourceId',
        'authId'
      ]) as AuthCreateDto;
      if (authUser && authUser.source === 'user') {
        user = await this.userService.findById(authUser.sourceId);
      }
      if (authUser && authUser.source === 'performer') {
        user = await this.performerService.findById(authUser.sourceId);
      }

      const stream = await this.streamModel.findOne({
        _id: conversation.streamId
      });
      if (!stream) return;

      const roomName = this.conversationService.serializeConversation(
        conversationId,
        conversation.type
      );

      if (!client.rooms[roomName]) {
        client.join(roomName);
      }

      const connection = await this.socketUserService.getConnectionValue(
        roomName,
        user._id
      );

      if (!connection) {
        this.socketUserService.addConnectionToRoom(
          roomName,
          user._id,
          authUser.source === 'performer' ? 'model' : 'member'
        );
      }

      await this.socketUserService.emitToRoom(
        roomName,
        `message_created_conversation_${conversation._id}`,
        {
          text: `${user.username} has joined this conversation`,
          _id: generateUuid(),
          conversationId: conversation._id,
          isSystem: true
        }
      );

      if (user.isPerformer && `${user._id}` === `${conversation.performerId}`) {
        await this.socketUserService.emitToRoom(roomName, MODEL_JOIN_ROOM, {
          conversationId
        });
        const type = conversation.type.split('_');
        await this.performerService.setStreamingStatus(user._id, type[1]);
      }

      const connections = await this.socketUserService.getRoomUserConnections(
        roomName
      );
      const memberIds: string[] = [];
      Object.keys(connections).forEach(id => {
        const value = connections[id].split(',');
        if (value[0] === 'member') {
          memberIds.push(id);
        }
      });
      const members = await this.userService.findByIds(memberIds);

      await this.socketUserService.emitToUsers(user._id, JOINED_THE_ROOM, {
        conversationId,
        // total: client.adapter.rooms[roomName]
        //   ? client.adapter.rooms[roomName].length
        //   : 0,
        total: members.length,
        members: members.map(m => new UserDto(m).toResponse()),
        streamList: stream.streamIds
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
  }

  @SubscribeMessage(LEAVE_ROOM)
  async handleLeavePrivateRoom(
    client: Socket,
    payload: { conversationId: string }
  ) {
    try {
      const { conversationId } = payload;
      const { token } = client.handshake.query;
      if (!token) {
        return;
      }

      const [user, conversation] = await Promise.all([
        this.authService.getSourceFromJWT(token),
        this.conversationService.findById(payload.conversationId)
      ]);
      if (!user || !conversation) {
        return;
      }

      const stream = await this.streamModel.findOne({
        _id: conversation.streamId
      });
      if (!stream) return;

      const roomName = this.conversationService.serializeConversation(
        conversationId,
        conversation.type
      );
      client.leave(roomName);
      await this.socketUserService.emitToRoom(
        roomName,
        `message_created_conversation_${payload.conversationId}`,
        {
          text: `${user.username} has left this conversation`,
          _id: generateUuid(),
          conversationId: payload.conversationId,
          isSystem: true
        }
      );

      if (user.isPerformer && `${user._id}` === `${conversation.performerId}`) {
        await Promise.all([
          this.socketUserService.emitToRoom(roomName, MODEL_LEFT_ROOM, {
            date: new Date(),
            conversationId
          }),
          this.performerService.setStreamingStatus(user._id, OFFLINE)
        ]);
      }

      if (
        stream.isStreaming &&
        (!client.adapter.rooms[roomName] || stream.type === PRIVATE_CHAT || (stream.type === GROUP_CHAT && user.isPerformer))
      ) {
        stream.isStreaming = false;
        stream.lastStreamingTime = new Date();
        await stream.save();
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }
}
