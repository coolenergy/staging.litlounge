/* eslint-disable no-shadow */
export const PURCHASE_ITEM_TYPE = {
  SALE_VIDEO: 'sale_video',
  PRODUCT: 'sale_product',
  PHOTO: 'sale_photo',
  TIP: 'tip',
  PRIVATE: 'stream_private',
  GROUP: 'stream_group'
};

export enum PurchaseItemType {
  SALE_VIDEO = 'sale_video',
  PRODUCT = 'sale_product',
  PHOTO = 'sale_photo',
  TIP = 'tip',
  PRIVATE = 'stream_private',
  GROUP = 'stream_group'
}

export const PURCHASE_ITEM_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  CANCELLED: 'cancelled'
};

export const PURCHASE_ITEM_TARGET_TYPE = {
  PRODUCT: 'product',
  VIDEO: 'video',
  PHOTO: 'photo',
  TIP: 'tip',
  PRIVATE: 'stream_private',
  GROUP: 'stream_group'
};

export const ORDER_TOKEN_STATUS = {
  PROCESSING: 'processing',
  SHIPPING: 'shipping',
  DELIVERED: 'delivered',
  REFUNDED: 'refunded'
};

export enum PURCHASE_ITEM_TARGET_SOURCE {
  USER = 'user'
}

export const PURCHASED_ITEM_SUCCESS_CHANNEL = 'PURCHASED_ITEM_SUCCESS_CHANNEL';

export const OVER_PRODUCT_STOCK = 'OVER_PRODUCT_STOCK';
export const ITEM_NOT_PURCHASED = 'ITEM_NOT_PURCHASED';
export const ITEM_NOT_FOR_SALE = 'ITEM_NOT_FOR_SALE';
