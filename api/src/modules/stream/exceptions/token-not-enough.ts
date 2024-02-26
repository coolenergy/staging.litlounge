import { HttpException } from '@nestjs/common';

export class TokenNotEnoughException extends HttpException {
  constructor() {
    super('Oops, you don\'t have enough tokens', 400);
  }
}
