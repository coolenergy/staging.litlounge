/* eslint-disable dot-notation */
import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { EntityNotFoundException, PageableData } from 'src/kernel';
import { StudioService } from 'src/modules/studio/services';
import { PerformerService } from 'src/modules/performer/services';
import { pick } from 'lodash';
import { PerformerDto } from 'src/modules/performer/dtos';
import { PaymentInformationModel } from '../models';
import { BANKING_INFORMATION_MODEL_PROVIDE } from '../providers';
import {
  PaymentInformationPayload,
  AdminCreatePaymentInformationPayload,
  AdminSearchPaymentInformationPayload
} from '../payloads';
import { BANKING_SOURCE } from '../constants';

@Injectable()
export class PaymentInformationService {
  constructor(
    @Inject(BANKING_INFORMATION_MODEL_PROVIDE)
    private readonly paymentInformationModel: Model<PaymentInformationModel>,
    private readonly studioService: StudioService,
    private readonly performerService: PerformerService
  ) {}

  async findById(id: string | ObjectId) {
    return this.paymentInformationModel.findOne({ _id: id });
  }

  async create(payload: PaymentInformationPayload, user) {
    const { type } = payload;
    let payment = await this.paymentInformationModel.findOne({
      sourceId: user._id,
      type
    });
    if (!payment) {
      payment = await this.paymentInformationModel.create({
        sourceId: user._id,
        sourceType: user?.roles?.includes('studio')
          ? BANKING_SOURCE.STUDIO
          : BANKING_SOURCE.PERFORMER,
        type
      });
    }

    Object.keys(payload).forEach((field) => {
      payment.set(field, payload[field]);
    });
    await payment.save();
    return payment.toObject();
  }

  async detail(
    payload: PaymentInformationPayload,
    sourceId: string | ObjectId
  ): Promise<PaymentInformationModel> {
    const { type } = payload;
    return this.paymentInformationModel.findOne({ sourceId, type });
  }

  async adminDetail(id: string | ObjectId) {
    const paymentInfo = await this.paymentInformationModel.findById(id);
    if (!paymentInfo) {
      throw new EntityNotFoundException();
    }

    const { sourceType, sourceId } = paymentInfo;
    const sourceInfo =
      sourceType === BANKING_SOURCE.STUDIO
        ? await this.studioService.findById(sourceId)
        : await this.performerService.findById(sourceId);

    return {
      ...paymentInfo.toObject(),
      sourceInfo
    };
  }

  async adminCreate(payload: AdminCreatePaymentInformationPayload) {
    const { type, sourceId, sourceType } = payload;
    let payment = await this.paymentInformationModel.findOne({
      sourceId,
      type
    });
    if (!payment) {
      payment = await this.paymentInformationModel.create({
        sourceId,
        sourceType,
        type
      });
    }

    Object.keys(payload).forEach((field) => {
      payment.set(field, payload[field]);
    });
    await payment.save();
    return payment.toObject();
  }

  async adminSearch(
    req: AdminSearchPaymentInformationPayload
  ): Promise<PageableData<any>> {
    const query = {};
    Object.keys(req).forEach((field) => {
      if (['type', 'sourceId', 'sourceType'].includes(field)) {
        query[field] = req[field];
      }
    });
    let sort = {};
    if (req.sort) {
      sort = {
        [req.sortBy || 'updatedAt']: req.sort || -1
      };
    }
    const [data, total] = await Promise.all([
      this.paymentInformationModel
        .find(query)
        .skip(parseInt(req.offset as string, 10))
        .limit(parseInt(req.limit as string, 10))
        .sort(sort)
        .lean()
        .exec(),
      this.paymentInformationModel.countDocuments(query)
    ]);
    const source = {};
    data.forEach((d) => {
      source[`${d.sourceId}`] = pick(d, ['sourceId', 'sourceType']);
    });
    const sourceInfos = (await Promise.all(
      Object.keys(source).map((sourceId) => {
        if (source[sourceId].sourceType === BANKING_SOURCE.STUDIO) {
          return this.studioService.findById(sourceId);
        }
        if (source[sourceId].sourceType === BANKING_SOURCE.PERFORMER) {
          return this.performerService.findById(sourceId);
        }

        return null;
      }) as any
    )) as PerformerDto[];

    data.forEach((d) => {
      const sourceInfo = sourceInfos.find(
        (s) => `${s._id}` === `${d.sourceId}`
      );
      if (sourceInfo) {
        // eslint-disable-next-line no-param-reassign
        d['sourceInfo'] = sourceInfo;
      }
    });

    return {
      data,
      total
    };
  }
}
