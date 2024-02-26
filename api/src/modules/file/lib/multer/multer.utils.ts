import {
  BadRequestException,
  HttpException,
  PayloadTooLargeException
} from '@nestjs/common';
import { multerExceptions } from './multer.constants';

export function transformException(error: Error | undefined) {
  if (!error || error instanceof HttpException) {
    return error;
  }
  switch (error.message) {
    case multerExceptions.LIMIT_FILE_SIZE:
      return new PayloadTooLargeException(error.message);
    case multerExceptions.LIMIT_FILE_COUNT:
    case multerExceptions.LIMIT_FIELD_KEY:
    case multerExceptions.LIMIT_FIELD_VALUE:
    case multerExceptions.LIMIT_FIELD_COUNT:
    case multerExceptions.LIMIT_UNEXPECTED_FILE:
    case multerExceptions.LIMIT_PART_COUNT:
      return new BadRequestException(error.message);
    default:
      break;
  }
  return error;
}

export interface IMulterUploadedFile {
  fieldname: string; // 'file'
  originalname: string; // 'abc.tif'
  encoding: string; // '7bit'
  mimetype: string; // 'image/tiff'
  destination: string; // '/absolute/path/public'
  filename: string; // 'q1pjq-abc.tif'
  path: string; // '/absolute/path/public/q1pjq-abc.tif'
  size: number; // 15866
}
