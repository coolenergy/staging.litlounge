import { HttpException } from '@nestjs/common';
import { OVER_PRODUCT_STOCK } from '../constants';

export class OverProductStockException extends HttpException {
  constructor() {
    super(OVER_PRODUCT_STOCK, 400);
  }
}
