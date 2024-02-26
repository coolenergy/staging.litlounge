import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
// import { StringHelper, EntityNotFoundException, QueueEventService, QueueEvent } from 'src/kernel';
import { UserDto } from 'src/modules/user/dtos';
import { PerformerDto } from 'src/modules/performer/dtos';
import { UserService } from 'src/modules/user/services';
import { PerformerService } from 'src/modules/performer/services';
import { MailerService } from 'src/modules/mailer';
import { SettingService } from 'src/modules/settings';
import { SETTING_KEYS } from 'src/modules/settings/constants';
import { ProductDto } from 'src/modules/performer-assets/dtos';
import { QueueEvent, QueueEventService } from 'src/kernel';
import { merge } from 'lodash';
import * as moment from 'moment';
import { OrderService } from 'src/modules/payment/services';
import { OrderDto } from 'src/modules/payment/dtos';
import { REFUND_REQUEST_ACTION, REFUND_REQUEST_CHANNEL } from '../constants';
import { DuplicateRequestException } from '../exceptions/duplicate.exception';
import { ProductService } from '../../performer-assets/services/product.service';
import { RefundRequestDto } from '../dtos/refund-request.dto';
import {
  RefundRequestCreatePayload,
  RefundRequestSearchPayload,
  RefundRequestUpdatePayload
} from '../payloads/refund-request.payload';
import { RefundRequestModel } from '../models/refund-request.model';
import { REFUND_REQUEST_MODEL_PROVIDER } from '../providers/refund-request.provider';

@Injectable()
export class RefundRequestService {
  constructor(
    @Inject(REFUND_REQUEST_MODEL_PROVIDER)
    private readonly refundRequestModel: Model<RefundRequestModel>,
    private readonly userService: UserService,
    private readonly performerService: PerformerService,
    private readonly productService: ProductService,
    private readonly mailService: MailerService,
    private readonly settingService: SettingService,
    private readonly orderService: OrderService,
    private readonly queueEventService: QueueEventService
  ) {}

  public async search(
    req: RefundRequestSearchPayload,
    user?: UserDto
  ): Promise<any> {
    const query = {} as any;

    if (user.roles.includes('admin') && req.userId) {
      query.userId = req.userId;
    } else if (!user.roles.includes('admin')) {
      query.userId = user._id;
    }
    if (req.performerId) {
      query.performerId = req.performerId;
    }
    if (req.sourceId) {
      query.sourceId = req.sourceId;
    }
    if (req.sourceType) {
      query.sourceType = req.sourceType;
    }

    if (req.status) {
      query.status = req.status;
    }

    let sort: { createdAt?: number } = {
      createdAt: -1
    };

    if (req.sort && req.sortBy) {
      sort = {
        [req.sortBy]: req.sort
      };
    }

    if (req.fromDate && req.toDate) {
      query.createdAt = {
        $gt: moment(req.fromDate).startOf('day'),
        $lte: moment(req.toDate).endOf('day')
      };
    }

    const [data, total] = await Promise.all([
      this.refundRequestModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(parseInt(req.limit as string, 10))
        .skip(parseInt(req.offset as string, 10)),
      this.refundRequestModel.countDocuments(query)
    ]);
    // const requests = data.map((d) => new RefundRequestDto(d));
    const pIds = data.map(d => d.performerId);
    const uIds = data.map(d => d.userId);
    const orderIds = data.map(d => d.sourceId);
    const [performers, users, orders, products] = await Promise.all([
      this.performerService.findByIds(pIds) || [],
      this.userService.findByIds(uIds) || [],
      this.orderService.findByIds(orderIds) || [],
      this.productService.findByPerformerIds(pIds) || []
    ]);

    const requests = data.map((request: RefundRequestModel) => {
      const performer =
        request.performerId &&
        performers.find(
          p => p._id.toString() === request.performerId.toString()
        );
      const userModel =
        request.userId &&
        users.find(p => p._id.toString() === request.userId.toString());
      const order =
        request.sourceId &&
        orders.find(o => o._id.toString() === request.sourceId.toString());
      const product =
        order &&
        products.find(p => p._id.toString() === order.productId.toString());

      return {
        ...request,
        performerInfo: new PerformerDto(performer).toResponse(true),
        userInfo: new UserDto(userModel).toResponse(true),
        orderInfo: new OrderDto(order),
        productInfo: new ProductDto(product)
      };
    });
    return {
      total,
      data: requests.map(d => new RefundRequestDto(d))
    };
  }

  public async create(
    payload: RefundRequestCreatePayload,
    user?: UserDto
  ): Promise<RefundRequestDto> {
    const data = {
      ...payload,
      userId: user._id,
      updatedAt: new Date(),
      createdAt: new Date()
    };
    const request = await this.refundRequestModel.findOne({
      userId: user._id,
      sourceId: data.sourceId,
      performerId: data.performerId,
      token: data.token
    });
    if (request) {
      throw new DuplicateRequestException();
    }
    const resp = await this.refundRequestModel.create(data);
    // TODO mailer
    const adminEmail =
      (await this.settingService.getKeyValue(SETTING_KEYS.ADMIN_EMAIL)) ||
      process.env.ADMIN_EMAIL;
    adminEmail &&
      (await this.mailService.send({
        subject: 'New refund request',
        to: adminEmail,
        data: {
          request: resp
        },
        template: 'refund-request'
      }));
    return new RefundRequestDto(resp);
  }

  public async updateStatus(
    id: string | ObjectId,
    payload: RefundRequestUpdatePayload
  ): Promise<any> {
    const request = await this.refundRequestModel.findById(id);
    if (!request) {
      throw new NotFoundException();
    }

    const oldStatus = request.status;
    merge(request, payload);
    request.updatedAt = new Date();
    await request.save();
    const event: QueueEvent = {
      channel: REFUND_REQUEST_CHANNEL,
      eventName: REFUND_REQUEST_ACTION.UPDATED,
      data: {
        oldStatus,
        request
      }
    };
    await this.queueEventService.publish(event);
    return request;
  }
}
