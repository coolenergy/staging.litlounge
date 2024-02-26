import { HttpException } from '@nestjs/common';

export class NotEnoughMoneyException extends HttpException {
  constructor() {
    super('NOT_ENOUGH_TOKEN', 400);
  }
}
