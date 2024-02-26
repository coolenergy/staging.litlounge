import { HttpException } from '@nestjs/common';

export class EmailExistedException extends HttpException {
  constructor() {
    super('Email has been taken', 422);
  }
}
