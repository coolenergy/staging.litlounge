import { HttpException } from '@nestjs/common';

export class StreamOfflineException extends HttpException {
  constructor(message?: string) {
    super(message || 'STREAM_OFFLINE', 400);
  }
}
