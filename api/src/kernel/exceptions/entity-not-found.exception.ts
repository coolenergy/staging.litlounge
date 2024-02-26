import { HttpStatus } from '@nestjs/common';
import { RuntimeException } from './runtime.exception';

export class EntityNotFoundException extends RuntimeException {
  constructor(msg: string | object = 'Entity is not found', error = 'ENTITY_NOT_FOUND') {
    super(msg, error, HttpStatus.NOT_FOUND);
  }
}
