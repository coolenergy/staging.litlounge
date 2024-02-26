import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { merge } from 'lodash';
import { QueueEvent, QueueEventService } from 'src/kernel';
import {
  INITIALIZE_COMMISSION,
  PERFORMER_CHANNEL,
  PERFORMER_STEAMING_STATUS_CHANNEL
} from 'src/modules/performer/constants';
import { SettingService } from 'src/modules/settings';
import { SETTING_KEYS } from 'src/modules/settings/constants';
import {
  GROUP_CHAT,
  OFFLINE,
  PRIVATE_CHAT,
  PUBLIC_CHAT
} from 'src/modules/stream/constant';
import { StudioService } from 'src/modules/studio/services';
import { SocketUserService } from 'src/modules/socket/services/socket-user.service';
import { ConversationService } from 'src/modules/message/services';
import { ConversationDto } from 'src/modules/message/dtos';
import { generateUuid } from 'src/kernel/helpers/string.helper';
import { EVENT } from 'src/kernel/constants';
import { PerformerCommissionModel } from '../models';
import { PERFORMER_COMMISSION_MODEL_PROVIDER } from '../providers';
import { PerformerCommissionService, PerformerService } from '../services';
import { PerformerDto } from '../dtos';

const PERFORMER_STUDIO_UPDATED = 'PERFORMER_STUDIO_UPDATED';
const PERFORMER_STEAMING_STATUS_UPDATED = 'PERFORMER_STEAMING_STATUS_UPDATED';

@Injectable()
export class PerformerListener {
  constructor(
    @Inject(PERFORMER_COMMISSION_MODEL_PROVIDER)
    private readonly PerformerCommission: Model<PerformerCommissionModel>,
    private readonly queueEventService: QueueEventService,
    private readonly performerCommsionService: PerformerCommissionService,
    private readonly settingService: SettingService,
    private readonly studioService: StudioService,
    private readonly performerService: PerformerService,
    private readonly socketUserService: SocketUserService,
    private readonly conversationService: ConversationService
  ) {
    this.queueEventService.subscribe(
      PERFORMER_CHANNEL,
      PERFORMER_STUDIO_UPDATED,
      this.studioUpdatedHandler.bind(this)
    );
    this.queueEventService.subscribe(
      PERFORMER_STEAMING_STATUS_CHANNEL,
      PERFORMER_STEAMING_STATUS_UPDATED,
      this.performerStreamStatusHandler.bind(this)
    );
  }

  private async studioUpdatedHandler(event: QueueEvent): Promise<void> {
    if (event.eventName !== EVENT.UPDATED) return;

    const { performer, oldStudioId } = event.data as any;
    if (performer.studioId && `${performer.studioId}` !== `${oldStudioId}`) {
      const studio = await this.studioService.findById(performer.studioId);
      if (!studio) {
        return;
      }

      const [
        defaultPerformerCommssion,
        defaultStudioCommission
      ] = await Promise.all([
        this.settingService.getKeyValue(SETTING_KEYS.PERFORMER_COMMISSION) || 0,
        this.settingService.getKeyValue(SETTING_KEYS.STUDIO_COMMISSION) || 0
      ]);

      let performerCommission = await this.performerCommsionService.findOne({
        performerId: performer._id
      });

      if (performerCommission) {
        performerCommission.studioCommission =
          studio.commission || defaultStudioCommission;
        performerCommission.memberCommission = parseInt(
          process.env.COMMISSION_RATE,
          10
        );
        await performerCommission.save();
        return;
      }

      performerCommission = new this.PerformerCommission();
      const infoData = {
        performerId: performer._id,
        tipCommission: defaultPerformerCommssion,
        albumCommission: defaultPerformerCommssion,
        groupCallCommission: defaultPerformerCommssion,
        privateCallCommission: defaultPerformerCommssion,
        productCommission: defaultPerformerCommssion,
        videoCommission: defaultPerformerCommssion,
        studioCommission: studio.commission || defaultStudioCommission,
        memberCommission: parseInt(process.env.COMMISSION_RATE, 10)
      };
      merge(performerCommission, infoData);
      await performerCommission.save();
    }

    if (!performer.studioId && oldStudioId) {
      let commssion = await this.performerCommsionService.findOne({
        performerId: performer._id
      });

      if (!commssion) {
        const defaultPerformerCommssion =
          (await this.settingService.getKeyValue(
            SETTING_KEYS.PERFORMER_COMMISSION
          )) || 0;
        commssion = new this.PerformerCommission();
        commssion.set('performerId', performer._id);
        INITIALIZE_COMMISSION.forEach(type => {
          commssion[type] = defaultPerformerCommssion;
        });
      }

      commssion.studioCommission = 1;
      await commssion.save();
      await this.queueEventService.publish({
        channel: 'STUDIO_MEMBER_CHANNEL',
        eventName: EVENT.UPDATED,
        data: { studioId: oldStudioId, total: -1 }
      });
    }
  }

  async performerStreamStatusHandler(event: QueueEvent) {
    try {
      if (
        ![PRIVATE_CHAT, GROUP_CHAT, PUBLIC_CHAT, OFFLINE].includes(
          event.eventName
        )
      ) {
        return;
      }

      const { id } = event.data;
      const performer = await this.performerService.findById(id);
      if (!performer) {
        return;
      }

      await this.socketUserService.emitToConnectedUsers(
        'modelUpdateStreamingStatus',
        {
          id,
          performer: new PerformerDto(performer).toSearchResponse(),
          status: event.eventName
        }
      );
      const conversation = await this.conversationService.findPerformerPublicConversation(
        id
      );
      if (!conversation) {
        return;
      }

      const conversationDto = new ConversationDto(conversation);
      const roomName = conversationDto.serializeConversation();
      if (event.eventName === PRIVATE_CHAT) {
        await this.socketUserService.emitToRoom(
          roomName,
          `message_created_conversation_${conversation._id}`,
          {
            _id: generateUuid(),
            text: 'The model is in private chat/C2C with another user',
            conversationId: conversation._id,
            isSystem: true
          }
        );
      } else if (event.eventName === GROUP_CHAT) {
        await this.socketUserService.emitToRoom(
          roomName,
          `message_created_conversation_${conversation._id}`,
          {
            _id: generateUuid(),
            text:
              'The model is in a Group show and will be back after the show ends.',
            conversationId: conversation._id,
            isSystem: true
          }
        );
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
  }
}
