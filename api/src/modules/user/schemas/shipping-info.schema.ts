import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

export const ShippingInfoSchema = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    index: true
  },
  deliveryAddress: String,
  postalCode: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
