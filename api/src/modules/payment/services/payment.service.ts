/* eslint-disable camelcase */
import {
  Injectable,
  Inject,
  BadRequestException
} from '@nestjs/common';
import {
  QueueEventService,
  QueueEvent
} from 'src/kernel';
import { EVENT } from 'src/kernel/constants';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { SettingService } from 'src/modules/settings';
import { SETTING_KEYS } from 'src/modules/settings/constants';
import { MissingConfigPaymentException } from '../exceptions';
import {
  PAYMENT_STATUS,
  TRANSACTION_SUCCESS_CHANNEL
} from '../constants';
import { OrderModel, PaymentTransactionModel } from '../models';
import { PAYMENT_TRANSACTION_MODEL_PROVIDER } from '../providers';
import { CCBillService } from './ccbill.service';

const SUPPORTED_GATEWAYS = ['ccbill'];
@Injectable()
export class PaymentService {
  constructor(
    @Inject(PAYMENT_TRANSACTION_MODEL_PROVIDER)
    // eslint-disable-next-line no-shadow
    private readonly PaymentTransactionModel: Model<PaymentTransactionModel>,
    private readonly ccbillService: CCBillService,
    private readonly settingService: SettingService,
    private readonly queueEventService: QueueEventService
  ) {}

  public async findById(id: string | ObjectId) {
    return this.PaymentTransactionModel.findById(id);
  }

  private async _getCCBillSettings() {
    const [
      flexformId,
      subAccountNumber,
      salt,
      currencyCode
    ] = await Promise.all([
      this.settingService.getKeyValue(SETTING_KEYS.CCBILL_FLEXFORM_ID),
      this.settingService.getKeyValue(SETTING_KEYS.CCBILL_SUB_ACCOUNT_NUMBER),
      this.settingService.getKeyValue(SETTING_KEYS.CCBILL_SALT),
      this.settingService.getKeyValue(SETTING_KEYS.CCBILL_CURRENCY_CODE)
    ]);
    if (!flexformId || !subAccountNumber || !salt) {
      throw new MissingConfigPaymentException();
    }

    return {
      flexformId,
      subAccountNumber,
      salt,
      currencyCode
    };
  }

  private async _createTransactionFromOrder(order: OrderModel, paymentGateway = 'ccbill') {
    const paymentTransaction = new this.PaymentTransactionModel();
    paymentTransaction.orderId = order._id;
    paymentTransaction.paymentGateway = paymentGateway;
    paymentTransaction.buyerSource = order.buyerSource;
    paymentTransaction.buyerId = order.buyerId;
    paymentTransaction.type = order.type;
    paymentTransaction.totalPrice = order.totalPrice;
    paymentTransaction.products = [{
      name: order.name,
      description: order.description,
      price: order.totalPrice,
      productType: order.productType,
      productId: order.productId,
      quantity: order.quantity,
      extraInfo: null
    }];
    paymentTransaction.paymentResponseInfo = null;
    paymentTransaction.status = PAYMENT_STATUS.PENDING;
    return paymentTransaction.save();
  }

  public async processSinglePayment(order: OrderModel, paymentGateway = 'ccbill') {
    if (!SUPPORTED_GATEWAYS.includes(paymentGateway)) throw new BadRequestException(`Does not support payment gateway${  paymentGateway}`);

    // TODO - filter for other service
    const ccbillConfig = await this._getCCBillSettings();

    const transaction = await this._createTransactionFromOrder(order, paymentGateway);
    return this.ccbillService.singlePurchase(Object.assign(ccbillConfig, {
      price: transaction.totalPrice,
      transactionId: transaction._id
    }));
  }

  public async ccbillSinglePaymentSuccessWebhook(payload: Record<string, any>) {
    const transactionId = payload['X-transactionId'] || payload.transactionId;
    if (!transactionId) {
      throw new BadRequestException();
    }
    const checkForHexRegExp = new RegExp('^[0-9a-fA-F]{24}$');
    if (!checkForHexRegExp.test(transactionId)) {
      return { ok: false };
    }
    const transaction = await this.PaymentTransactionModel.findById(
      transactionId
    );
    if (!transaction || transaction.status !== PAYMENT_STATUS.PENDING) {
      return { ok: false };
    }
    transaction.status = PAYMENT_STATUS.SUCCESS;
    transaction.paymentResponseInfo = payload;
    await transaction.save();
    await this.queueEventService.publish(
      new QueueEvent({
        channel: TRANSACTION_SUCCESS_CHANNEL,
        eventName: EVENT.CREATED,
        data: transaction
      })
    );
    return { ok: true };
  }

  public async ccbillRenewalSuccessWebhook(payload: any) {
    const subscriptionId = payload.subscriptionId || payload.subscription_id;
    if (!subscriptionId) {
      throw new BadRequestException();
    }
    const transaction = await this.PaymentTransactionModel.findOne({
      'paymentResponseInfo.subscriptionId': subscriptionId
    });
    if (!transaction) {
      return { ok: false };
    }

    // TODO - create new order for this transaction!

    const newTransaction = new this.PaymentTransactionModel(transaction.toObject());
    newTransaction.paymentResponseInfo = payload;
    newTransaction.status = PAYMENT_STATUS.SUCCESS;
    await newTransaction.save();
    await this.queueEventService.publish(
      new QueueEvent({
        channel: TRANSACTION_SUCCESS_CHANNEL,
        eventName: EVENT.CREATED,
        data: newTransaction
      })
    );
    return { ok: true };
  }
}
