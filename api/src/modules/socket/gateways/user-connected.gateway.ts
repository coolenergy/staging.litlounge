import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthService } from 'src/modules/auth/services';
import { QueueEventService } from 'src/kernel';
import {
  PERFORMER_LIVE_STREAM_CHANNEL,
  USER_LIVE_STREAM_CHANNEL,
  LIVE_STREAM_EVENT_NAME
} from 'src/modules/stream/constant';
import { AuthCreateDto } from 'src/modules/auth/dtos';
import { forwardRef, Inject } from '@nestjs/common';
import { SocketUserService } from '../services/socket-user.service';
import {
  USER_SOCKET_CONNECTED_CHANNEL,
  USER_SOCKET_EVENT,
  PERFORMER_SOCKET_CONNECTED_CHANNEL
} from '../constants';

@WebSocketGateway()
export class WsUserConnectedGateway
implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly socketUserService: SocketUserService,
    private readonly queueEventService: QueueEventService
  ) {}

  @SubscribeMessage('connect')
  async handleConnection(client: Socket): Promise<void> {
    if (!client.handshake.query.token) {
      return;
    }
    await this.login(client, client.handshake.query.token);
  }

  @SubscribeMessage('reconnect')
  async handleReconnection(client: Socket): Promise<void> {
    if (!client.handshake.query.token) {
      return;
    }
    await this.login(client, client.handshake.query.token);
  }

  @SubscribeMessage('disconnect')
  async handleDisconnect(client: Socket) {
    if (!client.handshake.query.token) {
      return;
    }

    await this.logout(client, client.handshake.query.token);
  }

  async login(client: Socket, token: string) {
    const decodeded = this.authService.decodeJWT(token) as any;
    if (!decodeded) {
      return;
    }

    const authUser = new AuthCreateDto(decodeded);
    await this.socketUserService.addConnection(authUser.sourceId, client.id);
    switch (authUser.source) {
      case 'user':
        await this.queueEventService.publish({
          channel: USER_SOCKET_CONNECTED_CHANNEL,
          eventName: USER_SOCKET_EVENT.CONNECTED,
          data: authUser
        });
        break;
      case 'performer':
        await this.queueEventService.publish({
          channel: PERFORMER_SOCKET_CONNECTED_CHANNEL,
          eventName: USER_SOCKET_EVENT.CONNECTED,
          data: authUser
        });
        break;
      default:
        break;
    }
  }

  async logout(client: Socket, token: string) {
    const decodeded = this.authService.decodeJWT(token) as any;
    if (!decodeded) {
      return;
    }

    const authUser = new AuthCreateDto(decodeded);
    const connections = await this.socketUserService.getUserSocketIds(authUser.sourceId.toString());
    if(!connections.length) {
      return;
    }

    if(!connections.includes(client.id)) {
      return;
    }

    const connectionLen = await this.socketUserService.removeConnection(
      authUser.sourceId,
      client.id
    );
    if (connectionLen) {
      // TODO something?
      return;
    }
    if (authUser.source === 'user') {
      await Promise.all([
        this.queueEventService.publish({
          channel: USER_SOCKET_CONNECTED_CHANNEL,
          eventName: USER_SOCKET_EVENT.DISCONNECTED,
          data: authUser
        }),
        this.queueEventService.publish({
          channel: USER_LIVE_STREAM_CHANNEL,
          eventName: LIVE_STREAM_EVENT_NAME.DISCONNECTED,
          data: authUser.sourceId
        })
      ]);
    } else if (authUser.source === 'performer') {
      await Promise.all([
        this.queueEventService.publish({
          channel: PERFORMER_SOCKET_CONNECTED_CHANNEL,
          eventName: USER_SOCKET_EVENT.DISCONNECTED,
          data: authUser
        }),
        this.queueEventService.publish({
          channel: PERFORMER_LIVE_STREAM_CHANNEL,
          eventName: LIVE_STREAM_EVENT_NAME.DISCONNECTED,
          data: authUser.sourceId
        })
      ]);
    }
  }
}
