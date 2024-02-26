interface document {
  _id: string;
  url: string;
  mimeType: string;
}

export interface ValueSchedule {
  start: string;
  end: string;
  closed: boolean;
}

export interface ISchedule {
  mon: ValueSchedule;
  tue: ValueSchedule;
  wed: ValueSchedule;
  thu: ValueSchedule;
  fri: ValueSchedule;
  sat: ValueSchedule;
  sun: ValueSchedule;
}

export interface IPerformer {
  _id: string;
  firstName: string;
  lastName: string;
  name: string;
  username: string;
  avatar?: any;
  header?: any;
  balance?: number;
  bankTransferOption?: {};
  bitpay?: {};
  categoryIds?: [];
  country?: string;
  createdAt?: Date;
  dateOfBirth?: Date;
  directDeposit?: {};
  documentVerificationId?: string;
  email?: string;
  emailVerified?: boolean;
  gender?: string;
  groupCallPrice?: number;
  idVerificationId?: string;
  isOnline?: number;
  isPerformer?: true;
  languages?: [];
  offlineAt?: Date;
  onlineAt?: Date;
  paxum?: {};
  privateCallPrice?: number;
  schedule?: ISchedule;
  stats?: {
    favorites?: number;
    totalGalleries?: number;
    totalPhotos?: number;
    totalProducts?: number;
    totalStreamTime?: number;
    totalTokenEarned?: number;
    totalTokenSpent?: number;
    totalVideos?: number;
    views?: number;
  };
  status?: string;
  tags?: [];
  updatedAt?: Date;
}

export interface IPerformerCreate {
  firstName: string;
  lastName: string;
  name: string;
  username: string;
  email: string;
  country: string;
  status: string;
  gender: string;
  languages: string[];
  phone: string;
  phoneCode: string;
  city: string;
  state: string;
  address: string;
  zipcode: string;
  schedule?: ISchedule;
  emailVerified?: boolean;
  socials?: any;
}

export interface IPerformerUpdate {
  firstName: string;
  lastName: string;
  name: string;
  username: string;
  email: string;
  country: string;
  status: string;
  gender: string;
  languages: string[];
  phone: string;
  phoneCode: string;
  city: string;
  state: string;
  address: string;
  zipcode: string;
  avatar?: string;
  header?: string;
  idVerification?: document;
  documentVerification?: document;
  releaseForm?: document;
  schedule?: ISchedule;
  emailVerified?: boolean;
  socials?: any;
  commissionSetting?: ICommissionSetting;
  studioId?: string;
}

export interface ICommissionSetting {
  performerId?: string;
  tipCommission: number;
  privateCallCommission: number;
  groupCallCommission: number;
  productCommission: number;
  albumCommission: number;
  videoCommission: number;
}
