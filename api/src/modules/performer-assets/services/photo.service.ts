/* eslint-disable no-shadow */
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import {
  QueueEventService,
  QueueEvent,
  EntityNotFoundException
} from 'src/kernel';
import { FileDto } from 'src/modules/file';
import { UserDto } from 'src/modules/user/dtos';
import {
  DELETE_FILE_TYPE,
  FileService,
  FILE_EVENT,
  MEDIA_FILE_CHANNEL
} from 'src/modules/file/services';
import { merge } from 'lodash';
import { PerformerService } from 'src/modules/performer/services';
import { EVENT } from 'src/kernel/constants';
import { PaymentTokenService } from 'src/modules/purchased-item/services';
import { PurchaseItemType } from 'src/modules/purchased-item/constants';
import { AuthService } from 'src/modules/auth/services';
import { Request } from 'express';
import { PHOTO_STATUS, PERFORMER_PHOTO_CHANNEL } from '../constants';
import { PhotoDto, GalleryDto } from '../dtos';
import { PhotoCreatePayload, PhotoUpdatePayload } from '../payloads';
import { GalleryService } from './gallery.service';
import { PhotoModel } from '../models';
import { PERFORMER_PHOTO_MODEL_PROVIDER } from '../providers';

const FILE_PROCESSED_TOPIC = 'FILE_PROCESSED';
const UPDATE_DEFAULT_COVER_GALLERY = 'UPDATE_DEFAULT_COVER_GALLERY';
@Injectable()
export class PhotoService {
  constructor(
    @Inject(PERFORMER_PHOTO_MODEL_PROVIDER)
    private readonly PhotoModel: Model<PhotoModel>,
    private readonly queueEventService: QueueEventService,
    @Inject(forwardRef(() => FileService))
    private readonly fileService: FileService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @Inject(forwardRef(() => PaymentTokenService))
    private readonly paymentTokenService: PaymentTokenService,
    @Inject(forwardRef(() => GalleryService))
    private readonly galleryService: GalleryService,
    @Inject(forwardRef(() => PerformerService))
    private readonly performerService: PerformerService
  ) {
    this.queueEventService.subscribe(
      PERFORMER_PHOTO_CHANNEL,
      FILE_PROCESSED_TOPIC,
      this.handleFileProcessed.bind(this)
    );

    this.queueEventService.subscribe(
      PERFORMER_PHOTO_CHANNEL,
      UPDATE_DEFAULT_COVER_GALLERY,
      this.handleDefaultCoverGallery.bind(this)
    );
  }

  public async find(condition = {}) {
    return this.PhotoModel.find(condition);
  }

