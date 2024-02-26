import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { UserDto } from 'src/modules/user/dtos';
import {
  EntityNotFoundException,
  QueueEventService,
  QueueEvent
} from 'src/kernel';
import { EVENT, ROLE } from 'src/kernel/constants';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import {
  ProductService,
  GalleryService
} from 'src/modules/performer-assets/services';
import { SettingService } from 'src/modules/settings';
import { SETTING_KEYS } from 'src/modules/settings/constants';
import { PerformerService } from 'src/modules/performer/services';
import { PRODUCT_TYPE } from 'src/modules/performer-assets/constants';
import { VideoModel } from 'src/modules/performer-assets/models';
import { PurchaseItemModel } from 'src/modules/purchased-item/models';
import { PERFORMER_VIDEO_MODEL_PROVIDER } from 'src/modules/performer-assets/providers';
import { ConversationService } from 'src/modules/message/services';
import { PerformerOfflineException } from 'src/modules/performer/exceptions';
import { PurchaseProductsPayload, SendTipsPayload } from '../payloads';
import {
  ItemHaveBoughtException,
  ItemNotForSaleException,
  NotEnoughMoneyException,
  OverProductStockException
} from '../exceptions';
import {
  PURCHASE_ITEM_TYPE,
  PURCHASE_ITEM_TARGET_TYPE,
  PURCHASED_ITEM_SUCCESS_CHANNEL,
  PURCHASE_ITEM_STATUS
} from '../constants';
import { PURCHASE_ITEM_MODEL_PROVIDER } from '../providers';

@Injectable()
export class PurchaseItemService {
  constructor(
    @Inject(PURCHASE_ITEM_MODEL_PROVIDER)
    private readonly PaymentTokenModel: Model<PurchaseItemModel>,
    @Inject(PERFORMER_VIDEO_MODEL_PROVIDER)
    private readonly videoModel: Model<VideoModel>,
    @Inject(forwardRef(() => QueueEventService))
    private readonly queueEventService: QueueEventService,
    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService,
    @Inject(forwardRef(() => PerformerService))
    private readonly performerService: PerformerService,
    @Inject(forwardRef(() => GalleryService))
    private readonly galleryService: GalleryService,
    @Inject(forwardRef(() => SettingService))
    private readonly settingService: SettingService,
    @Inject(forwardRef(() => ConversationService))
    private readonly conversationService: ConversationService
  ) {}

  public async findById(id: string | ObjectId) {
    return this.PaymentTokenModel.findById(id);
  }

  public async purchaseProduct(
    id: string | ObjectId,
    user: UserDto,
    payload: PurchaseProductsPayload
  ) {
    const product = await this.productService.getDetails(id);
    if (!product) throw new EntityNotFoundException();

    let transaction =
      product.type === PRODUCT_TYPE.DIGITAL &&
      (await this.PaymentTokenModel.findOne({
        sourceId: user._id,
        targetId: product._id,
        status: PURCHASE_ITEM_STATUS.SUCCESS,
        type: PURCHASE_ITEM_TYPE.PRODUCT
      }));
    if (transaction) {
      throw new ItemHaveBoughtException();
    }

    const quantity = payload?.quantity || 1;
    const purchaseToken =
      product.type === PRODUCT_TYPE.DIGITAL
        ? product.token
        : product.token * quantity;
    if (user.balance < purchaseToken) throw new NotEnoughMoneyException();

    if (product.type === PRODUCT_TYPE.PHYSICAL && quantity > product.stock) {
      throw new OverProductStockException();
    }

    if (user.balance < product.token) throw new NotEnoughMoneyException();
    transaction = new this.PaymentTokenModel({
      source: 'user',
      sourceId: user._id,
      target: PURCHASE_ITEM_TARGET_TYPE.PRODUCT,
      targetId: product._id,
      sellerId: product.performerId,
      type: PURCHASE_ITEM_TYPE.PRODUCT,
      totalPrice: product.token,
      originalPrice: product.token,
      name: product.name,
      description: `Purchase product ${product.name} (x${quantity})`,
      quantity,
      payBy: 'token',
      extraInfo: payload,
      status: PURCHASE_ITEM_STATUS.SUCCESS
    });
    await transaction.save();
    await this.queueEventService.publish(
      new QueueEvent({
        channel: PURCHASED_ITEM_SUCCESS_CHANNEL,
        eventName: EVENT.CREATED,
        data: transaction
      })
    );

    return transaction;
  }

  public async purchaseVideo(id: string | ObjectId, user: UserDto) {
    const video = await this.videoModel.findOne({ _id: id });
    if (!video) {
      throw new EntityNotFoundException();
    }

    if (!video.isSaleVideo) {
      throw new ItemNotForSaleException();
    }

    let transaction = await this.PaymentTokenModel.findOne({
      sourceId: user._id,
      targetId: video._id,
      status: PURCHASE_ITEM_STATUS.SUCCESS
    });
    if (transaction) {
      throw new ItemHaveBoughtException();
    }

    if (user.balance < video.token) throw new NotEnoughMoneyException();
    transaction = new this.PaymentTokenModel({
      source: 'user',
      sourceId: user._id,
      target: PURCHASE_ITEM_TARGET_TYPE.VIDEO,
      targetId: video._id,
      sellerId: video.performerId,
      type: PURCHASE_ITEM_TYPE.SALE_VIDEO,
      totalPrice: video.token,
      originalPrice: video.token,
      name: video.title,
      description: `Purchase video ${video.title}`,
      quantity: 1,
      payBy: 'token',
      status: PURCHASE_ITEM_STATUS.SUCCESS
    });
    await transaction.save();
    await this.queueEventService.publish(
      new QueueEvent({
        channel: PURCHASED_ITEM_SUCCESS_CHANNEL,
        eventName: EVENT.CREATED,
        data: transaction
      })
    );
    return transaction;
  }

