import { Injectable } from '@nestjs/common';
import { QueueEvent, QueueEventService } from 'src/kernel';
import { SocketUserService } from 'src/modules/socket/services/socket-user.service';
import { BLOCK_USERS_CHANNEL, BLOCK_ACTION } from '../constants';

const BLOCK_USERS_NOTIFY = 'BLOCK_USERS_NOTIFY';

@Injectable()
export class BlockUserListener {
  constructor(
    private readonly queueEventService: QueueEventService,
    private readonly socketUserService: SocketUserService
  ) {
    this.queueEventService.subscribe(
      BLOCK_USERS_CHANNEL,
      BLOCK_USERS_NOTIFY,
      this.handleMessage.bind(this)
    );
  }

  private async handleMessage(event: QueueEvent): Promise<void> {
    if (event.eventName !== BLOCK_ACTION.CREATED) return;
    const data = event.data as any;
    if (!data.userIds.length || !data.performerId) return;

    this.socketUserService.emitToUsers(data.userIds as any, 'nofify_users_block', { performerId: data.performerId });
  }
}
