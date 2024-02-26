import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';

export class StudioModel extends Document {
  name: string;

  username: string;

  email: string;

  status: string;

  phone: string;

  country: string;

  city: string;

  state: string;

  zipcode: string;

  address: string;

  languages: string[];

  roles: string[];

  timezone: string;

  createdAt: Date;

  updatedAt: Date;

  balance: number;

  emailVerified: boolean;

  stats: {
    totalPerformer: number;
    totalHoursOnline: number;
    totalTokenEarned: number;
    totalTokenSpent: number;
  };

  documentVerificationId: ObjectId;

  commission: number;

  tipCommission: number;

  privateCallCommission: number;

  groupCallCommission: number;

  productCommission: number;

  albumCommission: number;

  videoCommission: number;
}
