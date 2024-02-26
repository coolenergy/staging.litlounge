import { Schema } from 'mongoose';
import { ObjectId } from 'mongodb';

export const FileSchema = new Schema({
  type: {
    type: String,
    index: true
  },
  name: String,
  description: String,
  mimeType: String,
  server: String,
  path: String,
  absolutePath: String,
  width: Number,
  height: Number,
  duration: Number,
  size: Number,
  status: String,
  encoding: String,
  // store array of the files
  thumbnails: Schema.Types.Mixed,
  // eg avatar is attached to what user model?
  refItems: [{
    itemId: ObjectId,
    itemType: String,
    _id: false
  }],
  createdBy: ObjectId,
  updatedBy: ObjectId,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
