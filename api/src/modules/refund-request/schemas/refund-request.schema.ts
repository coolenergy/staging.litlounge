import { Schema } from 'mongoose';
import { ObjectId } from 'mongodb';

export const RefundRequestSchema = new Schema({
  userId: {
    type: ObjectId,
    index: true
  },
  sourceType: {
    type: String, // product
    default: 'product',
    index: true
  },
  sourceId: {
    type: ObjectId,
    index: true
  },
  token: {
    type: Number,
    default: 0
  },
  performerId: {
    type: ObjectId,
    index: true
  },
  description: {
    type: String
    // TODO - text index?
  },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'rejected'],
    default: 'pending',
    index: true
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
