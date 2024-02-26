import { HttpException } from '@nestjs/common';

export class ItemHaveBoughtException extends HttpException {
  constructor() {
    super('You have been purchased this item. Please check your account dashboard.', 400);
  }
}
