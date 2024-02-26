import { HttpStatus } from '@nestjs/common';
import { RuntimeException } from 'src/kernel';

export class PhysicalProductStockException extends RuntimeException {
  constructor() {
    super(
      'Physical product stock must not be empty.',
      'PHYSICAL_PRODUCT_STOCK_EMPTY',
      HttpStatus.BAD_REQUEST
    );
  }
}
