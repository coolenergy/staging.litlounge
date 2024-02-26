/* eslint-disable no-console */
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { forwardRef, Inject } from '@nestjs/common';
import { SocketUserService } from 'src/modules/socket/services/socket-user.service';
import { AuthService } from 'src/modules/auth/services';
import { Socket } from 'socket.io';
import { Model } from 'mongoose';
import { UserService } from 'src/modules/user/services';
import { UserDto } from 'src/modules/user/dtos';
import { PerformerService } from 'src/modules/performer/services';
import * as moment from 'moment';
import { ConversationService } from 'src/modules/message/services';
import { BroadcastStatus } from '../constant';
import { StreamModel } from '../models';
import { STREAM_MODEL_PROVIDER } from '../providers/stream.provider';
import { RequestService } from '../services';

const STREAM_JOINED = 'private-stream/streamJoined';
const STREAM_LEAVED = 'private-stream/streamLeaved';
const STREAM_INFORMATION_CHANGED = 'private-stream/streamInformationChanged';

@WebSocketGateway()
export class PrivateStreamWsGateway {
  constructor(
    private readonly socketUserService: SocketUserService,
    @Inject(STREAM_MODEL_PROVIDER)
    private readonly streamModel: Model<StreamModel>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly performerService: PerformerService,
    private readonly requestService: RequestService,
    private readonly conversationService: ConversationService
  ) {}

  @SubscribeMessage('private-stream/join')
  async handleJoinStream(
    client: Socket,
    payload: { conversationId: string; streamId: string }
  ): Promise<void> {
    try {
      const { conversationId, streamId } = payload;
      if (!conversationId) {
        return;
      }

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

      await this.streamModel.updateOne(
        { _id: conversation.streamId },
        {
          $addToSet: {
            streamIds: streamId
          }
        }
      );

      const resp = await this.requestService.getBroadcast(streamId);
      if (resp.status) {
        throw resp.error || resp.data;
      }

      if ([BroadcastStatus.CREATED, BroadcastStatus.BROADCASTING].includes(resp.data.status)) {
        const roomName = this.conversationService.serializeConversation(
          conversationId,
          conversation.type
        );
        await this.socketUserService.emitToRoom(roomName, STREAM_JOINED, {
          streamId,
          conversationId
        });
        if (!user.isPerformer && conversation.type === 'stream_private') {
          await this.socketUserService.emitToUsers(
            conversation.performerId,
            'private-chat-request',
            {
              user: user.toPrivateRequestResponse(),
              conversationId,
              streamId: conversation.streamId,
              id: streamId
            }
          );
        }
        await this.socketUserService.addConnectionToRoom(
          roomName,
          user._id,
          user.isPerformer ? 'model' : 'member'
        );
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
        if (memberIds.length) {
          const members = await this.userService.findByIds(memberIds);
          const data = {
            conversationId,
            total: members.length,
            members: members.map(m => new UserDto(m).toResponse())
          };
          this.socketUserService.emitToRoom(
            roomName,
            STREAM_INFORMATION_CHANGED,
            data
          );
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  @SubscribeMessage('private-stream/leave')
  async handleLeaveStream(
    client: Socket,
    payload: { conversationId: string; streamId: string }
  ): Promise<void> {
    try {
      const { conversationId, streamId } = payload;
      if (!conversationId) {
        return;
      }

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

      await this.streamModel.updateOne(
        { _id: conversation.streamId },
        {
          $pull: {
            streamIds: streamId
          }
        }
      );

      const roomName = this.conversationService.serializeConversation(
        conversationId,
        conversation.type
      );
      await this.socketUserService.emitToRoom(roomName, STREAM_LEAVED, {
        streamId,
        conversationId
      });

      const results = await this.socketUserService.getConnectionValue(
        roomName,
        user._id
      );
      if (results) {
        const values = results.split(',');
        const timeJoined = values[1] ? parseInt(values[1], 10) : null;
        const role = values[0];
        if (timeJoined) {
          const streamTime =
            moment()
              .toDate()
              .getTime() - timeJoined;
          if (
            role === 'model' &&
            `${user._id}` === `${conversation.performerId}`
          ) {
            await this.performerService.updateLastStreamingTime(
              user._id,
              streamTime
            );
          } else if (role === 'member') {
            await this.userService.updateStats(user._id, {
              'stats.totalViewTime': streamTime
            });
          }
        }
      }

      await this.socketUserService.removeConnectionFromRoom(roomName, user._id);
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
      const members = memberIds.length
        ? await this.userService.findByIds(memberIds)
        : [];
      const data = {
        conversationId,
        total: members.length,
        members: members.map(m => new UserDto(m).toResponse())
      };
      this.socketUserService.emitToRoom(
        roomName,
        STREAM_INFORMATION_CHANGED,
        data
      );
    } catch (e) {
      console.log(e);
    }
  }
}
