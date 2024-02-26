import { forwardRef, Inject, Injectable } from '@nestjs/common';
import {
  PerformerCommissionDto,
  PerformerDto
} from 'src/modules/performer/dtos';
import { PerformerSearchPayload } from 'src/modules/performer/payloads';
import {
  PerformerCommissionService,
  PerformerSearchService
} from 'src/modules/performer/services';
import { SettingService } from 'src/modules/settings/services';
import { SETTING_KEYS } from 'src/modules/settings/constants';
import { Model } from 'mongoose';
import { merge } from 'lodash';
import { ObjectId } from 'mongodb';
import { EntityNotFoundException } from 'src/kernel';
import { StudioDto } from '../dtos';
import { UpdateCommissionPayload } from '../payloads';
import { STUDIO_MODEL_PROVIDER } from '../providers';
import { StudioModel } from '../models';

@Injectable()
export class StudioCommissionService {
  constructor(
    @Inject(forwardRef(() => PerformerCommissionService))
    private readonly performerCommissionService: PerformerCommissionService,
    @Inject(forwardRef(() => PerformerSearchService))
    private readonly performerSearchService: PerformerSearchService,
    private readonly settingService: SettingService,
    @Inject(STUDIO_MODEL_PROVIDER)
    private readonly studioModel: Model<StudioModel>
  ) {}

  async searchMemberCommissions(query: PerformerSearchPayload, user) {
    const { data, total } = await this.performerSearchService.search(
      query,
      user
    );

    const performerIds = data.map(p => p._id);
    const performerCommissions = performerIds.length
      ? await this.performerCommissionService.findByPerformerIds(performerIds)
      : [];

    const [
      defaultStudioCommission,
      defaultPerformerCommssion
    ] = await Promise.all([
      this.settingService.getKeyValue(SETTING_KEYS.STUDIO_COMMISSION),
      this.settingService.getKeyValue(SETTING_KEYS.PERFORMER_COMMISSION)
    ]);
    const performers = data.map(performer => {
      const commission = performerCommissions.find(
        c => c.performerId.toString() === performer._id.toString()
      );
      if (commission) {
        return {
          ...performer,
          commissionSetting: new PerformerCommissionDto(commission)
        };
      }

      return {
        ...performer,
        commissionSetting: {
          performerId: performer._id,
          tipCommission: defaultPerformerCommssion,
          albumCommission: defaultPerformerCommssion,
          groupCallCommission: defaultPerformerCommssion,
          privateCallCommission: defaultPerformerCommssion,
          productCommission: defaultPerformerCommssion,
          videoCommission: defaultPerformerCommssion,
          studioCommission: defaultStudioCommission,
          memberCommission: parseInt(process.env.COMMISSION_RATE, 10)
        }
      };
    });

    return {
      total,
      data: performers.map(d => new PerformerDto(d).toResponse(true))
    };
  }

  async studioUpdateMemberCommission(
    id: string,
    payload: UpdateCommissionPayload,
    studio: StudioDto
  ) {
    return this.performerCommissionService.studioUpdate(
      id,
      payload,
      studio._id
    );
  }

  async adminUpdateStudioCommission(
    studioId: string | ObjectId,
    payload: UpdateCommissionPayload
  ) {
    const studio = await this.studioModel.findOne({ _id: studioId });
    if (!studio) {
      throw new EntityNotFoundException();
    }

    merge(studio, payload);
    await studio.save();

    return studio;
  }
}
