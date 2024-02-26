import { ObjectId } from 'mongodb';
import { pick } from 'lodash';
import { FileDto } from 'src/modules/file';
import { ICommissionSetting } from './performer-commission.dto';

interface ValueSchedule {
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

export interface BankTransferInterface {
  type: string;
  withdrawCurrency: string;
  taxPayer: string;
  bankName: string;
  bankAddress: string;
  bankCity: string;
  bankState: string;
  bankZip: string;
  bankCountry: string;
  bankAcountNumber: string;
  bankSWIFTBICABA: string;
  holderOfBankAccount: string;
  additionalInformation: string;
  payPalAccount: string;
  checkPayable: string;
}

export interface DirectDepositInterface {
  depositFirstName: string;
  depositLastName: string;
  accountingEmail: string;
  directBankName: string;
  accountType: string;
  accountNumber: string;
  routingNumber: string;
}

export interface IPaxum {
  paxumName: string;
  paxumEmail: string;
  paxumAdditionalInformation: string;
}

export interface IBitpay {
  bitpayName: string;
  bitpayEmail: string;
  bitpayAdditionalInformation: string;
}

export interface IPerformerResponse {
  _id?: ObjectId;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  phoneCode?: string; // international code prefix
  status?: string;
  avatar?: string;
  header?: string;
  idVerificationId?: ObjectId;
  streamingStatus?: string;
  streamingTitle?: string;
  documentVerificationId?: ObjectId;
  gender?: string;
  country?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  address?: string;
  languages?: string[];
  tags?: string[];
  studioId?: ObjectId;
  categoryIds?: ObjectId[];
  categories?: string[];
  createdBy?: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  height?: string;
  weight?: string;
  bio?: string;
  eyes?: string;
  maxParticipantsAllowed?: number;
  sexualReference?: string;
  aboutMe?: string;
  bust?: string;
  hair?: string;
  ethnicity?: string;
  pubicHair?: string;
  monthlyPrice?: number;
  yearlyPrice?: number;
  dateOfBirth?: Date;
  timezone?: string;
  bankTransferOption?: BankTransferInterface;
  directDeposit?: DirectDepositInterface;
  paxum?: IPaxum;
  bitpay?: IBitpay;
  stats?: {
    favorites?: number;
    totalVideos?: number;
    totalPhotos?: number;
    totalGalleries?: number;
    totalProducts?: number;
    totalStreamTime?: number;
    totalTokenEarned?: number;
    totalTokenSpent?: number;
  };
  isOnline?: boolean;
  watching?: number;
  isFavorite?: boolean;
  onlineAt?: Date;
  offlineAt?: Date;
  socials?: any;
  commissionSetting?: ICommissionSetting;
  privateCallPrice?: number;
  groupCallPrice?: number;
  lastStreamingTime?: Date;
}

export class PerformerDto {
  _id: ObjectId;

  name?: string;

  firstName?: string;

  lastName?: string;

  username?: string;

  email?: string;

  phone?: string;

  streamingStatus?: string;

  streamingTitle?: string;

  phoneCode?: string; // international code prefix

  status?: string;

  avatarId?: ObjectId;

  avatarPath?: string;

  headerId?: ObjectId;

  headerPath?: string;

  idVerificationId?: ObjectId;

  documentVerificationId?: ObjectId;

  idVerification?: any;

  documentVerification?: any;

  releaseFormId?: ObjectId;

  releaseForm?: any;

  avatar?: any;

  header?: any;

  gender?: string;

  country?: string;

  city?: string;

  state?: string;

  zipcode?: string;

  address?: string;

  languages?: string[];

  tags?: string[];

  studioId?: ObjectId;

  categoryIds?: ObjectId[];

  categories?: string[];

  schedule?: ISchedule;

  timezone?: string;

  noteForUser?: string;

  createdBy?: ObjectId;

  createdAt?: Date;

  updatedAt?: Date;

  height?: string;

  weight?: string;

  bio?: string;

  eyes?: string;

  sexualReference?: string;

  pubicHair?: string;

  hair?: string;

  bust?: string;

  aboutMe?: string;

  ethnicity?: string;

  bankTransferOption?: BankTransferInterface;

  directDeposit?: DirectDepositInterface;

  paxum?: IPaxum;

  bitpay?: IBitpay;

  monthlyPrice?: number;

  yearlyPrice?: number;

  dateOfBirth?: Date;

