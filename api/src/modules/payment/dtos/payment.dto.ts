import { ObjectId } from 'mongodb';
import { pick } from 'lodash';

export interface PaymentProduct {
  name?: string;
  description?: string;
  price?: number | string;
  extraInfo?: any;
  productType?: string;
  productId?: string | ObjectId;
  quantity?: number;
}

export interface DigitalProductResponse {
  digitalFileUrl?: any;
  digitalFileId?: any;
  _id?: string | ObjectId;
}

export class PaymentDto {
  _id: ObjectId;

  paymentGateway?: string;

  buyerInfo?: any;

  buyerSource?: string;

  buyerId: ObjectId;

  sellerSource?: string;

  sellerId?: ObjectId;

  type?: string;

  products?: PaymentProduct[];

  paymentResponseInfo?: any;

  totalPrice?: number;

  status?: string;

  createdAt: Date;

  updatedAt: Date;

  constructor(data?: Partial<PaymentDto>) {
    data
      && Object.assign(
        this,
        pick(data, [
          '_id',
          'paymentGateway',
          'buyerInfo',
          'buyerSource',
          'buyerId',
          'type',
          'products',
          'paymentResponseInfo',
          'status',
          'totalPrice',
          'originalPrice',
          'createdAt',
          'updatedAt'
        ])
      );
  }

  toResponse(includePrivateInfo = false): any {
    const publicInfo = {
      _id: this._id,
      paymentGateway: this.paymentGateway,
      buyerId: this.buyerId,
      buyerSource: this.buyerSource,
      buyerInfo: this.buyerInfo,
      sellerSource:  this.sellerSource,
      sellerId: this.sellerId,
      type: this.type,
      products: this.products,
      totalPrice: this.totalPrice,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };

    const privateInfo = {
      paymentResponseInfo: this.paymentResponseInfo
    };
    if (!includePrivateInfo) {
      return publicInfo;
    }

    return {
      ...publicInfo,
      ...privateInfo
    };
  }
}
