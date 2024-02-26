import { HttpException } from '@nestjs/common';
import { PASSWORD_INCORRECT } from '../constants';

export class PasswordIncorrectException extends HttpException {
  constructor() {
    super(PASSWORD_INCORRECT, 400);
  }
}
