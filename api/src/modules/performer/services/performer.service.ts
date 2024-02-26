import { Injectable, Inject, forwardRef, ForbiddenException, BadRequestException } from '@nestjs/common';
import { FilterQuery, Model } from 'mongoose';
import { UserDto } from 'src/modules/user/dtos';
import {
  EntityNotFoundException,
  QueueEvent,
  QueueEventService
} from 'src/kernel';
import { ObjectId } from 'mongodb';
import {
  DELETE_FILE_TYPE,
  FileService,
  FILE_EVENT,
  MEDIA_FILE_CHANNEL
} from 'src/modules/file/services';
import { FileDto } from 'src/modules/file';
import { EVENT, STATUS } from 'src/kernel/constants';
import { UserService } from 'src/modules/user/services';
import { merge, uniq } from 'lodash';
import { SocketUserService } from 'src/modules/socket/services/socket-user.service';
import * as moment from 'moment';
import {
  PERFORMER_CHANNEL,
  PERFORMER_STEAMING_STATUS_CHANNEL
} from 'src/modules/performer/constants';
import { USER_SOCKET_EVENT } from 'src/modules/socket/constants';
import { OFFLINE } from 'src/modules/stream/constant';
import { toObjectId } from 'src/kernel/helpers/string.helper';
import {
  PERFORMER_STATUSES,
  BLOCK_USERS_CHANNEL,
  BLOCK_ACTION
} from '../constants';
import { PerformerBroadcastSetting } from '../payloads/performer-broadcast-setting.payload';
import { PerformerCommissionService } from './index';
import { PerformerDto, BlockSettingDto } from '../dtos';
import { UsernameExistedException, EmailExistedException } from '../exceptions';
import {
  PerformerModel,
  BlockSettingModel,
  PerformerCommissionModel
} from '../models';
import {
  PerformerCreatePayload,
  PerformerUpdatePayload,
  BlockSettingPayload,
  PerformerRegisterPayload,
  DefaultPricePayload
} from '../payloads';
import {
  PERFORMER_MODEL_PROVIDER,
  PERFORMER_BLOCK_SETTING_MODEL_PROVIDER,
  PERFORMER_COMMISSION_MODEL_PROVIDER
} from '../providers';
import { CategoryService } from './category.service';

@Injectable()
export class PerformerService {
  constructor(
    @Inject(PERFORMER_MODEL_PROVIDER)
    private readonly performerModel: Model<PerformerModel>,
    private readonly userService: UserService,
    private readonly queueEventService: QueueEventService,
    private readonly categoryService: CategoryService,
    private readonly socketUserService: SocketUserService,
    @Inject(PERFORMER_BLOCK_SETTING_MODEL_PROVIDER)
    private readonly blockSettingModel: Model<BlockSettingModel>,
    @Inject(PERFORMER_COMMISSION_MODEL_PROVIDER)
    private readonly performerCommissionModel: Model<PerformerCommissionModel>,
    @Inject(forwardRef(() => FileService))
    private readonly fileService: FileService,
    @Inject(forwardRef(() => PerformerCommissionService))
    private readonly performerCommissionService: PerformerCommissionService
  ) {}

  public findOne(filter: FilterQuery<PerformerModel>) {
    return this.performerModel.findOne(filter);
  }

  public async findById(id: string | ObjectId): Promise<PerformerDto> {
    const model = await this.performerModel.findById(id);
    if (!model) return null;
    const dto = new PerformerDto(model);

    if (model.avatarId) {
      const avatar = await this.fileService.findById(model.avatarId);
      dto.avatarPath = avatar ? FileDto.getPublicUrl(avatar.path) : null;
    }
    if (model.headerId) {
      const header = await this.fileService.findById(model.headerId);
      dto.headerPath = header ? FileDto.getPublicUrl(header.path) : null;
    }
    return new PerformerDto(dto);
  }

  public async findAllindividualPerformers() {
    return this.performerModel.find({
      studioId: null
    });
  }

