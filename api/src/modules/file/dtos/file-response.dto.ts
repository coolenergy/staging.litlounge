import { ObjectId } from 'mongodb';
import { FileDto } from './file.dto';

export class FileResponseDto {
  _id?: string | ObjectId;

  url?: string;

  thumbnailUrl?: string;

  static fromFile(file: FileDto): FileResponseDto {
    if (!file) return null;

    return {
      _id: file._id,
      url: file.getUrl(),
      // TODO - implement me
      thumbnailUrl: null
    };
  }
}
