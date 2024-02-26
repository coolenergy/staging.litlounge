/* eslint-disable no-console */
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { QueueEventService, QueueEvent, EntityNotFoundException } from 'src/kernel';
import { FileDto } from 'src/modules/file';
import { UserDto } from 'src/modules/user/dtos';
import { PerformerDto } from 'src/modules/performer/dtos';
import { FileService, FILE_EVENT, MEDIA_FILE_CHANNEL } from 'src/modules/file/services';
import { PerformerService } from 'src/modules/performer/services';
import { merge } from 'lodash';
import { EVENT } from 'src/kernel/constants';
import { AuthService } from 'src/modules/auth/services';
import { Request } from 'express';
import { PaymentTokenService } from 'src/modules/purchased-item/services';
import { VideoUpdatePayload } from '../payloads';
import { VideoDto } from '../dtos';
import { VIDEO_STATUS, PERFORMER_VIDEO_CHANNEL } from '../constants';
import { VideoCreatePayload } from '../payloads/video-create.payload';
import { VideoModel } from '../models';
import { PERFORMER_VIDEO_MODEL_PROVIDER } from '../providers';

const FILE_PROCESSED_TOPIC = 'FILE_PROCESSED';

@Injectable()
export class VideoService {
  constructor(
    @Inject(PERFORMER_VIDEO_MODEL_PROVIDER)
    // eslint-disable-next-line no-shadow
    private readonly VideoModel: Model<VideoModel>,
    private readonly queueEventService: QueueEventService,
    @Inject(forwardRef(() => FileService))
    private readonly fileService: FileService,
    private readonly performerService: PerformerService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @Inject(forwardRef(() => PaymentTokenService))
    private readonly paymentTokenService: PaymentTokenService
  ) {
    this.queueEventService.subscribe(
      PERFORMER_VIDEO_CHANNEL,
      FILE_PROCESSED_TOPIC,
      this.handleFileProcessed.bind(this)
    );
  }

  public async findByIds(ids: string[] | ObjectId[]): Promise<VideoDto[]> {
    const videos = await this.VideoModel
      .find({
        _id: {
          $in: ids
        }
      })
      .lean()
      .exec();
    return videos.map((p) => new VideoDto(p));
  }

  public async findById(id: string | ObjectId): Promise<VideoDto> {
    const video = await this.VideoModel
      .findOne({
        _id: id
      })
      .lean()
      .exec();
    return new VideoDto(video);
  }

  public async handleFileProcessed(event: QueueEvent) {
    try {
      const { eventName } = event;
      if (eventName !== FILE_EVENT.VIDEO_PROCSSED) {
        return;
      }
      const { videoId } = event.data.meta;
      const [video, file] = await Promise.all([
        this.VideoModel.findById(videoId),
        this.fileService.findById(event.data.fileId)
      ]);
      if (!video) {
        // TODO - delete file?
        return;
      }
      const oldStatus = video.status;
      video.processing = false;
      if (file.status === 'error') {
        video.status = VIDEO_STATUS.FILE_ERROR;
      }
      await video.save();
      // update new status?
      await this.queueEventService.publish(
        new QueueEvent({
          channel: PERFORMER_VIDEO_CHANNEL,
          eventName: EVENT.UPDATED,
          data: {
            ...new VideoDto(video),
            oldStatus
          }
        })
      );
    } catch (e) {
      // TODO - log me
      console.log(e);
    }
  }

  private getVideoForView(fileDto: FileDto, videoId: string | ObjectId, jwToken: string) {
    // get thumb, video link, thumbnails, etc...
    return {
      url: jwToken ? `${fileDto.getUrl()}?videoId=${videoId}&token=${jwToken}` : `${fileDto.getUrl()}?videoId=${videoId}`,
      duration: fileDto.duration,
      thumbnails: (fileDto.thumbnails || []).map((thumb) => FileDto.getPublicUrl(thumb.path))
    };
  }

