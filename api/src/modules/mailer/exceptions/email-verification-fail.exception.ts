import { HttpException, HttpStatus } from '@nestjs/common';

export class EmailVerificationFailureException extends HttpException {
  constructor(error: string | Record<string, any>) {
    super(
      {
        error,
        message: 'Could not verify this SMTP transporter',
        statusCode: HttpStatus.BAD_REQUEST
      },
      HttpStatus.BAD_REQUEST
    );
  }
}
