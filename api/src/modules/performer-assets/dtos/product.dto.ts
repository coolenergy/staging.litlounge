import { ObjectId } from 'mongodb';
import { pick } from 'lodash';

export class ProductDto {
  _id?: ObjectId;

  performerId?: ObjectId;

  digitalFileId?: ObjectId;

  imageId?: ObjectId;

  image?: string;

  digitalFile: string;

  type?: string;

  name?: string;

  description?: string;

  publish?: boolean;

  isBought?: boolean;

  status?: string;

  token?: number;

  stock?: number;

  performer?: any;

  createdBy?: ObjectId;

  updatedBy?: ObjectId;

  createdAt?: Date;

  updatedAt?: Date;

  constructor(init?: Partial<ProductDto>) {
    Object.assign(
      this,
      pick(init, [
        '_id',
        'performerId',
        'digitalFileId',
        'imageId',
        'image',
        'digitalFile',
        'type',
        'name',
        'description',
        'publish',
        'isBought',
        'status',
        'token',
        'stock',
        'performer',
        'createdBy',
        'updatedBy',
        'createdAt',
        'updatedAt'
      ])
    );
  }

  toPublic() {
    return pick(this, [
      '_id',
      'performerId',
      'image',
      'type',
      'name',
      'description',
      'status',
      'token',
      'stock',
      'publish',
      'isBought',
      'performer',
      'createdBy',
      'updatedBy',
      'createdAt',
      'updatedAt'
    ]);
  }
}
