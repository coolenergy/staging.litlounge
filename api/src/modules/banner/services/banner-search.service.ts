import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Model } from 'mongoose';
import { PageableData } from 'src/kernel';
import { FileService } from 'src/modules/file/services';
import { BANNER_PROVIDER } from '../providers';
import { BannerModel } from '../models';
import { BannerDto } from '../dtos';
import { BannerSearchRequest } from '../payloads';

@Injectable()
export class BannerSearchService {
  constructor(
    @Inject(BANNER_PROVIDER)
    private readonly bannerModel: Model<BannerModel>,
    @Inject(forwardRef(() => FileService))
    private readonly fileService: FileService
  ) {}

  public async search(
    req: BannerSearchRequest
  ): Promise<PageableData<BannerDto>> {
    const query = {} as any;
    if (req.q) query.title = { $regex: req.q };
    if (req.status) query.status = req.status;
    let sort = {};
    if (req.sort && req.sortBy) {
      sort = {
        [req.sortBy]: req.sort
      };
    }
    const [data, total] = await Promise.all([
      this.bannerModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(parseInt(req.limit as string, 10))
        .skip(parseInt(req.offset as string, 10)),
      this.bannerModel.countDocuments(query)
    ]);

    const fileIds = data.map((d) => d.fileId);
    const banners = data.map((v) => new BannerDto(v));
    const [files] = await Promise.all([
      fileIds.length ? this.fileService.findByIds(fileIds) : []
    ]);
    banners.forEach((v) => {
      // TODO - should get picture (thumbnail if have?)
      const file = v.fileId ? files.find((f) => f._id.toString() === v.fileId.toString()) : null;
      if (file) {
        // eslint-disable-next-line no-param-reassign
        v.photo = {
          thumbnails: file.getThumbnails(),
          url: file.getUrl(),
          width: file.width,
          height: file.height,
          mimeType: file.mimeType
        };
      }
    });

    return {
      data: banners,
      total
    };
  }
}
