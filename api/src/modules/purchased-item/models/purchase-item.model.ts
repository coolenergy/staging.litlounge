import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export class PurchaseItemModel extends Document {
  source: string;

  sourceId: ObjectId;

  target: string;

  targetId: ObjectId;

  sellerId: ObjectId;

  type: string;

  totalPrice: number;

  originalPrice: number;

  name?: string;

  description?: string;

  quantity?: number;

  payBy: string;

  extraInfo?: any;

  status: string;

  createdAt: Date;

  updatedAt: Date;
}
