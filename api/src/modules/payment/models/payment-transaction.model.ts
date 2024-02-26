import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export class PaymentProductModel {
  name?: string;

  description?: string;

  price?: number | string;

  extraInfo?: any;

  productType?: string;

  productId?: string | ObjectId;

  quantity?: number;
}

export class PaymentTransactionModel extends Document {
  orderId?: string | ObjectId;

  paymentGateway: string;

  buyerSource: string;

  buyerId: ObjectId;

  // subscription, store, etc...
  type: string;

  totalPrice: number;

  products: PaymentProductModel[];

  paymentResponseInfo: any;

  status: string;

  createdAt: Date;

  updatedAt: Date;
}