  public async checkBlockedByIp(
    blockSettings: any,
    countryCode: string
  ): Promise<boolean> {
    if (
      blockSettings &&
      blockSettings.countries &&
      blockSettings.countries.length
    ) {
      return blockSettings.countries.indexOf(countryCode) > -1;
    }

    return false;
  }

  public async checkBlockedByPerformer(
    blockSettings: any,
    userId: string | ObjectId
  ): Promise<boolean> {
    if (
      blockSettings &&
      blockSettings.userIds &&
      blockSettings.userIds.length
    ) {
      return blockSettings.userIds.indexOf(userId) > -1;
    }

    return false;
  }

  public async findByUsername(
    username: string,
    countryCode?: string,
    currentUser?: UserDto
  ): Promise<PerformerDto> {
    const findUsername = username.replace(/[^a-zA-Z0-9]/g, '');
    const model = await this.performerModel.findOne({ username: findUsername });
    if (!model) return null;
    const dto = new PerformerDto(model);
    let isBlocked = false;
    const blockSettings = await this.blockSettingModel.findOne({
      performerId: model._id
    });

    if (countryCode && blockSettings) {
      isBlocked = await this.checkBlockedByIp(blockSettings, countryCode);
    }
    let isBlockedByPerformer = false;
    if (currentUser && blockSettings) {
      isBlockedByPerformer = await this.checkBlockedByPerformer(
        blockSettings,
        currentUser._id
      );
    }
    dto.isBlocked = !!(isBlocked || isBlockedByPerformer);
    if (model.avatarId) {
      const avatar = await this.fileService.findById(model.avatarId);
      dto.avatarPath = avatar ? avatar.path : null;
    }
    if (model.headerId) {
      const header = await this.fileService.findById(model.headerId);
      dto.headerPath = header ? header.path : null;
    }
    return dto;
  }

  public async findByEmail(email: string): Promise<PerformerDto> {
    const model = await this.performerModel.findOne({
      email: email.toLowerCase()
    });
    if (!model) return null;
    return new PerformerDto(model);
  }

  public async find(condition = {}) {
    const models = await this.performerModel.find(condition).exec();
    return models;
  }

  public async findByIds(ids): Promise<PerformerDto[]> {
    const performers = await this.performerModel
      .find({
        _id: {
          $in: ids
        }
      })
      .lean()
      .exec();
    return performers.map(p => new PerformerDto(p));
  }

  public async register(
    payload: Partial<PerformerRegisterPayload>
  ): Promise<PerformerDto> {
    const data = {
      ...payload,
      updatedAt: new Date(),
      createdAt: new Date()
    } as any;
    const userNameCheck = await this.performerModel.countDocuments({
      username: payload.username.trim()
    });
    if (userNameCheck) {
      throw new UsernameExistedException();
    }

    const emailCheck = await this.performerModel.countDocuments({
      email: payload.email.toLowerCase().trim()
    });
    if (emailCheck) {
      throw new EmailExistedException();
    }

    if (payload.avatarId) {
      const avatar = await this.fileService.findById(payload.avatarId);
      if (!avatar) {
        throw new EntityNotFoundException('Avatar not found!');
      }
      // TODO - check for other storaged
      data.avatarPath = avatar.path;
    }
    if (payload.headerId) {
      const header = await this.fileService.findById(payload.headerId);
      if (!header) {
        throw new EntityNotFoundException('Header not found!');
      }
      // TODO - check for other storaged
      data.headerPath = header.path;
    }

    const performer = await this.performerModel.create(data);

    await Promise.all([
      payload.idVerificationId &&
        this.fileService.addRef(payload.idVerificationId, {
          itemId: performer._id,
          itemType: 'performer-id-verification'
        }),
      payload.documentVerificationId &&
        this.fileService.addRef(payload.documentVerificationId, {
          itemId: performer._id,
          itemType: 'performer-document-verification'
        }),
      payload.avatarId &&
        this.fileService.addRef(payload.avatarId, {
          itemId: performer._id,
          itemType: 'performer-avatar'
        }),
      payload.headerId &&
        this.fileService.addRef(payload.headerId, {
          itemId: performer._id,
          itemType: 'performer-header'
        })
    ]);

    await this.queueEventService.publish(
      new QueueEvent({
        channel: PERFORMER_CHANNEL,
        eventName: EVENT.CREATED,
        data: {
          id: performer._id
        }
      })
    );

    // TODO - fire event?
    return new PerformerDto(performer);
  }

