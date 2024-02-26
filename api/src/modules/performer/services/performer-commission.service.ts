import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { UpdateCommissionPayload } from 'src/modules/studio/payloads';
import { EntityNotFoundException } from 'src/kernel';
import { SettingService } from 'src/modules/settings';
// import { SETTING_KEYS } from 'src/modules/settings/constants';
import { PerformerCommissionPayload } from '../payloads';
import { PERFORMER_COMMISSION_MODEL_PROVIDER } from '../providers';
import { PerformerCommissionModel } from '../models';
import { PerformerService } from './performer.service';
import { ICommissionSetting, PerformerCommissionDto } from '../dtos';

@Injectable()
export class PerformerCommissionService {
  constructor(
    @Inject(PERFORMER_COMMISSION_MODEL_PROVIDER)
    // eslint-disable-next-line no-shadow
    private readonly PerformerCommissionModel: Model<PerformerCommissionModel>,
    private readonly performerService: PerformerService,
    private readonly settingService: SettingService
  ) {}

  public async findOne(params) {
    return this.PerformerCommissionModel.findOne(params);
  }

  async findByPerformerIds(ids: ObjectId[]) {
    return this.PerformerCommissionModel.find({ performerId: { $in: ids } });
  }

  public async create(
    performerId: string | ObjectId,
    payload: ICommissionSetting
  ) {
    const data = { performerId, ...payload } as PerformerCommissionDto;
    return this.PerformerCommissionModel.create(data);
  }

  public async update(
    payload: PerformerCommissionPayload,
    performerId: ObjectId
  ): Promise<PerformerCommissionModel> {
    let item = await this.PerformerCommissionModel.findOne({
      performerId
    });
    if (!item) {
      item = new this.PerformerCommissionModel();
    }
    item.performerId = performerId;
    item.tipCommission = payload.tipCommission;
    item.privateCallCommission = payload.privateCallCommission;
    item.groupCallCommission = payload.groupCallCommission;
    item.productCommission = payload.productCommission;
    item.albumCommission = payload.albumCommission;
    item.videoCommission = payload.videoCommission;

    return item.save();
  }

  public async studioUpdate(
    id: string,
    payload: UpdateCommissionPayload,
    studioId: ObjectId
  ) {
    const performer = await this.performerService.findById(id);
    if (!performer) {
      throw new EntityNotFoundException();
    }

    if (performer.studioId.toString() !== studioId.toString()) {
      throw new ForbiddenException();
    }

    let commission = await this.findOne({
      performerId: id
    });

    if (!commission) {
      const data = {} as PerformerCommissionDto;
      data.performerId = performer._id;
      data.tipCommission = payload.tipCommission;
      data.privateCallCommission = payload.privateCallCommission;
      data.groupCallCommission = payload.groupCallCommission;
      data.productCommission = payload.productCommission;
      data.albumCommission = payload.albumCommission;
      data.videoCommission = payload.videoCommission;
      data.memberCommission = payload.commission;
      commission = await this.PerformerCommissionModel.create(data);
    } else {
      commission.tipCommission = payload.tipCommission;
      commission.privateCallCommission = payload.privateCallCommission;
      commission.groupCallCommission = payload.groupCallCommission;
      commission.productCommission = payload.productCommission;
      commission.albumCommission = payload.albumCommission;
      commission.videoCommission = payload.videoCommission;
      await commission.save();
    }
    return new PerformerCommissionDto(commission);
  }
}
