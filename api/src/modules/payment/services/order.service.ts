/* eslint-disable camelcase */
import {
  Injectable,
  Inject,
  forwardRef
} from '@nestjs/common';
import { UserDto } from 'src/modules/user/dtos';
import {
  EntityNotFoundException, QueueEvent, QueueEventService
} from 'src/kernel';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { TokenPackageService } from 'src/modules/token-package/services';
import { PerformerService } from 'src/modules/performer/services';
import { UserService } from 'src/modules/user/services';
import { EVENT } from 'src/kernel/constants';
import { OrderModel } from '../models';
import { ORDER_MODEL_PROVIDER } from '../providers';
import {ORDER_STATUS, DELIVERY_STATUS, PRODUCT_TYPE, PAYMENT_STATUS, ORDER_UPDATE_CHANNEL} from '../constants';
import { OrderDto } from '../dtos';
import { OrderUpdatePayload } from '../payloads/order-update.payload';

@Injectable()
export class OrderService {
  constructor(
    @Inject(ORDER_MODEL_PROVIDER)
    private readonly Order: Model<OrderModel>,
    @Inject(forwardRef(() => TokenPackageService))
    private readonly tokenService: TokenPackageService,
    @Inject(forwardRef(() => PerformerService))
    private readonly performerService: PerformerService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly queueEventService: QueueEventService
  ) {}

  public async createTokenOrderFromPayload(packageId: string | ObjectId, user: UserDto, orderStatus = ORDER_STATUS.CREATED) {
    const packageToken = await this.tokenService.findById(packageId);
    if (!packageToken) throw new EntityNotFoundException();

    const orderNumber = `TP${new Date().getTime()}`;
    const order = new this.Order({
      orderNumber,
      // buyer ID
      buyerId: user._id,
      buyerSource: 'user',
      sellerId: null,
      sellerSource: 'system',
      type: PRODUCT_TYPE.TOKEN,
      productType: PRODUCT_TYPE.TOKEN,
      productId: packageToken._id,
      name: packageToken.name,
      description: `${packageToken.price.toFixed(2)} for ${packageToken.tokens} tokens`,
      unitPrice: packageToken.price,
      quantity: 1,
      originalPrice: packageToken.price,
      totalPrice: packageToken.price,
      status: orderStatus,
      deliveryStatus: DELIVERY_STATUS.CREATED,
      deliveryAddress: '',
      paymentStatus: PAYMENT_STATUS.PENDING,
      payBy: 'money',
      couponInfo: null,
      shippingCode: null,
      extraInfo: null
    });

    return order.save();
  }

  public async findById(id): Promise<OrderDto> {
    const item = await this.Order.findById(id);
    return item ? new OrderDto(item.toObject()) : null;
  }

  public async findByIds(ids): Promise<OrderDto[]> {
    const items = await this.Order.find({ _id: { $in: ids } });
    return items.map(i => new OrderDto(i));
  }

  public async getDetails(id: string | ObjectId | OrderDto): Promise<OrderDto> {
    const order = id instanceof OrderDto ? id : await this.findById(id);
    if (!order) throw new EntityNotFoundException();

    // map info of seller, buyer and product info if have
    if (order.sellerSource === 'performer') {
      const performer = await this.performerService.findById(order.sellerId);
      order.sellerInfo = performer?.toResponse();
    }
    const user = await this.userService.findById(order.buyerId);
    order.buyerInfo = {
      _id: user._id,
      username: user.username
    };

    return order;
  }

  public async update(id: string | ObjectId, payload: OrderUpdatePayload) {
    const order = await this.Order.findById(id);
    const oldDeliveryStatus = order.deliveryStatus;
    if (payload.deliveryStatus) order.deliveryStatus = payload.deliveryStatus;
    if (payload.shippingCode) order.shippingCode = payload.shippingCode;
    await order.save();

    await this.queueEventService.publish(
      new QueueEvent({
        channel: ORDER_UPDATE_CHANNEL,
        eventName: EVENT.UPDATED,
        data: {
          oldValue: {
            deliveryStatus: oldDeliveryStatus
          },
          newValue: new OrderDto(order)
        }
      })
    );
    return order;
  }
}
