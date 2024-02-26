import { ObjectId } from 'mongodb';
import { pick } from 'lodash';

export interface ICommissionSetting {
  _id?: ObjectId;
  performerId: ObjectId;
  tipCommission: number;
  privateCallCommission: number;
  groupCallCommission: number;
  productCommission: number;
  albumCommission: number;
  videoCommission: number;
  studioCommission: number;
  memberCommission: number;
}

export class PerformerCommissionDto {
  _id: ObjectId;

  performerId: ObjectId;

  tipCommission: number;

  privateCallCommission: number;

  groupCallCommission: number;

  productCommission: number;

  albumCommission: number;

  videoCommission: number;

  studioCommission: number;

  memberCommission: number;

  createdBy: ObjectId;

  updatedBy: ObjectId;

  createdAt: Date;

  updatedAt: Date;

  constructor(data?: Partial<PerformerCommissionDto>) {
    Object.assign(
      this,
      pick(data, [
        '_id',
        'performerId',
        'tipCommission',
        'privateCallCommission',
        'groupCallCommission',
        'productCommission',
        'albumCommission',
        'videoCommission',
        'studioCommission',
        'memberCommission',
        'createdBy',
        'updatedBy',
        'createdAt',
        'updatedAt'
      ])
    );
  }
}
