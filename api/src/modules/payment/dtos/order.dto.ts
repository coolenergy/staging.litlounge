import { ObjectId } from 'mongodb';
import { pick } from 'lodash';

export class OrderDto {
  _id: ObjectId;

  orderNumber?: string;

  // buyer ID
  buyerId: ObjectId;

  buyerSource: string;

  buyerInfo?: any;

  sellerId: ObjectId;

  sellerSource: string;

  sellerUsername: string;

  sellerInfo: any;

  type: string;

  // physical , digital...
  productType: string;

  productId: ObjectId;

  name: string;

  description: string;

  unitPrice: number;

  quantity: number;

  originalPrice: number;

  totalPrice: number;

  status: string;

  deliveryStatus: string;

  deliveryAddress: string;

  portalCode: string;

  paymentStatus: string;

  payBy: string;

  couponInfo: any;

  shippingCode: string;

  extraInfo: any;

  createdAt: Date;

  updatedAt: Date;

  constructor(data?: Partial<OrderDto>) {
    const props = Object.getOwnPropertyNames(data);
    data
      && Object.assign(
        this,
        pick(data, props)
      );
  }
}
