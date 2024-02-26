import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import {
  StringHelper, EntityNotFoundException, QueueEventService, QueueEvent
} from 'src/kernel';
import { UserDto } from 'src/modules/user/dtos';
import { CategoryModel } from '../models';
import { POST_CATEGORY_MODEL_PROVIDER } from '../providers';
import { CategoryCreatePayload, CategoryUpdatePayload } from '../payloads';
import { POST_CATEGORY_CHANNEL, CATEGORY_EVENTS } from '../constants';

@Injectable()
export class CategoryService {
  constructor(
    @Inject(POST_CATEGORY_MODEL_PROVIDER)
    private readonly categoryModel: Model<CategoryModel>,
    private readonly queueEventService: QueueEventService
  ) { }

  public async find(params: any): Promise<CategoryModel[]> {
    return this.categoryModel.find(params);
  }

  public async findByIdOrSlug(id: string | ObjectId): Promise<CategoryModel> {
    const query = id instanceof ObjectId || StringHelper.isObjectId(id)
      ? { _id: id }
      : { slug: id };
    return this.categoryModel.findOne(query);
  }

  public async generateSlug(type: string, title: string, id?: string | ObjectId) {
    // consider if need unique slug with post type
    const slug = StringHelper.createAlias(title);
    const query = { slug, type } as any;
    if (id) {
      query._id = { $ne: id };
    }
    const count = await this.categoryModel.countDocuments(query);
    if (!count) {
      return slug;
    }

    return this.generateSlug(type, `${slug}1`, id);
  }

  public async create(
    payload: CategoryCreatePayload,
    user?: UserDto
  ): Promise<CategoryModel> {
    const data = {
      ...payload,
      updatedAt: new Date(),
      createdAt: new Date()
    } as any;
    if (user) {
      data.createdBy = user._id;
      data.updatedBy = user._id;
    }

    if (payload.parentId) {
      const parent = await this.categoryModel.findOne({ _id: payload.parentId });
      if (!parent) {
        throw new EntityNotFoundException('Parent category not found!');
      }
    }

    data.slug = await this.generateSlug(payload.type, payload.slug || payload.title);

    const category = await this.categoryModel.create(data);
    // TODO - fire event?
    return category;
  }

  public async update(id: string | ObjectId, payload: CategoryUpdatePayload, user?: UserDto): Promise<CategoryModel> {
    const category = await this.findByIdOrSlug(id);
    if (!category) {
      throw new EntityNotFoundException();
    }

    category.title = payload.title;
    category.description = payload.description;
    if (payload.parentId && category.parentId && payload.parentId.toString() !== category.parentId.toString()) {
      const parent = await this.categoryModel.findOne({ _id: payload.parentId });
      if (!parent) {
        throw new EntityNotFoundException('Parent category not found!');
      }
      // TODO - check for the tree
    }
    category.parentId = payload.parentId || null;
    if (user) {
      category.updatedBy = user._id;
    }
    await category.save();
    // TODO - emit event for category update
    return category;
  }

  public async delete(id: string | ObjectId | CategoryModel): Promise<void> {
    const category = id instanceof CategoryModel ? id : await this.findByIdOrSlug(id);
    if (!category) {
      // should log?
      throw new EntityNotFoundException();
    }
    await this.categoryModel.deleteOne({ _id: id });
    await this.queueEventService.publish(new QueueEvent({
      channel: POST_CATEGORY_CHANNEL,
      eventName: CATEGORY_EVENTS.DELETED,
      data: category.toObject()
    }));
    // TODO - fire event for category, then related data will be deleted?
    // Remove sub categories
    if (category.parentId) {
      const children = await this.categoryModel.find({ parentId: category._id });
      await Promise.all(children.map((c) => this.delete(c)));
    }
  }
}
