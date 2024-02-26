import { Injectable, Inject } from '@nestjs/common';
import { QueueEvent, QueueEventService } from 'src/kernel';
import { Model } from 'mongoose';
import {
  PERFORMER_SOCKET_CONNECTED_CHANNEL,
  USER_SOCKET_EVENT
} from 'src/modules/socket/constants';
import { SocketUserService } from 'src/modules/socket/services/socket-user.service';
import { OFFLINE } from 'src/modules/stream/constant';
import { PerformerModel } from '../models';
import { PERFORMER_MODEL_PROVIDER } from '../providers';
import { PerformerDto } from '../dtos';

const HANDLE_PERFORMER_ONLINE_OFFLINE = 'HANDLE_PERFORMER_ONLINE_OFFLINE';

@Injectable()
export class PerformerConnectedListener {
  constructor(
    private readonly queueEventService: QueueEventService,
    private readonly socketUserService: SocketUserService,
    @Inject(PERFORMER_MODEL_PROVIDER)
    private readonly performerModel: Model<PerformerModel>
  ) {
    this.queueEventService.subscribe(
      PERFORMER_SOCKET_CONNECTED_CHANNEL,
      HANDLE_PERFORMER_ONLINE_OFFLINE,
      this.handleOnlineOffline.bind(this)
    );
  }

  private async handleOnlineOffline(event: QueueEvent): Promise<void> {
    const { source, sourceId } = event.data;
    if (source !== 'performer') {
      return;
    }

    const performer = await this.performerModel.findOne({_id: sourceId});
    if (!performer) {
      return;
    }

    let updateData = {};
    switch (event.eventName) {
      case USER_SOCKET_EVENT.CONNECTED:
        updateData = {
          isOnline: true,
          onlineAt: new Date(),
          offlineAt: null
        };
        break;
      case USER_SOCKET_EVENT.DISCONNECTED:
        updateData = {
          isOnline: false,
          streamingStatus: OFFLINE,
          onlineAt: null,
          offlineAt: new Date()
        };
        break;
      default:
        return;
    }
    await this.performerModel.updateOne({ _id: sourceId }, updateData, {
      upsert: false
    });
    await this.socketUserService.emitToConnectedUsers('modelUpdateStatus', {
      status: event.eventName,
      performer: new PerformerDto(performer).toSearchResponse(),
      id: sourceId
    });
  }
}
