import { Schema } from 'mongoose';

export const MessageSchema = new Schema({
  conversationId: {
    type: Schema.Types.ObjectId,
    index: true
  },
  // text, file, etc...
  type: {
    type: String,
    default: 'text',
    index: true
  },
  fileId: {
    type: Schema.Types.ObjectId,
    index: true
  },
  text: String,
  senderSource: String,
  senderId: {
    type: Schema.Types.ObjectId,
    index: true
  },
  meta: Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
