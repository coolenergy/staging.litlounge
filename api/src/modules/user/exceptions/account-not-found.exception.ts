import { HttpException } from '@nestjs/common';

export class AccountNotFoundxception extends HttpException {
  constructor() {
    super('Account not found', 400);
  }
}
