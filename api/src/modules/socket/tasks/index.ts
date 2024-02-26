import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AgendaService } from 'src/kernel/infras/agenda';
import { AuthService } from 'src/modules/auth/services';
import { SocketUserService } from 'src/modules/socket/services/socket-user.service';

export const DISCONENNCT_OFFLINE_SOCKET_ISCHEDULE =
  'DISCONENNCT_OFFLINE_SOCKET_ISCHEDULE';

@Injectable()
export class SocketUserTask {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly agendaService: AgendaService,
    private readonly socketUserService: SocketUserService
  ) {
    this.agendaService.define(
      DISCONENNCT_OFFLINE_SOCKET_ISCHEDULE,
      {},
      this.handler.bind(this)
    );
    this.agendaService.every('2 minutes', DISCONENNCT_OFFLINE_SOCKET_ISCHEDULE);
  }

  async handler(_, done: (err?: Error) => void) {
    try {
      const connectedSockets = await this.socketUserService.getConnectedSocket();
      const connectedSocketIds = Object.keys(connectedSockets).map(id => id);

      if (connectedSocketIds.length) {
        connectedSocketIds.forEach(id => {
          if (connectedSockets[id].handshake.query.token) {
            const decodeded = this.authService.verifyJWT(
              connectedSockets[id].handshake.query.token
            );
            if (!decodeded) {
              connectedSockets[id].disconnect(true);
            }
          }
        });
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    } finally {
      done();
    }
  }
}
