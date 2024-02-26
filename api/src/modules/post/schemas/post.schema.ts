import { Schema } from 'mongoose';
import { ObjectId } from 'mongodb';

export const PostSchema = new Schema({
  authorId: ObjectId,
  type: {
    type: String,
    index: true
  },
  title: {
    type: String
    // TODO - text index?
  },
  slug: {
    type: String,
    index: true,
    unique: true
  },
  content: String,
  shortDescription: String,
  categoryIds: [{
    type: ObjectId,
    default: []
  }],
  // store all related categories such as parent ids int search filter
  categorySearchIds: [{
    type: ObjectId,
    default: []
  }],
  status: {
    type: String,
    default: 'draft'
  },
  image: {
    type: Schema.Types.Mixed
  },
  createdBy: ObjectId,
  updatedBy: ObjectId,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
