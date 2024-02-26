import { ObjectId } from 'mongodb';
import { Schema } from 'mongoose';

export const BlockSettingSchema = new Schema({
  performerId: {
    type: Schema.Types.ObjectId,
    index: true
  },
  countries: [{ type: String, index: true }],
  userIds: [{
    type: ObjectId, index: true
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

BlockSettingSchema.index({ countries: 1 });