  public async getDetails(
    id: string | ObjectId,
    jwtToken: string
  ): Promise<PerformerDto> {
    const performer = await this.performerModel.findById(id);
    if (!performer) {
      throw new EntityNotFoundException();
    }

    const {
      avatarId,
      headerId,
      documentVerificationId,
      idVerificationId,
      releaseFormId,
      categoryIds
    } = performer;
    const [
      avatar,
      header,
      documentVerification,
      idVerification,
      releaseForm,
      commission,
      categories
    ] = await Promise.all([
      avatarId && this.fileService.findById(avatarId),
      headerId && this.fileService.findById(headerId),
      documentVerificationId &&
        this.fileService.findById(documentVerificationId),
      idVerificationId && this.fileService.findById(idVerificationId),
      releaseFormId && this.fileService.findById(releaseFormId),
      this.performerCommissionModel.findOne({
        performerId: id
      }),
      categoryIds
        ? this.categoryService.find({ _id: { $in: categoryIds } })
        : []
    ]);

    // TODO - update kernel for file dto
    const dto = new PerformerDto(performer);
    dto.categories = categories ? categories.map(c => c.name) : [];
    dto.avatar = avatar ? FileDto.getPublicUrl(avatar.path) : null; // TODO - get default avatar
    dto.header = header ? FileDto.getPublicUrl(header.path) : null; // TODO - get default header
    dto.idVerification = idVerification
      ? {
          _id: idVerification._id,
          name: idVerification.name,
          url: jwtToken
            ? `${FileDto.getPublicUrl(idVerification.path)}?documentId=${
                idVerification._id
              }&token=${jwtToken}`
            : FileDto.getPublicUrl(idVerification.path),
          mimeType: idVerification.mimeType
        }
      : null;
    dto.documentVerification = documentVerification
      ? {
          _id: documentVerification._id,
          name: documentVerification.name,
          url: jwtToken
            ? `${FileDto.getPublicUrl(documentVerification.path)}?documentId=${
                documentVerification._id
              }&token=${jwtToken}`
            : FileDto.getPublicUrl(documentVerification.path),
          mimeType: documentVerification.mimeType
        }
      : null;
    dto.releaseForm = releaseForm
      ? {
          _id: releaseForm._id,
          name: releaseForm.name,
          url: jwtToken
            ? `${FileDto.getPublicUrl(releaseForm.path)}?documentId=${
                releaseForm._id
              }&token=${jwtToken}`
            : FileDto.getPublicUrl(releaseForm.path),
          mimeType: releaseForm.mimeType
        }
      : null;

    dto.commissionSetting = commission;
    return dto;
  }

