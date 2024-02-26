import * as mongoose from 'mongoose';

export const VerificationSchema = new mongoose.Schema(
  {
    sourceType: {
      type: String,
      default: 'user',
      index: true
    },
    sourceId: {
      type: mongoose.Types.ObjectId,
      index: true
    },
    type: {
      type: String,
      default: 'email',
      index: true
    },
    value: {
      type: String,
      index: true
    },
    token: {
      type: String,
      index: true
    },
    verified: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    collection: 'verifications'
  }
);
