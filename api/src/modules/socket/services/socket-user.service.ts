import { Injectable } from '@nestjs/common';
import { RedisService } from 'nestjs-redis';
import { ObjectId } from 'mongodb';
import { uniq } from 'lodash';
import { WebSocketServer, WebSocketGateway } from '@nestjs/websockets';
import { Server } from 'socket.io';

export const CONNECTED_USER_REDIS_KEY = 'connected_users';
export const CONNECTED_ROOM_REDIS_KEY = 'user:';
export const CHECK_ONLINE_STATUS_SCHEDULE = 'CHECK_ONLINE_STATUS_SCHEDULE';

@Injectable()
@WebSocketGateway()
export class SocketUserService {
  @WebSocketServer() server: Server;

  constructor(private readonly redisService: RedisService) {}

  async addConnection(sourceId: string | ObjectId, socketId: string) {
    // TODO - pass config
    const redisClient = this.redisService.getClient();

    // add to online list
    await redisClient.sadd(CONNECTED_USER_REDIS_KEY, sourceId.toString());
    // add to set: source_id & sockets, to check connection lengths in future in needd?
    await redisClient.sadd(sourceId.toString(), socketId);

    // join this member into member room for feature use?
    // this.server.join(sourceId.toString());
  }

  async getUserSocketIds(id: string) {
    const redisClient = this.redisService.getClient();
    const results = await redisClient.smembers(id);
    return results;
  }

  async userGetAllConnectedRooms(id: string) {
    const redisClient = this.redisService.getClient();
    const results = await redisClient.smembers(CONNECTED_ROOM_REDIS_KEY + id);
    return results;
  }

  async removeConnection(sourceId: string | ObjectId, socketId: string) {
    const redisClient = this.redisService.getClient();
    await redisClient.srem(sourceId.toString(), socketId);

    // if hash is empty, remove conencted user
    const len = await redisClient.scard(sourceId.toString());
    if (!len) {
      await redisClient.srem(CONNECTED_USER_REDIS_KEY, sourceId.toString());
    }
    return len;
  }

  async addConnectionToRoom(roomId: string, userId: string, value: string) {
    const redisClient = this.redisService.getClient();
    // await redisClient.hset('room-' + roomId, id , value);
    await redisClient.hset(
      `room-${roomId}`,
      userId,
      `${value},${new Date().getTime()}`
    );
    await redisClient.sadd(CONNECTED_ROOM_REDIS_KEY + userId, roomId);
  }

  async removeConnectionFromRoom(roomId: string, userId: string) {
    const redisClient = this.redisService.getClient();
    await redisClient.hdel(`room-${roomId}`, userId);
    await redisClient.srem(CONNECTED_ROOM_REDIS_KEY + userId, roomId);
  }

  async getConnectionValue(roomId: string, userId: string) {
    const redisClient = this.redisService.getClient();
    const results = await redisClient.hmget(`room-${roomId}`, ...[userId]);
    return results[0];
  }

  async getRoomUserConnections(roomId: string) {
    const redisClient = this.redisService.getClient();
    const results = await redisClient.hgetall(`room-${roomId}`);
    return results;
  }

  async countRoomUserConnections(roomId: string) {
    const redisClient = this.redisService.getClient();
    const total = await redisClient.hlen(`room-${roomId}`);
    return total;
  }

  async emitToUsers(
    userIds: string | string[] | ObjectId | ObjectId[],
    eventName: string,
    data: any
  ) {
    const stringIds = uniq(
      Array.isArray(userIds) ? userIds : [userIds]
    ).map(i => i.toString());
    const redisClient = this.redisService.getClient();
    Promise.all(
      stringIds.map(async userId => {
        // TODO - check
        const socketIds = await redisClient.smembers(userId);
        (socketIds || []).forEach(socketId =>
          this.server.to(socketId).emit(eventName, data)
        );
      })
    );
  }

  async emitToRoom(roomName: string, eventName: string, data: any) {
    this.server.to(roomName).emit(eventName, data);
  }

  async emitToConnectedUsers(eventName: string, data: any) {
    const connectedUsers = this.server.clients().connected;
    const ids = Object.keys(connectedUsers).map(id => id);
    if (!ids.length) {
      return;
    }

    await Promise.all(ids.map(id => this.server.to(id).emit(eventName, data)));
  }

  async getConnectedSocket() {
    return this.server.clients().connected;
  }
}
