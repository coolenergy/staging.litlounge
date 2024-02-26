import { HttpException, HttpStatus } from '@nestjs/common';

export class StreamServerErrorException extends HttpException {
  constructor(response: Record<string, any>) {
    super(
      {
        message: response.message || 'Stream Server Error!',
        error: response.error,
        status: response.status || HttpStatus.INTERNAL_SERVER_ERROR
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
