import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export class UserModel extends Document {
  name?: string;

  firstName?: string;

  lastName?: string;

  email?: string;

  phone?: string;

  roles: string[];

  avatarId: ObjectId;

  avatarPath: string;

  timezone?: string;

  status: string;

  balance?: number;

  username?: string;

  country?: string;

  dateOfBirth: Date;

  gender?: string;

  createdAt: Date;

  updatedAt: Date;

  state?: string;

  city?: string;

  emailVerified?: boolean;

  isOnline?: boolean;

  onlineAt?: Date;

  offlineAt?: Date;

  totalOnlineTime?: number;

  stats: {
    totalViewTime: number;
    totalTokenEarned: number;
    totalTokenSpent: number;
  }
}
