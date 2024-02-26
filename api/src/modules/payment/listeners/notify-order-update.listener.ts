import { Injectable, Logger } from '@nestjs/common';
import { QueueEventService, QueueEvent } from 'src/kernel';
import { ORDER_UPDATE_CHANNEL } from 'src/modules/payment/constants';
import { EVENT } from 'src/kernel/constants';
import { MailerService } from 'src/modules/mailer/services';
import { UserService } from 'src/modules/user/services';
import { OrderModel } from '../models';

const EMAIL_NOTIFY_ORDER_UPDATE = 'EMAIL_NOTIFY_ORDER_UPDATE';

@Injectable()
export class NotifyOrderUpdateListener {
  private readonly logger = new Logger('UpdateOrderStatusListener');

  constructor(
    private readonly queueEventService: QueueEventService,
    private readonly mailService: MailerService,
    private readonly userService: UserService
  ) {
    this.queueEventService.subscribe(
      ORDER_UPDATE_CHANNEL,
      EMAIL_NOTIFY_ORDER_UPDATE,
      this.handler.bind(this)
    );
  }

  public async handler(event: QueueEvent) {
    try {
      if (![EVENT.UPDATED].includes(event.eventName)) {
        return;
      }
      const order = event.data.newValue as OrderModel;

      if (order.buyerSource !== 'user') return;
      const user = await this.userService.findById(order.buyerId);
      if (!user || !user.email) return;
      // mail to user
      if (user.email) {
        await this.mailService.send({
          subject: `Order ${order.orderNumber} has been updated`,
          to: user.email,
          data: {
            user,
            order,
            oldDeliveryStatus: event.data.oldValue?.deliveryStatus
          },
          template: 'update-order-status'
        });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      this.logger.error(error)
    }
  }
}
