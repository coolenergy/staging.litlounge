import { Schema } from 'mongoose';

export const PurchasedItemSchema = new Schema({
  // user, model, etc...
  source: {
    type: String
  },
  sourceId: {
    type: Schema.Types.ObjectId,
    index: true
  },
  // item type
  target: {
    type: String
  },
  targetId: {
    type: Schema.Types.ObjectId,
    index: true
  },
  // item owner
  sellerId: {
    type: Schema.Types.ObjectId,
    index: true
  },
  name: String,
  description: String,
  price: Number,
  quantity: Number,
  type: String,
  totalPrice: {
    type: Number,
    default: 0
  },
  originalPrice: {
    type: Number,
    default: 0
  },
  // pending, success, etc...
  status: {
    type: String,
    index: true
  },
  extraInfo: Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