  public async create(
    payload: PerformerCreatePayload,
    user?: UserDto
  ): Promise<PerformerDto> {
    const data = {
      ...payload,
      updatedAt: new Date(),
      createdAt: new Date()
    } as any;
    const userNameCheck = await this.performerModel.countDocuments({
      username: payload.username.trim()
    });
    if (userNameCheck) {
      throw new UsernameExistedException();
    }

    const emailCheck = await this.performerModel.countDocuments({
      email: payload.email.toLowerCase().trim()
    });
    if (emailCheck) {
      throw new EmailExistedException();
    }

    if (payload.avatarId) {
      const avatar = await this.fileService.findById(payload.avatarId);
      if (!avatar) {
        throw new EntityNotFoundException('Avatar not found!');
      }
      // TODO - check for other storaged
      data.avatarPath = avatar.path;
    }
    if (payload.headerId) {
      const header = await this.fileService.findById(payload.headerId);
      if (!header) {
        throw new EntityNotFoundException('Header not found!');
      }
      // TODO - check for other storaged
      data.headerPath = header.path;
    }

    // TODO - check for category Id, studio
    if (user) {
      data.createdBy = user._id;
    }
    const performer = await this.performerModel.create(data);
    await Promise.all([
      payload.idVerificationId &&
        this.fileService.addRef(payload.idVerificationId, {
          itemId: performer._id as any,
          itemType: 'performer-id-verification'
        }),
      payload.documentVerificationId &&
        this.fileService.addRef(payload.documentVerificationId, {
          itemId: performer._id as any,
          itemType: 'performer-document-verification'
        }),
      payload.releaseFormId &&
        this.fileService.addRef(payload.releaseFormId, {
          itemId: performer._id as any,
          itemType: 'performer-release-form'
        }),
      payload.avatarId &&
        this.fileService.addRef(payload.avatarId, {
          itemId: performer._id as any,
          itemType: 'performer-avatar'
        }),
      payload.headerId &&
        this.fileService.addRef(payload.headerId, {
          itemId: performer._id as any,
          itemType: 'performer-header'
        })
    ]);

    if (payload.commissionSetting) {
      await this.performerCommissionService.update(
        payload.commissionSetting,
        performer._id
      );
    }

    await this.queueEventService.publish(
      new QueueEvent({
        channel: PERFORMER_CHANNEL,
        eventName: EVENT.CREATED,
        data: {
          id: performer._id
        }
      })
    );

    // TODO - fire event?
    return new PerformerDto(performer);
  }

  public async adminUpdate(
    id: string | ObjectId,
    payload: PerformerUpdatePayload
  ): Promise<any> {
    const performer = await this.performerModel.findById(id);
    if (!performer) {
      throw new EntityNotFoundException();
    }

    const data = { ...payload } as any;
    const { studioId } = performer;
    if (!performer.name) {
      data.name = [performer.firstName || '', performer.lastName || '']
        .join(' ')
        .trim();
    }

    if (
      data.email &&
      data.email.toLowerCase() !== performer.email.toLowerCase()
    ) {
      const emailCheck = await this.performerModel.countDocuments({
        email: data.email.toLowerCase(),
        _id: {
          $ne: performer._id
        }
      });
      if (emailCheck) {
        throw new EmailExistedException();
      }
    }

    if (data.username && data.username !== performer.username) {
      const usernameCheck = await this.performerModel.countDocuments({
        username: performer.username,
        _id: { $ne: performer._id }
      });
      if (usernameCheck) {
        throw new UsernameExistedException();
      }
    }

    if (
      (payload.avatarId && !performer.avatarId) ||
      (performer.avatarId &&
        payload.avatarId &&
        payload.avatarId !== performer.avatarId.toString())
    ) {
      const avatar = await this.fileService.findById(payload.avatarId);
      if (!avatar) {
        throw new EntityNotFoundException('Avatar not found!');
      }
      // TODO - check for other storaged
      data.avatarPath = avatar.path;
    }
    if (
      (payload.headerId && !performer.headerId) ||
      (performer.headerId &&
        payload.headerId &&
        payload.headerId !== performer.headerId.toString())
    ) {
      const header = await this.fileService.findById(payload.headerId);
      if (!header) {
        throw new EntityNotFoundException('Header not found!');
      }
      // TODO - check for other storaged
      data.headerPath = header.path;
    }

    await this.performerModel.updateOne({ _id: id }, data);

    await Promise.all([
      payload.avatarId &&
        this.fileService.addRef(payload.avatarId, {
          itemId: performer._id,
          itemType: 'performer-avatar'
        }),
      payload.headerId &&
        this.fileService.addRef(payload.headerId, {
          itemId: performer._id,
          itemType: 'performer-header'
        }),
      payload.documentVerificationId &&
        this.fileService.addRef(payload.documentVerificationId, {
          itemId: performer._id,
          itemType: 'performer-document-verification'
        }),
      payload.releaseFormId &&
        this.fileService.addRef(payload.releaseFormId, {
          itemId: performer._id,
          itemType: 'performer-release-form'
        }),
      payload.idVerificationId &&
        this.fileService.addRef(payload.idVerificationId, {
          itemId: performer._id,
          itemType: 'performer-id-verification'
        })
    ]);

    if (
      payload.documentVerificationId &&
      `${payload.documentVerificationId}` !==
        `${performer.documentVerificationId}`
    ) {
      performer.documentVerificationId &&
        (await this.fileService.remove(performer.documentVerificationId));
    }
    if (
      payload.idVerificationId &&
      `${payload.idVerificationId}` !== `${performer.idVerificationId}`
    ) {
      performer.idVerificationId &&
        (await this.fileService.remove(performer.idVerificationId));
    }
    if (
      payload.releaseFormId &&
      `${payload.releaseFormId}` !== `${performer.releaseFormId}`
    ) {
      performer.releaseFormId &&
        (await this.fileService.remove(performer.releaseFormId));
    }

    merge(performer, data);
    const event: QueueEvent = {
      channel: PERFORMER_CHANNEL,
      eventName: EVENT.UPDATED,
      data: {
        performer,
        oldStudioId: studioId
      }
    };
    await this.queueEventService.publish(event);
    return performer;
  }

