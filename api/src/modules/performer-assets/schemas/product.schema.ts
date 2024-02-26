import { Schema } from 'mongoose';
import { ObjectId } from 'mongodb';

export const ProductSchema = new Schema({
  performerId: {
    type: ObjectId,
    index: true
  },
  // original file
  digitalFileId: ObjectId,
  imageId: ObjectId,
  name: {
    type: String
    // TODO - text index?
  },
  description: String,
  publish: Boolean,
  type: {
    type: String,
    default: 'physical'
  },
  status: {
    type: String,
    default: 'active'
  },
  token: {
    type: Number,
    default: 0
  },
  stock: {
    type: Number,
    default: 0
  },
  createdBy: ObjectId,
  updatedBy: ObjectId,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
