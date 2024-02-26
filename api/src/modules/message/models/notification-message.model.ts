import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export class NotificationMessageModel extends Document {
  conversationId: ObjectId;

  totalNotReadMessage: number;

  recipientId: ObjectId;

  createdAt: Date;

  updatedAt: Date;
}
