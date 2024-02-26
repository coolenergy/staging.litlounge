import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Model } from 'mongoose';
import { PageableData } from 'src/kernel';
import { PerformerService } from 'src/modules/performer/services';
import { FileService } from 'src/modules/file/services';
import { PerformerDto } from 'src/modules/performer/dtos';
import { PaymentTokenService } from 'src/modules/purchased-item/services';
import { PURCHASE_ITEM_STATUS } from 'src/modules/purchased-item/constants';
import { UserDto } from 'src/modules/user/dtos';
import { VideoDto } from '../dtos';
import { VideoSearchRequest } from '../payloads';
import { VideoModel } from '../models';
import { PERFORMER_VIDEO_MODEL_PROVIDER } from '../providers';
import { VIDEO_STATUS } from '../constants';

@Injectable()
export class VideoSearchService {
  constructor(
    @Inject(PERFORMER_VIDEO_MODEL_PROVIDER)
    private readonly videoModel: Model<VideoModel>,
    private readonly performerService: PerformerService,
    @Inject(forwardRef(() => FileService))
    private readonly fileService: FileService,
    @Inject(forwardRef(() => PaymentTokenService))
    private readonly paymentTokenService: PaymentTokenService
  ) {}

  public async adminSearch(
    req: VideoSearchRequest,
    jwToken: string
  ): Promise<PageableData<VideoDto>> {
    const query = {} as any;
    if (req.q) query.title = { $regex: req.q };
    if (req.performerId) query.performerId = req.performerId;
    if (req.status) query.status = req.status;
    let sort: {[k: string]: any} = {createdAt: -1};
    if (req.sort && req.sortBy) {
      sort = {
        [req.sortBy]: req.sort
      };
    }
    const [data, total] = await Promise.all([
      this.videoModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(parseInt(req.limit as string, 10))
        .skip(parseInt(req.offset as string, 10)),
      this.videoModel.countDocuments(query)
    ]);

    const performerIds = data.map(d => d.performerId);
    const fileIds = [];
    data.forEach(v => {
      v.thumbnailId && fileIds.push(v.thumbnailId);
      v.fileId && fileIds.push(v.fileId);
    });

    const [performers, files] = await Promise.all([
      performerIds.length ? this.performerService.findByIds(performerIds) : [],
      fileIds.length ? this.fileService.findByIds(fileIds) : []
    ]);

    const videos = data.map(video => {
      const performer = performers.find(
        p => p._id.toString() === video.performerId.toString()
      );
      const thumbnail =
        video.thumbnailId &&
        files.find(f => f._id.toString() === video.thumbnailId.toString());
      const file =
        video.fileId &&
        files.find(f => f._id.toString() === video.fileId.toString());
      return {
        ...video,
        performer: {
          username: performer?.username || 'N/A'
        },
        thumbnail: thumbnail?.getUrl(),
        video: file && {
          url: jwToken
            ? `${file.getUrl()}?videoId=${video._id}&token=${jwToken}`
            : `${file.getUrl()}?videoId=${video._id}`,
          thumbnails: file.getThumbnails(),
          duration: file.duration
        }
      };
    });

    return {
      data: videos.map(v => new VideoDto(v)),
      total
    };
  }

