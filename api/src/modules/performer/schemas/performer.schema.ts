import * as mongoose from 'mongoose';

export const performerSchema = new mongoose.Schema({
  name: String,
  firstName: String,
  lastName: String,
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
    type: String
  },
  phone: {
    type: String
  },
  streamingStatus: String,
  streamingTitle: String,
  live: {
    type: Boolean,
    default: false
  },
  phoneCode: String, // international code prefix
  avatarId: {
    type: mongoose.Schema.Types.ObjectId
  },
  avatarPath: String,
  headerId: {
    type: mongoose.Schema.Types.ObjectId
  },
  headerPath: String,
  idVerificationId: {
    type: mongoose.Schema.Types.ObjectId
  },
  documentVerificationId: {
    type: mongoose.Schema.Types.ObjectId
  },
  releaseFormId: {
    type: mongoose.Schema.Types.ObjectId
  },
  tags: [{ type: String, index: true }],
  gender: {
    type: String
  },
  country: {
    type: String
  },
  city: String,
  state: String,
  zipcode: String,
  address: String,
  languages: [
    {
      type: String
    }
  ],
  studioId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  categoryIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      index: true
    }
  ],
  schedule: {
    type: mongoose.Schema.Types.Mixed
  },
  timezone: { type: String },
  noteForUser: String,
  dateOfBirth: Date,
  eyes: String,
  height: String,
  weight: String,
  bio: String,
  sexualReference: String,
  hair: String,
  pubicHair: String,
  ethnicity: String,
  aboutMe: String,
  bust: String,
  createdBy: mongoose.Schema.Types.ObjectId,
  stats: {
    views: {
      type: Number,
      default: 0
    },
    favorites: {
      type: Number,
      default: 0
    },
    totalVideos: {
      type: Number,
      default: 0
    },
    totalPhotos: {
      type: Number,
      default: 0
    },
    totalGalleries: {
      type: Number,
      default: 0
    },
    totalProducts: {
      type: Number,
      default: 0
    },
    totalStreamTime: {
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
  socials: {
    type: mongoose.Schema.Types.Mixed
  },
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
  balance: {
    type: Number,
    default: 0
  },
  maxParticipantsAllowed: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  privateCallPrice: Number,
  groupCallPrice: Number,
  lastStreamingTime: Date
});
