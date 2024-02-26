import { pick } from 'lodash';
import { ObjectId } from 'mongodb';

export class PayoutRequestDto {
  _id: any;

  source: string;

  sourceId: ObjectId;

  performerId?: ObjectId;

  performerInfo?: any;

  studioId?: ObjectId;

  studioRequestId: ObjectId;

  studioInfo?: any;

  paymentAccountInfo?: any;

  paymentAccountType: string;

  fromDate: Date;

  toDate: Date;

  requestNote: string;

  adminNote?: string;

  status: string;

  sourceType: string;

  tokenMustPay: number;

  previousPaidOut: number;

  pendingToken: number;

  sourceInfo: any;

  createdAt: Date;

  updatedAt: Date;

  constructor(data?: Partial<PayoutRequestDto>) {
    Object.assign(
      this,
      pick(data, [
        '_id',
        'source',
        'sourceId',
        'performerId',
        'performerInfo',
        'sourceInfo',
        'studioId',
        'studioInfo',
        'paymentAccountType',
        'fromDate',
        'toDate',
        'paymentAccountInfo',
        'requestNote',
        'adminNote',
        'status',
        'sourceType',
        'tokenMustPay',
        'previousPaidOut',
        'pendingToken',
        'createdAt',
        'updatedAt'
      ])
    );
  }
}
