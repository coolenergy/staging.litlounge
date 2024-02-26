import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export class CategoryModel extends Document {
  name: string;

  slug: string;

  ordering: number;

  description: string;

  createdBy: ObjectId;

  updatedBy: ObjectId;

  createdAt: Date;

  updatedAt: Date;
}
