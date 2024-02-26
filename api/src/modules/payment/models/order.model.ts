import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export class OrderModel extends Document {
  orderNumber?: string;

  type?: string;

  // buyer information, eg user
  buyerId: ObjectId;

  buyerSource: string;

  sellerId?: ObjectId;

  sellerSource?: string;

  sellerUsername?: string;

  productType?: string;

  productId?: ObjectId;

  name?: string;

  description?: string;

  unitPrice?: number;

  quantity?: number;

  originalPrice?: number;

  totalPrice?: number;

  // status of the sub order
  status?: string;

  deliveryStatus?: string;

  deliveryAddress?: string;

  portalCode?: string;

  paymentStatus?: string;

  payBy: string;

  couponInfo?: any;

  // code for physical product
  shippingCode?: string

  extraInfo?: any;

  createdAt?: Date;

  updatedAt?: Date;
}