  public async studioUpdateStatus(
    id: string,
    status: string,
    studioId: ObjectId
  ) {
    const performer = await this.findById(id);
    if (!performer) {
      throw new EntityNotFoundException();
    }

    if (performer.studioId.toString() !== studioId.toString()) {
      throw new ForbiddenException();
    }

    if (![STATUS.ACTIVE, STATUS.INACTIVE].includes(status)) {
      throw new BadRequestException();
    }

    return this.performerModel.updateOne(
      { _id: id },
      { $set: { status } },
      { new: true }
    );
  }

  public async update(
    id: string | ObjectId,
    payload: Partial<PerformerUpdatePayload>
  ): Promise<any> {
    const performer = await this.performerModel.findOne({ _id: id });
    if (!performer) {
      throw new EntityNotFoundException();
    }

    const data = { ...payload } as any;
    // TODO - check roles here
    if (performer && `${performer._id}` !== `${id}`) {
      delete data.email;
      delete data.username;
    }

    const {
      avatarId,
      headerId,
      documentVerificationId,
      idVerificationId,
      releaseFormId
    } = performer;

    data.name = [performer.firstName || '', performer.lastName || '']
      .join(' ')
      .trim();

    await this.performerModel.updateOne({ _id: id }, data);

    await Promise.all([
      payload.avatarId &&
        this.fileService.addRef(payload.avatarId, {
          itemId: performer._id,
          itemType: 'performer-avatar'
        }),
      payload.headerId &&
        this.fileService.addRef(payload.headerId, {
          itemId: performer._id,
          itemType: 'performer-header'
        }),
      payload.documentVerificationId &&
        this.fileService.addRef(payload.documentVerificationId, {
          itemId: performer._id,
          itemType: 'performer-document-verification'
        }),
      payload.releaseFormId &&
        this.fileService.addRef(payload.releaseFormId, {
          itemId: performer._id,
          itemType: 'performer-release-form'
        }),
      payload.idVerificationId &&
        this.fileService.addRef(payload.idVerificationId, {
          itemId: performer._id,
          itemType: 'performer-id-verification'
        })
    ]);

    await Promise.all([
      payload.avatarId &&
        this.queueEventService.publish(
          new QueueEvent({
            channel: MEDIA_FILE_CHANNEL,
            eventName: FILE_EVENT.FILE_RELATED_MODULE_UPDATED,
            data: {
              type: DELETE_FILE_TYPE.FILEID,
              currentFile: avatarId,
              newFile: payload.avatarId
            }
          })
        ),
        payload.headerId &&
        this.queueEventService.publish(
          new QueueEvent({
            channel: MEDIA_FILE_CHANNEL,
            eventName: FILE_EVENT.FILE_RELATED_MODULE_UPDATED,
            data: {
              type: DELETE_FILE_TYPE.FILEID,
              currentFile: headerId,
              newFile: payload.headerId
            }
          })
        ),
      payload.documentVerificationId &&
        this.queueEventService.publish(
          new QueueEvent({
            channel: MEDIA_FILE_CHANNEL,
            eventName: FILE_EVENT.FILE_RELATED_MODULE_UPDATED,
            data: {
              type: DELETE_FILE_TYPE.FILEID,
              currentFile: documentVerificationId,
              newFile: payload.documentVerificationId
            }
          })
        ),
      payload.releaseFormId &&
        this.queueEventService.publish(
          new QueueEvent({
            channel: MEDIA_FILE_CHANNEL,
            eventName: FILE_EVENT.FILE_RELATED_MODULE_UPDATED,
            data: {
              type: DELETE_FILE_TYPE.FILEID,
              currentFile: releaseFormId,
              newFile: payload.releaseFormId
            }
          })
        ),
      payload.idVerificationId &&
        this.queueEventService.publish(
          new QueueEvent({
            channel: MEDIA_FILE_CHANNEL,
            eventName: FILE_EVENT.FILE_RELATED_MODULE_UPDATED,
            data: {
              type: DELETE_FILE_TYPE.FILEID,
              currentFile: idVerificationId,
              newFile: payload.idVerificationId
            }
          })
        )
    ]);
    return true;
  }

