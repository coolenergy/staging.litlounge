import { Document } from "mongoose";
import { ObjectId } from 'mongodb';

export class PaymentInformationModel extends Document {
  _id: ObjectId;

  type: string;

  sourceId: ObjectId;

  sourceType: string;

  createdAt: Date;

  updatedAt: Date;
}