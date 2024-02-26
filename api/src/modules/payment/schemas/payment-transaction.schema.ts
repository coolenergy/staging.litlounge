import { Schema } from 'mongoose';

export const PaymentTransactionSchema = new Schema({
  orderId: {
    type: Schema.Types.ObjectId,
    index: true
  },
  paymentGateway: {
    type: String
  },
  buyerSource: {
    type: String
  },
  buyerId: {
    type: Schema.Types.ObjectId,
    index: true
  },
  // subscription, store, etc...
  type: {
    type: String,
    index: true
  },
  products: [
    {
      _id: false,
      name: String,
      description: String,
      price: Number,
      productType: String,
      productId: Schema.Types.ObjectId,
      quantity: Number,
      extraInfo: Schema.Types.Mixed
    }
  ],
  totalPrice: {
    type: Number,
    default: 0
  },
  paymentResponseInfo: {
    type: Schema.Types.Mixed
  },
  // pending, success, etc...
  status: {
    type: String,
    index: true
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
