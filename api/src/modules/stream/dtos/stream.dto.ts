import * as _ from 'lodash';
import { ObjectId } from 'mongodb';

export declare type StreamType = 'public' | 'group' | 'private';
export interface IStream {
  _id?: ObjectId
  performerId?: string | ObjectId;
  type?: string;
  userIds?: ObjectId[];
  sessionId?: string;
  isStreaming?: boolean;
  totalViewer?: number;
  streamingTime?: number;
  lastStreamingTime?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class StreamDto {
  _id: ObjectId

  performerId: string | ObjectId;

  userIds: ObjectId[];

  streamIds: string[];

  type: string;

  sessionId: string;

  isStreaming: boolean;

  totalViewer: number;

  streamingTime: number;

  lastStreamingTime: Date;

  createdAt: Date;

  updatedAt: Date;

  constructor(data: Partial<IStream>) {
    Object.assign(
      this,
      _.pick(data, [
        '_id',
        'performerId',
        'userIds',
        'type',
        'streamIds',
        'sessionId',
        'isStreaming',
        'totalViewer',
        'streamingTime',
        'lastStreamingTime',
        'createdAt',
        'updatedAt'
      ])
    );
  }

  toResponse(includePrivateInfo = false) {
    const publicInfo = {
      _id: this._id,
      isStreaming: this.isStreaming,
      totalViewer: this.totalViewer,
      streamingTime: this.streamingTime,
      lastStreamingTime: this.lastStreamingTime
    };
    if (!includePrivateInfo) {
      return publicInfo;
    }

    return {
      ...publicInfo,
      performerId: this.performerId,
      userIds: this.userIds,
      type: this.type,
      streamIds: this.streamIds,
      sessionId: this.sessionId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
