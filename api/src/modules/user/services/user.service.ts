import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { FileDto } from 'src/modules/file';
import { EntityNotFoundException, PageableData } from 'src/kernel';
import { ROLE, STATUS } from 'src/kernel/constants';
import { FileService } from 'src/modules/file/services';
import { SettingService } from 'src/modules/settings';
import { SETTING_KEYS } from 'src/modules/settings/constants';
import { AuthService } from 'src/modules/auth/services';
import { UserModel, ShippingInfoModel } from '../models';
import { USER_MODEL_PROVIDER, SHIPPING_INFO_PROVIDER } from '../providers';
import {
  UserUpdatePayload,
  UserAuthUpdatePayload,
  UserAuthCreatePayload,
  UserCreatePayload
} from '../payloads';
import { UserDto, IShippingInfo, IShippingInfoResponse } from '../dtos';
import { STATUS_ACTIVE } from '../constants';
import { EmailHasBeenTakenException } from '../exceptions';
import { UsernameExistedException } from '../exceptions/username-existed.exception';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_MODEL_PROVIDER)
    private readonly userModel: Model<UserModel>,
    @Inject(SHIPPING_INFO_PROVIDER)
    private readonly shippingInfoModel: Model<ShippingInfoModel>,
    @Inject(forwardRef(() => FileService))
    private readonly fileService: FileService,
    private readonly settingService: SettingService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService:  AuthService
  ) {}

  public async find(params: any): Promise<UserModel[]> {
    return this.userModel.find(params);
  }

  public async findByEmail(email: string): Promise<UserModel | null> {
    return this.userModel.findOne({ email: email.toLowerCase() });
  }

  public async findByEmails(emails: string[]): Promise<UserModel[]> {
    return this.userModel.find({ email: { $in: emails } });
  }

  public async findById(id: string | ObjectId): Promise<UserModel> {
    return this.userModel.findById(id);
  }

  public async findByUsername(username: string): Promise<UserDto> {
    const newUsername = username.toLowerCase();
    const user = await this.userModel.findOne({ username: newUsername });
    return user ? new UserDto(user) : null;
  }

  public async findByIds(ids: any[]): Promise<UserDto[]> {
    const users = await this.userModel.find({
      _id: { $in: ids }
    });
    return users.map(u => new UserDto(u));
  }

  public async create(
    data: Partial<UserCreatePayload> | UserAuthCreatePayload,
    options = {} as any
  ): Promise<UserModel> {
    const count = await this.userModel.countDocuments({
      email: data.email.toLowerCase()
    });
    if (count) {
      throw new EmailHasBeenTakenException();
    }

    const username = await this.findByUsername(data.username);
    if (username) {
      throw new UsernameExistedException();
    }

    const balance = await this.settingService.getKeyValue(SETTING_KEYS.FREE_TOKENS) || 0;
    const user = { ...data, balance } as any;
    user.createdAt = new Date();
    user.updatedAt = new Date();
    user.roles = options.roles || ['user'];
    user.status = options.status || STATUS_ACTIVE;
    if (typeof options.emailVerified !== 'undefined') {
      user.emailVerified = options.emailVerified;
    }
    if (!user.name) {
      user.name = [user.firstName || '', user.lastName || ''].join(' ').trim();
    }

    return this.userModel.create(user);
  }

  public async update(
    id: string | ObjectId,
    payload: Partial<UserUpdatePayload>,
    user?: UserDto
  ): Promise<any> {
    const data = { ...payload };
    // TODO - check roles here
    if (user && `${user._id}` === `${id}`) {
      delete data.email;
      delete data.username;
    }
    if (!user.name) {
      data.name = [user.firstName || '', user.lastName || ''].join(' ').trim();
    }
    return this.userModel.updateOne({ _id: id }, data, { new: true });
  }

  public async updateAvatar(user: UserDto, file: FileDto): Promise<FileDto> {
    await this.userModel.updateOne(
      { _id: user._id },
      {
        avatarId: file._id,
        avatarPath: file.path
      }
    );

    if (user.avatarId && user.avatarId !== file._id) {
      await this.fileService.remove(user.avatarId);
    }

    await this.fileService.addRef(file._id, {
      itemId: user._id,
      itemType: ROLE.USER
    });

    // resend user info?
    // TODO - check others config for other storage
    return file;
  }

  public async adminUpdate(
    id: string | ObjectId,
    payload: UserAuthUpdatePayload
  ): Promise<any> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new EntityNotFoundException();
    }

    const data = { ...payload };
    if (!user.name) {
      user.name = [user.firstName || '', user.lastName || ''].join(' ').trim();
    }

    if (data.email && data.email.toLowerCase() !== user.email.toLowerCase()) {
      const emailCheck = await this.userModel.countDocuments({
        email: data.email.toLowerCase(),
        _id: {
          $ne: user._id
        }
      });
      if (emailCheck) {
        throw new EmailHasBeenTakenException();
      }
    }

    if (
      data.username &&
      data.username.toLowerCase() !== user.username.toLowerCase()
    ) {
      const usernameCheck = await this.userModel.countDocuments({
        username: user.username.toLowerCase(),
        _id: { $ne: user._id }
      });
      if (usernameCheck) {
        throw new UsernameExistedException();
      }
    }

    await this.userModel.updateOne({ _id: id }, data, { new: true });
    if (data.email && data.email.toLowerCase() !== user.email.toLowerCase()) {
      const auth = await this.authService.findBySource({
        source: 'user',
        sourceId: user._id,
        type: 'email'
      });
      if (auth) {
        auth.key = data.email;
        await auth.save();
      }
    }
  }

  public async createShippingInfo(user: UserDto, data: IShippingInfo) {
    const info = await this.shippingInfoModel.create(
      Object.assign(data, { userId: user._id })
    );
    return info;
  }

  public async getShippingInfo(
    id: string | ObjectId
  ): Promise<PageableData<IShippingInfoResponse>> {
    const [total, data] = await Promise.all([
      this.shippingInfoModel.countDocuments({ userId: id }),
      this.shippingInfoModel.find({ userId: id })
    ]);
    return { data, total };
  }

  public async updateVerificationStatus(
    userId: string | ObjectId
  ): Promise<any> {
    return this.userModel.updateOne(
      {
        _id: userId
      },
      { status: STATUS.ACTIVE, emailVerified: true },
      { new: true }
    );
  }

  public async increaseBalance(
    id: string | ObjectId,
    amount: number,
    withStats = true
  ) {
    const stats = withStats
      ? {
          balance: amount,
          'stats.totalTokenEarned': amount > 0 ? amount : 0,
          'stats.totalTokenSpent': amount <= 0 ? amount : 0
        }
      : { balance: amount };
    return this.userModel.updateOne(
      { _id: id },
      {
        $inc: stats
      }
    );
  }

  public async updateStats(
    id: string | ObjectId,
    payload: Record<string, number>
  ) {
    return this.userModel.updateOne({ _id: id }, { $inc: payload });
  }

  public async stats() {
    const [totalViewTime, totalTokenSpent] = await Promise.all([
      this.userModel.aggregate([
        {
          $group: {
            _id: null,
            total: {
              $sum: '$stats.totalViewTime'
            }
          }
        }
      ]),
      this.userModel.aggregate([
        {
          $group: {
            _id: null,
            total: {
              $sum: '$stats.totalTokenSpent'
            }
          }
        }
      ])
    ]);

    return {
      totalViewTime: (totalViewTime.length && totalViewTime[0].total) || 0,
      totalTokenSpent: (totalTokenSpent.length && totalTokenSpent[0].total) || 0
    };
  }
}
