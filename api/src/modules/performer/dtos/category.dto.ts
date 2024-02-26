import { ObjectId } from 'mongodb';
import { pick } from 'lodash';

export class PerformerCategoryDto {
  _id: ObjectId;

  name: string;

  slug: string;

  ordering: number;

  description: string;

  createdBy: ObjectId;

  updatedBy: ObjectId;

  createdAt: Date;

  updatedAt: Date;

  constructor(data?: Partial<PerformerCategoryDto>) {
    Object.assign(
      this,
      pick(data, [
        '_id',
        'name',
        'slug',
        'ordering',
        'description',
        'createdBy',
        'updatedBy',
        'createdAt',
        'updatedAt'
      ])
    );
  }
}
