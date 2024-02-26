import { ObjectId } from 'mongodb';
import { pick } from 'lodash';
import { GalleryModel } from '../models';

export class GalleryDto {
  _id?: ObjectId;

  performerId?: ObjectId;

  type?: string;

  name?: string;

  description?: string;

  status?: string;

  processing?: boolean;

  coverPhotoId?: ObjectId;

  token?: number;

  coverPhoto?: Record<string, any>;

  isBought?: boolean;

  performer?: any;

  createdBy?: ObjectId;

  updatedBy?: ObjectId;

  createdAt?: Date;

  updatedAt?: Date;

  isSale?: boolean;

  constructor(init?: Partial<GalleryDto>) {
    Object.assign(
      this,
      pick(init, [
        '_id',
        'performerId',
        'numOfItems',
        'type',
        'name',
        'description',
        'status',
        'coverPhotoId',
        'token',
        'isBought',
        'coverPhoto',
        'performer',
        'createdBy',
        'updatedBy',
        'createdAt',
        'updatedAt',
        'isSale'
      ])
    );
  }

  static fromModel(model: GalleryModel) {
    return new GalleryDto(model);
  }
}
