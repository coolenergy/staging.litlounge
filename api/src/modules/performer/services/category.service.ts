import {
  Injectable, Inject, ConflictException
} from '@nestjs/common';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { StringHelper, EntityNotFoundException } from 'src/kernel';
import { UserDto } from 'src/modules/user/dtos';
import { CategoryModel } from '../models';
import { PERFORMER_CATEGORY_MODEL_PROVIDER } from '../providers';
import { CategoryCreatePayload, CategoryUpdatePayload } from '../payloads';

@Injectable()
export class CategoryService {
  constructor(
    @Inject(PERFORMER_CATEGORY_MODEL_PROVIDER)
    private readonly categoryModel: Model<CategoryModel>
  ) { }

  public async find(params: any): Promise<CategoryModel[]> {
    return this.categoryModel.find(params);
  }

  public async findByIdOrSlug(id: string | ObjectId): Promise<CategoryModel> {
    const query = id instanceof ObjectId || StringHelper.isObjectId(id) ? { _id: id } : { slug: id };
    return this.categoryModel.findOne(query);
  }

  public async generateSlug(name: string, id?: string | ObjectId) {
    // consider if need unique slug with type
    const slug = StringHelper.createAlias(name);
    const query = { slug } as any;
    if (id) {
      query._id = { $ne: id };
    }
    const count = await this.categoryModel.countDocuments(query);
    if (!count) {
      return slug;
    }

    return this.generateSlug(`${slug}1`, id);
  }

  public async create(payload: CategoryCreatePayload, user?: UserDto): Promise<CategoryModel> {
    const data = {
      ...payload,
      updatedAt: new Date(),
      createdAt: new Date()
    } as any;
    if (user) {
      data.createdBy = user._id;
      data.updatedBy = user._id;
    }
    const orderingCheck = await this.categoryModel.countDocuments({
      ordering: payload.ordering
    });
    if (orderingCheck) {
      throw new ConflictException('Ordering is duplicated');
    }
    data.slug = await this.generateSlug(payload.slug || payload.name);

    const category = await this.categoryModel.create(data);
    // TODO - fire event?
    return category;
  }

  public async update(id: string | ObjectId, payload: CategoryUpdatePayload, user?: UserDto): Promise<CategoryModel> {
    const category = await this.findByIdOrSlug(id);
    if (!category) {
      throw new EntityNotFoundException();
    }

    const orderingCheck = await this.categoryModel.countDocuments({
      ordering: payload.ordering,
      _id: { $ne: category._id }
    });
    if (orderingCheck) {
      throw new ConflictException('Ordering is duplicated');
    }

    category.name = payload.name;
    category.ordering = payload.ordering;
    category.description = payload.description;
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
    // TODO - fire event for category, then related data will be deleted?
    // remove sub categories

    // TODO - log user activity
  }
}
