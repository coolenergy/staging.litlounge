import { QueueEvent } from 'src/kernel/events';
import { QueueEventServiceAbstract } from './queue-event-abstract.service';
import { QueueService } from './queue.service';

// queue service base on redis / bee-queue
// support for subscribers in multiple instances, but just one subscribe will receive message
// by using bee-queue
// simplify by using redis among system instead of rabitMQ for normal cases
// idea is build a queue message like Kafka but use redis
export class QueueEventService extends QueueEventServiceAbstract {
  /**
  * channel with topic
  * {
  *    channel: {
  *       topic: [BeeQueue instance]
  *    }
  * }
  */
  private queueInstances = {} as any;

  constructor(private queueService: QueueService) {
    super();
  }

  // all instance will subscribe same channel such as USER_UPDATED
  // will notify to all topic
  private getQueueInstance(channel: string, topic: string) {
    if (!this.queueInstances[channel]) {
      this.queueInstances[channel] = {};
    }
    if (!this.queueInstances[channel][topic]) {
      this.queueInstances[channel][topic] = this.queueService.createInstance(
        `${channel}_${topic}`
      );
    }

    return this.queueInstances[channel][topic];
  }

  public subscribe(
    channel: string,
    topic: string,
    handler: Function
  ): Promise<void> {
    // 1 topic can create once
    if (this.queueInstances[channel] && this.queueInstances[channel][topic]) {
      // eslint-disable-next-line no-console
      console.warn(`Cannot add same listener to same topic in ${channel}. Please create new topic name`);
      return;
    }
    const queue = this.getQueueInstance(channel, topic);
    queue.process(async (job: any) => {
      // TODO - define for other config like retry
      // or add log, etc...
      await handler(job.data);
    });
  }

  async publish(event: QueueEvent): Promise<void> {
    if (!this.queueInstances[event.channel]) {
      // eslint-disable-next-line no-console
      console.warn(`No subscriber for channel ${event.channel}`);
      return;
    }

    Promise.all(
      Object.keys(this.queueInstances[event.channel]).map((topic: string) =>
      // TODO - add event config for retries, then save log, etc...
        this.queueInstances[event.channel][topic].createJob(event)
          .save())
    );
  }
}
