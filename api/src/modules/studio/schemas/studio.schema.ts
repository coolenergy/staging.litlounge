import { ObjectId } from 'mongodb';
import { Schema } from 'mongoose';

export const studioSchema = new Schema({
  name: String,
  username: {
    type: String,
    index: true,
    lowercase: true,
    unique: true,
    trim: true,
    // uniq if not null
    sparse: true
  },
  email: {
    type: String,
    index: true,
    unique: true,
    lowercase: true,
    trim: true,
    // uniq if not null
    sparse: true
  },
  status: {
    type: String,
    index: true
  },
  phone: {
    type: String
  },
  country: {
    type: String,
    index: true
  },
  city: String,
  state: String,
  zipcode: String,
  address: String,
  languages: [
    {
      type: String,
      index: true
    }
  ],
  timezone: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  balance: {
    type: Number,
    default: 0
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  roles: [
    {
      type: String,
      default: 'studio'
    }
  ],
  stats: {
    totalPerformer: {
      type: Number,
      default: 0
    },
    totalHoursOnline: {
      type: Number,
      default: 0
    },
    totalTokenEarned: {
      type: Number,
      default: 0
    },
    totalTokenSpent: {
      type: Number,
      default: 0
    }
  },
  documentVerificationId: {
    type: ObjectId,
    index: true
  },
  // TODO - should be removed
  commission: {
    type: Number
  },
  // details for commission details
  tipCommission: {
    type: Number
  },
  privateCallCommission: {
    type: Number
  },
  groupCallCommission: {
    type: Number
  },
  productCommission: {
    type: Number
  },
  albumCommission: {
    type: Number
  },
  videoCommission: {
    type: Number
  }
});
