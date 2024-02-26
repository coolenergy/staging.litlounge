import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { merge } from 'lodash';
import { MENU_PROVIDER } from '../providers';
import { MenuModel } from '../models';
import { MenuDto } from '../dtos';
import { MenuCreatePayload, MenuUpdatePayload } from '../payloads';

@Injectable()
export class MenuService {
  constructor(
    @Inject(MENU_PROVIDER)
    private readonly Menu: Model<MenuModel>
  ) {}

  public async checkOrdering(ordering: number, id?: string | ObjectId) {
    const query = { ordering } as any;
    if (id) {
      query._id = { $ne: id };
    }
    const count = await this.Menu.countDocuments(query);
    if (!count) {
      return ordering;
    }
    return this.checkOrdering(ordering + 1, id);
  }

  public async findById(id: string | ObjectId): Promise<MenuModel> {
    const query = { _id: id };
    const menu = await this.Menu.findOne(query);
    if (!menu) return null;
    return menu;
  }

  public async create(payload: MenuCreatePayload): Promise<MenuDto> {
    const data = {
      ...payload,
      updatedAt: new Date(),
      createdAt: new Date()
    };
    data.ordering = await this.checkOrdering(payload.ordering || 0);
    const menu = await this.Menu.create(data);
    return new MenuDto(menu);
  }

  public async update(
    id: string | ObjectId,
    payload: MenuUpdatePayload
  ): Promise<MenuDto> {
    const menu = await this.findById(id);
    if (!menu) {
      throw new NotFoundException();
    }

    const data = {
      ...payload,
      updatedAt: new Date()
    } as any;
    data.ordering = await this.checkOrdering(payload.ordering || 0, menu._id);
    merge(menu, data);
    await menu.save();
    return menu;
  }

  public async delete(id: string | ObjectId | MenuModel): Promise<boolean> {
    const menu = id instanceof MenuModel ? id : await this.findById(id);
    if (!menu) {
      throw new NotFoundException('Menu not found');
    }
    await this.Menu.deleteOne({ _id: id });
    return true;
  }
}
