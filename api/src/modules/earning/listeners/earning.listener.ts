import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { QueueEventService, QueueEvent } from 'src/kernel';
import {
  PURCHASED_ITEM_SUCCESS_CHANNEL,
  PURCHASE_ITEM_TYPE
} from 'src/modules/purchased-item/constants';
import { EVENT, ROLE } from 'src/kernel/constants';
import {
  PerformerCommissionService,
  PerformerService
} from 'src/modules/performer/services';
import { SettingService } from 'src/modules/settings';
import { PurchasedItemDto } from 'src/modules/purchased-item/dtos';
import { StudioService } from 'src/modules/studio/services';
import { PAYMENT_STATUS } from '../../payment/constants';
import { SETTING_KEYS } from '../../settings/constants';
import { EarningDto } from '../dtos/earning.dto';
import { EARNING_MODEL_PROVIDER } from '../providers/earning.provider';
import { EarningModel } from '../models/earning.model';
import { EARNING_CHANNEL } from '../constants';

const PURCHASED_ITEM_SUCCESS = 'PURCHASED_ITEM_SUCCESS';
const UPDATED_EARNING_PAID_STATUS = 'UPDATED_EARNING_PAID_STATUS';

@Injectable()
export class TransactionEarningListener {
  constructor(
    @Inject(EARNING_MODEL_PROVIDER)
    private readonly earningModel: Model<EarningModel>,
    private readonly queueEventService: QueueEventService,
    private readonly performerService: PerformerService,
    private readonly studioService: StudioService,
    private readonly settingService: SettingService,
    private readonly performerCommission: PerformerCommissionService
  ) {
    this.queueEventService.subscribe(
      PURCHASED_ITEM_SUCCESS_CHANNEL,
      PURCHASED_ITEM_SUCCESS,
      this.handleListenEarning.bind(this)
    );
    this.queueEventService.subscribe(
      EARNING_CHANNEL,
      UPDATED_EARNING_PAID_STATUS,
      this.caclBalance.bind(this)
    );
  }

