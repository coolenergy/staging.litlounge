import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import {
  EntityNotFoundException,
  PageableData,
  QueueEventService
} from 'src/kernel';
import { PurchasedItemDto } from 'src/modules/purchased-item/dtos';
import { toObjectId } from 'src/kernel/helpers/string.helper';
import { StudioService } from 'src/modules/studio/services';
import { ObjectId } from 'mongodb';
import { pick } from 'lodash';
import * as moment from 'moment';
import { EVENT, ROLE } from 'src/kernel/constants';
import { STATUES } from 'src/modules/payout-request/constants';
import { EarningModel } from '../models/earning.model';
import { EARNING_MODEL_PROVIDER } from '../providers/earning.provider';
import {
  EarningSearchRequestPayload,
  UpdateEarningStatusPayload
} from '../payloads';
import { UserDto } from '../../user/dtos';
import { UserService } from '../../user/services';
import { PerformerService } from '../../performer/services';
import {
  EarningDto,
  IEarning,
  IEarningStatResponse
} from '../dtos/earning.dto';
import { PerformerDto } from '../../performer/dtos';
import { PurchaseItemService } from '../../purchased-item/services';
import { EARNING_CHANNEL } from '../constants';

@Injectable()
export class EarningService {
  constructor(
    @Inject(EARNING_MODEL_PROVIDER)
    private readonly earningModel: Model<EarningModel>,
    private readonly userService: UserService,
    private readonly performerService: PerformerService,
    private readonly studioService: StudioService,
    private readonly paymentService: PurchaseItemService,
    private readonly queueEventService: QueueEventService
  ) {}

