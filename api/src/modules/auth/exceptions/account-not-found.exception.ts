import { HttpException } from '@nestjs/common';
import { ACCOUNT_NOT_FOUND } from '../constants';

export class AccountNotFoundxception extends HttpException {
  constructor() {
    super(ACCOUNT_NOT_FOUND, 400);
  }
}
