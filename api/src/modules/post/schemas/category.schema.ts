import { Schema } from 'mongoose';
import { ObjectId } from 'mongodb';

export const CategorySchema = new Schema({
  type: {
    type: String,
    index: true
  },
  parentId: {
    type: ObjectId,
    index: true
  },
  title: String,
  slug: {
    type: String,
    index: true
  },
  description: String,
  createdBy: ObjectId,
  updatedBy: ObjectId,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
