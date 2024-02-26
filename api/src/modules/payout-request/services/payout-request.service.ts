import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { UserDto } from 'src/modules/user/dtos';
import { PerformerDto } from 'src/modules/performer/dtos';
// import { UserService } from 'src/modules/user/services';
import { PerformerService } from 'src/modules/performer/services';
import { MailerService } from 'src/modules/mailer';
import { SettingService } from 'src/modules/settings';
import { SETTING_KEYS } from 'src/modules/settings/constants';
import { EarningService } from 'src/modules/earning/services/earning.service';
import {
  EntityNotFoundException,
  QueueEventService,
  QueueEvent
} from 'src/kernel';
import { merge } from 'lodash';
import { StudioService } from 'src/modules/studio/services';
import { StudioDto } from 'src/modules/studio/dtos';
import { toObjectId } from 'src/kernel/helpers/string.helper';
import * as moment from 'moment';
import { PaymentInformationService } from 'src/modules/payment-information/services';
import {
  PAYOUT_REQUEST_CHANEL,
  PAYOUT_REQUEST_EVENT,
  SOURCE_TYPE
} from '../constants';
import {
  DuplicateRequestException,
  MinPayoutRequestRequiredException
} from '../exceptions';
import { PayoutRequestDto } from '../dtos/payout-request.dto';
import {
  PayoutRequestCreatePayload,
  PayoutRequestSearchPayload,
  PayoutRequestUpdatePayload
} from '../payloads/payout-request.payload';
import { PayoutRequestModel } from '../models/payout-request.model';
import { PAYOUT_REQUEST_MODEL_PROVIDER } from '../providers/payout-request.provider';

@Injectable()
export class PayoutRequestService {
  constructor(
    @Inject(PAYOUT_REQUEST_MODEL_PROVIDER)
    private readonly payoutRequestModel: Model<PayoutRequestModel>,
    private readonly studioService: StudioService,
    private readonly queueEventService: QueueEventService,
    private readonly performerService: PerformerService,
    private readonly mailService: MailerService,
    private readonly settingService: SettingService,
    private readonly earningService: EarningService,
    private readonly paymentInformationService: PaymentInformationService
  ) {}

  public async search(
    req: PayoutRequestSearchPayload,
    user?: UserDto
  ): Promise<any> {
    const query = {} as any;
    if (req.sourceId) {
      query.sourceId = toObjectId(req.sourceId);
    }

    if (req.performerId) {
      query.performerId = toObjectId(req.performerId);
    }

    if (req.sourceType) {
      query.sourceType = req.sourceType;
    }

    if (req.status) {
      query.status = req.status;
    }

    let sort: { createdAt?: number } = {
      createdAt: -1
    };

    sort = {
      [req.sortBy || 'createdAt']: req.sort || 'desc'
    };

    if (req.fromDate && req.toDate) {
      query.createdAt = {
        $gt: moment(req.fromDate).startOf('day').toDate(),
        $lte: moment(req.toDate).endOf('day').toDate()
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
    const requests = data.map((d) => new PayoutRequestDto(d));
    if (user?.roles?.includes('admin')) {
      const sources = await Promise.all(
        requests.map((request) => this.getRequestSource(request))
      );
      requests.forEach((request: PayoutRequestDto) => {
        const sourceInfo = sources.find(
          (source) =>
            source && source._id.toString() === request.sourceId.toString()
        );
        switch (request.sourceType) {
          case 'performer':
            request.performerInfo = sourceInfo
              ? new PerformerDto(sourceInfo).toResponse(true)
              : null;
            break;
          case 'studio':
            request.studioInfo = sourceInfo
              ? new StudioDto(sourceInfo).toResponse(true)
              : null;
            break;
          default:
            break;
        }
      });
    }
    return {
      total,
      data: requests
    };
  }

  getRequestSource(
    request: PayoutRequestDto | PayoutRequestModel
  ): Promise<PerformerDto | StudioDto> {
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

  public async findById(id: string | object): Promise<any> {
    const request = await this.payoutRequestModel.findById(id);
    return request;
  }

  public async create(
    payload: PayoutRequestCreatePayload,
    user?: PerformerDto
  ): Promise<PayoutRequestDto> {
    const data = {
      ...payload,
      performerId: user._id,
      studioRequestId: user.studioId,
      sourceId: user._id
    };
    const query = {
      sourceId: user._id,
      performerId: user._id,
      sourceType: SOURCE_TYPE.PERFORMER,
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
      previousPaidOut: statEarning.paidPrice,
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
    performer: PerformerDto
  ): Promise<PayoutRequestDto> {
    const payout = await this.payoutRequestModel.findOne({ _id: id });
    if (!payout) {
      throw new EntityNotFoundException();
    }

    if (performer._id.toString() !== payout.sourceId.toString()) {
      throw new ForbiddenException();
    }

    merge(payout, payload);
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
    const adminEmail =
      (await this.settingService.getKeyValue(SETTING_KEYS.ADMIN_EMAIL)) ||
      process.env.ADMIN_EMAIL;
    adminEmail &&
      (await this.mailService.send({
        subject: 'Update payout request',
        to: adminEmail,
        data: {
          request: payout
        },
        template: 'payout-request'
      }));
    return new PayoutRequestDto(payout);
  }

  public async details(id: string, user: PerformerDto) {
    const payout = await this.payoutRequestModel.findById(id);
    if (!payout) {
      throw new EntityNotFoundException();
    }

    if (user._id.toString() !== payout.sourceId.toString()) {
      throw new ForbiddenException();
    }

    const data = new PayoutRequestDto(payout);
    if (data.sourceId) {
      const performerDto = await this.performerService.findById(
        payout.sourceId
      );
      data.performerInfo = performerDto
        ? performerDto.toSearchResponse()
        : null;
    }
    return data;
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
          sourceInfo._id
        )
      : null;
    const data = new PayoutRequestDto({
      ...request.toObject(),
      sourceInfo,
      paymentAccountInfo: paymentAccountInfo
        ? paymentAccountInfo.toObject()
        : null
    });
    return data;
  }

  public async updateStatus(
    id: string | ObjectId,
    payload: PayoutRequestUpdatePayload,
    user?: UserDto
  ): Promise<any> {
    const request = await this.payoutRequestModel.findById(id);
    if (!request) {
      throw new EntityNotFoundException();
    }

    if (
      user &&
      user.roles.includes('studio') &&
      user._id.toString() !== request.studioRequestId.toString()
    ) {
      throw new ForbiddenException();
    }

    const oldStatus = request.status;
    merge(request, payload);
    request.updatedAt = new Date();
    await request.save();

    const event: QueueEvent = {
      channel: PAYOUT_REQUEST_CHANEL,
      eventName: PAYOUT_REQUEST_EVENT.UPDATED,
      data: {
        request,
        oldStatus
      }
    };
    await this.queueEventService.publish(event);
    return request;
  }
}
