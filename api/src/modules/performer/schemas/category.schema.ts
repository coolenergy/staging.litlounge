import { Schema } from 'mongoose';
import { ObjectId } from 'mongodb';

export const CategorySchema = new Schema({
  name: String,
  slug: {
    type: String,
    index: true
  },
  ordering: { type: Number, default: 0 },
  description: String,
  createdBy: ObjectId,
  updatedBy: ObjectId,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
