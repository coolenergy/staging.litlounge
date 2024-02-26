import { HttpStatus } from '@nestjs/common';
import { RuntimeException } from 'src/kernel';

export class InvalidFileException extends RuntimeException {
  constructor(msg: string | object = 'Invalid image', error = 'INVALID_OR_MISSING_FILE') {
    super(msg, error, HttpStatus.BAD_REQUEST);
  }
}
