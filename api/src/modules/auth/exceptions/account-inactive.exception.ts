import { HttpException } from '@nestjs/common';
import { ACCOUNT_INACTIVE } from '../constants';

export class AccountInactiveException extends HttpException {
  constructor() {
    super(ACCOUNT_INACTIVE, 401);
  }
}
