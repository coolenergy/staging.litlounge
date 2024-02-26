import { HttpException } from '@nestjs/common';
import { EMAIL_OR_PASSWORD_INCORRECT } from '../constants';

export class EmailOrPasswordIncorrectException extends HttpException {
  constructor() {
    super(EMAIL_OR_PASSWORD_INCORRECT, 400);
  }
}
