import { HttpException } from '@nestjs/common';

export class BlockedCountryException extends HttpException {
  constructor() {
    super('BLOCK_COUNTRY', 403);
  }
}
