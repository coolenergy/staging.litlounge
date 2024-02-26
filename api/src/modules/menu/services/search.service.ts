import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { PageableData } from 'src/kernel';
import { MENU_PROVIDER } from '../providers';
import { MenuModel } from '../models';
import { MenuSearchRequestPayload } from '../payloads';
import { MenuDto } from '../dtos';

@Injectable()
export class MenuSearchService {
  constructor(
    @Inject(MENU_PROVIDER)
    private readonly menuModel: Model<MenuModel>
  ) {}

  // TODO - define category DTO
  public async search(
    req: MenuSearchRequestPayload
  ): Promise<PageableData<MenuDto>> {
    const query = {} as any;
    if (req.q) {
      query.$or = [
        {
          title: { $regex: req.q }
        }
      ];
    }
    if (req.section) {
      query.section = req.section;
    }
    let sort = {};
    if (req.sort && req.sortBy) {
      sort = {
        [req.sortBy]: req.sort
      };
    }
    const [data, total] = await Promise.all([
      this.menuModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(parseInt(req.limit as string, 10))
        .skip(parseInt(req.offset as string, 10)),
      this.menuModel.countDocuments(query)
    ]);

    return {
      data: data.map((item) => new MenuDto(item)), // TODO - define mdoel
      total
    };
  }

  public async userSearch(
    req: MenuSearchRequestPayload
  ): Promise<PageableData<MenuDto>> {
    const query = {} as any;
    query.public = true;
    if (req.section) {
      query.section = req.section;
    }
    let sort = {};
    if (req.sort && req.sortBy) {
      sort = {
        [req.sortBy]: req.sort
      };
    }
    const [data, total] = await Promise.all([
      this.menuModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(parseInt(req.limit as string, 10))
        .skip(parseInt(req.offset as string, 10)),
      this.menuModel.countDocuments(query)
    ]);

    return {
      data: data.map((item) => new MenuDto(item)), // TODO - define mdoel
      total
    };
  }
}
