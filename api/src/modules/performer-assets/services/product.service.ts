import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import {
  EntityNotFoundException,
  QueueEventService,
  QueueEvent
} from 'src/kernel';
import { FileDto } from 'src/modules/file';
import { UserDto } from 'src/modules/user/dtos';
import { FileService } from 'src/modules/file/services';
import { PerformerService } from 'src/modules/performer/services';
import { merge, uniq } from 'lodash';
import { EVENT } from 'src/kernel/constants';
import { PaymentTokenService } from 'src/modules/purchased-item/services';
import { PurchaseItemType } from 'src/modules/purchased-item/constants';
import { PRODUCT_TYPE, PERFORMER_PRODUCT_CHANNEL } from '../constants';
import { ProductDto } from '../dtos';
import { ProductCreatePayload, ProductUpdatePayload } from '../payloads';

import {
  PhysicalProductStockException,
  InvalidFileException
} from '../exceptions';
import { ProductModel } from '../models';
import { PERFORMER_PRODUCT_MODEL_PROVIDER } from '../providers';

@Injectable()
export class ProductService {
  constructor(
    @Inject(PERFORMER_PRODUCT_MODEL_PROVIDER)
    // eslint-disable-next-line no-shadow
    private readonly ProductModel: Model<ProductModel>,
    private readonly performerService: PerformerService,
    @Inject(forwardRef(() => FileService))
    private readonly fileService: FileService,
    private readonly queueEventService: QueueEventService,
    @Inject(forwardRef(() => PaymentTokenService))
    private readonly paymentTokenService: PaymentTokenService
  ) {}

  public async create(
    payload: ProductCreatePayload,
    digitalFile: FileDto,
    imageFile: FileDto,
    creator?: UserDto
  ): Promise<ProductDto> {
    if (payload.type === PRODUCT_TYPE.DIGITAL && !digitalFile) {
      imageFile && this.fileService.remove(imageFile._id);
      throw new InvalidFileException('Missing digital file');
    }

    if (payload.type === PRODUCT_TYPE.PHYSICAL && !payload.stock) {
      throw new PhysicalProductStockException();
    }

    const product = new this.ProductModel(payload);
    if (digitalFile) product.digitalFileId = digitalFile._id;
    if (imageFile) product.imageId = imageFile._id;
    if (creator) {
      product.createdBy = creator._id;
      product.updatedBy = creator._id;
    }

    await product.save();
    await Promise.all([
      digitalFile && this.fileService.addRef(digitalFile._id, {itemId: product._id, itemType: 'digital-product'}),
      imageFile && this.fileService.addRef(imageFile._id, {itemId: product._id, itemType: 'performer-product'})
    ])

    const dto = new ProductDto(product);
    await this.queueEventService.publish(
      new QueueEvent({
        channel: PERFORMER_PRODUCT_CHANNEL,
        eventName: EVENT.CREATED,
        data: dto
      })
    );
    return dto;
  }

  public async update(
    id: string | ObjectId,
    payload: ProductUpdatePayload,
    digitalFile: FileDto,
    imageFile: FileDto,
    updater?: UserDto
  ): Promise<ProductDto> {
    const product = await this.ProductModel.findOne({ _id: id });
    if (!product) {
      throw new EntityNotFoundException();
    }
    const oldStatus = product.status;

    if (
      payload.type === PRODUCT_TYPE.DIGITAL
      && !product.digitalFileId
      && !digitalFile
    ) {
      throw new InvalidFileException('Missing digital file');
    }

    if (payload.type === PRODUCT_TYPE.PHYSICAL && !payload.stock) {
      throw new PhysicalProductStockException();
    }

    merge(product, payload);
    const deletedFileIds = [];
    if (digitalFile) {
      product.digitalFileId && deletedFileIds.push(product.digitalFileId);
      product.digitalFileId = digitalFile._id;
    }

    if (imageFile) {
      product.imageId && deletedFileIds.push(product.imageId);
      product.imageId = imageFile._id;
    }
    if (updater) product.updatedBy = updater._id;
    await product.save();

    deletedFileIds.length
      && (await Promise.all(
        deletedFileIds.map((deletedFileId) => this.fileService.remove(deletedFileId))
      ));

    const dto = new ProductDto(product);
    await this.queueEventService.publish(
      new QueueEvent({
        channel: PERFORMER_PRODUCT_CHANNEL,
        eventName: EVENT.UPDATED,
        data: {
          ...dto,
          oldStatus
        }
      })
    );
    return dto;
  }

