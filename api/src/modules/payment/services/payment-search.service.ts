import { Injectable, Inject } from '@nestjs/common';
import { UserService } from 'src/modules/user/services';
import { UserDto } from 'src/modules/user/dtos';
import { Model } from 'mongoose';
import * as moment from 'moment';
import { PAYMENT_TRANSACTION_MODEL_PROVIDER } from '../providers';
import { PaymentTransactionModel } from '../models';
import { PaymentSearchPayload } from '../payloads';
import { PaymentDto } from '../dtos';
import { PAYMENT_STATUS } from '../constants';

@Injectable()
export class PaymentSearchService {
  constructor(
    @Inject(PAYMENT_TRANSACTION_MODEL_PROVIDER)
    private readonly paymentTransactionModel: Model<PaymentTransactionModel>,
    private readonly userService: UserService
  ) {}

  public async getUserTransactions(req: PaymentSearchPayload, user: UserDto): Promise<any> {
    const query = {
      buyerSource: 'user',
      buyerId: user._id,
      status: {
        $ne: PAYMENT_STATUS.PENDING
      }
    } as any;
    if (req.type) query.type = req.type;
    if (req.status) query.status = req.status;
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
      this.paymentTransactionModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(parseInt(req.limit as string, 10))
        .skip(parseInt(req.offset as string, 10)),
      this.paymentTransactionModel.countDocuments(query)
    ]);

    const paymentData = data.map(d => new PaymentDto(d));
    return {
      total,
      data: paymentData
    };
  }

  public async adminGetUserTransactions(req: PaymentSearchPayload): Promise<any> {
    const query = {
      status: {
        $ne: PAYMENT_STATUS.PENDING
      }
    } as any;
    if (req.type) query.type = req.type;
    if (req.status) query.status = req.status;
    if (req.fromDate && req.toDate) {
      query.createdAt = {
        $gt: moment(req.fromDate).startOf('day'),
        $lt: moment(req.toDate).endOf('day')
      };
    }
    if (req.sourceId) query.buyerId = req.sourceId;
    const sort = {
      [req.sortBy || 'updatedAt']: req.sort || -1
    };
    const [data, total] = await Promise.all([
      this.paymentTransactionModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(parseInt(req.limit as string, 10))
        .skip(parseInt(req.offset as string, 10)),
      this.paymentTransactionModel.countDocuments(query)
    ]);

    const paymentData = data.map(d => new PaymentDto(d));
    const userIds = paymentData
      .filter(p => p.buyerSource === 'user')
      .map(p => p.buyerId);

    if (userIds.length) {
      const users = await this.userService.findByIds(userIds);
      paymentData.forEach(p => {
        const buyer = users.find(u => u._id.toString() === p.buyerId.toString());
        if (buyer) {
          // eslint-disable-next-line no-param-reassign
          p.buyerInfo = new UserDto(buyer).toResponse();
        }
      });
    }

    return {
      total,
      data: paymentData
    };
  }
}
