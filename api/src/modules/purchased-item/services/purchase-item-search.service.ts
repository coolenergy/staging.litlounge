import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { UserService } from 'src/modules/user/services';
import { PerformerService } from 'src/modules/performer/services';
import { UserDto } from 'src/modules/user/dtos';
import { FileService } from 'src/modules/file/services';
import { Model } from 'mongoose';
import * as moment from 'moment';
import { PERFORMER_PHOTO_MODEL_PROVIDER, PERFORMER_VIDEO_MODEL_PROVIDER } from 'src/modules/performer-assets/providers';
import { PhotoModel, VideoModel } from 'src/modules/performer-assets/models';
import { VideoDto } from 'src/modules/performer-assets/dtos';
import { FileDto } from 'src/modules/file';
import { GalleryService } from 'src/modules/performer-assets/services';
import { PURCHASE_ITEM_MODEL_PROVIDER } from '../providers';
import { PurchaseItemModel } from '../models';
import { PaymentTokenSearchPayload } from '../payloads';
import { PurchasedItemDto } from '../dtos';
import { PURCHASE_ITEM_TYPE } from '../constants';

@Injectable()
export class PurchasedItemSearchService {
  constructor(
    @Inject(forwardRef(() => FileService))
    private readonly fileService: FileService,
    @Inject(forwardRef(() => PerformerService))
    private readonly performerService: PerformerService,
    @Inject(PURCHASE_ITEM_MODEL_PROVIDER)
    private readonly PaymentTokenModel: Model<PurchaseItemModel>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(PERFORMER_VIDEO_MODEL_PROVIDER)
    private readonly videoModel: Model<VideoModel>,
    @Inject(PERFORMER_PHOTO_MODEL_PROVIDER)
    // eslint-disable-next-line no-shadow
    private readonly PhotoModel: Model<PhotoModel>,
    @Inject(forwardRef(() => GalleryService))
    private readonly galleryService: GalleryService
  ) {}

  public async getUserTransactionsToken(
    req: PaymentTokenSearchPayload,
    user: UserDto
  ) {
    const query = {
      source: 'user',
      sourceId: user._id
    } as any;
    if (req.type) query.type = req.type;
    if (req.status) query.status = req.status;
    if (req.sellerId) query.sellerId = req.sellerId;
    if (req.performerId) query.sellerId = req.sellerId;
    if (req.fromDate && req.toDate) {
      query.createdAt = {
        $gt: moment(req.fromDate).startOf('day'),
        $lt: moment(req.toDate).endOf('day')
      };
    }
    const sort = {
      [req.sortBy || 'updatedAt']: req.sort || -1
    };
    const [data, total] = await Promise.all([
      this.PaymentTokenModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(parseInt(req.limit as string, 10))
        .skip(parseInt(req.offset as string, 10)),
      this.PaymentTokenModel.countDocuments(query)
    ]);
    const performerIds = data.filter(d => d.sellerId).map(d => d.sellerId);
    const performers = performerIds.length ?
      await this.performerService.findByIds(performerIds) :
      [];

    const dtos = data.map(d => new PurchasedItemDto(d));
    dtos.forEach(dto => {
      if (dto.sellerId) {
        const performer = performers.find(p => p._id.toString() === dto.sellerId.toString());
        // eslint-disable-next-line no-param-reassign
        dto.sellerInfo = performer?.toPublicDetailsResponse();
      }
    });
    await this._mapVideoInfo(dtos);
    await this._mapGalleryInfo(dtos);

    return {
      total,
      data: dtos
    };
  }