  public async delete(id: string | ObjectId): Promise<boolean> {
    const product = await this.ProductModel.findOne({ _id: id });
    if (!product) {
      throw new EntityNotFoundException();
    }

    await product.remove();
    product.digitalFileId && await this.fileService.remove(product.digitalFileId);
    product.imageId && await this.fileService.remove(product.imageId);
    await this.queueEventService.publish(
      new QueueEvent({
        channel: PERFORMER_PRODUCT_CHANNEL,
        eventName: EVENT.DELETED,
        data: new ProductDto(product)
      })
    );
    return true;
  }

  public async getDetails(id: string | ObjectId) {
    const product = await this.ProductModel.findOne({ _id: id });
    if (!product) {
      throw new EntityNotFoundException();
    }

    const [performer, imageFile] = await Promise.all([
      this.performerService.findById(product.performerId),
      product.imageId ? this.fileService.findById(product.imageId) : null
    ]);

    const dto = new ProductDto(product);
    dto.image = imageFile ? imageFile.getUrl() : null;
    dto.performer = {
      username: performer.username
    };

    return dto;
  }

  public async performerGetDetails(id: string | ObjectId, jwToken: string) {
    const product = await this.ProductModel.findOne({ _id: id });
    if (!product) {
      throw new EntityNotFoundException();
    }

    const [performer, digitalFile, imageFile] = await Promise.all([
      this.performerService.findById(product.performerId),
      product.type === PRODUCT_TYPE.DIGITAL && product.digitalFileId
        ? this.fileService.findById(product.digitalFileId)
        : null,
      product.imageId ? this.fileService.findById(product.imageId) : null
    ]);

    const dto = new ProductDto(product);
    dto.image = imageFile ? imageFile.getUrl() : null;
    dto.digitalFile = digitalFile ? `${digitalFile.getUrl()}?productId=${product._id}&token=${jwToken}` : null;
    dto.performer = {
      username: performer.username
    };

    return dto;
  }

  public async findByIds(ids: any) {
    const productIds = uniq((ids as any).map((i) => i.toString()));

    const products = await this.ProductModel
      .find({
        _id: {
          $in: productIds
        }
      })
      .lean()
      .exec();
    return products.map((p) => new ProductDto(p));
  }

  public async findById(id: any) {
    const product = await this.ProductModel.findById(id)
    return new ProductDto(product)
  }

  public async findByPerformerIds(ids: string[] | ObjectId[]) {
      return this.ProductModel
      .find({
        performerId: {
          $in: ids
        }
      })
      .lean()
      .exec();
  }

  public async updateStock(id: string | ObjectId, num = -1) {
    return this.ProductModel.updateOne(
      { _id: id },
      { $inc: { stock: num } }
    );
  }

  public async checkAuth(req: any, user: UserDto) {
    const { query } = req;
    if (!query.productId) {
      return false
    }
    if (user.roles && user.roles.includes('admin')) {
      return true;
    }
    // check type product
    const product = await this.ProductModel.findById(query.productId);
    if (!product) return false;
    if (user._id.toString() === product.performerId.toString()) {
      return true;
    }
    if (product.type !== PRODUCT_TYPE.DIGITAL) {
      return true;
    }
    const checkBought = await this.paymentTokenService.checkBought(product._id, PurchaseItemType.PRODUCT , user);
    if (checkBought) {
      return true;
    }
    return false;
  }
}
