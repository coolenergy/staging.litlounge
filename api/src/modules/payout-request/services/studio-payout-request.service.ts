import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { Model, FilterQuery } from 'mongoose';
import { MailerService } from 'src/modules/mailer';
import { SettingService } from 'src/modules/settings';
import { SETTING_KEYS } from 'src/modules/settings/constants';
import { EarningService } from 'src/modules/earning/services/earning.service';
import { EntityNotFoundException, QueueEvent, QueueEventService } from 'src/kernel';
import { merge } from 'lodash';
import { StudioDto } from 'src/modules/studio/dtos';
import { StudioService } from 'src/modules/studio/services';
import { PerformerDto } from 'src/modules/performer/dtos';
import { PerformerService } from 'src/modules/performer/services';
import * as moment from 'moment';
import { PaymentInformationService } from 'src/modules/payment-information/services';
import { PAYOUT_REQUEST_CHANEL, PAYOUT_REQUEST_EVENT, SOURCE_TYPE } from '../constants';
import {
  DuplicateRequestException,
  MinPayoutRequestRequiredException
} from '../exceptions';
import { PayoutRequestDto } from '../dtos/payout-request.dto';
import {
  PayoutRequestCreatePayload,
  PayoutRequestSearchPayload
} from '../payloads/payout-request.payload';
import { PayoutRequestModel } from '../models/payout-request.model';
import { PAYOUT_REQUEST_MODEL_PROVIDER } from '../providers/payout-request.provider';

@Injectable()
export class StudioPayoutRequestService {
  constructor(
    @Inject(PAYOUT_REQUEST_MODEL_PROVIDER)
    private readonly payoutRequestModel: Model<PayoutRequestModel>,
    private readonly studioService: StudioService,
    private readonly mailService: MailerService,
    private readonly settingService: SettingService,
    private readonly earningService: EarningService,
    private readonly performerService: PerformerService,
    private readonly paymentInformationService: PaymentInformationService,
    private readonly queueEventService: QueueEventService
  ) {}

  public async findById(id): Promise<any> {
    const request = await this.payoutRequestModel.findById(id);
    if (!request) {
      throw new EntityNotFoundException();
    }
    const data = new PayoutRequestDto(request);
    if (data.sourceId) {
      const studio = await this.studioService.findById(request.sourceId);
      data.studioInfo = studio ? new StudioDto(studio).toResponse() : null;
    }
    return data;
  }

  public async create(
    payload: PayoutRequestCreatePayload,
    user: StudioDto
  ): Promise<PayoutRequestDto> {
    const data = {
      ...payload,
      sourceId: user._id
    };
    const query: FilterQuery<PayoutRequestModel> = {
      sourceType: SOURCE_TYPE.STUDIO,
      sourceId: user._id,
      fromDate: data.fromDate,
      toDate: data.toDate
    };
    let payoutRequest = await this.payoutRequestModel.findOne(query);
    if (payoutRequest) {
      throw new DuplicateRequestException();
    }

    const [statEarning, minPayoutRequest] = await Promise.all([
      this.earningService.calculatePayoutRequestStats({
        targetId: query.sourceId,
        fromDate: data.fromDate,
        toDate: data.toDate
      }),
      this.settingService.getKeyValue(SETTING_KEYS.MINIMUM_PAYOUT_REQUEST) || 0
    ]);
    if (statEarning.totalPrice < minPayoutRequest) {
      throw new MinPayoutRequestRequiredException();
    }

    payoutRequest = await this.payoutRequestModel.create({
      ...data,
      tokenMustPay: statEarning.totalPrice,
      previousPaidOut:  statEarning.paidPrice,
      pendingToken: statEarning.remainingPrice
    });
    const adminEmail =
      (await this.settingService.getKeyValue(SETTING_KEYS.ADMIN_EMAIL)) ||
      process.env.ADMIN_EMAIL;
    adminEmail &&
      (await this.mailService.send({
        subject: 'New payout request',
        to: adminEmail,
        data: {
          request: payoutRequest
        },
        template: 'payout-request'
      }));
    return new PayoutRequestDto(payoutRequest);
  }

