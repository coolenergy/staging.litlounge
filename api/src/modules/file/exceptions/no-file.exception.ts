import { HttpStatus } from '@nestjs/common';
import { RuntimeException } from 'src/kernel';

export class NoFileException extends RuntimeException {
  constructor(
    error = 'NO_FILE'
  ) {
    super('No file!', error, HttpStatus.BAD_REQUEST);
  }
}
