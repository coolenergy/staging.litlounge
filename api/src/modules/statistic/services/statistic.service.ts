import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { STUDIO_MODEL_PROVIDER } from 'src/modules/studio/providers';
import { StudioModel } from 'src/modules/studio/models';
import {
  PERFORMER_GALLERY_MODEL_PROVIDER, PERFORMER_PHOTO_MODEL_PROVIDER,
  PERFORMER_PRODUCT_MODEL_PROVIDER, PERFORMER_VIDEO_MODEL_PROVIDER
} from '../../performer-assets/providers';
import {
  GalleryModel, PhotoModel, ProductModel, VideoModel
} from '../../performer-assets/models';
import { USER_MODEL_PROVIDER } from '../../user/providers';
import { UserModel } from '../../user/models';
import { PERFORMER_MODEL_PROVIDER } from '../../performer/providers';
import { PerformerModel } from '../../performer/models';
import { PAYMENT_TRANSACTION_MODEL_PROVIDER } from '../../payment/providers';
import { OrderModel } from '../../payment/models';
import { EARNING_MODEL_PROVIDER } from '../../earning/providers/earning.provider';
import { EarningModel } from '../../earning/models/earning.model';
import { STATUS_ACTIVE, STATUS_INACTIVE, STATUS_PENDING } from '../../user/constants';
import { PERFORMER_STATUSES } from '../../performer/constants';
import { STUDIO_STATUES } from '../../studio/constants';
import { ORDER_STATUS } from '../../payment/constants';
import {} from '.'

@Injectable()
export class StatisticService {
  constructor(
    @Inject(PERFORMER_GALLERY_MODEL_PROVIDER)
    private readonly galleryModel: Model<GalleryModel>,
    @Inject(PERFORMER_PHOTO_MODEL_PROVIDER)
    private readonly photoModel: Model<PhotoModel>,
    @Inject(PERFORMER_PRODUCT_MODEL_PROVIDER)
    private readonly productModel: Model<ProductModel>,
    @Inject(PERFORMER_VIDEO_MODEL_PROVIDER)
    private readonly videoModel: Model<VideoModel>,
    @Inject(USER_MODEL_PROVIDER)
    private readonly userModel: Model<UserModel>,
    @Inject(PERFORMER_MODEL_PROVIDER)
    private readonly performerModel: Model<PerformerModel>,
    @Inject(STUDIO_MODEL_PROVIDER)
    private readonly studioModel: Model<StudioModel>,
    @Inject(PAYMENT_TRANSACTION_MODEL_PROVIDER)
    private readonly orderModel: Model<OrderModel>,
    @Inject(EARNING_MODEL_PROVIDER)
    private readonly earningModel: Model<EarningModel>
  ) { }

  public async stats(): Promise<any> {
    const totalActiveUsers = await this.userModel.countDocuments({ status: STATUS_ACTIVE });
    const totalInactiveUsers = await this.userModel.countDocuments({ status: STATUS_INACTIVE });
    const totalPendingUsers = await this.userModel.countDocuments({ status: STATUS_PENDING });
    const totalActivePerformers = await this.performerModel.countDocuments({ status: STATUS_ACTIVE });
    const totalInactivePerformers = await this.performerModel.countDocuments({ status: STATUS_INACTIVE });
    const totalPendingPerformers = await this.performerModel.countDocuments({ status: PERFORMER_STATUSES.PENDING });
    const totalActiveStudio = await this.studioModel.countDocuments({ status: STUDIO_STATUES.ACTIVE });
    const totalInactiveStudio = await this.studioModel.countDocuments({ status: STUDIO_STATUES.INACTIVE });
    const totalPendingStudio = await this.studioModel.countDocuments({ status: STUDIO_STATUES.PENDING });
    const totalGalleries = await this.galleryModel.countDocuments({ });
    const totalPhotos = await this.photoModel.countDocuments({ });
    const totalVideos = await this.videoModel.countDocuments({});
    const totalDeliveriedOrders = await this.orderModel.countDocuments({ deliveryStatus: ORDER_STATUS.DELIVERED });
    const totalShippingdOrders = await this.orderModel.countDocuments({ deliveryStatus: ORDER_STATUS.SHIPPING });
    const totalRefundedOrders = await this.orderModel.countDocuments({ deliveryStatus: ORDER_STATUS.REFUNDED });
    const totalProducts = await this.productModel.countDocuments({});
    const [totalGrossPrice, totalNetPrice, totalStreamTime ] = await Promise.all([
      this.earningModel.aggregate([
        {
          $group: {
            _id: null,
            total: {
              $sum: '$grossPrice'
            }
          }
        }
      ]),
      this.earningModel.aggregate([
        {
          $group: {
            _id: null,
            total: {
              $sum: '$netPrice'
            }
          }
        }
      ]),
      this.performerModel.aggregate([
        {
          $group: {
            _id: null,
            total: {
              $sum: '$stats.totalStreamTime'
            }
          }
        }
      ])
    ]);
    return {
      totalActiveUsers,
      totalInactiveUsers,
      totalPendingUsers,
      totalActivePerformers,
      totalInactivePerformers,
      totalPendingPerformers,
      totalActiveStudio,
      totalInactiveStudio,
      totalPendingStudio,
      totalGalleries,
      totalPhotos,
      totalVideos,
      totalProducts,
      totalDeliveriedOrders,
      totalShippingdOrders,
      totalRefundedOrders,
      totalStreamTime: (totalStreamTime && totalStreamTime.length && totalStreamTime[0].total) || 0,
      totalGrossPrice: (totalGrossPrice && totalGrossPrice.length && totalGrossPrice[0].total) || 0,
      totalNetPrice: (totalGrossPrice && totalGrossPrice.length && totalNetPrice[0].total) || 0
    };
  }
}
