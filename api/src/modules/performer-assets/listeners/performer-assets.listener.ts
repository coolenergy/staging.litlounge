import { Injectable, Inject, Logger } from '@nestjs/common';
import { QueueEventService, QueueEvent } from 'src/kernel';
import { PHOTO_STATUS } from 'src/modules/performer-assets/constants';
import { EVENT } from 'src/kernel/constants';
import { Model } from 'mongoose';
import {
  DELETE_FILE_TYPE,
  FILE_EVENT,
  MEDIA_FILE_CHANNEL
} from 'src/modules/file/services';
import {
  PERFORMER_PHOTO_CHANNEL,
  PERFORMER_GALLERY_CHANNEL
} from '../constants';
import { PERFORMER_GALLERY_MODEL_PROVIDER } from '../providers';
import { GalleryModel } from '../models';
import { PhotoService } from '../services';

const HANDLE_PHOTO_COUNT_FOR_GALLERY = 'HANDLE_PHOTO_COUNT_FOR_GALLERY';
const HANDLE_DELETE_GALLERY = 'HANDLE_DELETE_GALLERY';

@Injectable()
export class PerformerAssetsListener {
  private readonly logger = new Logger('FileService');

  constructor(
    private readonly queueEventService: QueueEventService,
    private readonly photoService: PhotoService,
    @Inject(PERFORMER_GALLERY_MODEL_PROVIDER)
    private readonly galleryModel: Model<GalleryModel>
  ) {
    this.queueEventService.subscribe(
      PERFORMER_PHOTO_CHANNEL,
      HANDLE_PHOTO_COUNT_FOR_GALLERY,
      this.handlePhotoCount.bind(this)
    );
    this.queueEventService.subscribe(
      PERFORMER_GALLERY_CHANNEL,
      HANDLE_DELETE_GALLERY,
      this.handleDeleteGallery.bind(this)
    );
  }

  public async handlePhotoCount(event: QueueEvent) {
    try {
      const { eventName } = event;
      if (![EVENT.CREATED, EVENT.DELETED, EVENT.UPDATED].includes(eventName)) {
        return;
      }
      const { galleryId, status, oldStatus, oldGallery } = event.data;
      const difGallery =
        oldGallery && oldGallery.toString() !== galleryId.toString();
      let increase = 0;

      switch (eventName) {
        case EVENT.CREATED:
          if (status === PHOTO_STATUS.ACTIVE) increase = 1;
          break;
        case EVENT.UPDATED:
          if (difGallery) return;
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

      if (difGallery && eventName === EVENT.UPDATED) {
        await Promise.all([
          oldStatus === PHOTO_STATUS.ACTIVE
            ? this.galleryModel.updateOne(
                { _id: oldGallery },
                {
                  $inc: {
                    numOfItems: -1
                  }
                }
              )
            : null,
          status === PHOTO_STATUS.ACTIVE
            ? this.galleryModel.updateOne(
                { _id: galleryId },
                {
                  $inc: {
                    numOfItems: 1
                  }
                }
              )
            : null
        ]);
      }

      if (increase) {
        await this.galleryModel.updateOne(
          { _id: galleryId },
          {
            $inc: {
              numOfItems: increase
            }
          }
        );
      }
    } catch (e) {
      // TODO - log me
      // eslint-disable-next-line no-console
      console.log(e);
    }
  }

  async handleDeleteGallery(event: QueueEvent) {
    try {
      const { eventName, data } = event;
      if (![EVENT.DELETED].includes(eventName)) {
        return;
      }
      const { galleryId } = data;
      if (!galleryId) return;
      const photos = await this.photoService.find({ galleryId });
      if (photos.length) {
        const ids = photos.map(p => p._id);
        const fileIds = photos.map(p => p.fileId);
        await this.photoService.deleteManyByIds(ids);
        // eslint-disable-next-line no-restricted-syntax
        for (const fileId of fileIds) {
          this.queueEventService.publish(
            new QueueEvent({
              channel: MEDIA_FILE_CHANNEL,
              eventName: FILE_EVENT.FILE_RELATED_MODULE_UPDATED,
              data: { type: DELETE_FILE_TYPE.FILEID, currentFile: fileId }
            })
          );
        }
      }
    } catch (e) {
      this.logger.error(e);
    }
  }
}
