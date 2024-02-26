import { Schema } from 'mongoose';
import { ObjectId } from 'mongodb';
import { BANKING_TYPE, BANKING_SOURCE } from '../constants';

export const paymentInformationSchema = new Schema({
  sourceId: {
    type: ObjectId,
    index: true
  },
  sourceType : {
    type: String,
    default: BANKING_SOURCE.PERFORMER,
    index: true
  },
  type: {
    type: String,
    index: true,
    enum: [
      BANKING_TYPE.BITPAY,
      BANKING_TYPE.DEPOSIT,
      BANKING_TYPE.ISSUE,
      BANKING_TYPE.PAYONNEER,
      BANKING_TYPE.PAYPAL,
      BANKING_TYPE.WIRE,
      BANKING_TYPE.PAXUM
    ]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  strict: false
});
