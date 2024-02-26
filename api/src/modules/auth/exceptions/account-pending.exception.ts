import { HttpException } from '@nestjs/common';
import { ACCOUNT_PENDING } from '../constants';

export class AccountPendingException extends HttpException {
  constructor() {
    super(ACCOUNT_PENDING, 400);
  }
}