  public async buyPhotoGallery(id: string | ObjectId, user: UserDto) {
    const gallery = await this.galleryService.findById(id);
    if (!gallery) {
      throw new EntityNotFoundException();
    }

    if (!gallery.isSale) {
      throw new ItemNotForSaleException();
    }

    let transaction = await this.PaymentTokenModel.findOne({
      sourceId: user._id,
      targetId: gallery._id,
      status: PURCHASE_ITEM_STATUS.SUCCESS
    });
    if (transaction) {
      throw new ItemHaveBoughtException();
    }

    if (user.balance < gallery.token) throw new NotEnoughMoneyException();
    transaction = new this.PaymentTokenModel({
      source: 'user',
      sourceId: user._id,
      target: PURCHASE_ITEM_TARGET_TYPE.PHOTO,
      targetId: gallery._id,
      sellerId: gallery.performerId,
      type: PURCHASE_ITEM_TYPE.PHOTO,
      totalPrice: gallery.token,
      originalPrice: gallery.token,
      name: gallery.name,
      description: `Purchase gallery ${gallery.name}`,
      quantity: 1,
      payBy: 'token',
      status: PURCHASE_ITEM_STATUS.SUCCESS
    });
    await transaction.save();
    await this.queueEventService.publish(
      new QueueEvent({
        channel: PURCHASED_ITEM_SUCCESS_CHANNEL,
        eventName: EVENT.CREATED,
        data: transaction
      })
    );
    return transaction;
  }

  async sendTips(user: UserDto, performerId: string, payload: SendTipsPayload) {
    const performer = await this.performerService.findById(performerId);
    if (!performer) {
      throw new EntityNotFoundException();
    }

    if (!performer.isOnline) {
      throw new PerformerOfflineException();
    }

    if (user.balance < payload.token) {
      throw new NotEnoughMoneyException();
    }

    const paymentTransaction = new this.PaymentTokenModel();
    paymentTransaction.originalPrice = payload.token;
    paymentTransaction.totalPrice = payload.token;
    paymentTransaction.source = ROLE.USER;
    paymentTransaction.sourceId = user._id;
    paymentTransaction.target = PURCHASE_ITEM_TARGET_TYPE.TIP;
    paymentTransaction.sellerId = performer._id;
    paymentTransaction.targetId = new ObjectId(payload.conversationId);
    paymentTransaction.type = PURCHASE_ITEM_TYPE.TIP;
    paymentTransaction.name = 'tip';
    paymentTransaction.status = PURCHASE_ITEM_STATUS.SUCCESS;
    await paymentTransaction.save();
    await this.queueEventService.publish(
      new QueueEvent({
        channel: PURCHASED_ITEM_SUCCESS_CHANNEL,
        eventName: EVENT.CREATED,
        data: paymentTransaction
      })
    );
    return paymentTransaction;
  }

  public async sendPaidToken(user: UserDto, conversationId: string) {
    const conversation = await this.conversationService.findById(
      conversationId
    );
    if (!conversation) {
      throw new EntityNotFoundException();
    }

    const { performerId, type } = conversation;
    const performer = await this.performerService.findById(
      conversation.performerId
    );
    if (!performer) {
      throw new EntityNotFoundException();
    }

    let token: number;
    let key: string;
    switch (conversation.type) {
      case 'stream_group':
        token = performer.groupCallPrice;
        key = SETTING_KEYS.GROUP_CHAT_DEFAULT_PRICE;
        break;
      case 'stream_private':
        token = performer.privateCallPrice;
        key = SETTING_KEYS.PRIVATE_C2C_PRICE;
        break;
      default:
        key = SETTING_KEYS.PRIVATE_C2C_PRICE;
        break;
    }

    if (typeof token === 'undefined') {
      token = (await this.settingService.getKeyValue(key)) || 0;
    }

    if (user.balance < token) {
      throw new NotEnoughMoneyException();
    }

    const paymentTransaction = new this.PaymentTokenModel();
    paymentTransaction.originalPrice = token;
    paymentTransaction.totalPrice = token;
    paymentTransaction.source = ROLE.USER;
    paymentTransaction.sourceId = user._id;
    paymentTransaction.target = type;
    paymentTransaction.sellerId = performerId;
    paymentTransaction.targetId = conversation._id;
    paymentTransaction.type = type;
    paymentTransaction.name = type;
    paymentTransaction.status = PURCHASE_ITEM_STATUS.SUCCESS;
    await paymentTransaction.save();
    await this.queueEventService.publish(
      new QueueEvent({
        channel: PURCHASED_ITEM_SUCCESS_CHANNEL,
        eventName: EVENT.CREATED,
        data: paymentTransaction
      })
    );
    return paymentTransaction;
  }
}
