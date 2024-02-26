import { HttpException, HttpStatus } from "@nestjs/common";

export class PerformerOfflineException extends HttpException {
  constructor() {
    super('Performer is offline', HttpStatus.BAD_REQUEST);
  }
}