  public async create(
    video: FileDto,
    trailer: FileDto,
    thumbnail: FileDto,
    payload: VideoCreatePayload,
    creator?: PerformerDto
  ): Promise<VideoDto> {
    let valid = true;
    if (!video) valid = false;

    if (!valid && thumbnail) {
      await this.fileService.remove(thumbnail._id);
    }

    if (thumbnail && !thumbnail.isImage()) {
      // delete thumb if ok
      // TODO - detect ref and delete if not have
      await this.fileService.remove(thumbnail._id);
    }

    if (video && !video.mimeType.toLowerCase().includes('video') && (video.name.split('.').pop() || '').toLocaleLowerCase() !== 'mkv') {
      await this.fileService.remove(video._id);
    }

    if (trailer && !trailer.mimeType.toLowerCase().includes('video') && (trailer.name.split('.').pop() || '').toLocaleLowerCase() !== 'mkv') {
      await this.fileService.remove(trailer._id);
    }

    if (!valid) {
      throw new Error('Invalid file format');
    }

    // TODO - check performer and other info?
    const model = new this.VideoModel(payload);
    model.fileId = video._id;
    model.thumbnailId = thumbnail ? thumbnail._id : null;
    model.trailerId = trailer ? trailer._id : null;
    model.processing = true;
    creator && model.set('createdBy', creator._id);
    model.createdAt = new Date();
    model.updatedAt = new Date();
    await model.save();

    model.thumbnailId
      && (await this.fileService.addRef(model.thumbnailId, {
        itemId: model._id,
        itemType: 'performer-video-thumbnail'
      }));
    model.fileId
      && (await this.fileService.addRef(model.fileId, {
        itemType: 'performer-video',
        itemId: model._id
      }));
    model.trailerId
      && (await this.fileService.addRef(model.trailerId, {
        itemType: 'performer-trailer-video',
        itemId: model._id
      }));

    await this.queueEventService.publish(
      new QueueEvent({
        channel: PERFORMER_VIDEO_CHANNEL,
        eventName: EVENT.CREATED,
        data: new VideoDto(model)
      })
    );

    await this.fileService.queueProcessVideo(model.fileId, {
      publishChannel: PERFORMER_VIDEO_CHANNEL,
      meta: {
        videoId: model._id
      }
    });
    return new VideoDto(model);
  }

  // TODO - add a service to query details from public user
  // this request is for admin or owner only?
  public async getDetails(videoId: string | ObjectId, jwToken: string): Promise<VideoDto> {
    const video = await this.VideoModel.findById(videoId);
    if (!video) throw new EntityNotFoundException();

    const [performer, videoFile, trailerFile, thumbnailFile] = await Promise.all([
      this.performerService.findById(video.performerId),
      this.fileService.findById(video.fileId),
      video.trailerId ? this.fileService.findById(video.trailerId) : null,
      video.thumbnailId ? this.fileService.findById(video.thumbnailId) : null
    ]);

    // TODO - define interface or dto?
    const dto = new VideoDto(video);
    dto.thumbnail = thumbnailFile ? thumbnailFile.getUrl() : null;
    dto.video = this.getVideoForView(videoFile, dto._id, jwToken);
    dto.trailer = trailerFile ? this.getVideoForView(trailerFile, null, null) : null;
    dto.performer = performer
      ? {
        username: performer.username
      }
      : null;
    return dto;
  }

