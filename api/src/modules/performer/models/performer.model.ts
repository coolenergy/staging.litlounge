import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';
import { ISchedule, BankTransferInterface } from '../dtos';

export class PerformerModel extends Document {
  name?: string;

  firstName: string;

  lastName: string;

  username: string;

  email: string;

  phone: string;

  phoneCode: string; // international code prefix

  avatarId: ObjectId;

  avatarPath: string;

  headerId?: ObjectId;

  headerPath?: string;

  idVerificationId: ObjectId;

  documentVerificationId: ObjectId;

  releaseFormId: ObjectId;

  gender: string;

  country: string;

  city: string;

  state: string;

  zipcode: string;

  address: string;

  streamingStatus: string;

  streamingTitle: string;

  languages: string[];

  tags: string[];

  categoryIds: Array<ObjectId>;

  schedule: ISchedule;

  timezone: string;

  hair: string;

  eyes: string;

  weight: string;

  height: string;

  ethnicity: string;

  pubicHair: string;

  bust: string;

  aboutMe: string;

  sexualReference: string;

  noteForUser: string;

  studioId: ObjectId;

  createdBy: ObjectId;

  dateOfBirth: Date;

  bankTransferOption: BankTransferInterface;

  directDeposit: any;

  paxum: any

  bitpay: any;

  balance: number;

  createdAt: Date;

  updatedAt: Date;

  emailVerified: boolean;

  isOnline: boolean;

  onlineAt: Date;

  offlineAt: Date;

  socials: any;

  stats: {
    views: number;
    favorites: number;
    totalVideos: number;
    totalPhotos: number;
    totalGalleries: number;
    totalProducts: number;
    totalStreamTime: number;
    totalTokenEarned: number;
    totalTokenSpent: number;
  }

  privateCallPrice: number;

  groupCallPrice: number;

  maxParticipantsAllowed: number;

  lastStreamingTime: Date;
}
