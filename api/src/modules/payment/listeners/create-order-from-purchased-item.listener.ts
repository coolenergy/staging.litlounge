import { Inject, Injectable, Logger } from '@nestjs/common';
import { QueueEventService, QueueEvent } from 'src/kernel';
import { DELIVERY_STATUS, ORDER_STATUS, PRODUCT_TYPE } from 'src/modules/payment/constants';
import { EVENT } from 'src/kernel/constants';
import { MailerService } from 'src/modules/mailer/services';
import { UserService } from 'src/modules/user/services';
import { Model } from 'mongoose';
import { PURCHASED_ITEM_SUCCESS_CHANNEL, PURCHASE_ITEM_TYPE } from 'src/modules/purchased-item/constants';
import { PurchaseItemModel } from 'src/modules/purchased-item/models';
import { ProductService } from 'src/modules/performer-assets/services';
import { PerformerService } from 'src/modules/performer/services';
import { ProductDto } from 'src/modules/performer-assets/dtos';
import { FileService } from 'src/modules/file/services';
import { ORDER_MODEL_PROVIDER } from '../providers';
import { OrderModel } from '../models';
import { PAYMENT_STATUS } from '../constants';

const CREATE_ORDER_FROM_PURCHASED_ITEM = 'CREATE_ORDER_FROM_PURCHASED_ITEM';

@Injectable()
export class CreateOrderFromPurchasedItemListener {
  private readonly logger = new Logger('CreateOrderFromPurchasedItemListener');

  constructor(
    private readonly queueEventService: QueueEventService,
    private readonly mailService: MailerService,
    private readonly userService: UserService,
    private readonly performerService: PerformerService,
    private readonly productService: ProductService,
    private readonly fileService: FileService,
    @Inject(ORDER_MODEL_PROVIDER)
    private readonly Order: Model<OrderModel>
  ) {
    this.queueEventService.subscribe(
      PURCHASED_ITEM_SUCCESS_CHANNEL,
      CREATE_ORDER_FROM_PURCHASED_ITEM,
      this.handler.bind(this)
    );
  }

  public async handler(event: QueueEvent) {
    try {
      if (![EVENT.CREATED].includes(event.eventName)) {
        return;
      }
      const purchasedItem = event.data as PurchaseItemModel;
      // create order for product only
      if (purchasedItem.type !== PURCHASE_ITEM_TYPE.PRODUCT) return;
      const product = await this.productService.findById(purchasedItem.targetId);
      if (!product) return;

      const orderNumber = `O${new Date().getTime()}`;
      const order = new this.Order({
        orderNumber,
        // buyer ID
        buyerId: purchasedItem.sourceId,
        buyerSource: purchasedItem.source,
        sellerId: purchasedItem.sellerId,
        sellerSource: 'performer',
        type: purchasedItem.type,
        productType: product.type,
        productId: product._id,
        name: product.name,
        description: purchasedItem.description,
        unitPrice: product.token,
        quantity: purchasedItem.quantity,
        originalPrice: product.token,
        totalPrice: purchasedItem.totalPrice,
        status: ORDER_STATUS.PAID,
        deliveryStatus: product.type === PRODUCT_TYPE.PHYSICAL_PRODUCT ? DELIVERY_STATUS.CREATED : DELIVERY_STATUS.DELIVERED,
        deliveryAddress: purchasedItem.extraInfo?.deliveryAddress,
        portalCode: purchasedItem.extraInfo?.portalCode,
        paymentStatus: PAYMENT_STATUS.SUCCESS,
        payBy: 'token',
        couponInfo: null,
        shippingCode: null,
        extraInfo: null
      });

      await order.save();
      await this._emailNotification(order, product);
    } catch (error) {
      // eslint-disable-next-line no-console
      this.logger.error(error)
    }
  }

  private async _emailNotification(order: OrderModel, product: ProductDto) {
    const [user, performer] = await Promise.all([
      this.userService.findById(order.buyerId),
      this.performerService.findById(order.sellerId)
    ]);
    if (user) {
      // if product is a digital, send digital product
      const template = product.type === PRODUCT_TYPE.PHYSICAL_PRODUCT ?
        'user-payment-success' :
        'send-user-digital-product'

      const digitalLink = product.digitalFileId ? this.fileService.generateDownloadLink(product.digitalFileId) : '';

      // TODO - check me with link
      await this.mailService.send({
        subject: 'New payment success',
        to: user.email,
        data: {
          user,
          order,
          digitalLink
        },
        template
      });
    }

    if (performer) {
      await this.mailService.send({
        subject: 'New payment success',
        to: performer.email,
        data: {
          user,
          order
        },
        template: 'performer-payment-success'
      });
    }
  }
}