  public async viewProfile(id: string | ObjectId) {
    return this.performerModel.updateOne(
      { _id: id },
      {
        $inc: { 'stats.views': 1 }
      },
      { new: true }
    );
  }

  public async updateBlockSetting(
    performerId: ObjectId,
    payload: BlockSettingPayload
  ) {
    let item = await this.blockSettingModel.findOne({
      performerId
    });
    if (item) {
      item.countries = uniq(payload.countries);
      item.userIds = uniq(payload.userIds);
      const data = item.toObject();
      const emitUserIds = data.userIds.length
        ? data.userIds
            .map(u => u.toString())
            .filter(u => !payload.userIds.includes(u))
        : [];
      payload.userIds &&
        (await this.queueEventService.publish({
          channel: BLOCK_USERS_CHANNEL,
          eventName: BLOCK_ACTION.CREATED,
          data: {
            userIds: emitUserIds,
            performerId: item.performerId
          }
        }));
      await item.save();
      return item;
    }

    // eslint-disable-next-line new-cap
    item = new this.blockSettingModel();
    item.performerId = performerId;
    item.userIds = uniq(payload.userIds);
    item.countries = uniq(payload.countries);
    payload.userIds &&
      (await this.queueEventService.publish({
        channel: BLOCK_USERS_CHANNEL,
        eventName: BLOCK_ACTION.CREATED,
        data: {
          userIds: item.userIds,
          performerId: item.performerId
        }
      }));
    await item.save();
    return item;
  }

  public async getBlockSetting(
    performerId: ObjectId
  ): Promise<BlockSettingModel> {
    const item = await this.blockSettingModel.findOne({
      performerId
    });
    if (!item) {
      const newData = await this.blockSettingModel.create({
        performerId,
        userIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        countries: []
      });
      return newData;
    }
    const users = item.userIds.length
      ? await this.userService.findByIds(item.userIds)
      : [];
    const data = new BlockSettingDto(item) as any;
    data.usersInfo = users
      ? users.map(u => u._id && u.toResponse(false))
      : null;
    return data;
  }

  public async checkBlock(performerId, countryCode, user): Promise<any> {
    let isBlocked = false;
    const blockSettings = await this.blockSettingModel.findOne({
      performerId
    });

    if (countryCode && blockSettings) {
      isBlocked = await this.checkBlockedByIp(blockSettings, countryCode);
    }
    let isBlockedByPerformer = false;
    if (user && blockSettings) {
      isBlockedByPerformer = await this.checkBlockedByPerformer(
        blockSettings,
        user._id
      );
    }
    const blocked = !!(isBlockedByPerformer || isBlocked);
    return { blocked };
  }

  public async updateSteamingStatus(id: string | ObjectId, status: string) {
    return this.performerModel.updateOne(
      { _id: id },
      { $set: { streamingTitle: status } }
    );
  }

