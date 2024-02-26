import { HttpException } from '@nestjs/common';

export class ModelNotFoundException extends HttpException {
  constructor() {
    super('MODEL_NOT_FOUND', 422);
  }
}
