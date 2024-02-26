import { HttpException, HttpStatus } from '@nestjs/common';

export class RuntimeException extends HttpException {
  protected constructor(message: string | object, error?: string, statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
    let response: any;
    if (typeof message === 'string') {
      response = { message, error, statusCode };
    } else {
      response = {
        error,
        statusCode,
        ...message
      };
    }
    super(response, statusCode);
  }
}
