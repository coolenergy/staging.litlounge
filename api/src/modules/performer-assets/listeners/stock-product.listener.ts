import { Injectable } from '@nestjs/common';
import { QueueEventService, QueueEvent } from 'src/kernel';
import { PURCHASED_ITEM_SUCCESS_CHANNEL } from 'src/modules/purchased-item/constants';
import { EVENT } from 'src/kernel/constants';
import { PURCHASE_ITEM_TYPE } from '../../purchased-item/constants';
import { ProductService } from '../services';
import { PRODUCT_TYPE } from '../constants';

const UPDATE_STOCK_CHANNEL = 'UPDATE_STOCK_CHANNEL';

@Injectable()
export class StockProductListener {
  constructor(
    private readonly queueEventService: QueueEventService,
    private readonly productService: ProductService
  ) {
    this.queueEventService.subscribe(
      PURCHASED_ITEM_SUCCESS_CHANNEL,
      UPDATE_STOCK_CHANNEL,
      this.handleStockProducts.bind(this)
    );
  }

  public async handleStockProducts(event: QueueEvent) {
    const transaction = event.data;
    if (![EVENT.CREATED].includes(event.eventName) || transaction?.type !== PURCHASE_ITEM_TYPE.PRODUCT) {
      return;
    }

    const product = await this.productService.findById(transaction.targetId);
    if (product?.type !== PRODUCT_TYPE.PHYSICAL) return;
    await this.productService.updateStock(transaction.targetId, -1);
    // TODO - fix for digital product link
  }
}
