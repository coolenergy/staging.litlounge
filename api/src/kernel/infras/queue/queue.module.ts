import { DynamicModule, Global, Module } from '@nestjs/common';

import { QueueEventService } from './queue-event.service';
import { QueueService } from './queue.service';

@Global()
@Module({})
export class QueueModule {
  static forRoot(
    opts?: any
  ): DynamicModule {
    const queueServiceProvider = {
      provide: QueueService,
      useFactory: async () => {
        // TODO - get and update config
        // check bee queue settings here https://github.com/bee-queue/bee-queue#settings
        const config = {
          prefix: process.env.REDIS_PRIFIX || 'bq',
          stallInterval: 5000,
          nearTermWindow: 1200000,
          delayedDebounce: 1000,
          redis: {
            host: process.env.REDIS_HOST || '127.0.0.1',
            port: parseInt(process.env.REDIS_PORT, 10) || 6379,
            db: parseInt(process.env.REDIS_DB, 10) || 0,
            options: {}
          },
          isWorker: true,
          getEvents: true,
          sendEvents: true,
          storeJobs: false, // dont store job event
          ensureScripts: true,
          activateDelayedJobs: false,
          removeOnSuccess: true,
          removeOnFailure: true, // dont need store
          redisScanCount: 100,
          ...opts || {}
        };
        return new QueueService(config);
      },
      inject: []
    };

    const queueEventServiceProvider = {
      provide: QueueEventService,
      useFactory: async () => {
        // TODO - get and update config for queue event
        // check bee queue settings here https://github.com/bee-queue/bee-queue#settings
        const config = {
          prefix: 'qe',
          stallInterval: 5000,
          nearTermWindow: 1200000,
          delayedDebounce: 1000,
          redis: {
            host: process.env.REDIS_HOST || '127.0.0.1',
            port: 6379,
            db: 0,
            options: {}
          },
          isWorker: true,
          getEvents: true,
          sendEvents: true,
          storeJobs: false, // dont store job event
          ensureScripts: true,
          activateDelayedJobs: false,
          removeOnSuccess: true,
          removeOnFailure: true, // dont need store
          redisScanCount: 100,
          ...opts || {}
        };
        return new QueueEventService(new QueueService(config));
      },
      inject: [QueueService]
    };

    return {
      module: QueueModule,
      providers: [queueServiceProvider, queueEventServiceProvider],
      exports: [queueServiceProvider, queueEventServiceProvider]
    };
  }
}
