import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { PageableData } from 'src/kernel';
import { TOKEN_PACKAGE_MODEL_PROVIDER } from '../providers';
import { TokenPackageModel } from '../models';
import { TokenPackageSearchPayload } from '../payloads';

@Injectable()
export class TokenPackageSearchService {
  constructor(
    @Inject(TOKEN_PACKAGE_MODEL_PROVIDER)
    private readonly tokenPackageModel: Model<TokenPackageModel>
  ) {}

  public async search(req: TokenPackageSearchPayload): Promise<PageableData<TokenPackageModel>> {
    const query = {} as any;
    if (req.q) {
      query.$or = [
        {
          name: { $regex: req.q }
        }
      ];
    }
    if (req.isActive) query.isActive = req.isActive;
    const sort = {
      [req.sortBy || 'updatedAt']: req.sort
    };
    const [data, total] = await Promise.all([
      this.tokenPackageModel
        .find(query)
        .sort(sort)
        .limit(parseInt(req.limit as string, 10))
        .skip(parseInt(req.offset as string, 10)),
      this.tokenPackageModel.countDocuments(query)
    ]);

    return {
      data,
      total
    };
  }

  public async userSearch(req: TokenPackageSearchPayload): Promise<PageableData<TokenPackageModel>> {
    const query = {} as any;
    if (req.q) {
      query.$or = [
        {
          name: { $regex: req.q }
        }
      ];
    }
    query.isActive = true;
    const sort = {
      [req.sortBy || 'ordering']: (req.sort || 1)
    };
    const [data, total] = await Promise.all([
      this.tokenPackageModel
        .find(query)
        .sort(sort)
        .limit(parseInt(req.limit as string, 10))
        .skip(parseInt(req.offset as string, 10)),
      this.tokenPackageModel.countDocuments(query)
    ]);

    return {
      data,
      total
    };
  }
}