  public async search(
    req: EarningSearchRequestPayload,
    user?: UserDto
  ): Promise<PageableData<IEarning>> {
    const query = {} as any;
    if (req.performerId) {
      query.performerId = toObjectId(req.performerId);
    }
    if (req.targetId) {
      query.targetId = toObjectId(req.targetId);
    }
    if (req.sourceId) {
      query.sourceId = toObjectId(req.sourceId);
    }
    if (req.source) {
      query.source = req.source;
    }
    if (req.target) {
      query.target = req.target;
    }
    if (req.type) {
      query.type = req.type;
    }

    if(req.payoutStatus){
      query.payoutStatus = req.payoutStatus;
    }

    if (!req.performerId && req.performerType === 'individual') {
      const performers = await this.performerService.findAllindividualPerformers();
      const ids = performers.map(p => p._id);
      query.performerId = {
        $in: ids
      };
    }

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
        $gt: moment(req.fromDate)
          .startOf('day')
          .toDate(),
        $lte: moment(req.toDate)
          .endOf('day')
          .toDate()
      };
    }

    const [data, total] = await Promise.all([
      this.earningModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(parseInt(req.limit as string, 10))
        .skip(parseInt(req.offset as string, 10)),
      this.earningModel.countDocuments(query)
    ]);

    const includePrivateInfo =
      user && user.roles && user.roles.includes('admin');
    const sources = data.map(d => ({
      id: d.sourceId,
      role: d.source
    }));
    const targets = data.map(d => ({
      id: d.targetId,
      role: d.target
    }));
    const users = [...sources, ...targets];
    const userInfos = await Promise.all(
      users.map(u => this.getInfo(u.id, u.role))
    );

    const earnings = data.map((earning: EarningDto) => {
      const { sourceId, targetId, conversionRate, netPrice } = earning;
      const sourceInfo = userInfos.find(
        s => s._id.toString() === sourceId.toString()
      );
      const targetInfo = userInfos.find(
        t => t._id.toString() === targetId.toString()
      );
      const price = conversionRate && conversionRate * netPrice;
      return { ...earning, sourceInfo, targetInfo, price };
    });

    return {
      total,
      data: earnings.map(e => new EarningDto(e).toResponse(includePrivateInfo))
    };
  }

  async getInfo(id: string | ObjectId, role: string) {
    if (role === ROLE.PERFORMER) {
      return this.performerService.findById(id);
    }

    if (role === ROLE.STUDIO) {
      return this.studioService.findById(id);
    }

    if (role === ROLE.USER) {
      return this.userService.findById(id);
    }

    return null;
  }

  public async details(id: string) {
    const earning = await this.earningModel.findById(toObjectId(id));
    const transaction = await this.paymentService.findById(
      earning.transactionTokenId
    );
    if (!earning || !transaction) {
      throw new EntityNotFoundException();
    }
    const [user, performer] = await Promise.all([
      this.userService.findById(earning.userId),
      this.performerService.findById(earning.performerId)
    ]);
    const data = new EarningDto(earning);
    data.userInfo = user ? new UserDto(user).toResponse(true) : null;
    data.performerInfo = performer
      ? new PerformerDto(performer).toResponse(true)
      : null;
    data.transactionInfo = new PurchasedItemDto(transaction);
    return data;
  }

  public async adminStats(
    req: EarningSearchRequestPayload
  ): Promise<IEarningStatResponse> {
    const query = {} as any;
    if (req.performerId) {
      query.performerId = toObjectId(req.performerId);
    }
    if (req.sourceId) {
      query.sourceType = toObjectId(req.sourceId);
    }
    if (req.targetId) {
      query.targetId = toObjectId(req.targetId);
    }
    if (req.source) {
      query.source = req.source;
    }
    if (req.target) {
      query.target = req.target;
    }
    if (req.type) {
      query.type = req.type;
    }
    if (req.fromDate && req.toDate) {
      query.createdAt = {
        $gt: moment(req.fromDate)
          .startOf('day')
          .toDate(),
        $lte: moment(req.toDate)
          .endOf('day')
          .toDate()
      };
    }

    if (!req.performerId && req.performerType === 'individual') {
      const performers = await this.performerService.findAllindividualPerformers();
      const ids = performers.map(p => p._id);
      query.performerId = {
        $in: ids
      };
    }

    const [
      totalPrice,
      paidPrice,
      remainingPrice,
      sharedPrice
    ] = await Promise.all([
      this.earningModel.aggregate([
        {
          $match: query
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: '$grossPrice'
            }
          }
        }
      ]),
      this.earningModel.aggregate([
        {
          $match: { ...query, isPaid: true }
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: '$netPrice'
            }
          }
        }
      ]),
      this.earningModel.aggregate([
        {
          $match: { ...query, isPaid: false }
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: '$netPrice'
            }
          }
        }
      ]),
      this.earningModel.aggregate([
        {
          $match: { ...query }
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: '$netPrice'
            }
          }
        }
      ])
    ]);
    
    return {
      totalPrice: (totalPrice.length && totalPrice[0].total) || 0,
      paidPrice: (paidPrice.length && paidPrice[0].total) || 0,
      remainingPrice: (remainingPrice.length && remainingPrice[0].total) || 0,
      sharedPrice: (sharedPrice.length && sharedPrice[0].total) || 0
    };
  }

  public async stats(
    req: EarningSearchRequestPayload,
    options?: any
  ): Promise<IEarningStatResponse> {
    const query = {} as any;
    if (req.performerId) {
      query.performerId = toObjectId(req.performerId);
    }
    if (req.sourceId) {
      query.sourceType = toObjectId(req.sourceId);
    }
    if (req.targetId) {
      query.targetId = toObjectId(req.targetId);
    }
    if (req.source) {
      query.source = req.source;
    }
    if (req.target) {
      query.target = req.target;
    }
    if (req.type) {
      query.type = req.type;
    }
    if (req.fromDate && req.toDate) {
      query.createdAt = {
        $gt: moment(req.fromDate)
          .startOf('day')
          .toDate(),
        $lte: moment(req.toDate)
          .endOf('day')
          .toDate()
      };
    }

    const [totalPrice, paidPrice, remainingPrice] = await Promise.all([
      this.earningModel.aggregate([
        {
          $match: query
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: '$grossPrice'
            }
          }
        }
      ]),
      this.earningModel.aggregate([
        {
          $match: { ...query, isPaid: true }
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: '$netPrice'
            }
          }
        }
      ]),
      this.earningModel.aggregate([
        {
          $match: { ...query, isPaid: false }
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: '$netPrice'
            }
          }
        }
      ])
    ]);

    let studioToModel;
    let studioToModel2;
    if (options?.includingStudioEarning) {
      studioToModel = await this.earningModel.aggregate([
        {
          $match: {
            ...query,
            isPaid: false
          }
        },
        {
          $group: {
            _id: null,
            totalGross: {
              $sum: '$studioToModel.grossPrice'
            },
            totalNet: {
              $sum: '$studioToModel.netPrice'
            }
          }
        }
      ]);

      studioToModel2 = await this.earningModel.aggregate([
        {
          $match: query
        },
        {
          $group: {
            _id: null,
            totalGross: {
              $sum: '$studioToModel.grossPrice'
            },
            totalNet: {
              $sum: '$studioToModel.netPrice'
            }
          }
        }
      ]);
    }

    const result = {
      totalPrice: (totalPrice.length && totalPrice[0].total) || 0,
      paidPrice: (paidPrice.length && paidPrice[0].total) || 0,
      remainingPrice: (remainingPrice.length && remainingPrice[0].total) || 0
    } as any;
    if (options?.includingStudioEarning) {
      result.studioToModelTotalUnpaidGrossPrice = studioToModel?.length ? studioToModel[0].totalGross : 0;
      result.studioToModelTotalUnpaidNetPrice = studioToModel?.length ? studioToModel[0].totalNet : 0;
      result.studioToModelTotalGrossPrice = studioToModel2?.length ? studioToModel2[0].totalGross : 0;
      result.studioToModelTotalNetPrice = studioToModel2?.length ? studioToModel2[0].totalNet : 0;
    }
    return result;
  }

  public async calculatePayoutRequestStats(q) {
    const query = {} as any;
    if (q.performerId) {
      query.performerId = toObjectId(q.performerId);
    }
    if (q.targetId) {
      query.targetId = toObjectId(q.targetId);
    }
    if (q.fromDate && q.toDate) {
      query.createdAt = {
        $gt: moment(q.fromDate)
          // .startOf('day')
          .toDate(),
        $lte: moment(q.toDate)
          // .endOf('day')
          .toDate()
      };
    }

    const [totalPrice, paidPrice, remainingPrice] = await Promise.all([
      this.earningModel.aggregate([
        {
          $match: { ...query, isPaid: false }
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: '$netPrice'
            }
          }
        }
      ]),
      this.earningModel.aggregate([
        {
          $match: { ...query, isPaid: true }
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: '$netPrice'
            }
          }
        }
      ]),
      this.earningModel.aggregate([
        {
          $match: { ...pick(query, 'targetId'), isPaid: false }
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: '$netPrice'
            }
          }
        }
      ])
    ]);
    return {
      totalPrice: (totalPrice.length && totalPrice[0].total) || 0,
      paidPrice: (paidPrice.length && paidPrice[0].total) || 0,
      remainingPrice: (remainingPrice.length && remainingPrice[0].total) || 0
    };
  }

  public async updatePaidStatus(
    payload: UpdateEarningStatusPayload
  ): Promise<any> {
    const query = {
      targetId: payload.targetId,
      createdAt: {
        $gt: new Date(payload.fromDate),
        $lte: new Date(payload.toDate)
      }
    } as any;

    await this.earningModel.updateMany(query, {
      $set: {
        isPaid: true,
        paidAt: new Date(),
        updatedAt: new Date(),
        payoutStatus: STATUES.DONE
      }
    });

    await this.queueEventService.publish({
      eventName: EVENT.UPDATED,
      channel: EARNING_CHANNEL,
      data: {
        targetId: payload.targetId
      }
    });

    return true;
  }

  public async updateRejectStatus(
    payload: UpdateEarningStatusPayload
  ): Promise<any> {
    const query = {
      targetId: payload.targetId,
      createdAt: {
        $gt: new Date(payload.fromDate),
        $lte: new Date(payload.toDate)
      }
    } as any;

    await this.earningModel.updateMany(query, {
      $set: {
        updatedAt: new Date(),
        payoutStatus: STATUES.REJECTED
      }
    });

    await this.queueEventService.publish({
      eventName: EVENT.UPDATED,
      channel: EARNING_CHANNEL,
      data: {
        targetId: payload.targetId
      }
    });

    return true;
  }

  public async updateRefItemsStudioToModel(
    request, status
  ) {
    const earnings = await this.earningModel.find({
      targetId: request.sourceId,
      createdAt: {
        $gt: new Date(request.fromDate),
        $lte: new Date(request.toDate)
      }
    }).select('_id');
    await earnings.reduce(async (lp, earning) => {
      await lp;
      await this.earningModel.updateOne({
        'studioToModel.refItemId': earning._id
      }, {
        $set: {
          'studioToModel.payoutStatus': status
        }
      });
      return Promise.resolve();
    }, Promise.resolve());
  }

  async getTotalPendingToken(performerId: string | ObjectId) {
    const performer = await this.performerService.findById(performerId);
    if (!performer) throw new EntityNotFoundException();

    const data = await this.earningModel.aggregate([
      {
        $match: {
          targetId: performer._id,
          target: ROLE.PERFORMER,
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

    return {
      total: (data.length && data[0].total) || 0
    };
  }
}