  public async handleListenEarning(event: QueueEvent) {
    try {
      const transaction = event.data as PurchasedItemDto;
      if (
        event.eventName !== EVENT.CREATED ||
        transaction?.status !== PAYMENT_STATUS.SUCCESS
      ) {
        return;
      }

      // just support performer item on this time
      const performerId = transaction.sellerId;
      const performer = await this.performerService.findById(performerId);
      if (!performer) {
        return;
      }

      let commission = 0;
      let studioCommision = 0;
      let studioEarning = null;
      const [
        defaultPerformerCommission,
        defaultStudioCommission,
        performerCommission,
        conversionRate
      ] = await Promise.all([
        this.settingService.getKeyValue(SETTING_KEYS.PERFORMER_COMMISSION),
        this.settingService.getKeyValue(SETTING_KEYS.STUDIO_COMMISSION),
        this.performerCommission.findOne({ performerId: performer._id }),
        this.settingService.getKeyValue(SETTING_KEYS.CONVERSION_RATE)
      ]);
      if (performer.studioId) {
        const studio = await this.studioService.findById(performer.studioId);
        studioCommision = studio.commission || defaultStudioCommission;
        commission = performerCommission?.memberCommission || defaultPerformerCommission;
        switch (transaction.type) {
          case PURCHASE_ITEM_TYPE.GROUP:
            studioCommision = studio.groupCallCommission || defaultStudioCommission;
            commission = performerCommission?.groupCallCommission || performerCommission?.memberCommission || defaultPerformerCommission;
            break;
          case PURCHASE_ITEM_TYPE.PRIVATE:
            studioCommision = studio.privateCallCommission || defaultStudioCommission;
            commission = performerCommission?.privateCallCommission || performerCommission?.memberCommission || defaultPerformerCommission;
            break;
          case PURCHASE_ITEM_TYPE.TIP:
            studioCommision = studio.tipCommission || defaultStudioCommission;
            commission = performerCommission?.tipCommission || performerCommission?.memberCommission || defaultPerformerCommission;
            break;
          case PURCHASE_ITEM_TYPE.PRODUCT:
            studioCommision = studio.productCommission || defaultStudioCommission;
            commission = performerCommission?.productCommission || performerCommission?.memberCommission || defaultPerformerCommission;
            break;
          case PURCHASE_ITEM_TYPE.PHOTO:
            studioCommision = studio.albumCommission || defaultStudioCommission;
            commission = performerCommission?.albumCommission || performerCommission?.memberCommission || defaultPerformerCommission;
            break;
          case PURCHASE_ITEM_TYPE.SALE_VIDEO:
            studioCommision = studio.videoCommission || defaultStudioCommission;
            commission = performerCommission?.videoCommission || performerCommission?.memberCommission || defaultPerformerCommission;
            break;
          default:
            break;
        }

        const newStudioEarning = {
          conversionRate:
            conversionRate || parseInt(process.env.CONVERSION_RATE, 10),
          originalPrice: transaction.totalPrice,
          grossPrice: transaction.totalPrice,
          commission: studioCommision,
          netPrice: transaction.totalPrice * (studioCommision / 100),
          performerId: transaction.sellerId,
          userId: transaction.sourceId,
          transactionTokenId: transaction._id,
          type: transaction.type,
          createdAt: transaction.createdAt,
          transactionStatus: transaction.status,
          sourceId: transaction.sellerId,
          source: ROLE.PERFORMER,
          target: ROLE.STUDIO,
          targetId: performer.studioId
        } as EarningDto;
        studioEarning = await this.earningModel.create(newStudioEarning);
      } else if (performerCommission) {
        switch (transaction.type) {
          case PURCHASE_ITEM_TYPE.GROUP:
            commission = performerCommission.groupCallCommission;
            break;
          case PURCHASE_ITEM_TYPE.PRIVATE:
            commission = performerCommission.privateCallCommission;
            break;
          case PURCHASE_ITEM_TYPE.TIP:
            commission = performerCommission.tipCommission;
            break;
          case PURCHASE_ITEM_TYPE.PRODUCT:
            commission = performerCommission.productCommission;
            break;
          case PURCHASE_ITEM_TYPE.PHOTO:
            commission = performerCommission.albumCommission;
            break;
          case PURCHASE_ITEM_TYPE.SALE_VIDEO:
            commission = performerCommission.videoCommission;
            break;
          default:
            break;
        }
      } else {
        commission = defaultPerformerCommission;
      }

      // Performer Earning
      const grossPrice = performer.studioId
        ? transaction.totalPrice * (studioCommision / 100)
        : transaction.totalPrice;
      const netPrice = grossPrice * (commission / 100);
      // eslint-disable-next-line new-cap
      const newEarning = new this.earningModel();
      newEarning.set(
        'conversionRate',
        conversionRate || parseInt(process.env.CONVERSION_RATE, 10)
      );
      newEarning.set('originalPrice', transaction.totalPrice);
      newEarning.set('grossPrice', grossPrice);
      newEarning.set('commission', commission);
      newEarning.set('netPrice', netPrice);
      newEarning.set('performerId', transaction.sellerId);
      newEarning.set('userId', transaction.sourceId);
      newEarning.set('transactionTokenId', transaction._id);
      newEarning.set('type', transaction.type);
      newEarning.set('createdAt', transaction.createdAt);
      newEarning.set('transactionStatus', transaction.status);
      newEarning.set('sourceId', transaction.sourceId);
      newEarning.set('targetId', transaction.sellerId);
      newEarning.set('source', ROLE.USER);
      newEarning.set('target', ROLE.PERFORMER);

      if (studioEarning) {
        newEarning.set('studioToModel', {
          grossPrice,
          commission,
          netPrice
        });
      }

      const modelEarning = await newEarning.save();
      // store metadata to studio to model
      if (studioEarning) {
        await this.earningModel.updateOne(
          { _id: studioEarning._id },
          {
            studioToModel: {
              grossPrice,
              commission,
              netPrice,
              payoutStatus: 'pending',
              refItemId: modelEarning._id
            }
          }
        );
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  }

  private async caclBalance(event: QueueEvent) {
    try {
      const { eventName, data } = event;
      if (eventName !== EVENT.UPDATED) {
        return;
      }

      const { targetId } = data;
      const [performer, studio] = await Promise.all([
        this.performerService.findOne({ _id: targetId }),
        this.studioService.findById(targetId)
      ]);
      if (!performer && !studio) return;

      const result = await this.earningModel.aggregate([
        {
          $match: {
            targetId: performer?._id || studio?._id,
            isPaid: false
          }
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: '$netPrice'
            }
          }
        }
      ]);
      const balance = (result.length && typeof result[0].total !== 'undefined') ? result[0].total : 0;

      if (performer) await this.performerService.updateBalance(performer._id, balance);
      if (studio) await this.studioService.updateBalance(studio._id, balance);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  }
}
