import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Model } from 'mongoose';
import { PageableData } from 'src/kernel';
import { PerformerService } from 'src/modules/performer/services';
import { FileService } from 'src/modules/file/services';
import {
  PURCHASE_ITEM_STATUS,
  PURCHASE_ITEM_TARGET_TYPE
} from 'src/modules/purchased-item/constants';
import { PaymentTokenService } from 'src/modules/purchased-item/services';
import { PRODUCT_TYPE } from '../constants';
import { ProductSearchRequest } from '../payloads';
import { UserDto } from '../../user/dtos';
import { ProductDto } from '../dtos';
import { ProductModel } from '../models';
import { PERFORMER_PRODUCT_MODEL_PROVIDER } from '../providers';

@Injectable()
export class ProductSearchService {
  constructor(
    @Inject(PERFORMER_PRODUCT_MODEL_PROVIDER)
    private readonly productModel: Model<ProductModel>,
    private readonly performerService: PerformerService,
    @Inject(forwardRef(() => FileService))
    private readonly fileService: FileService,
    @Inject(forwardRef(() => PaymentTokenService))
    private readonly paymentTokenService: PaymentTokenService
  ) {}

  public async adminSearch(
    req: ProductSearchRequest
  ): Promise<PageableData<ProductDto>> {
    const query = {} as any;
    if (req.q) query.name = { $regex: req.q };
    if (req.performerId) query.performerId = req.performerId;
    if (req.status) query.status = req.status;
    if (req.publish) query.publish = req.publish;

    let sort = {};
    if (req.sort && req.sortBy) {
      sort = {
        [req.sortBy]: req.sort
      };
    }
    const [data, total] = await Promise.all([
      this.productModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(parseInt(req.limit as string, 10))
        .skip(parseInt(req.offset as string, 10)),
      this.productModel.countDocuments(query)
    ]);

    const performerIds = data.map(d => d.performerId);
    const imageIds = data.map(d => d.imageId);
    const [performers, images] = await Promise.all([
      performerIds.length ? this.performerService.findByIds(performerIds) : [],
      imageIds.length ? this.fileService.findByIds(imageIds) : []
    ]);
    const products = data.map(product => {
      // TODO - should get picture (thumbnail if have?)
      const performer = performers.find(
        p => p._id.toString() === product.performerId.toString()
      );
      const file =
        images.length > 0 && product.imageId
          ? images.find(f => f._id.toString() === product.imageId.toString())
          : null;
      return {
        ...product,
        performer: performer && { username: performer.username },
        image: file && file.getUrl()
      };
    });

    return {
      data: products.map(v => new ProductDto(v)),
      total
    };
  }

  public async performerSearch(
    req: ProductSearchRequest,
    user: UserDto,
    jwToken: string
  ): Promise<PageableData<ProductDto>> {
    const query = {} as any;
    if (req.q) query.name = { $regex: req.q };
    query.performerId = user._id;
    if (req.status) query.status = req.status;
    if (req.publish) query.publish = req.publish;

    let sort = {};
    if (req.sort && req.sortBy) {
      sort = {
        [req.sortBy]: req.sort
      };
    }
    const [data, total] = await Promise.all([
      this.productModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(parseInt(req.limit as string, 10))
        .skip(parseInt(req.offset as string, 10)),
      this.productModel.countDocuments(query)
    ]);

    const performerIds = data.map(d => d.performerId);
    const imageIds = data.map(d => d.imageId);
    const digitalFileIds = data
      .filter(d => d.type === PRODUCT_TYPE.DIGITAL)
      .map(d => d.digitalFileId);
    const [performers, images, digitalFiles] = await Promise.all([
      performerIds.length ? this.performerService.findByIds(performerIds) : [],
      imageIds.length ? this.fileService.findByIds(imageIds) : [],
      digitalFileIds.length ? this.fileService.findByIds(digitalFileIds) : []
    ]);
    const products = data.map(product => {
      const { performerId, imageId, digitalFileId, type } = product;
      const performer =
        performerId &&
        performers.find(p => p._id.toString() === performerId.toString());
      const file =
        images.length > 0 && imageId
          ? images.find(f => f._id.toString() === imageId.toString())
          : null;
      const digitalFile =
        digitalFiles.length > 0 &&
        type === PRODUCT_TYPE.DIGITAL &&
        digitalFileId
          ? digitalFiles.find(
              f => f._id.toString() === digitalFileId.toString()
            )
          : null;
      return {
        ...product,
        performer: performer && { username: performer.username },
        image: file && file.getUrl(),
        digitalFile:
          digitalFile &&
          `${digitalFile.getUrl()}?productId=${product._id}&token=${jwToken}`
      };
    });

    return {
      data: products.map(v => new ProductDto(v)),
      total
    };
  }

  public async userSearch(
    req: ProductSearchRequest,
    user?: UserDto
  ): Promise<PageableData<ProductDto>> {
    const query = {} as any;
    if (req.q) query.name = { $regex: req.q };
    if (req.performerId) query.performerId = req.performerId;
    if (req.productId) query._id = { $ne: req.productId };
    if (req.type) query.type = req.type;

    query.status = 'active';
    let sort = {};
    if (req.sort && req.sortBy) {
      sort = {
        [req.sortBy]: req.sort
      };
    }
    const [data, total] = await Promise.all([
      this.productModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(parseInt(req.limit as string, 10))
        .skip(parseInt(req.offset as string, 10)),
      this.productModel.countDocuments(query)
    ]);

    const performerIds = data.map(d => d.performerId);
    const imageIds = data.map(d => d.imageId);
    const productIds = data.map(d => d._id);
    const [performers, images, payments] = await Promise.all([
      performerIds.length ? this.performerService.findByIds(performerIds) : [],
      imageIds.length ? this.fileService.findByIds(imageIds) : [],
      user
        ? this.paymentTokenService.findByQuery({
            target: PURCHASE_ITEM_TARGET_TYPE.PRODUCT,
            sourceId: user._id,
            targetId: { $in: productIds },
            status: PURCHASE_ITEM_STATUS.SUCCESS
          })
        : []
    ]);
    const products = data.map(product => {
      const performer = performers.find(
        p => p._id.toString() === product.performerId.toString()
      );
      const purchased =
        user &&
        payments.find(p => p.targetId.toString() === product._id.toString());
      const file =
        images.length > 0 &&
        product.imageId &&
        images.find(f => f._id.toString() === product.imageId.toString());
      return {
        ...product,
        performer: performer && {
          username: performer.username
        },
        image: file && file.getUrl(),
        isBought: !!purchased
      };
    });

    return {
      data: products.map(v => new ProductDto(v)),
      total
    };
  }
}
