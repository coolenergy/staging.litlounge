import * as mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import { STATUS_ACTIVE, ROLE_USER } from '../constants';

export const UserSchema = new mongoose.Schema({
  name: String,
  firstName: String,
  lastName: String,
  city: String,
  state: String,
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
  phone: {
    type: String
  },
  roles: [{
    type: String,
    default: ROLE_USER
  }],
  emailVerified: {
    type: Boolean,
    default: false
  },
  avatarId: ObjectId,
  avatarPath: String,
  status: {
    type: String,
    default: STATUS_ACTIVE
  },
  gender: {
    type: String
  },
  balance: {
    type: Number,
    default: 0
  },
  country: {
    type: String
  },
  timezone: {
    type: String
  },
  dateOfBirth: Date,
  isOnline: {
    type: Boolean,
    default: false
  },
  onlineAt: {
    type: Date
  },
  offlineAt: {
    type: Date
  },
  totalOnlineTime: {
    type: Number,
    default: 0
  },
  stats: {
    totalViewTime: {
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
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
