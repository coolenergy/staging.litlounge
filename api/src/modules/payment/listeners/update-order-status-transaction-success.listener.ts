import { Inject, Injectable, Logger } from '@nestjs/common';
import { QueueEventService, QueueEvent } from 'src/kernel';
import { DELIVERY_STATUS, ORDER_PAID_SUCCESS_CHANNEL, ORDER_STATUS, PRODUCT_TYPE, TRANSACTION_SUCCESS_CHANNEL } from 'src/modules/payment/constants';
import { EVENT } from 'src/kernel/constants';
import { MailerService } from 'src/modules/mailer/services';
import { SettingService } from 'src/modules/settings';
import { UserService } from 'src/modules/user/services';
import { Model } from 'mongoose';
import { PAYMENT_STATUS } from '../constants';
import { OrderModel, PaymentTransactionModel } from '../models';
import { ORDER_MODEL_PROVIDER } from '../providers';

const UPDATE_ORDER_STATUS_TRANSACTION_SUCCESS = 'UPDATE_ORDER_STATUS_TRANSACTION_SUCCESS';

@Injectable()
export class UpdateOrderStatusPaymentTransactionSuccessListener {
  private readonly logger = new Logger('UpdateOrderStatusPaymentTransactionSuccessListener');

  constructor(
    private readonly queueEventService: QueueEventService,
    private readonly mailService: MailerService,
    private readonly userService: UserService,
    @Inject(ORDER_MODEL_PROVIDER)
    private readonly Order: Model<OrderModel>
  ) {
    this.queueEventService.subscribe(
      TRANSACTION_SUCCESS_CHANNEL,
      UPDATE_ORDER_STATUS_TRANSACTION_SUCCESS,
      this.handler.bind(this)
    );
  }

  public async handler(event: QueueEvent) {
    try {
      if (![EVENT.CREATED].includes(event.eventName)) {
        return;
      }
      const transaction = event.data as PaymentTransactionModel;

      const order = await this.Order.findById(transaction.orderId);
      if (!order) return;

      order.paymentStatus = PAYMENT_STATUS.SUCCESS;
      order.status = ORDER_STATUS.PAID;
      if (order.type === PRODUCT_TYPE.TOKEN) {
        order.deliveryStatus = DELIVERY_STATUS.DELIVERED;
      }
      await order.save();

      await this.queueEventService.publish(
        new QueueEvent({
          channel: ORDER_PAID_SUCCESS_CHANNEL,
          eventName: EVENT.CREATED,
          data: order
        })
      );

      if (order.buyerSource !== 'user') return;
      const user = await this.userService.findById(transaction.buyerId);
      if (!user) return;
      const adminEmail = SettingService.getValueByKey('adminEmail') || process.env.ADMIN_EMAIL;

      // mail to admin
      if (adminEmail) {
        await this.mailService.send({
          subject: 'New payment success',
          to: adminEmail,
          data: {
            user,
            order
          },
          template: 'admin-payment-success'
        });
      }
      // mail to user
      if (user.email) {
        await this.mailService.send({
          subject: 'New payment success',
          to: user.email,
          data: {
            user,
            order
          },
          template: 'user-payment-success'
        });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      this.logger.error(error)
    }
  }
}
