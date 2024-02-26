import * as mongoose from 'mongoose';

export const ForgotSchema = new mongoose.Schema(
  {
    authId: {
      type: mongoose.Types.ObjectId,
      index: true
    },
    source: {
      type: String,
      index: true
    },
    sourceId: {
      type: mongoose.Types.ObjectId,
      index: true
    },
    token: {
      type: String,
      index: true
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
    collection: 'forgot'
  }
);
