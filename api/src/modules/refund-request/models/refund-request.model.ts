import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export class RefundRequestModel extends Document {
  userId: ObjectId;

  sourceType?: string;

  sourceId: ObjectId;

  token: number;

  performerId: ObjectId;

  description: string;

  status?: string;

  createdAt?: Date;

  updatedAt?: Date;
}
