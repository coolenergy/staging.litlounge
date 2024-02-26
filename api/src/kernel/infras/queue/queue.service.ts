import { Injectable } from '@nestjs/common';

const Queue = require('bee-queue');

@Injectable()
export class QueueService {
  constructor(private readonly config?: any) {
  }

  public createInstance(name: string, config?: any) {
    return new Queue(name, config || this.config);
  }
}
