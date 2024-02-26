import { Schema } from 'mongoose';
import { ObjectId } from 'mongodb';

export const StreamSchema = new Schema({
  performerId: ObjectId,
  type: String,
  sessionId: String,
  isStreaming: { type: Boolean, default: false },
  userIds: [{ type: ObjectId }],
  streamIds: [{ type: String }],
  lastStreamingTime: Date,
  streamingTime: {
    type: Number,
    default: 0
  },
  totalViewer: {
    type: Number,
    default: 0
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
