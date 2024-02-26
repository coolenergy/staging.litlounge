import { HttpException } from '@nestjs/common';

export class DuplicateRequestException extends HttpException {
  constructor() {
    super('DUPLICATE_PAYOUT_REQUEST', 422);
  }
}
