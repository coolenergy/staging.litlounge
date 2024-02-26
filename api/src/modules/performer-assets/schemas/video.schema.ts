import { Schema } from 'mongoose';
import { ObjectId } from 'mongodb';

export const VideoSchema = new Schema({
  performerId: {
    type: ObjectId,
    index: true
  },
  fileId: ObjectId,
  trailerId: ObjectId,
  type: {
    type: String,
    index: true
  },
  title: {
    type: String
    // TODO - text index?
  },
  description: String,
  status: {
    type: String,
    default: 'active'
  },
  token: {
    type: Number,
    default: 0
  },
  processing: Boolean,
  thumbnailId: ObjectId,
  isSaleVideo: {
    type: Boolean,
    default: false
  },
  createdBy: ObjectId,
  updatedBy: ObjectId,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
