import { HttpException } from '@nestjs/common';
import { ACCOUNT_EXISTED } from '../constants';

export class AccountExistedException extends HttpException {
  constructor() {
    super(ACCOUNT_EXISTED, 400);
  }
}