  public async adminGetUserTransactionsToken(req: PaymentTokenSearchPayload) {
    const query = {} as any;
    if (req.sourceId) query.sourceId = req.sourceId;
    if (req.source) query.source = req.source;
    if (req.type) query.type = req.type;
    if (req.status) query.status = req.status;
    if (req.target) query.target = req.target;
    if (req.targetId) query.targetId = req.targetId;
    if (req.sellerId) query.sellerId = req.sellerId;
    if (req.performerId) query.sellerId = req.sellerId;
    if (req.fromDate && req.toDate) {
      query.createdAt = {
        $gt: moment(req.fromDate).startOf('day'),
        $lt: moment(req.toDate).endOf('day')
      };
    }
    const sort = {
      [req.sortBy || 'updatedAt']: req.sort || -1
    };
    const [data, total] = await Promise.all([
      this.PaymentTokenModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(parseInt(req.limit as string, 10))
        .skip(parseInt(req.offset as string, 10)),
      this.PaymentTokenModel.countDocuments(query)
    ]);
    const sourceIds = data.filter(d => d.source === 'user').map(d => d.sourceId);
    const sellerIds = data.map(d => d.sellerId);
    const [users, performers] = await Promise.all([
      sourceIds.length ? this.userService.findByIds(sourceIds) : [],
      sellerIds ? this.performerService.findByIds(sellerIds) : []
    ]);

    const dtos = data.map(d => new PurchasedItemDto(d));
    dtos.forEach(dto => {
      const performer = performers.find(p => p._id.toString() === dto.sellerId.toString());
      // eslint-disable-next-line no-param-reassign
      dto.sellerInfo = performer?.toResponse();

      const user = users.find(u => u._id.toString() === dto.sourceId.toString());
      // eslint-disable-next-line no-param-reassign
      dto.sourceInfo = user?.toResponse();
    });

    return {
      total,
      data: dtos
    };
  }

  public async userSearchPurchasedItem(query, sort, req) {
    const [data, total] = await Promise.all([
      this.PaymentTokenModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(parseInt(req.limit, 10))
        .skip(parseInt(req.offset, 10)),
      this.PaymentTokenModel.countDocuments(query)
    ]);

    return {
      total,
      data: data.map(d => new PurchasedItemDto(d))
    };
  }

  private async _mapVideoInfo(purchasedItems: PurchasedItemDto[]) {
    const videoIds = purchasedItems.filter(p => p.type === PURCHASE_ITEM_TYPE.SALE_VIDEO).map(p => p.targetId);
    if (!videoIds) return;
    const videoModels = await this.videoModel.find({ _id: { $in: videoIds } });
    if (!videoModels.length) return;
    const videos = videoModels.map(v => new VideoDto(v));
    const videoFiles = await Promise.all(
      videoModels
        .filter(v => v.fileId)
        .map(v => this.fileService.findById(v.fileId))
    );
    videos.forEach(v => {
      if (v.fileId) {
        const videoFile = videoFiles.find(f => f._id.toString() === v.fileId.toString());
        if (videoFile) {
          // eslint-disable-next-line no-param-reassign
          v.video = {
            duration: videoFile.duration,
            thumbnails: (videoFile.thumbnails || [])
              .map((thumb) => FileDto.getPublicUrl(thumb.path))
          };
        }
      }
    });
    purchasedItems.forEach(p => {
      const video = p.targetId && videos.find(v => p.targetId.toString() === v._id.toString());
      // eslint-disable-next-line no-param-reassign
      if (video) p.targetInfo = video;
    });
  }

  private async _mapGalleryInfo(purchasedItems: PurchasedItemDto[]) {
    const galleryIds = purchasedItems.filter(p => p.type === PURCHASE_ITEM_TYPE.PHOTO).map(p => p.targetId);
    if (!galleryIds) return;
    const galleries = await this.galleryService.findByIds(galleryIds);
    if (!galleries.length) return;
    const coverPhotoIds = galleries.filter(g => g.coverPhotoId).map(g => g.coverPhotoId);
    const coverFiles = coverPhotoIds.length ?
      await this.PhotoModel.find({ _id: { $in: coverPhotoIds } }) :
      [];
    if (coverFiles.length) {
      const fileIds = coverFiles.map(c => c.fileId);
      const files = await this.fileService.findByIds(fileIds);
      galleries.forEach(g => {
        if (g.coverPhotoId) {
          const coverPhoto = coverFiles.find(c => c._id.toString() === g.coverPhotoId.toString());
          if (coverPhoto) {
            const file = files.find(f => f._id.toString() === coverPhoto.fileId.toString());
            if (file) {
              // eslint-disable-next-line no-param-reassign
              g.coverPhoto = {
                thumbnails: file.getThumbnails()
              };
            }
          }
        }
      });
    }

    purchasedItems.forEach(p => {
      const gallery = p.targetId && galleries.find(g => p.targetId.toString() === g._id.toString());
      if (gallery) {
        // eslint-disable-next-line no-param-reassign
        p.targetInfo = gallery;
      }
    });
  }
}
