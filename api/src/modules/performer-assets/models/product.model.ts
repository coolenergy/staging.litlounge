import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export class ProductModel extends Document {
  performerId: ObjectId;

  digitalFileId: ObjectId;

  imageId: ObjectId;

  type: string;

  name: string;

  description: string;

  pusblish: boolean;

  status: string;

  token: number;

  stock: number;

  createdBy: ObjectId;

  updatedBy: ObjectId;

  createdAt: Date;

  updatedAt: Date;
}
