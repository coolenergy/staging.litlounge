import { HttpException, HttpStatus } from '@nestjs/common';

export class MissingServerConfig extends HttpException {
  constructor(msg: string | object = 'Missing Server Config') {
    super(msg, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
