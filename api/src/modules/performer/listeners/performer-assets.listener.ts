/* eslint-disable no-console */
import { Injectable, Inject } from '@nestjs/common';
import { QueueEventService, QueueEvent } from 'src/kernel';
import {
  PERFORMER_PHOTO_CHANNEL,
  PERFORMER_VIDEO_CHANNEL,
  PERFORMER_PRODUCT_CHANNEL,
  PHOTO_STATUS,
  VIDEO_STATUS,
  PRODUCT_STATUS
} from 'src/modules/performer-assets/constants';
import { Model } from 'mongoose';
import { EVENT } from 'src/kernel/constants';
import { PerformerModel } from '../models';
import { PERFORMER_MODEL_PROVIDER } from '../providers';

const HANDLE_PHOTO_COUNT_FOR_PERFORMER = 'HANDLE_PHOTO_COUNT_FOR_PERFORMER';

@Injectable()
export class PerformerAssetsListener {
  constructor(
    private readonly queueEventService: QueueEventService,
    @Inject(PERFORMER_MODEL_PROVIDER)
    private readonly performerModel: Model<PerformerModel>
  ) {
    this.queueEventService.subscribe(
      PERFORMER_PHOTO_CHANNEL,
      HANDLE_PHOTO_COUNT_FOR_PERFORMER,
      this.handlePhotoCount.bind(this)
    );

    this.queueEventService.subscribe(
      PERFORMER_VIDEO_CHANNEL,
      HANDLE_PHOTO_COUNT_FOR_PERFORMER,
      this.handleVideoCount.bind(this)
    );

    this.queueEventService.subscribe(
      PERFORMER_PRODUCT_CHANNEL,
      HANDLE_PHOTO_COUNT_FOR_PERFORMER,
      this.handleProductCount.bind(this)
    );
  }

  public async handlePhotoCount(event: QueueEvent) {
    try {
      const { eventName } = event;
      if (![EVENT.CREATED, EVENT.DELETED, EVENT.UPDATED].includes(eventName)) {
        return;
      }
      const { performerId, status, oldStatus } = event.data;
      let increase = 0;

      switch (eventName) {
        case EVENT.CREATED:
          if (status === PHOTO_STATUS.ACTIVE) increase = 1;
          break;
        case EVENT.UPDATED:
          if (
            oldStatus !== PHOTO_STATUS.ACTIVE &&
            status === PHOTO_STATUS.ACTIVE
          )
            increase = 1;
          if (
            oldStatus === PHOTO_STATUS.ACTIVE &&
            status !== PHOTO_STATUS.ACTIVE
          )
            increase = -1;
          break;
        case EVENT.DELETED:
          if (status === PHOTO_STATUS.ACTIVE) increase = -1;
          break;
        default:
          break;
      }

      if (increase) {
        await this.performerModel.updateOne(
          { _id: performerId },
          {
            $inc: {
              'stats.totalPhotos': increase
            }
          }
        );
      }
    } catch (e) {
      // TODO - log me
      console.log(e);
    }
  }

  public async handleVideoCount(event: QueueEvent) {
    try {
      const { eventName } = event;
      if (![EVENT.CREATED, EVENT.DELETED, EVENT.UPDATED].includes(eventName)) {
        return;
      }
      const { performerId, status, oldStatus } = event.data;
      let increase = 0;

      switch (eventName) {
        case EVENT.CREATED:
          if (status === VIDEO_STATUS.ACTIVE) increase = 1;
          break;
        case EVENT.UPDATED:
          if (
            oldStatus !== VIDEO_STATUS.ACTIVE &&
            status === VIDEO_STATUS.ACTIVE
          )
            increase = 1;
          if (
            oldStatus === VIDEO_STATUS.ACTIVE &&
            status !== VIDEO_STATUS.ACTIVE
          )
            increase = -1;
          break;
        case EVENT.DELETED:
          if (status === VIDEO_STATUS.ACTIVE) increase = -1;
          break;
        default:
          break;
      }

      if (increase) {
        await this.performerModel.updateOne(
          { _id: performerId },
          {
            $inc: {
              'stats.totalVideos': increase
            }
          }
        );
      }
    } catch (e) {
      // TODO - log me
      console.log(e);
    }
  }

  public async handleProductCount(event: QueueEvent) {
    try {
      const { eventName } = event;
      if (![EVENT.CREATED, EVENT.DELETED, EVENT.UPDATED].includes(eventName)) {
        return;
      }
      const { performerId, status, oldStatus } = event.data;
      let increase = 0;

      switch (eventName) {
        case EVENT.CREATED:
          if (status === PRODUCT_STATUS.ACTIVE) increase = 1;
          break;
        case EVENT.UPDATED:
          if (
            oldStatus !== PRODUCT_STATUS.ACTIVE &&
            status === PRODUCT_STATUS.ACTIVE
          )
            increase = 1;
          if (
            oldStatus === PRODUCT_STATUS.ACTIVE &&
            status !== PRODUCT_STATUS.ACTIVE
          )
            increase = -1;
          break;
        case EVENT.DELETED:
          if (status === PRODUCT_STATUS.ACTIVE) increase = -1;
          break;
        default:
          break;
      }

      if (increase) {
        await this.performerModel.updateOne(
          { _id: performerId },
          {
            $inc: {
              'stats.totalProducts': increase
            }
          }
        );
      }
    } catch (e) {
      // TODO - log me
      console.log(e);
    }
  }
}
