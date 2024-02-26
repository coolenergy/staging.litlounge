/* eslint-disable no-shadow */
import { Inject, Injectable } from '@nestjs/common';
import {
  PageableData,
  EntityNotFoundException,
  QueueEventService,
  QueueEvent
} from 'src/kernel';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { UserDto } from 'src/modules/user/dtos';
import { PerformerDto } from 'src/modules/performer/dtos';
import { EVENT } from 'src/kernel/constants';
import { FavouriteModel } from '../models';
import { FAVOURITE_MODEL_PROVIDER } from '../providers';
import { PerformerService } from '../../performer/services';
import { FavouriteSearchPayload } from '../payload';
import { FavouriteDto } from '../dtos';
import { PERFORMER_FAVORITE_CHANNEL } from '../constants';

@Injectable()
export class FavouriteService {
  constructor(
    @Inject(FAVOURITE_MODEL_PROVIDER)
    private readonly FavouriteModel: Model<FavouriteModel>,
    private readonly performerService: PerformerService,
    private readonly queueEventService: QueueEventService
  ) {}

  async find(params) {
    const favorites = await this.FavouriteModel.find(params);
    return favorites;
  }

  async findOne(params) {
    const favorite = await this.FavouriteModel.findOne(params);
    return favorite;
  }

  async findById(id: string): Promise<FavouriteModel> {
    const favourite = await this.FavouriteModel.findOne({ _id: id });
    return favourite;
  }

  async doLike(favoriteId: string, ownerId: ObjectId): Promise<any> {
    const performer = await this.performerService.findById(favoriteId);
    if (!performer) {
      throw new EntityNotFoundException();
    }

    let favourite = await this.FavouriteModel.findOne({ favoriteId, ownerId });
    if (!favourite) {
      favourite = new this.FavouriteModel();
      favourite.ownerId = ownerId;
      favourite.favoriteId = performer._id;
      await favourite.save();
    }
    this.queueEventService.publish(
      new QueueEvent({
        channel: PERFORMER_FAVORITE_CHANNEL,
        eventName: EVENT.CREATED,
        data: {
          performerId: favoriteId
        }
      })
    );
    return { success: true };
  }

  async doUnlike(favoriteId: string, ownerId: ObjectId): Promise<any> {
    const performer = await this.performerService.findById(favoriteId);
    if (!performer) {
      throw new EntityNotFoundException();
    }

    const favourite = await this.FavouriteModel.findOne({
      favoriteId,
      ownerId
    });
    if (!favourite) {
      throw new EntityNotFoundException();
    }

    await favourite.remove();
    this.queueEventService.publish(
      new QueueEvent({
        channel: PERFORMER_FAVORITE_CHANNEL,
        eventName: EVENT.DELETED,
        data: {
          performerId: favoriteId
        }
      })
    );
    return { success: true };
  }

  async userSearch(
    req: FavouriteSearchPayload,
    currentUser: UserDto
  ): Promise<PageableData<FavouriteDto>> {
    const query = {} as any;
    query.ownerId = currentUser._id;
    let sort = {};
    if (req.sort && req.sortBy) {
      sort = {
        [req.sortBy]: req.sort
      };
    }
    const [data, total] = await Promise.all([
      this.FavouriteModel.find(query)
        .lean()
        .sort(sort)
        .limit(parseInt(req.limit as string, 10))
        .skip(parseInt(req.offset as string, 10)),
      this.FavouriteModel.count(query)
    ]);

    const performerIds = data.map(d => d.favoriteId);
    const performers = performerIds.length
      ? await this.performerService.findByIds(performerIds)
      : [];

    const favourites = data.map(favourite => {
      const performer =
        favourite.favoriteId &&
        performers.find(
          p => p._id.toString() === favourite.favoriteId.toString()
        );

        if(performer) {
          performer.isFavorite = true;
        }

      return {
        ...favourite,
        performer: performer && performer.toSearchResponse()
      };
    });

    return {
      total,
      data: favourites.map(d => new FavouriteDto(d))
    };
  }

  async performerSearch(
    req: FavouriteSearchPayload,
    currentUser: PerformerDto
  ): Promise<PageableData<FavouriteDto>> {
    const query = {} as any;
    query.favoriteId = currentUser._id;
    let sort = {};
    if (req.sort && req.sortBy) {
      sort = {
        [req.sortBy]: req.sort
      };
    }
    const [data, total] = await Promise.all([
      this.FavouriteModel.find(query)
        .lean()
        .sort(sort)
        .limit(parseInt(req.limit as string, 10))
        .skip(parseInt(req.offset as string, 10)),
      this.FavouriteModel.count(query)
    ]);

    const userIds = data.map(d => d.ownerId);
    const users = userIds.length
      ? await this.performerService.findByIds(userIds)
      : [];

    const favourites = data.map(favourite => {
      const user =
        favourite.ownerId &&
        users.find(
          u => u._id.toString() === favourite.ownerId.toString()
        );

      if (user) {
        return {
          ...favourite,
          user: user.toResponse()
        };
      }

      return favourite;
    });

    return {
      total,
      data: favourites.map(d => new FavouriteDto(d))
    };
  }

  async getAllFollowerIdsByPerformerId(performerId: string | ObjectId) {
    const favourites = await this.FavouriteModel.find({ favoriteId: performerId});
    return favourites.map(f => f.ownerId);
  }
}