  public async update(
    id: string,
    payload: PayoutRequestCreatePayload,
    studio: StudioDto
  ): Promise<PayoutRequestDto> {
    const payout = await this.payoutRequestModel.findOne({ _id: id });
    if (!payout) {
      throw new EntityNotFoundException();
    }

    if (studio._id.toString() !== payout.sourceId.toString()) {
      throw new ForbiddenException();
    }

    const oldStatus = payout.status;
    merge(payout, payload);
    // TODO update for performer request
    const statEarning = await this.earningService.calculatePayoutRequestStats({
      targetId: payout.sourceId,
      fromDate: payload.fromDate,
      toDate: payload.toDate
    });

    payout.tokenMustPay = statEarning.totalPrice;
    payout.previousPaidOut = statEarning.paidPrice;
    payout.pendingToken = statEarning.remainingPrice;
    payout.updatedAt = new Date();
    await payout.save();
    const adminEmail = await this.settingService.getKeyValue(SETTING_KEYS.ADMIN_EMAIL);
    adminEmail &&
      (await this.mailService.send({
        subject: 'Update payout request',
        to: adminEmail,
        data: {
          request: payout
        },
        template: 'payout-request'
      }));

    const event: QueueEvent = {
      channel: PAYOUT_REQUEST_CHANEL,
      eventName: PAYOUT_REQUEST_EVENT.UPDATED,
      data: {
        request: payout,
        oldStatus
      }
    };
    await this.queueEventService.publish(event);
    return new PayoutRequestDto(payout);
  }

  public async details(id: string, user: StudioDto) {
    const payout = await this.payoutRequestModel.findById(id);
    if (!payout) {
      throw new EntityNotFoundException();
    }

    if (user._id.toString() !== payout.sourceId.toString()) {
      throw new ForbiddenException();
    }

    const data = new PayoutRequestDto(payout);
    if (data.sourceId) {
      const studio = await this.studioService.findById(payout.sourceId);
      data.studioInfo = studio ? new StudioDto(studio).toResponse() : null;
    }
    return data;
  }

  getRequestSource(
    request: PayoutRequestDto | PayoutRequestModel
  ): Promise<any> {
    const { sourceType, sourceId } = request;
    switch (sourceType) {
      case 'performer':
        return this.performerService.findById(sourceId);
      case 'studio':
        return this.studioService.findById(sourceId);
      default:
        return null;
    }
  }

  public async adminDetails(id: string): Promise<PayoutRequestDto> {
    const request = await this.payoutRequestModel.findById(id);
    if (!request) {
      throw new EntityNotFoundException();
    }

    const { paymentAccountType } = request;
    const sourceInfo = await this.getRequestSource(request);
    const paymentAccountInfo = sourceInfo
      ? await this.paymentInformationService.detail(
          { type: paymentAccountType },
          sourceInfo
        )
      : null;
    const data = new PayoutRequestDto({
      ...request.toObject(),
      sourceInfo,
      paymentAccountInfo
    });
    return data;
  }

  async performerRequest(req: PayoutRequestSearchPayload, studio: StudioDto) {
    const query = {} as any;
    if (req.status) {
      query.status = req.status;
    }

    query.studioRequestId = studio._id;
    let sort: { createdAt?: number } = {
      createdAt: -1
    };
    if (req.sort && req.sortBy) {
      sort = {
        [req.sortBy]: req.sort
      };
    }

    if (req.fromDate && req.toDate) {
      query.createdAt = {
        $gt: moment(req.fromDate).startOf('day'),
        $lte: moment(req.toDate).endOf('day')
      };
    }

    const [data, total] = await Promise.all([
      this.payoutRequestModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(parseInt(req.limit as string, 10))
        .skip(parseInt(req.offset as string, 10)),
      this.payoutRequestModel.countDocuments(query)
    ]);
    const requests = data.map(d => new PayoutRequestDto(d));
    const performerIds = data.map(d => d.performerId);
    const [performers] = await Promise.all([
      this.performerService.findByIds(performerIds) || []
    ]);

    requests.forEach((request: PayoutRequestDto) => {
      const performer = performers.find(
        p => p._id.toString() === request.performerId.toString()
      );
      request.performerInfo = performer
        ? new PerformerDto(performer).toResponse(true)
        : null;
    });
    return {
      total,
      data: requests
    };
  }
}
