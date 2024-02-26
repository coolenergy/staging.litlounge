import { Schema } from 'mongoose';
import { ObjectId } from 'mongodb';

export const GallerySchema = new Schema({
  performerId: {
    type: ObjectId,
    index: true
  },
  type: {
    type: String,
    index: true
  },
  name: {
    type: String
    // TODO - text index?
  },
  description: String,
  status: {
    type: String,
    // draft, active
    default: 'active'
  },
  isSale: {
    type: Boolean,
    detault: true
  },
  token: {
    type: Number,
    default: 0
  },
  numOfItems: {
    type: Number,
    default: 0
  },
  coverPhotoId: {
    type: ObjectId,
    index: true
  },
  createdBy: ObjectId,
  updatedBy: ObjectId,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
