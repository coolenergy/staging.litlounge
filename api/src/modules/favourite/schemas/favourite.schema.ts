import { Schema } from 'mongoose';
import { ObjectId } from 'mongodb';

export const favouriteSchema = new Schema({
  favoriteId: { type: ObjectId, index: true },
  ownerId: { type: ObjectId, index: true },
  createdAt: {
    type: Date,
    default: new Date()
  },
  updatedAt: {
    type: Date,
    default: new Date()
  }
});
