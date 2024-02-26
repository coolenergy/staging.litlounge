import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { EntityNotFoundException } from 'src/kernel';
import { merge } from 'lodash';
import { TOKEN_PACKAGE_MODEL_PROVIDER } from '../providers';
import { TokenPackageModel } from '../models';
import {
  TokenPackageCreatePayload,
  TokenPackageUpdatePayload
} from '../payloads';
import { TokenPackageDto } from '../dtos';

@Injectable()
export class TokenPackageService {
  constructor(
    @Inject(TOKEN_PACKAGE_MODEL_PROVIDER)
    private readonly tokenPackageModel: Model<TokenPackageModel>
  ) {}

  public async find(params: any): Promise<TokenPackageModel[]> {
    return this.tokenPackageModel.find(params);
  }

  public async findById(id: string | ObjectId): Promise<TokenPackageModel> {
    const query = { _id: id };
    return this.tokenPackageModel.findOne(query);
  }

  public async create(
    payload: TokenPackageCreatePayload
  ): Promise<TokenPackageModel> {
    const data = {
      ...payload
    };

    const tokenPackage = await this.tokenPackageModel.create(data);
    return tokenPackage;
  }

  public async update(
    id: string | ObjectId,
    payload: TokenPackageUpdatePayload
  ): Promise<TokenPackageModel> {
    const tokenPackage = await this.findById(id);
    if (!tokenPackage) {
      throw new NotFoundException();
    }
    // TODO - check logical here
    merge(tokenPackage, payload);
    tokenPackage.set('updatedAt', new Date());
    await tokenPackage.save();
    return tokenPackage;
  }

  public async delete(id: string | ObjectId): Promise<boolean> {
    const tokenPackage = await this.findById(id);
    if (!tokenPackage) {
      throw new NotFoundException();
    }

    await tokenPackage.remove();
    return true;
  }

  public async getPublic(id: string): Promise<TokenPackageDto> {
    const tokenPackage = await this.tokenPackageModel.findById(id);
    if (!tokenPackage) {
      throw new EntityNotFoundException();
    }

    const dto = new TokenPackageDto(tokenPackage);
    return dto;
  }
}
