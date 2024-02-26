import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export class VideoModel extends Document {
  performerId: ObjectId;

  fileId: ObjectId;

  isSaleVideo: boolean;

  type: string;

  title: string;

  description: string;

  status: string;

  processing: boolean;

  thumbnailId: ObjectId;

  trailerId: ObjectId;

  token: number;

  createdBy: ObjectId;

  updatedBy: ObjectId;

  createdAt: Date;

  updatedAt: Date;
}