  public async updateLastStreamingTime(
    id: string | ObjectId,
    streamTime: number
  ) {
    const newEvent: QueueEvent = {
      channel: PERFORMER_STEAMING_STATUS_CHANNEL,
      eventName: OFFLINE,
      data: { id }
    };
    await this.queueEventService.publish(newEvent);
    return this.performerModel.updateOne(
      { _id: id },
      {
        $set: {
          lastStreamingTime: new Date(),
          live: false,
          streamingStatus: OFFLINE
        },
        $inc: { 'stats.totalStreamTime': streamTime }
      }
    );
  }

  public async offline(id: string | ObjectId) {
    const performer = await this.findById(id);
    if (!performer) {
      return;
    }

    await this.performerModel.updateOne(
      { _id: id },
      {
        $set: {
          isOnline: false,
          streamingStatus: OFFLINE,
          onlineAt: null,
          offlineAt: new Date()
        }
      }
    );
    await this.socketUserService.emitToConnectedUsers('modelUpdateStatus', {
      id,
      performer: new PerformerDto({
        ...performer,
        streamingStatus: OFFLINE
      }).toSearchResponse(),
      status: USER_SOCKET_EVENT.DISCONNECTED
    });
  }

  public async updateVerificationStatus(
    userId: string | ObjectId
  ): Promise<any> {
    return this.performerModel.updateOne(
      {
        _id: userId
      },
      { emailVerified: true },
      { new: true }
    );
  }

  public async increaseBalance(id: string | ObjectId, amount: number) {
    return this.performerModel.updateOne(
      { _id: id },
      {
        $inc: {
          balance: amount,
          'stats.totalTokenEarned': amount > 0 ? amount : 0,
          'stats.totalTokenSpent': amount <= 0 ? amount : 0
        }
      }
    );
  }

  public async updateBalance(id: string | ObjectId, balance) {
    await this.performerModel.updateOne({ _id: id }, {
      $set: {
        balance
      }
    });
  }

  public async updateStats(
    id: string | ObjectId,
    payload: Record<string, number>
  ) {
    return this.performerModel.updateOne({ _id: id }, { $inc: payload });
  }

  public async goLive(id: string | ObjectId) {
    return this.performerModel.updateOne({ _id: id }, { $set: { live: true } });
  }

  public async setStreamingStatus(
    id: string | ObjectId,
    streamingStatus: string
  ) {
    const performer = await this.performerModel.findOne({ _id: id });
    if (!performer) {
      return;
    }

    if (streamingStatus === performer.streamingStatus) {
      return;
    }

    const newEvent: QueueEvent = {
      channel: PERFORMER_STEAMING_STATUS_CHANNEL,
      eventName: streamingStatus,
      data: { id, oldStreamingStatus: performer.streamingStatus }
    };
    await this.queueEventService.publish(newEvent);
    await this.performerModel.updateOne(
      { _id: toObjectId(id) },
      { $set: { streamingStatus } }
    );
  }

  public async updateAvatar(
    performerId: ObjectId,
    file: FileDto
  ): Promise<FileDto> {
    const performer = await this.performerModel.findById(performerId);
    if (!performer) {
      await this.fileService.remove(file._id);
      throw new EntityNotFoundException();
    }

    const { avatarId } = performer;
    await this.performerModel.updateOne(
      { _id: performerId },
      {
        avatarId: file._id,
        avatarPath: file.path
      }
    );
    if (avatarId && avatarId !== file._id) {
      await this.fileService.remove(avatarId);
    }
    return file;
  }

  public async updateHeader(
    performerId: ObjectId,
    file: FileDto
  ): Promise<FileDto> {
    const performer = await this.performerModel.findById(performerId);
    if (!performer) {
      await this.fileService.remove(file._id);
      throw new EntityNotFoundException();
    }

    const { headerId } = performer;
    await this.performerModel.updateOne(
      { _id: performerId },
      {
        headerId: file._id,
        headerPath: file.path
      }
    );
    if (headerId && headerId !== file._id) {
      await this.fileService.remove(headerId);
    }
    return file;
  }

