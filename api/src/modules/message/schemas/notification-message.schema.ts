import { Schema } from 'mongoose';

export const NotificationMessageSchema = new Schema({
  conversationId: {
    type: Schema.Types.ObjectId,
    index: true
  },
  totalNotReadMessage: {
    type: Number,
    default: 0
  },
  recipientId: {
    type: Schema.Types.ObjectId,
    index: true
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
