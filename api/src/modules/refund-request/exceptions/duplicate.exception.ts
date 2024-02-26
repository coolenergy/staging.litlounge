import { HttpException } from '@nestjs/common';

export class DuplicateRequestException extends HttpException {
  constructor() {
    super('DUPLICATE_REFUND_REQUEST', 422);
  }
}
