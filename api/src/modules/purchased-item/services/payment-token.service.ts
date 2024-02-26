import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { UserDto } from 'src/modules/user/dtos';
import { ObjectId } from 'mongodb';
import { PurchaseItemModel } from '../models/purchase-item.model';
import { PURCHASE_ITEM_MODEL_PROVIDER } from '../providers';
import {
  PURCHASE_ITEM_TYPE,
  PURCHASE_ITEM_STATUS,
  PurchaseItemType
} from '../constants';

@Injectable()
export class PaymentTokenService {
  constructor(
    @Inject(PURCHASE_ITEM_MODEL_PROVIDER)
    private readonly PaymentTokenModel: Model<PurchaseItemModel>
  ) {}

  public async checkBoughtVideo(
    id: string | ObjectId,
    user: UserDto
  ): Promise<boolean> {
    if (!user) return false;
    const transaction = await this.PaymentTokenModel.findOne({
      targetId: id,
      sourceId: user._id,
      type: PURCHASE_ITEM_TYPE.SALE_VIDEO,
      status: PURCHASE_ITEM_STATUS.SUCCESS
    });
    return !!transaction;
  }

  public async checkBought(
    id: string | ObjectId,
    type: PurchaseItemType,
    user: UserDto
  ) {
    if (!user) return false;

    const transaction = await this.PaymentTokenModel.findOne({
      type,
      targetId: id,
      sourceId: user._id,
      status: PURCHASE_ITEM_STATUS.SUCCESS
    });
    return !!transaction;
  }

  public async findByQuery(query: any) {
    const data = await this.PaymentTokenModel.find(query);
    return data;
  }
}
