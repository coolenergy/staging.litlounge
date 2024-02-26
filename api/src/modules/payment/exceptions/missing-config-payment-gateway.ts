import { HttpException } from '@nestjs/common';
import { MISSING_CONFIG_PAYMENT_GATEWAY } from '../constants';

export class MissingConfigPaymentException extends HttpException {
  constructor() {
    super(MISSING_CONFIG_PAYMENT_GATEWAY, 400);
  }
}