  public async performerSearch(
    req: VideoSearchRequest,
    performer: PerformerDto,
    jwToken: string
  ): Promise<PageableData<VideoDto>> {
    const query = {} as any;
    if (req.q) query.title = { $regex: req.q };
    query.performerId = performer._id;
    if (req.status) query.status = req.status;
    let sort: {[k: string]: any} = {createdAt: -1};
    if (req.sort && req.sortBy) {
      sort = {
        [req.sortBy]: req.sort
      };
    }
    const [data, total] = await Promise.all([
      this.videoModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(parseInt(req.limit as string, 10))
        .skip(parseInt(req.offset as string, 10)),
      this.videoModel.countDocuments(query)
    ]);
    const performerIds = data.map(d => d.performerId);
    const fileIds = [];
    data.forEach(v => {
      v.thumbnailId && fileIds.push(v.thumbnailId);
      v.fileId && fileIds.push(v.fileId);
      v.trailerId && fileIds.push(v.trailerId);
    });

    const [performers, files] = await Promise.all([
      performerIds.length ? this.performerService.findByIds(performerIds) : [],
      fileIds.length ? this.fileService.findByIds(fileIds) : []
    ]);

    const videos = data.map(video => {
      const model = performers.find(
        p => p._id.toString() === video.performerId.toString()
      );
      const thumbnail =
        video.thumbnailId &&
        files.find(f => f._id.toString() === video.thumbnailId.toString());
      const file =
        video.fileId &&
        files.find(f => f._id.toString() === video.fileId.toString());
      const trailer =
        video.trailerId &&
        files.find(f => f._id.toString() === video.trailerId.toString());
      return {
        ...video,
        performer: {
          username: model?.username || 'N/A'
        },
        thumbnail: thumbnail?.getUrl(),
        video: file && {
          url: jwToken
            ? `${file.getUrl()}?videoId=${video._id}&token=${jwToken}`
            : `${file.getUrl()}?videoId=${video._id}`,
          thumbnails: file.getThumbnails(),
          duration: file.duration
        },
        trailer: trailer && {
          url: trailer.getUrl(),
          thumbnails: trailer.getThumbnails(),
          duration: trailer.duration
        }
      };
    });

    return {
      data: videos.map(v => new VideoDto(v)),
      total
    };
  }

  public async userSearch(
    req: VideoSearchRequest,
    user: UserDto,
    jwToken: string
  ): Promise<PageableData<VideoDto>> {
    const query = {} as any;
    if (req.q) query.title = { $regex: req.q };
    if (req.performerId) query.performerId = req.performerId;
    if (req.isSaleVideo) query.isSaleVideo = req.isSaleVideo;

    query.status = VIDEO_STATUS.ACTIVE;
    let sort: {[k: string]: any} = {createdAt: -1};
    if (req.sort && req.sortBy) {
      sort = {
        [req.sortBy]: req.sort
      };
    }
    const [data, total] = await Promise.all([
      this.videoModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(parseInt(req.limit as string, 10))
        .skip(parseInt(req.offset as string, 10)),
      this.videoModel.countDocuments(query)
    ]);
    const performerIds = data.map(d => d.performerId);
    const videoIds = data.map(d => d._id);
    const fileIds = [];
    data.forEach(v => {
      v.thumbnailId && fileIds.push(v.thumbnailId);
      v.fileId && fileIds.push(v.fileId);
    });

    const [performers, files, payments] = await Promise.all([
      performerIds.length ? this.performerService.findByIds(performerIds) : [],
      fileIds.length ? this.fileService.findByIds(fileIds) : [],
      user
        ? this.paymentTokenService.findByQuery({
            targetId: { $in: videoIds },
            // dont need target type because mongoid is different
            sourceId: user._id,
            status: PURCHASE_ITEM_STATUS.SUCCESS
          })
        : []
    ]);

    const videos = data.map(v => {
      const video = new VideoDto(v);
      const purchasedVideo = payments.find(
        payment => payment.targetId.toString() === video._id.toString()
      );
      const performer = performers.find(
        p => p._id.toString() === video.performerId.toString()
      );
      const thumbnail =
        video.thumbnailId &&
        files.find(f => f._id.toString() === video.thumbnailId.toString());
      const file =
        video.fileId &&
        files.find(f => f._id.toString() === video.fileId.toString());
      return {
        ...video,
        isBought: !!purchasedVideo,
        performer: performer ? performer.toPublicDetailsResponse() : null,
        thumbnail: thumbnail?.getUrl(),
        video: file && {
          url: jwToken
            ? `${file.getUrl()}?videoId=${video._id}&token=${jwToken}`
            : `${file.getUrl()}?videoId=${video._id}`,
          thumbnails: file.getThumbnails(),
          duration: file.duration
        }
      };
    });

    return {
      data: videos,
      total
    };
  }
}
