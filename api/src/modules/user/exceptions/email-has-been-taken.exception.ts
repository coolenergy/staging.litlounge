import { HttpException } from '@nestjs/common';

export class EmailHasBeenTakenException extends HttpException {
  constructor() {
    super('Email has been taken', 400);
  }
}
