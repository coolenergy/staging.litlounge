import { pick } from 'lodash';
import { ObjectId } from 'mongodb';

export class RefundRequestDto {
  _id: any;

  userId: ObjectId;

  sourceType?: string;

  sourceId?: ObjectId;

  token: number;

  performerId: ObjectId;

  description: string;

  status: string;

  createdAt: Date;

  updatedAt: Date;

  performerInfo?: any;

  userInfo?: any;

  productInfo?: any;

  orderInfo?: any

  constructor(data?: Partial<RefundRequestDto>) {
    Object.assign(
      this,
      pick(data, [
        '_id',
        'userId',
        'sourceType',
        'sourceId',
        'token',
        'performerId',
        'description',
        'status',
        'createdAt',
        'updatedAt',
        'performerInfo',
        'userInfo',
        'productInfo',
        'orderInfo'
      ])
    );
  }
}