  stats?: {
    favorites?: number;
    totalVideos?: number;
    totalPhotos?: number;
    totalGalleries?: number;
    totalProducts?: number;
    totalStreamTime?: number;
    totalTokenEarned?: number;
    totalTokenSpent?: number;
  };

  balance?: number;

  isPerformer = true;

  emailVerified?: boolean;

  isOnline?: boolean;

  watching?: number;

  onlineAt?: Date;

  offlineAt?: Date;

  isStreaming?: boolean;

  isFavorite: boolean;

  isBlocked?: boolean;

  socials?: any;

  commissionSetting?: ICommissionSetting;

  maxParticipantsAllowed?: number;

  privateCallPrice: number;

  groupCallPrice: number;

  lastStreamingTime: Date;

  studioInfo: any;

  constructor(data?: Partial<PerformerDto>) {
    Object.assign(
      this,
      pick(data, [
        '_id',
        'name',
        'firstName',
        'lastName',
        'name',
        'username',
        'email',
        'phone',
        'phoneCode',
        'status',
        'avatarId',
        'avatarPath',
        'headerId',
        'headerPath',
        'bankTransferOption',
        'directDeposit',
        'maxParticipantsAllowed',
        'paxum',
        'bitpay',
        'streamingStatus',
        'streamingTitle',
        'idVerificationId',
        'idVerification',
        'documentVerificationId',
        'documentVerification',
        'releaseFormId',
        'releaseForm',
        'gender',
        'country',
        'city',
        'state',
        'zipcode',
        'address',
        'languages',
        'tags',
        'studioId',
        'categoryIds',
        'categories',
        'schedule',
        'timezone',
        'noteForUser',
        'createdBy',
        'createdAt',
        'updatedAt',
        'eyes',
        'height',
        'weight',
        'bio',
        'sexualReference',
        'hair',
        'pubicHair',
        'ethnicity',
        'aboutMe',
        'bust',
        'dateOfBirth',
        'balance',
        'isPerformer',
        'emailVerified',
        'isOnline',
        'watching',
        'onlineAt',
        'offlineAt',
        'isStreaming',
        'isFavorite',
        'isBlocked',
        'socials',
        'stats',
        'commissionSetting',
        'privateCallPrice',
        'groupCallPrice',
        'lastStreamingTime',
        'studioInfo'
      ])
    );
  }

  toResponse(includePrivateInfo = false): Partial<PerformerDto> {
    const publicInfo = {
      _id: this._id,
      avatar: FileDto.getPublicUrl(this.avatarPath),
      header: FileDto.getPublicUrl(this.headerPath),
      username: this.username,
      dateOfBirth: this.dateOfBirth,
      phone: this.phone,
      isOnline: this.isOnline,
      watching: this.watching,
      gender: this.gender,
      isStreaming: this.isStreaming,
      isFavorite: this.isFavorite,
      socials: this.socials,
      stats: this.stats,
      lastStreamingTime: this.lastStreamingTime,
      streamingStatus: this.streamingStatus,
      streamingTitle: this.streamingTitle,
      country: this.country,
      city: this.city,
      state: this.state,
      zipcode: this.zipcode,
      address: this.address,
      languages: this.languages,
      categoryIds: this.categoryIds,
      categories: this.categories,
      tags: this.tags,
      aboutMe: this.aboutMe,
      isBlocked: this.isBlocked,
      privateCallPrice: this.privateCallPrice,
      groupCallPrice: this.groupCallPrice,
      offlineAt: this.offlineAt
    };

    const privateInfo = {
      email: this.email,
      phone: this.phone,
      phoneCode: this.phoneCode,
      status: this.status,
      name: this.getName(),
      firstName: this.firstName,
      lastName: this.lastName,
      city: this.city,
      state: this.state,
      zipcode: this.zipcode,
      address: this.address,
      languages: this.languages,
      idVerificationId: this.idVerificationId,
      documentVerificationId: this.documentVerificationId,
      documentVerification: this.documentVerification,
      releaseFormId: this.releaseFormId,
      releaseForm: this.releaseForm,
      idVerification: this.idVerification,
      schedule: this.schedule,
      timezone: this.timezone,
      noteForUser: this.noteForUser,
      bankTransferOption: this.bankTransferOption,
      directDeposit: this.directDeposit,
      paxum: this.paxum,
      bitpay: this.bitpay,
      height: this.height,
      weight: this.weight,
      bio: this.bio,
      eyes: this.eyes,
      sexualReference: this.sexualReference,
      hair: this.hair,
      aboutMe: this.aboutMe,
      pubicHair: this.pubicHair,
      bust: this.bust,
      ethnicity: this.ethnicity,
      tags: this.tags,
      monthlyPrice: this.monthlyPrice,
      yearlyPrice: this.yearlyPrice,
      stats: this.stats,
      balance: this.balance,
      isPerformer: this.isPerformer,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      emailVerified: this.emailVerified,
      onlineAt: this.onlineAt,
      offlineAt: this.offlineAt,
      privateCallPrice: this.privateCallPrice,
      groupCallPrice: this.groupCallPrice,
      maxParticipantsAllowed: this.maxParticipantsAllowed,
      commissionSetting: this.commissionSetting,
      studioId: this.studioId,
      studioInfo: this.studioInfo
    };
    if (!includePrivateInfo) {
      return publicInfo;
    }

    return {
      ...publicInfo,
      ...privateInfo
    };
  }