  public async updateDefaultPrice(
    id: ObjectId,
    payload: DefaultPricePayload
  ): Promise<any> {
    return this.performerModel.updateOne(
      { _id: id },
      {
        $set: {
          privateCallPrice: payload.privateCallPrice,
          groupCallPrice: payload.groupCallPrice
        }
      }
    );
  }

  public async updateBroadcastSetting(
    id: string | ObjectId,
    payload: PerformerBroadcastSetting
  ) {
    return this.performerModel.updateOne({ _id: id }, payload);
  }

  public selfSuspendAccount(performerId: string | ObjectId) {
    return this.performerModel.updateOne(
      { _id: performerId },
      { status: PERFORMER_STATUSES.INACTIVE }
    );
  }

  public async stats() {
    const [
      totalVideos,
      totalPhotos,
      totalGalleries,
      totalProducts,
      totalStreamTime,
      totalTokenEarned
    ] = await Promise.all([
      this.performerModel.aggregate([
        {
          $group: {
            _id: null,
            total: {
              $sum: '$stats.totalVideos'
            }
          }
        }
      ]),
      this.performerModel.aggregate([
        {
          $group: {
            _id: null,
            total: {
              $sum: '$stats.totalPhotos'
            }
          }
        }
      ]),
      this.performerModel.aggregate([
        {
          $group: {
            _id: null,
            total: {
              $sum: '$stats.totalGalleries'
            }
          }
        }
      ]),
      this.performerModel.aggregate([
        {
          $group: {
            _id: null,
            total: {
              $sum: '$stats.totalProducts'
            }
          }
        }
      ]),
      this.performerModel.aggregate([
        {
          $group: {
            _id: null,
            total: {
              $sum: '$stats.totalStreamTime'
            }
          }
        }
      ]),
      this.performerModel.aggregate([
        {
          $group: {
            _id: null,
            total: {
              $sum: '$stats.totalTokenEarned'
            }
          }
        }
      ])
    ]);

    return {
      totalVideos: (totalVideos.length && totalVideos[0].total) || 0,
      totalPhotos: (totalPhotos.length && totalPhotos[0].total) || 0,
      totalGalleries: (totalGalleries.length && totalGalleries[0].total) || 0,
      totalProducts: (totalProducts.length && totalProducts[0].total) || 0,
      totalStreamTime:
        (totalStreamTime.length && totalStreamTime[0].total) || 0,
      totalTokenEarned:
        (totalTokenEarned.length && totalTokenEarned[0].total) || 0
    };
  }

  async totalOnlineTodayStat(studioId: string | ObjectId) {
    const totalOnlineToday = await this.performerModel.aggregate([
      {
        $match: {
          studioId,
          lastStreamingTime: {
            $gt: moment()
              .set({ hour: 0, minute: 0 })
              .toDate()
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 }
        }
      }
    ]);
    return (totalOnlineToday.length && totalOnlineToday[0].total) || 0;
  }

  async totalHoursOnlineStat(studioId: string | ObjectId) {
    const totalHoursOnline = await this.performerModel.aggregate([
      { $match: { studioId } },
      {
        $group: {
          _id: null,
          total: { $sum: '$stats.totalStreamTime' }
        }
      }
    ]);
    return (totalHoursOnline.length && totalHoursOnline[0].total) || 0;
  }

  public async checkAuthDocument(req: any, user: UserDto) {
    const { query } = req;
    if (!query.documentId) {
      return false;
    }

    const file = await this.fileService.findById(query.documentId);
    if (!file || !file.refItems || !file.refItems.length) {
      return false;
    }

    if (user.roles && user.roles.includes('admin')) {
      return true;
    }

    const { itemId } = file.refItems[0];
    if (user._id.toString() !== itemId.toString()) {
      return false;
    }

    if (
      file.type &&
      [
        'performer-document',
        'company-registration-certificate',
        'performer-release-form'
      ].indexOf(file.type) !== -1
    ) {
      return true;
    }

    return false;
  }
}
