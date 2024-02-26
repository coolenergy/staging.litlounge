import { HttpException, HttpStatus } from '@nestjs/common';
import { CANNOT_AUTHENTICATE } from '../constants';

export class AuthErrorException extends HttpException {
  constructor() {
    super(CANNOT_AUTHENTICATE, HttpStatus.UNAUTHORIZED);
  }
}
