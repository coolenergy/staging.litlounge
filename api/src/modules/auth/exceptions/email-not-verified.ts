import { HttpException } from '@nestjs/common';
import { EMAIL_NOT_VERIFIED } from '../constants';

export class EmailNotVerifiedException extends HttpException {
  constructor() {
    super(EMAIL_NOT_VERIFIED, 400);
  }
}
