import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export class ShippingInfoModel extends Document {
  userId: ObjectId;

  postalCode?: string;

  deliveryAddress?: string;
}