  getName() {
    if (this.name) return this.name;
    return [this.firstName || '', this.lastName || ''].join(' ').trim();
  }

  toSearchResponse() {
    return {
      _id: this._id,
      avatar: FileDto.getPublicUrl(this.avatarPath),
      header: FileDto.getPublicUrl(this.headerPath),
      username: this.username,
      gender: this.gender,
      languages: this.languages,
      tags: this.tags,
      streamingStatus: this.streamingStatus,
      streamingTitle: this.streamingTitle,
      aboutMe: this.aboutMe,
      isFavorite: this.isFavorite,
      isBlocked: this.isBlocked,
      isStreaming: this.isStreaming,
      isOnline: this.isOnline,
      watching: this.watching,
      lastStreamingTime: this.lastStreamingTime,
      privateCallPrice: this.privateCallPrice,
      groupCallPrice: this.groupCallPrice,
      categoryIds: this.categoryIds,
      categories: this.categories,
      stats: this.stats,
      dateOfBirth: this.dateOfBirth,
      offlineAt: this.offlineAt,
      country: this.country
    };
  }

  toPublicDetailsResponse() {
    return {
      _id: this._id,
      avatar: FileDto.getPublicUrl(this.avatarPath),
      header: FileDto.getPublicUrl(this.headerPath),
      username: this.username,
      status: this.status,
      gender: this.gender,
      country: this.country,
      streamingStatus: this.streamingStatus,
      streamingTitle: this.streamingTitle,
      city: this.city,
      state: this.state,
      zipcode: this.zipcode,
      address: this.address,
      languages: this.languages,
      categoryIds: this.categoryIds,
      categories: this.categories,
      schedule: this.schedule,
      timezone: this.timezone,
      noteForUser: this.noteForUser,
      height: this.height,
      weight: this.weight,
      bio: this.bio,
      eyes: this.eyes,
      tags: this.tags,
      hair: this.hair,
      aboutMe: this.aboutMe,
      pubicHair: this.pubicHair,
      bust: this.bust,
      ethnicity: this.ethnicity,
      sexualReference: this.sexualReference,
      monthlyPrice: this.monthlyPrice,
      yearlyPrice: this.yearlyPrice,
      stats: this.stats,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      dateOfBirth: this.dateOfBirth,
      isOnline: this.isOnline,
      watching: this.watching,
      isStreaming: this.isStreaming,
      isFavorite: this.isFavorite,
      isBlocked: this.isBlocked,
      socials: this.socials,
      privateCallPrice: this.privateCallPrice,
      groupCallPrice: this.groupCallPrice,
      maxParticipantsAllowed: this.maxParticipantsAllowed,
      onlineAt: this.onlineAt,
      offlineAt: this.offlineAt,
      lastStreamingTime: this.lastStreamingTime
    };
  }
}

export class BlockSettingDto {
  _id: ObjectId;

  performerId: ObjectId;

  countries: string[];

  userIds: ObjectId[] | string[];

  usersInfo?: any[];

  createdAt: Date;

  updatedAt: Date;

  constructor(data?: Partial<BlockSettingDto>) {
    Object.assign(
      this,
      pick(data, [
        '_id',
        'performerId',
        'countries',
        'userIds',
        'usersInfo',
        'createdAt',
        'updatedAt'
      ])
    );
  }
}
