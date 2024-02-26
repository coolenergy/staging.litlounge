import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

export class VerificationModel extends Document {
  sourceType: string;

  sourceId: ObjectId;

  type: string;

  value: string;

  token: string;

  verified: boolean;

  createAt: Date;

  updatedAt: Date;
}
