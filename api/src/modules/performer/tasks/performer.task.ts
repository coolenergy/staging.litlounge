import { Injectable } from '@nestjs/common';
import { AgendaService } from 'src/kernel/infras/agenda';
import { difference } from 'lodash';
import * as Agenda from 'agenda';
import { RedisService } from 'nestjs-redis';
import { SocketUserService } from 'src/modules/socket/services/socket-user.service';
import { PerformerService } from '../services';

export const CHECK_ONLINE_STATUS_SCHEDULE = 'CHECK_ONLINE_STATUS_SCHEDULE';

@Injectable()
export class PerformerTask {
  constructor(
    private readonly redisService: RedisService,
    private readonly agendaService: AgendaService,
    private readonly socketUserService: SocketUserService,
    private readonly performerService: PerformerService
  ) {
    this.agendaService.define(
      CHECK_ONLINE_STATUS_SCHEDULE,
      {},
      this.modelOnlineStatusHandler.bind(this)
    );
    this.agendaService.every('2 minutes', CHECK_ONLINE_STATUS_SCHEDULE);
  }

  async modelOnlineStatusHandler(
    job: Agenda.Job<any>,
    done: (err?: Error) => void
  ) {
    try {
      const query = job.attrs.data;
      const onlinePerformers = await this.performerService.find({
        ...query,
        isOnline: true
      });
      if (!onlinePerformers.length) {
        return;
      }

      const redisClient = this.redisService.getClient();
      const promises = [];
      const connectedSockets = await this.socketUserService.getConnectedSocket();
      const connectedSocketIds = Object.keys(connectedSockets).map(id => id);
      const sockets: { [key: string]: string[] } = {};
      let results = await Promise.all(
        onlinePerformers.map(p => redisClient.smembers(p._id))
      );
      results.forEach((v, i) => {
        sockets[onlinePerformers[i]._id] = v;
      });

      if (!connectedSocketIds.length) {
        /**
         * Remove all sockets saved in redis
         */
        await Promise.all(
          onlinePerformers.map(
            p =>
              sockets[p._id].length && redisClient.srem(p._id, sockets[p._id])
          )
        );
      } else {
        // eslint-disable-next-line camelcase
        Object.keys(sockets).forEach(p_id => {
          const disconnectSockets = difference(
            sockets[p_id],
            connectedSocketIds
          );
          if (disconnectSockets.length) {
            promises.push(redisClient.srem(p_id, disconnectSockets));
          }
        });
        await Promise.all(promises);
      }

      // Update performer status
      results = await Promise.all(
        onlinePerformers.map(p => redisClient.smembers(p._id))
      );
      results.forEach((v, i) => {
        sockets[onlinePerformers[i]._id] = v;
      });
      await Promise.all(
        // eslint-disable-next-line camelcase
        Object.keys(sockets).map(p_id => {
          if (!sockets[p_id].length) {
            return this.performerService.offline(p_id);
          }

          return null;
        })
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    } finally {
      done();
    }
  }
}
