import { ObjectId } from 'mongodb';
import { pick } from 'lodash';

export interface PerformerPhotoResponse {
  _id?: ObjectId;

  performerId?: ObjectId;

  galleryId?: ObjectId;

  fileId?: ObjectId;

  photo?: any;

  type?: string;

  title?: string;

  description?: string;

  status?: string;

  processing?: boolean;

  performer?: any;

  gallery?: any;

  createdBy?: ObjectId;

  updatedBy?: ObjectId;

  createdAt?: Date;

  updatedAt?: Date;
}
export class PhotoDto {
  _id?: ObjectId;

  performerId?: ObjectId;

  galleryId?: ObjectId;

  fileId?: ObjectId;

  photo?: any;

  type?: string;

  title?: string;

  description?: string;

  status?: string;

  processing?: boolean;

  performer?: any;

  gallery?: any;

  createdBy?: ObjectId;

  updatedBy?: ObjectId;

  createdAt?: Date;

  updatedAt?: Date;

  constructor(init?: Partial<PhotoDto>) {
    Object.assign(
      this,
      pick(init, [
        '_id',
        'performerId',
        'galleryId',
        'fileId',
        'photo',
        'type',
        'title',
        'description',
        'status',
        'processing',
        'performer',
        'createdBy',
        'updatedBy',
        'createdAt',
        'updatedAt'
      ])
    );
  }

  toPublic(): PerformerPhotoResponse {
    return pick(this, [
      '_id',
      'performerId',
      'galleryId',
      'photo',
      'type',
      'title',
      'description',
      'status',
      'processing',
      'performer',
      'createdBy',
      'updatedBy',
      'createdAt',
      'updatedAt'
    ]);
  }
}
