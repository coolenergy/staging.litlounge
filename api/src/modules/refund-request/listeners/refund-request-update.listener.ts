import { Injectable } from '@nestjs/common';
import { QueueEvent, QueueEventService } from 'src/kernel';
import { OrderService } from 'src/modules/payment/services';
import {
  REFUND_REQUEST_ACTION,
  REFUND_REQUEST_CHANNEL,
  STATUES
} from '../constants';

const REFUND_REQUEST_UPDATE_TOPIC = 'REFUND_REQUEST_UPDATE_TOPIC';
const REFUNDED = 'refunded';

@Injectable()
export class RefundRequestUpdateListener {
  constructor(
    private readonly queueEventService: QueueEventService,
    private readonly orderService: OrderService
  ) {
    this.queueEventService.subscribe(
      REFUND_REQUEST_CHANNEL,
      REFUND_REQUEST_UPDATE_TOPIC,
      this.handler.bind(this)
    );
  }

  async handler(event: QueueEvent): Promise<void> {
    try {
      if (event.eventName !== REFUND_REQUEST_ACTION.UPDATED) return;

      const { oldStatus, request } = event.data;
      if (oldStatus !== request.status && request.status === STATUES.RESOLVED) {
        const order = await this.orderService.findById(request.sourceId);
        if (!order) return;

        // const { transactionTokenId } = order;
        order.deliveryStatus = REFUNDED;
        await Promise.all([
          /**
           * Update earning, commission
           */
          // order.save()
          // TODO - reupdate me
        ]);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }
}
