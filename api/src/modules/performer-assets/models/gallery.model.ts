import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export class GalleryModel extends Document {
  performerId: ObjectId;

  galleryId: ObjectId;

  type: string;

  name: string;

  description: string;

  status: string;

  coverPhotoId: ObjectId;

  token: number;

  numOfItems: number;

  createdBy: ObjectId;

  updatedBy: ObjectId;

  createdAt: Date;

  updatedAt: Date;

  isSale: boolean;
}
