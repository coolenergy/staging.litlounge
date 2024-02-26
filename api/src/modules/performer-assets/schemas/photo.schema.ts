import { Schema } from 'mongoose';
import { ObjectId } from 'mongodb';

export const PhotoSchema = new Schema({
  performerId: {
    type: ObjectId,
    index: true
  },
  galleryId: {
    type: ObjectId,
    index: true
  },
  // original file
  fileId: ObjectId,
  title: {
    type: String
    // TODO - text index?
  },
  description: String,
  status: {
    type: String,
    // draft, active, pending, file-error
    default: 'active'
  },
  processing: Boolean,
  isGalleryCover: {
    type: Boolean,
    default: false
  },
  createdBy: ObjectId,
  updatedBy: ObjectId,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
