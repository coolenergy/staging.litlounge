import { Schema } from 'mongoose';
import { ObjectId } from 'mongodb';

export const PostMetaSchema = new Schema({
  postId: {
    type: ObjectId,
    index: true,
    required: true
  },
  key: {
    type: String,
    index: true
  },
  value: Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
