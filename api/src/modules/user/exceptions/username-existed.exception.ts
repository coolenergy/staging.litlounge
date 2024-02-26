import { HttpException } from '@nestjs/common';
import { USERNAME_HAS_BEEN_TAKEN } from '../../auth/constants';

export class UsernameExistedException extends HttpException {
  constructor() {
    super(USERNAME_HAS_BEEN_TAKEN, 400);
  }
}
