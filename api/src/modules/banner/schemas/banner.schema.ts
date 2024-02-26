import { Schema } from 'mongoose';
import { ObjectId } from 'mongodb';
import { BANNER_TYPE } from '../constants';

export const BannerSchema = new Schema({
  // original file
  fileId: ObjectId,
  type: {
    type: String,
    enum: [BANNER_TYPE.IMG , BANNER_TYPE.HTML],
    default: BANNER_TYPE.IMG
  },
  contentHTML : String,
  title: {
    type: String
    // TODO - text index?
  },
  href: String,
  description: { type: String },
  processing: Boolean,
  status: {
    type: String,
    // draft, active, pending, file-error
    default: 'active'
  },
  position: { type: String, default: 'top' },
  createdBy: ObjectId,
  updatedBy: ObjectId,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
