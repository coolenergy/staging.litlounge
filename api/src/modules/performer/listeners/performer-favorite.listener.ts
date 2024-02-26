import { Injectable, Inject } from '@nestjs/common';
import { QueueEventService, QueueEvent } from 'src/kernel';
import {
  PERFORMER_FAVORITE_CHANNEL
} from 'src/modules/favourite/constants';
import { Model } from 'mongoose';
import { EVENT } from 'src/kernel/constants';
import { PERFORMER_MODEL_PROVIDER } from '../providers';
import { PerformerModel } from '../models';

const HANDLE_FAVORITE_FOR_PERFORMER = 'HANDLE_FAVORITE_FOR_PERFORMER';

@Injectable()
export class PerformerFavoriteListener {
  constructor(
    private readonly queueEventService: QueueEventService,
    @Inject(PERFORMER_MODEL_PROVIDER)
    private readonly performerModel: Model<PerformerModel>
  ) {
    this.queueEventService.subscribe(
      PERFORMER_FAVORITE_CHANNEL,
      HANDLE_FAVORITE_FOR_PERFORMER,
      this.handleFavorite.bind(this)
    );
  }

  public async handleFavorite(event: QueueEvent) {
    try {
      const { eventName } = event;
      if (![EVENT.CREATED, EVENT.DELETED].includes(eventName)) {
        return;
      }
      const { performerId } = event.data;
      const increase = eventName === EVENT.CREATED ? 1 : -1;
      await this.performerModel.updateOne(
        { _id: performerId },
        {
          $inc: {
            'stats.favorites': increase
          }
        }
      );
    } catch (e) {
      // TODO - log me
      // eslint-disable-next-line no-console
      console.log(e);
    }
  }
}
