import { QueueEvent, QueueEventService } from 'src/kernel';
import { Injectable } from '@nestjs/common';
import { UserService } from 'src/modules/user/services';
import {
  PerformerCommissionService,
  PerformerService
} from 'src/modules/performer/services';
import { EVENT, ROLE } from 'src/kernel/constants';
import { ObjectId } from 'mongodb';
import { SocketUserService } from 'src/modules/socket/services/socket-user.service';
import { SettingService } from 'src/modules/settings/services';
import { MESSAGE_TYPE } from 'src/modules/message/constants';
import { SETTING_KEYS } from 'src/modules/settings/constants';
import { StudioService } from 'src/modules/studio/services';
import { ConversationService } from 'src/modules/message/services';
import { UserDto } from 'src/modules/user/dtos';
import { generateUuid } from 'src/kernel/helpers/string.helper';
import { PurchasedItemDto } from '../dtos';
import {
  PURCHASED_ITEM_SUCCESS_CHANNEL,
  PURCHASE_ITEM_STATUS,
  PURCHASE_ITEM_TYPE
} from '../constants';

const HANDLE_PAYMENT_TOKEN = 'HANDLE_PAYMENT_TOKEN';
const RECEIVED_PAID_TOKEN = 'RECEIVED_PAID_TOKEN';

@Injectable()
export class PaymentTokenListener {
  constructor(
    private readonly userService: UserService,
    private readonly performerService: PerformerService,
    private readonly queueEventService: QueueEventService,
    private readonly socketUserService: SocketUserService,
    private readonly settingService: SettingService,
    private readonly performerCommission: PerformerCommissionService,
    private readonly studioService: StudioService,
    private readonly conversationService: ConversationService
  ) {
    this.queueEventService.subscribe(
      PURCHASED_ITEM_SUCCESS_CHANNEL,
      HANDLE_PAYMENT_TOKEN,
      this.handler.bind(this)
    );
  }

  async handler(event: QueueEvent) {
    const { eventName } = event;
    const transaction: PurchasedItemDto = event.data;
    const { sourceId, source, status, totalPrice } = transaction;
    const performerId = transaction.sellerId;
    try {
      if (
        eventName !== EVENT.CREATED ||
        status !== PURCHASE_ITEM_STATUS.SUCCESS
      ) {
        return;
      }

      const [owner, performer] = await Promise.all([
        this.getUser(source, sourceId),
        performerId ? await this.performerService.findById(performerId) : null
      ]);

      if (!owner || !performer) return;

      let commission = 0;
      let studioCommision = 0;
      const [
        defaultPerformerCommission,
        defaultStudioCommission,
        performerCommission
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
      const grossPrice = performer.studioId ? totalPrice * (studioCommision / 100) : totalPrice;
      const netPrice = grossPrice * (commission / 100);
      await Promise.all([
        this.performerService.increaseBalance(performer._id, netPrice),
        performer.studioId &&
          this.studioService.increaseBalance(
            performer.studioId,
            (totalPrice * studioCommision) / 100
          ),
        source === ROLE.USER
          ? this.userService.increaseBalance(
              transaction.sourceId,
              totalPrice * -1
            )
          : this.performerService.increaseBalance(
              transaction.sourceId,
              totalPrice * -1
            )
      ]);
      await this.notify(transaction, netPrice);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
  }

  async notify(transaction: PurchasedItemDto, netPrice: number) {
    try {
      const { targetId, sourceId, type, totalPrice } = transaction;
      const performerId = transaction.sellerId;
      if (type === PURCHASE_ITEM_TYPE.TIP) {
        const [user, conversation] = await Promise.all([
          this.userService.findById(sourceId),
          targetId && this.conversationService.findById(targetId)
        ]);
        const senderInfo = user && new UserDto(user).toResponse();
        const message = {
          conversationId: conversation._id,
          _id: generateUuid(),
          senderInfo,
          token: totalPrice,
          text: `has tipped ${totalPrice} tokens`,
          type: MESSAGE_TYPE.TIP
        };

        await Promise.all([
          conversation &&
            this.socketUserService.emitToRoom(
              this.conversationService.serializeConversation(
                conversation._id,
                conversation.type
              ),
              `message_created_conversation_${ conversation._id}`,
              message
            ),
          this.socketUserService.emitToUsers(performerId, 'tipped', {
            senderInfo,
            token: totalPrice, netPrice
          })
        ]);
      }

      if ([PURCHASE_ITEM_TYPE.GROUP, PURCHASE_ITEM_TYPE.PRIVATE].includes(type)) {
        this.socketUserService.emitToUsers(performerId, RECEIVED_PAID_TOKEN, {
          conversationId: targetId,
          token: totalPrice, netPrice
        })
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
  }

  async getUser(role: string, id: ObjectId) {
    if (!role || !id) return null;

    let user = null;
    if (role === ROLE.USER) {
      user = await this.userService.findById(id);
    } else if (role === ROLE.PERFORMER) {
      user = await this.performerService.findById(id);
    }
    // else if (role === Role.Studio) {
    //   user = await this.studioService.findById(id);
    // }

    return user;
  }
}
