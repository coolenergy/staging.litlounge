import { Injectable } from '@nestjs/common';
import { QueueEvent, QueueEventService } from 'src/kernel';
import { EVENT } from 'src/kernel/constants';
import { StudioService } from '../services';

@Injectable()
export class StudioMemberListener {
  constructor(
    private readonly studioService: StudioService,
    private readonly queueEventService: QueueEventService
  ) {
    this.queueEventService.subscribe(
      'STUDIO_MEMBER_CHANNEL',
      'STUDIO_CREATE_UPDATE_MEMBER',
      this.handler.bind(this)
    );
  }

  async handler(event: QueueEvent) {
    try {
      if (
        event.eventName !== EVENT.CREATED ||
        event.eventName !== EVENT.UPDATED
      ) {
        return;
      }

      const { studioId, total } = event.data;
      await this.studioService.updateStats(studioId, {
        'stats.totalPerformer': total || 1
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }
}
