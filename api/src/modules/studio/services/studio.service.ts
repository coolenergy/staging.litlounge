import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PerformerService } from 'src/modules/performer/services';
import { Model } from 'mongoose';
import { UsernameExistedException } from 'src/modules/user/exceptions';
import { EmailExistedException } from 'src/modules/performer/exceptions';
import { ObjectId } from 'mongodb';
import {
  EntityNotFoundException,
  QueueEvent,
  QueueEventService
} from 'src/kernel';
import { FileService } from 'src/modules/file/services';
import { FileDto } from 'src/modules/file';
import { StudioDto } from '../dtos';
import { StudioUpdatePayload } from '../payloads';
import { STUDIO_MODEL_PROVIDER } from '../providers';
import { StudioModel } from '../models';
import {
  STUDIO_CHANNEL,
  STUDIO_EVENT_NAME,
  STUDIO_STATUES
} from '../constants';

@Injectable()
export class StudioService {
  constructor(
    private readonly performerService: PerformerService,
    @Inject(STUDIO_MODEL_PROVIDER)
    private readonly studioModel: Model<StudioModel>,
    @Inject(forwardRef(() => FileService))
    private readonly fileService: FileService,
    private readonly queueEventService: QueueEventService
  ) {}

  public async findById(id: string | ObjectId) {
    const studio = await this.studioModel.findById(id);
    return new StudioDto(studio);
  }

  public async find(condition = {}) {
    return this.studioModel.find(condition);
  }

  public async findByIds(ids: string[] | ObjectId[]) {
    const studios = await this.studioModel
      .find({
        _id: {
          $in: ids
        }
      })
      .lean()
      .exec();
    return studios.map((studio) => new StudioDto(studio));
  }

  public async findByEmail(email: string) {
    return this.studioModel.findOne({ email: email.toLowerCase() });
  }

  public async register(payload): Promise<StudioDto> {
    const data = {
      ...payload,
      roles: payload.roles || ['studio'],
      updatedAt: new Date(),
      createdAt: new Date()
    } as any;
    const userNameCheck = await this.studioModel.countDocuments({
      username: payload.username.trim()
    });
    if (userNameCheck) {
      throw new UsernameExistedException();
    }

    const emailCheck = await this.studioModel.countDocuments({
      email: payload.email.toLowerCase().trim()
    });
    if (emailCheck) {
      throw new EmailExistedException();
    }

    if (payload.documentVerificationId) {
      const file = await this.fileService.findById(
        payload.documentVerificationId
      );
      if (!file) {
        throw new EntityNotFoundException(
          'Verification Document is not found!'
        );
      }
    }

    const studio = await this.studioModel.create(data);
    if (payload.documentVerificationId) {
      await this.fileService.addRef(payload.documentVerificationId, {
        itemId: studio._id,
        itemType: 'studio-document'
      });
    }

    const event: QueueEvent = {
      channel: STUDIO_CHANNEL,
      eventName: STUDIO_EVENT_NAME.CREATED,
      data: studio
    };
    await this.queueEventService.publish(event);
    return new StudioDto(studio);
  }

  public async update(
    id: string | ObjectId,
    payload: Partial<StudioUpdatePayload>
  ): Promise<any> {
    const data = {
      ...payload
    };
    if (payload.documentVerificationId) {
      const file = await this.fileService.findById(
        payload.documentVerificationId
      );
      if (!file) {
        throw new EntityNotFoundException(
          'Verification Document is not found!'
        );
      }
    }

    return this.studioModel.updateOne({ _id: id }, data, { new: true });
  }

  public async updateStats(
    id: string | ObjectId,
    payload: Record<string, number>
  ) {
    return this.studioModel.updateOne({ _id: id }, { $inc: payload });
  }

  public async uploadDocument(studio: StudioDto, fileId: ObjectId) {
    await this.studioModel.updateOne(
      { _id: studio._id },
      { $set: { documentVerificationId: fileId } }
    );

    await Promise.all([
      this.fileService.addRef(fileId, {
        itemId: studio._id,
        itemType: 'studio-document'
      }),
      studio.documentVerificationId &&
        this.fileService.remove(studio.documentVerificationId)
    ]);
    return true;
  }

  public async search(req) {
    const query = {} as any;
    if (req.q) {
      if (!query.$and) {
        query.$and = [];
      }
      query.$and.push({
        $or: [
          {
            name: { $regex: req.q }
          },
          {
            username: { $regex: req.q }
          },
          {
            email: { $regex: req.q }
          }
        ]
      });
    }
    if (req.status) {
      if (req.status === STUDIO_STATUES.PENDING) {
        if (!query.$and) {
          query.$and = [];
        }
        query.$and.push({
          $or: [{ status: req.status }, { emailVerified: false }]
        });
      } else {
        query.status = req.status;
      }
    }

    let sort = {};
    if (req.sort && req.sortBy) {
      sort = {
        [req.sortBy]: req.sort
      };
    }

    const [data, total] = await Promise.all([
      this.studioModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(parseInt(req.limit as string, 10))
        .skip(parseInt(req.offset as string, 10)),
      this.studioModel.countDocuments(query)
    ]);

    return { data, total };
  }

  public async stats(id: string | ObjectId) {
    const results = await this.findById(id);
    if (!results) {
      throw new EntityNotFoundException();
    }

    const studio = new StudioDto(results);
    const { stats, _id } = studio;
    const [totalOnlineToday, totalHoursOnline] = await Promise.all([
      this.performerService.totalOnlineTodayStat(_id),
      this.performerService.totalHoursOnlineStat(_id)
    ]);

    return { ...stats, totalOnlineToday, totalHoursOnline };
  }

  public async detail(id: string | ObjectId, jwtToken: string) {
    const result = await this.findById(id);
    const studio = new StudioDto(result).toResponse(true);
    if (studio.documentVerificationId) {
      const documentVerification = await this.fileService.findById(
        studio.documentVerificationId
      );

      if (documentVerification) {
        const documentVerificationFileURL = jwtToken
          ? `${FileDto.getPublicUrl(documentVerification.path)}?documentId=${
              documentVerification._id
            }&token=${jwtToken}`
          : FileDto.getPublicUrl(documentVerification.path);
        studio.documentVerificationFile = documentVerificationFileURL;
        studio.documentVerification = {
          _id: documentVerification._id,
          name: documentVerification.name,
          url: documentVerificationFileURL,
          mimeType: documentVerification.mimeType
        };
      }
    }

    return studio;
  }

  public async increaseBalance(id: string | ObjectId, amount: number) {
    return this.studioModel.updateOne(
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

  public async updateBalance(id: string | ObjectId, balance: number) {
    return this.studioModel.updateOne(
      { _id: id },
      {
        balance
      }
    );
  }

  public async updateVerificationStatus(
    userId: string | ObjectId
  ): Promise<any> {
    return this.studioModel.updateOne(
      {
        _id: userId
      },
      { emailVerified: true },
      { new: true }
    );
  }
}
