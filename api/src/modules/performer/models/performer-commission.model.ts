import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export class PerformerCommissionModel extends Document {
  // tip, private-call, group-call, product, album, video
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
}
