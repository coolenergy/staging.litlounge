import { HttpException } from '@nestjs/common';

export class BlockedByPerformerException extends HttpException {
  constructor() {
    super('BLOCKED_BY_PERFORMER', 403);
  }
}
