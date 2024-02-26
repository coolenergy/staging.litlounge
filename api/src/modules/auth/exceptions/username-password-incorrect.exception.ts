import { HttpException } from '@nestjs/common';
import { USERNAME_OR_PASSWORD_INCORRECT } from '../constants';

export class UsernameOrPasswordIncorrectException extends HttpException {
  constructor() {
    super(USERNAME_OR_PASSWORD_INCORRECT, 400);
  }
}