  public async handleFileProcessed(event: QueueEvent) {
    try {
      if (event.eventName !== FILE_EVENT.PHOTO_PROCESSED) return;

      const { photoId } = event.data.meta;
      const [photo, file] = await Promise.all([
        this.PhotoModel.findById(photoId),
        this.fileService.findById(event.data.fileId)
      ]);
      if (!photo) {
        // TODO - delete file?
        return;
      }
      photo.processing = false;
      if (file.status === 'error') {
        photo.status = PHOTO_STATUS.FILE_ERROR;
      }
      await photo.save();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  }

  public async create(
    file: FileDto,
    payload: PhotoCreatePayload,
    creator?: UserDto
  ): Promise<PhotoDto> {
    if (!file) throw new Error('File is valid!');
    if (!file.isImage()) {
      await this.fileService.removeIfNotHaveRef(file._id);
      throw new Error('Invalid image!');
    }

    // process to create thumbnails
    const photo = new this.PhotoModel(payload);
    if (!photo.title) photo.title = file.name;

    photo.fileId = file._id;
    if (creator) {
      photo.createdBy = creator._id;
      photo.updatedBy = creator._id;
    }
    photo.processing = true;
    await photo.save();
    await Promise.all([
      this.fileService.addRef(file._id, {
        itemType: 'performer-photo',
        itemId: photo._id
      }),
      this.fileService.queueProcessPhoto(file._id, {
        meta: {
          photoId: photo._id
        },
        publishChannel: PERFORMER_PHOTO_CHANNEL,
        thumbnailSize: {
          width: 250,
          height: 250
        }
      })
    ]);

    const dto = new PhotoDto(photo);
    await this.queueEventService.publish(
      new QueueEvent({
        channel: PERFORMER_PHOTO_CHANNEL,
        eventName: EVENT.CREATED,
        data: dto
      })
    );

    return dto;
  }

  public async updateInfo(
    id: string | ObjectId,
    payload: PhotoUpdatePayload,
    file: FileDto,
    updater?: UserDto
  ): Promise<PhotoDto> {
    const photo = await this.PhotoModel.findById(id);
    if (!photo) {
      throw new EntityNotFoundException();
    }

    const oldStatus = photo.status;
    const oldGallery = photo.galleryId;
    const currentFile = photo.fileId;

    if (file) {
      if (!file.isImage) {
        await this.fileService.removeIfNotHaveRef(file._id);
        throw new Error('Invalid image!');
      }

      photo.fileId = file._id;
    }

    merge(photo, payload);
    if (
      photo.status !== PHOTO_STATUS.FILE_ERROR &&
      payload.status !== PHOTO_STATUS.FILE_ERROR
    ) {
      photo.status = payload.status;
    }

    updater && photo.set('updatedBy', updater._id);
    photo.updatedAt = new Date();
    await photo.save();
    if (file && file.isImage()) {
      await Promise.all([
        this.fileService.addRef(file._id, {
          itemType: 'performer-photo',
          itemId: photo._id
        }),
        this.fileService.queueProcessPhoto(file._id, {
          meta: {
            photoId: photo._id
          },
          publishChannel: PERFORMER_PHOTO_CHANNEL,
          thumbnailSize: {
            width: 250,
            height: 250
          }
        }),
        this.queueEventService.publish(
          new QueueEvent({
            channel: MEDIA_FILE_CHANNEL,
            eventName: FILE_EVENT.FILE_RELATED_MODULE_UPDATED,
            data: {
              type: DELETE_FILE_TYPE.FILEID,
              currentFile,
              newFile: file._id
            }
          })
        )
      ]);
    }
    const dto = new PhotoDto(photo);
    this.queueEventService.publish(
      new QueueEvent({
        channel: PERFORMER_PHOTO_CHANNEL,
        eventName: EVENT.UPDATED,
        data: {
          ...dto,
          oldStatus,
          oldGallery
        }
      })
    );

    return dto;
  }

  public async details(
    id: string | ObjectId,
    jwToken: string
  ): Promise<PhotoDto> {
    const photo = await this.PhotoModel.findOne({ _id: id });
    if (!photo) {
      throw new EntityNotFoundException();
    }

    const dto = new PhotoDto(photo);
    const [performer, gallery, file] = await Promise.all([
      photo.performerId
        ? this.performerService.findById(photo.performerId)
        : null,
      photo.galleryId ? this.galleryService.findById(photo.galleryId) : null,
      photo.fileId ? this.fileService.findById(photo.fileId) : null
    ]);
    if (performer) dto.performer = { username: performer.username };
    if (gallery) dto.gallery = new GalleryDto(gallery);
    if (file) {
      dto.photo = {
        url: jwToken
          ? `${file.getUrl()}?galleryId=${photo.galleryId}&token=${jwToken}`
          : `${file.getUrl()}?galleryId=${photo.galleryId}&token=${jwToken}`,
        thumbnails: file.getThumbnails(),
        width: file.width,
        height: file.height
      };
    }

    return dto;
  }

  public async delete(id: string | ObjectId) {
    const photo = await this.PhotoModel.findById(id);
    if (!photo) {
      throw new EntityNotFoundException();
    }

    const dto = new PhotoDto(photo);

    await photo.remove();
    // TODO - should check ref and remove
    photo.fileId && await this.fileService.remove(photo.fileId);
    await this.queueEventService.publish(
      new QueueEvent({
        channel: PERFORMER_PHOTO_CHANNEL,
        eventName: EVENT.DELETED,
        data: dto
      })
    );
    return true;
  }

  public async deleteMany(condition) {
    return this.PhotoModel.deleteMany(condition);
  }

  public deleteManyByIds(ids: string[] | ObjectId[]) {
    return this.PhotoModel.deleteMany({_id: {$in: ids}});
  }

  private async handleDefaultCoverGallery(event: QueueEvent) {
    if (![EVENT.CREATED, EVENT.UPDATED].includes(event.eventName)) {
      return;
    }
    const photo = event.data as PhotoDto;
    if (!photo.galleryId) return;

    const defaultCover = await this.PhotoModel.findOne({
      galleryId: photo.galleryId,
      status: PHOTO_STATUS.ACTIVE
    });
    await this.galleryService.updateCover(
      photo.galleryId,
      defaultCover ? defaultCover._id : null
    );

    // update cover field in the photo list
    const photoCover = await this.PhotoModel.findOne({
      galleryId: photo.galleryId,
      isGalleryCover: true
    });
    if (
      !defaultCover ||
      (photoCover && photoCover._id.toString() === defaultCover.toString())
    )
      return;
    await this.PhotoModel.updateOne(
      { _id: defaultCover._id },
      {
        isGalleryCover: true
      }
    );
  }

  public async checkAuth(req: Request) {
    const {
      query: { galleryId, token }
    } = req;
    const gallery =
      galleryId && (await this.galleryService.findById(galleryId as string));
    if (!gallery) {
      return false;
    }

    if (!gallery.isSale) {
      return true;
    }

    if (!token) {
      return false;
    }

    const user = await this.authService.getSourceFromJWT(token as string);
    if (!user) {
      return false;
    }

    if (user.roles && user.roles.includes('admin')) {
      return true;
    }

    if (user._id.toString() === gallery.performerId.toString()) {
      return true;
    }

    const checkBought = await this.paymentTokenService.checkBought(
      gallery._id,
      PurchaseItemType.PHOTO,
      user
    );
    if (checkBought) {
      return true;
    }

    return false;
  }
}
