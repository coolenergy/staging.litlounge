import { ObjectId } from 'mongodb';

export interface IShippingInfo {
  userId?: ObjectId;
  deliveryAddress?: string;
  postalCode?: string;
  isNew?: boolean;
}

export interface IShippingInfoResponse {
  _id?: string | ObjectId;
  userId?: string | ObjectId;
  deliveryAddress?: string;
  postalCode?: string;
}
