import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export interface IRefItem {
  itemType: string;
  itemId: ObjectId;
}

export class FileModel extends Document {
  type?: string; // video, podcast, file, etc...

  name?: string;

  description?: string;

  mimeType?: string;

  server?: string; // eg: local, aws, etc... we can create a helper to filter and get direct link

  path?: string; // path of key in local or server

  absolutePath?: string;

  width?: number; // for video, img

  height?: number; // for video, img

  duration?: number; // for video, podcast

  size?: number; // in byte

  status?: string;

  thumbnails?: any;

  encoding?: string;

  refItems?: IRefItem[];

  createdBy?: ObjectId;

  updatedBy?: ObjectId;

  createdAt?: Date;

  updatedAt?: Date;
}
