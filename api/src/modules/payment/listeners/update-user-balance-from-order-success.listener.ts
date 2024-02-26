import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { QueueEventService, QueueEvent } from 'src/kernel';
import { ORDER_PAID_SUCCESS_CHANNEL, ORDER_STATUS, PRODUCT_TYPE } from 'src/modules/payment/constants';
import { EVENT } from 'src/kernel/constants';
import { UserService } from 'src/modules/user/services';
import { TokenPackageService } from 'src/modules/token-package/services';
import { OrderModel } from '../models';

const UPDATE_USER_BALANCE_FROM_ORDER_PAID = 'UPDATE_USER_BALANCE_FROM_ORDER_PAID';

@Injectable()
export class UpdateUserBalanceFromOrderSuccessListener {
  private readonly logger = new Logger('UpdateUserBalanceFromOrderSuccessListener');

  constructor(
    private readonly queueEventService: QueueEventService,
    private readonly userService: UserService,
    @Inject(forwardRef(() => TokenPackageService))
    private readonly tokenService: TokenPackageService
  ) {
    this.queueEventService.subscribe(
      ORDER_PAID_SUCCESS_CHANNEL,
      UPDATE_USER_BALANCE_FROM_ORDER_PAID,
      this.handler.bind(this)
    );
  }

  public async handler(event: QueueEvent) {
    try {
      if (![EVENT.CREATED].includes(event.eventName)) {
        return;
      }
      const order = event.data as OrderModel;
      if (order.productType !== PRODUCT_TYPE.TOKEN && order.type !== PRODUCT_TYPE.TOKEN || order.status !== ORDER_STATUS.PAID) return;

      const tokenPackage = await this.tokenService.findById(order.productId);
      const amount = tokenPackage?.tokens || parseInt(`${order.totalPrice}`, 10);
      await this.userService.increaseBalance(order.buyerId, amount, false);
    } catch (error) {
      // eslint-disable-next-line no-console
      this.logger.error(error)
    }
  }
}
