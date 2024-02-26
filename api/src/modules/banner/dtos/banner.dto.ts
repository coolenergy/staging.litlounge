import { ObjectId } from 'mongodb';
import { pick } from 'lodash';

export class BannerDto {
  _id?: ObjectId;

  fileId?: ObjectId;

  title?: string;

  description?: string;

  status?: string;

  href?: string;

  position?: string;

  processing?: boolean;

  photo?: any;

  type: string;

  contentHTML: string;

  createdAt?: Date;

  updatedAt?: Date;

  constructor(init?: Partial<BannerDto>) {
    Object.assign(
      this,
      pick(init, [
        '_id',
        'fileId',
        'title',
        'description',
        'href',
        'status',
        'position',
        'processing',
        'photo',
        'createdAt',
        'updatedAt',
        'type',
        'contentHTML'
      ])
    );
  }
}
