import { HttpException } from '@nestjs/common';

export class ParticipantJoinLimitException extends HttpException {
  constructor() {
    super('NUMBER_PARTICIPANNT_JOIN_LIMIT', 400);
  }
}
