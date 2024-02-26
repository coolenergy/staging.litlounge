import { ObjectId } from 'mongodb';
import { pick } from 'lodash';
import { FileDto } from 'src/modules/file';

export interface IUserResponse {
  _id?: ObjectId;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  roles?: string[];
  timezone?: string;
  avatar?: string;
  status?: string;
  gender?: string;
  balance?: number;
  country?: string;
  city?: string;
  dateOfBirth?: Date;
  state?: string;
  emailVerified?: boolean;
  stats?: {
    totalViewTime?: number;
    totalTokenEarned?: number;
    totalTokenSpent?: number;
  };
  isOnline?: boolean;
  onlineAt?: Date;
  offlineAt?: Date;
  totalOnlineTime?: number;
  createdAt?: Date;
}

export class UserDto {
  _id: ObjectId;

  name?: string;

  firstName: string;

  lastName: string;

  email: string;

  phone?: string;

  timezone?: string;

  roles: string[] = ['user'];

  avatarId?: string | ObjectId;

  avatarPath?: string;

  status?: string;

  username: string;

  gender?: string;

  balance?: number;

  dateOfBirth: Date;

  city?: string;

  stats?: any;

  state?: string;

  country: string;

  emailVerified: boolean;

  isOnline?: boolean;

  onlineAt?: Date;

  offlineAt?: Date;

  totalOnlineTime?: number;

  createdAt?: Date;

  constructor(data?: Partial<UserDto>) {
    data
      && Object.assign(
        this,
        pick(data, [
          '_id',
          'name',
          'firstName',
          'lastName',
          'email',
          'phone',
          'roles',
          'avatarId',
          'timezone',
          'avatarPath',
          'status',
          'username',
          'gender',
          'balance',
          'stats',
          'country',
          'city',
          'dateOfBirth',
          'state',
          'emailVerified',
          'isOnline',
          'onlineAt',
          'offlineAt',
          'totalOnlineTime',
          'createdAt'
        ])
      );
  }

  toResponse(includePrivateInfo = false): IUserResponse {
    const publicInfo = {
      _id: this._id,
      avatar: FileDto.getPublicUrl(this.avatarPath),
      roles: this.roles,
      username: this.username,
      isOnline: this.isOnline
    };
    if (!includePrivateInfo) {
      return publicInfo;
    }

    return {
      ...publicInfo,
      name: this.name || `${this.firstName} ${this.lastName}`,
      email: this.email,
      phone: this.phone,
      status: this.status,
      gender: this.gender,
      firstName: this.firstName,
      lastName: this.lastName,
      balance: this.balance,
      country: this.country,
      city: this.city,
      stats: this.stats,
      dateOfBirth: this.dateOfBirth,
      state: this.state,
      timezone: this.timezone,
      emailVerified: this.emailVerified,
      onlineAt: this.onlineAt,
      offlineAt: this.offlineAt,
      totalOnlineTime: this.totalOnlineTime,
      createdAt: this.createdAt
    };
  }

  toPrivateRequestResponse() {
    return {
      _id: this._id,
      avatar: FileDto.getPublicUrl(this.avatarPath),
      roles: this.roles,
      username: this.username,
      balance: this.balance,
      isOnline: this.isOnline
    }
  }
}
