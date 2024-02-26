import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { EntityNotFoundException, QueueEventService } from 'src/kernel';
import { FileDto } from 'src/modules/file';
import { UserDto } from 'src/modules/user/dtos';
import {
  DELETE_FILE_TYPE,
  FileService,
  FILE_EVENT,
  MEDIA_FILE_CHANNEL
} from 'src/modules/file/services';
import { merge } from 'lodash';
import { BANNER_STATUS } from '../constants';
import { BannerDto } from '../dtos';
import { BannerCreatePayload, BannerUpdatePayload } from '../payloads';
import { BannerModel } from '../models';
import { BANNER_PROVIDER } from '../providers';

@Injectable()
export class BannerService {
  constructor(
    @Inject(BANNER_PROVIDER)
    private readonly bannerModel: Model<BannerModel>,
    @Inject(forwardRef(() => FileService))
    private readonly fileService: FileService,
    private readonly queueEventService: QueueEventService
  ) {}

  public async upload(
    file: FileDto,
    payload: BannerCreatePayload,
    creator?: UserDto
  ): Promise<BannerDto> {
    if (!file) throw new Error('File is valid!');
    if (!file.isImage()) {
      await this.fileService.removeIfNotHaveRef(file._id);
      throw new Error('Invalid image!');
    }

    // eslint-disable-next-line new-cap
    const banner = new this.bannerModel(payload);
    if (!banner.title) banner.title = file.name;

    banner.fileId = file._id;
    banner.createdAt = new Date();
    banner.updatedAt = new Date();
    if (creator) {
      banner.createdBy = creator._id;
      banner.updatedBy = creator._id;
    }
    banner.processing = false;
    await banner.save();
    await Promise.all([
      this.fileService.addRef(file._id, {
        itemType: 'banner',
        itemId: banner._id
      })
    ]);

    const dto = new BannerDto(banner);

    return dto;
  }

  public async create(
    payload: BannerCreatePayload,
    creator?: UserDto
  ): Promise<BannerDto> {

    // eslint-disable-next-line new-cap
    const banner = new this.bannerModel(payload);
    if (creator) {
      banner.createdBy = creator._id;
      banner.updatedBy = creator._id;
    }
    banner.processing = false;
    await banner.save();

    const dto = new BannerDto(banner);

    return dto;
  }

  public async updateInfo(
    id: string | ObjectId,
    payload: BannerUpdatePayload,
    updater: UserDto
  ): Promise<BannerDto> {
    const banner = await this.bannerModel.findById(id);
    if (!banner) {
      throw new EntityNotFoundException();
    }

    const { fileId } = banner;
    merge(banner, payload);
    if (
      banner.status !== BANNER_STATUS.FILE_ERROR &&
      payload.status !== BANNER_STATUS.FILE_ERROR
    ) {
      banner.status = payload.status;
    }
    updater && banner.set('updatedBy', updater._id);
    banner.updatedAt = new Date();
    await banner.save();
    if (fileId && payload.fileId) {
      await this.queueEventService.publish({
        channel: MEDIA_FILE_CHANNEL,
        eventName: FILE_EVENT.FILE_RELATED_MODULE_UPDATED,
        data: {
          type: DELETE_FILE_TYPE.FILEID,
          currentFile: fileId,
          newFile: payload.fileId
        }
      });
    }
    const dto = new BannerDto(banner);
    return dto;
  }

  public async details(
    id: string | ObjectId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    userDto?: UserDto
  ): Promise<BannerDto> {
    const banner = await this.bannerModel.findOne({ _id: id });
    if (!banner) {
      throw new EntityNotFoundException();
    }

    const dto = new BannerDto(banner);
    const [file] = await Promise.all([
      banner.fileId ? this.fileService.findById(banner.fileId) : null
    ]);
    if (file) {
      dto.photo = {
        url: file.getUrl(),
        thumbnails: file.getThumbnails(),
        width: file.width,
        height: file.height
      };
    }

    return dto;
  }

  public async delete(id: string | ObjectId) {
    const banner = await this.bannerModel.findById(id);
    if (!banner) {
      throw new EntityNotFoundException();
    }

    await banner.remove();
    await this.queueEventService.publish({
      channel: MEDIA_FILE_CHANNEL,
      eventName: FILE_EVENT.ASSETS_ITEM_DELETED,
      data: {
        type: 'banner',
        metadata: banner.toObject()
      }
    })
    return true;
  }
}
