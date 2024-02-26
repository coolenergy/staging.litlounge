import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

export class ForgotModel extends Document {
  authId: ObjectId;

  sourceId: ObjectId;

  source: string;

  token: string;

  createdAt: Date;

  updatedAt: Date;
}
