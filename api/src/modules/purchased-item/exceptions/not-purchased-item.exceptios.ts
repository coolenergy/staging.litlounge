import { HttpException } from '@nestjs/common';
import { ITEM_NOT_PURCHASED } from '../constants';

export class ItemNotPurchasedException extends HttpException {
  constructor() {
    super(ITEM_NOT_PURCHASED, 400);
  }
}
