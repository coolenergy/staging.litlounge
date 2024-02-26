import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { PageableData } from 'src/kernel';
import { PERFORMER_CATEGORY_MODEL_PROVIDER } from '../providers';
import { CategoryModel } from '../models';
import { CategorySearchRequestPayload } from '../payloads';
import { PerformerCategoryDto } from '../dtos';

@Injectable()
export class CategorySearchService {
  constructor(
    @Inject(PERFORMER_CATEGORY_MODEL_PROVIDER)
    private readonly categoryModel: Model<CategoryModel>
  ) {}

  // TODO - define category DTO
  public async search(
    req: CategorySearchRequestPayload
  ): Promise<PageableData<PerformerCategoryDto>> {
    const query = {} as any;
    if (req.q) {
      query.$or = [
        {
          name: { $regex: req.q }
        }
      ];
    }
    let sort = {};
    if (req.sort && req.sortBy) {
      sort = {
        [req.sortBy]: req.sort
      };
    }
    const [data, total] = await Promise.all([
      this.categoryModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(parseInt(req.limit as string, 10))
        .skip(parseInt(req.offset as string, 10)),
      this.categoryModel.countDocuments(query)
    ]);

    return {
      data: data.map(d => new PerformerCategoryDto(d)), // TODO - define mdoel
      total
    };
  }
}
