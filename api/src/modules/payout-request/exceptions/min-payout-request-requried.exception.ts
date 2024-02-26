import { HttpException, HttpStatus } from '@nestjs/common';

export const MIN_PAYOUT_REQUEST_REQUIRED = 'MIN_PAYOUT_REQUEST_REQUIRED';

export class MinPayoutRequestRequiredException extends HttpException {
  constructor(response?: Record<string, any>) {
    super(
      response || MIN_PAYOUT_REQUEST_REQUIRED,
      HttpStatus.BAD_REQUEST
    );
  }
}
