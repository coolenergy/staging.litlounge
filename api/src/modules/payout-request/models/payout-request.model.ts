import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export class PayoutRequestModel extends Document {
  source: string;

  sourceId: ObjectId;

  performerId?: ObjectId;

  studioId?: ObjectId;

  studioRequestId: ObjectId;

  paymentAccountType?: string;

  fromDate: Date;

  toDate: Date;

  requestNote?: string;

  adminNote?: string

  status?: string;

  sourceType?: string;

  tokenMustPay?: number;

  previousPaidOut?: number;

  pendingToken?: number;

  createdAt: Date;

  updatedAt:Date;
}
