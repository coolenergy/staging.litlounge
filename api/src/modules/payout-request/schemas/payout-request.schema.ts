import { Schema } from 'mongoose';
import { ObjectId } from 'mongodb';

export const payoutRequestSchema = new Schema({
  source: {
    index: true,
    type: String,
    enum: ['performer', 'studio']
  },
  sourceId: {
    index: true,
    type: ObjectId
  },
  performerId: {
    type: ObjectId,
    index: true
  },
  studioRequestId: {
    type: ObjectId,
    index: true
  },
  studioId: {
    type: ObjectId,
    index: true
  },
  paymentAccountType: {
    type: String,
    enum: ['wire', 'paypal', 'issue_check_us', 'deposit', 'payoneer', 'bitpay'],
    index: true
  },
  fromDate: {
    type: Date
  },
  toDate: {
    type: Date
  },
  requestNote: {
    type: String
  },
  adminNote: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'done'],
    default: 'pending',
    index: true
  },
  sourceType: {
    type: String,
    enum: ['performer', 'studio'],
    index: true
  },
  tokenMustPay: {
    type: Number,
    default: 0
  },
  previousPaidOut: {
    type: Number,
    default: 0
  },
  pendingToken: {
    type: Number,
    default: 0
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
