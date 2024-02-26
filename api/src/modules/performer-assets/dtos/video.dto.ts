import { ObjectId } from 'mongodb';
import { pick } from 'lodash';
import { VideoModel } from '../models';

export class VideoDto {
  _id?: ObjectId;

  performerId?: ObjectId;

  fileId?: ObjectId;

  type?: string;

  title?: string;

  description?: string;

  status?: string;

  processing?: boolean;

  thumbnailId?: ObjectId;

  token?: number;

  isBought?: boolean;

  thumbnail?: string;

  video?: any;

  trailer?: any;

  trailerId?: ObjectId;

  isSaleVideo?: boolean;

  performer?: any;

  createdBy?: ObjectId;

  updatedBy?: ObjectId;

  createdAt?: Date;

  updatedAt?: Date;

  constructor(init?: Partial<VideoDto>) {
    Object.assign(this, pick(init, [
      '_id',
      'performerId',
      'fileId',
      'type',
      'title',
      'description',
      'status',
      'processing',
      'thumbnailId',
      'token',
      'video',
      'thumbnail',
      'isSaleVideo',
      'trailer',
      'trailerId',
      'performer',
      'createdBy',
      'updatedBy',
      'createdAt',
      'updatedAt',
      'isBought'
    ]));
  }

  static fromModel(file: VideoModel) {
    return new VideoDto(file);
  }
}

export class IVideoResponse {
  _id?: ObjectId;

  performerId?: ObjectId;

  fileId?: ObjectId;

  type?: string;

  title?: string;

  description?: string;

  status?: string;

  tags?: string[];

  processing?: boolean;

  thumbnailId?: ObjectId;

  isSaleVideo?: boolean;

  price?: number;

  thumbnail?: string;

  video?: any;

  token?: number;

  performer?: any;

  stats?: {
    views: number;
    likes: number;
    comments: number;
  };

  userReaction?: {
    liked?: boolean;
    favourited?: boolean;
    watchedLater?: boolean;
  };

  isBought?: boolean;

  isSubscribed?: boolean;

  createdBy?: ObjectId;

  updatedBy?: ObjectId;

  createdAt?: Date;

  updatedAt?: Date;

  constructor(init?: Partial<IVideoResponse>) {
    Object.assign(this, pick(init, [
      '_id',
      'performerId',
      'fileId',
      'type',
      'title',
      'token',
      'description',
      'status',
      'processing',
      'thumbnailId',
      'isSchedule',
      'isSaleVideo',
      'price',
      'video',
      'thumbnail',
      'performer',
      'tags',
      'stats',
      'userReaction',
      'isBought',
      'isSubscribed',
      'createdBy',
      'updatedBy',
      'scheduledAt',
      'createdAt',
      'updatedAt'
    ]));
  }

  static fromModel(file: VideoModel) {
    return new VideoDto(file);
  }
}