  public async userGetDetails(videoId: string | ObjectId, currentUser: UserDto, jwToken: string): Promise<VideoDto> {
    const video = await this.VideoModel.findById(videoId);
    if (!video) throw new EntityNotFoundException();

    const [performer, videoFile, thumbnailFile, trailerFile] = await Promise.all([
      this.performerService.findById(video.performerId),
      this.fileService.findById(video.fileId),
      video.thumbnailId ? this.fileService.findById(video.thumbnailId) : null,
      video.trailerId ? this.fileService.findById(video.trailerId) : null
    ]);

    // TODO - define interface or dto?
    const dto = new VideoDto(video);
    dto.thumbnail = thumbnailFile ? thumbnailFile.getUrl() : null;
    dto.trailer = trailerFile ? this.getVideoForView(trailerFile, null, null) : null;
    // TODO check video for sale or subscriber
    if (!dto.isSaleVideo) {
      dto.video = this.getVideoForView(videoFile, dto._id, jwToken);
    } else {
      const isBought = await this.paymentTokenService.checkBoughtVideo(dto._id, currentUser);
      dto.video = this.getVideoForView(videoFile, dto._id, jwToken );
      dto.isBought = isBought;
    }

    dto.performer = performer ? performer.toPublicDetailsResponse() : null;
    return dto;
  }

  public async increaseView(id: string | ObjectId) {
    return this.VideoModel.updateOne({ _id: id }, {
      $inc: { 'stats.views': 1 }
    }, { new: true });
  }

  public async updateInfo(
    id: string | ObjectId,
    payload: VideoUpdatePayload,
    file: FileDto,
    trailer: FileDto,
    thumbnail: FileDto,
    updater?: PerformerDto
  ): Promise<VideoDto> {
    const video = await this.VideoModel.findById(id);
    if (!video) {
      throw new EntityNotFoundException();
    }
    const oldStatus = video.status;

    merge(video, payload);
    if (video.status !== VIDEO_STATUS.FILE_ERROR && payload.status !== VIDEO_STATUS.FILE_ERROR) {
      video.status = payload.status;
    }
    const deletedFileIds = [];
    if (file) {
      video.fileId && deletedFileIds.push(video.fileId);
      video.fileId = file._id;
    }

    if (trailer) {
      video.trailerId && deletedFileIds.push(video.trailerId);
      video.trailerId = trailer._id;
    }

    if (thumbnail) {
      video.thumbnailId && deletedFileIds.push(video.thumbnailId);
      video.thumbnailId = thumbnail._id;
    }

    updater && video.set('updatedBy', updater._id);
    video.updatedAt = new Date();
    await video.save();

    deletedFileIds.length && (
      await Promise.all(deletedFileIds.map((deletedFileId) => this.fileService.remove(deletedFileId)))
    );

    const dto = new VideoDto(video);

    await this.queueEventService.publish(
      new QueueEvent({
        channel: PERFORMER_VIDEO_CHANNEL,
        eventName: EVENT.UPDATED,
        data: {
          ...dto,
          oldStatus
        }
      })
    );

    return dto;
  }

  public async delete(id: string | ObjectId) {
    const video = await this.VideoModel.findById(id);
    if (!video) {
      throw new EntityNotFoundException();
    }

    await video.remove();
    await Promise.all([
      this.queueEventService.publish(
        new QueueEvent({
          channel: PERFORMER_VIDEO_CHANNEL,
          eventName: EVENT.DELETED,
          data: new VideoDto(video)
        })
      ),
      this.queueEventService.publish({
        channel: MEDIA_FILE_CHANNEL,
        eventName: FILE_EVENT.ASSETS_ITEM_DELETED,
        data: {
          type: 'video',
          metadata: video.toObject()
        }
      })
    ]);
    return true;
  }

  public async checkAuth(req: Request) {
    const { query: {videoId, token} } = req;
    if (!videoId) {
      return false
    }

    const video = await this.VideoModel.findById(videoId);
    if (!video) {
      return false;
    }

    if (!video.isSaleVideo) {
      return true;
    }

    if (!token) {
      return false;
    }

    const user = await this.authService.getSourceFromJWT(token as string);
    if (user.roles && user.roles.includes('admin')) {
      return true;
    }

    if (user._id.toString() === video.performerId.toString()) {
      return true;
    }

    const checkBought = await this.paymentTokenService.checkBoughtVideo(video._id, user);
    if (checkBought) {
      return true;
    }
    return false;
  }
}
