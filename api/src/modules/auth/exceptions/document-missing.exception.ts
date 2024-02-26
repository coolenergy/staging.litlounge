import { HttpException } from '@nestjs/common';
import { DOCUMENT_MISSING } from '../constants';

export class DocumentMissiongException extends HttpException {
  constructor() {
    super(DOCUMENT_MISSING, 400);
  }
}
