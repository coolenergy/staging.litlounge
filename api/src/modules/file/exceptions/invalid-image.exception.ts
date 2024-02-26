import { HttpStatus } from '@nestjs/common';
import { RuntimeException } from 'src/kernel';

export class InvalidImageException extends RuntimeException {
  constructor(msg: string | object = 'Invalid image', error: string = 'INVALID_IMAGE') {
    super(msg, error, HttpStatus.BAD_REQUEST);
  }
}
