/* eslint-disable camelcase */
import {
  Injectable,
  Inject,
  forwardRef
} from '@nestjs/common';
import { Model } from 'mongoose';
import * as moment from 'moment';
import { PerformerService } from 'src/modules/performer/services';
import { UserService } from 'src/modules/user/services';
import { OrderModel } from '../models';
import { ORDER_MODEL_PROVIDER } from '../providers';
import { OrderDto } from '../dtos';
import { OrderSearchPayload } from '../payloads';

@Injectable()
export class OrderSearchService {
  constructor(
    @Inject(ORDER_MODEL_PROVIDER)
    private readonly Order: Model<OrderModel>,
    @Inject(forwardRef(() => PerformerService))
    private readonly performerService: PerformerService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService
  ) {}

  public async search(req: OrderSearchPayload) {
    const query = { } as any;
    if (req.deliveryStatus) query.deliveryStatus = req.deliveryStatus;
    if (req.sellerId) query.sellerId = req.sellerId;
    if (req.buyerId) query.buyerId = req.buyerId;
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
      this.Order
        .find(query)
        .lean()
        .sort(sort)
        .limit(parseInt(req.limit as string, 10))
        .skip(parseInt(req.offset as string, 10)),
      this.Order.countDocuments(query)
    ]);

    const dtos = data.map(d => new OrderDto(d));
    await this._mapSellerInfo(dtos);
    await this._mapBuyerInfo(dtos);
    return {
      total,
      data: dtos
    };
  }

  private async _mapSellerInfo(orders: OrderDto[]) {
    const performerIds = orders.filter(o => o.sellerSource === 'performer')
      .map(o => o.sellerId);
    if (!performerIds.length) return;
    const performers = await this.performerService.findByIds(performerIds);
    orders.forEach(o => {
      if (o.sellerId) {
        const performer = performers.find(p => p._id.toString() === o.sellerId.toString());
        // eslint-disable-next-line no-param-reassign
        if (performer) o.sellerInfo = performer.toResponse();
      }
    });
  }

  private async _mapBuyerInfo(orders: OrderDto[]) {
    const userIds = orders.filter(o => o.buyerSource === 'user')
      .map(o => o.buyerId);
    if (!userIds.length) return;
    const users = await this.userService.findByIds(userIds);
    orders.forEach(o => {
      if (o.buyerId) {
        const buyer = users.find(p => p._id.toString() === o.buyerId.toString());
        // eslint-disable-next-line no-param-reassign
        if (buyer) o.buyerInfo = buyer.toResponse();
      }
    });
  }
}
