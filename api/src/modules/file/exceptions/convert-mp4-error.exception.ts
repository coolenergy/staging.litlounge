import { HttpStatus } from '@nestjs/common';
import { RuntimeException } from 'src/kernel';

export class ConvertMp4ErrorException extends RuntimeException {
  constructor(
    error = 'convert mp4 error!'
  ) {
    super('Convert mp4 error', error, HttpStatus.BAD_REQUEST);
  }
}
