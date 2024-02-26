import { pick } from 'lodash';
import { ObjectId } from 'mongodb';

export interface IStudio {
  _id: ObjectId;
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
  emailVerified?: boolean;
  stats?: {
    totalPerformer?: number;
    totalHoursOnline?: number;
    totalTokenEarned?: number;
    totalOnlineToday?: number;
    totalTokenSpent?: number;
  };
  documentVerificationId: ObjectId;
  documentVerificationFile: string;
  documentVerification: any;
  commission: number;
  tipCommission: number;
  privateCallCommission: number;
  groupCallCommission: number,
  productCommission: number,
  albumCommission: number,
  videoCommission: number
}

export class StudioDto {
  _id: ObjectId;

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

  stats?: {
    totalPerformer?: number;
    totalHoursOnline?: number;
    totalTokenEarned?: number;
    totalOnlineToday?: number;
    totalTokenSpent?: number;
  };

  documentVerificationId: ObjectId;

  documentVerificationFile: string;

  documentVerification: any;

  commission: number;

  tipCommission: number;

  privateCallCommission: number;

  groupCallCommission: number;

  productCommission: number;

  albumCommission: number;

  videoCommission: number;

  constructor(payload: Partial<StudioDto>) {
    Object.assign(
      this,
      pick(payload, [
        '_id',
        'name',
        'username',
        'email',
        'status',
        'phone',
        'country',
        'city',
        'state',
        'zipcode',
        'address',
        'roles',
        'languages',
        'timezone',
        'createdAt',
        'updatedAt',
        'balance',
        'emailVerified',
        'stats',
        'documentVerificationId',
        'documentVerificationFile',
        'commission',
        'tipCommission',
        'privateCallCommission',
        'groupCallCommission',
        'productCommission',
        'albumCommission',
        'videoCommission'
      ])
    );
  }

  toResponse(includePrivateInfo = false): Partial<IStudio> {
    const publicInfo = {
      _id: this._id,
      name: this.name,
      username: this.username,
      email: this.email,
      status: this.status,
      phone: this.phone,
      country: this.country,
      city: this.city,
      state: this.state,
      zipcode: this.zipcode,
      address: this.address,
      languages: this.languages,
      timezone: this.timezone,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      stats: this.stats
    };

    if (!includePrivateInfo) {
      return publicInfo;
    }

    const privateInfo = {
      emailVerified: this.emailVerified,
      commission: this.commission,
      documentVerificationId: this.documentVerificationId,
      documentVerificationFile: this.documentVerificationFile,
      balance: this.balance,
      roles: this.roles,
      tipCommission: this.tipCommission,
      privateCallCommission: this.privateCallCommission,
      groupCallCommission: this.groupCallCommission,
      productCommission: this.productCommission,
      albumCommission: this.albumCommission,
      videoCommission: this.videoCommission
    };
    return {
      ...publicInfo,
      ...privateInfo
    };
  }
}
