import { pick } from 'lodash';

export interface IPostAuthor {
  _id?: any;
  name?: string;
  avatar?: string;
  roles?: string[];
}

export class PostDto {
  _id: any;

  authorId: any;

  author: IPostAuthor;

  type: string;

  title: string;

  slug: string;

  content: string;

  shortDescription: string;

  categoryIds: string[];

  status: string;

  meta: any[];

  image: any;

  updatedBy: any;

  createdBy: any;

  createdAt: Date;

  updatedAt: Date;

  constructor(data?: Partial<PostDto>) {
    Object.assign(
      this,
      pick(data, [
        '_id',
        'authorId',
        'type',
        'title',
        'slug',
        'content',
        'shortDescription',
        'categoryIds',
        'status',
        'meta',
        'image',
        'updatedBy',
        'createdBy',
        'createdAt',
        'updatedAt'
      ])
    );
  }
}
