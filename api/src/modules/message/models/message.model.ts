import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export class MessageModel extends Document {
  conversationId?: ObjectId;

  type?: string;

  fileId?: ObjectId;

  text?: string;

  senderSource?: string;

  senderId?: ObjectId;

  meta?: any;

  createdAt?: Date;

  updatedAt?: Date;
}
