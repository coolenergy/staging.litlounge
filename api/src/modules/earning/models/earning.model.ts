import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export interface IStudioToModel {
  grossPrice: number;
  commission: number;
  netPrice: number;
  payoutStatus: string;
  refItemId: ObjectId;
}

export class EarningModel extends Document {
  transactionTokenId: ObjectId;

  performerId: ObjectId;

  userId: ObjectId;

  type: string;

  source: string;

  target: string;

  sourceId: ObjectId;

  targetId: ObjectId;

  originalPrice: number;

  grossPrice: number;

  netPrice: number;

  commission: number;

  isPaid: boolean;

  createdAt: Date;

  updatedAt: Date;

  paidAt: Date;

  transactionStatus: string;

  conversionRate: number;

  studioToModel?: IStudioToModel;

  payoutStatus?: string;
}
