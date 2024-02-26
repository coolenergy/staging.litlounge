export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  CANCELLED: 'cancelled'
};

export const PAYMENT_GATEWAY = {
  CCBILL: 'ccbill',
  EPOCH: 'epoch'
}

export const PAYMENT_TYPE = {
  MONTHLY_SUBSCRIPTION: 'monthly_subscription',
  YEARLY_SUBSCRIPTION: 'yearly_subscription',
  SALE_VIDEO: 'sale_video',
  PRODUCT: 'product',
  TOKEN: 'token'
};
export const PAYMENT_TARGET_TYPE = {
  PERFORMER: 'performer',
  PRODUCT: 'product',
  VIDEO: 'video',
  TOKEN: 'token'
};

export const TRANSACTION_SUCCESS_CHANNEL = 'TRANSACTION_SUCCESS_CHANNEL';
export const ORDER_PAID_SUCCESS_CHANNEL = 'ORDER_PAID_SUCCESS_CHANNEL';
export const OVER_PRODUCT_STOCK = 'OVER_PRODUCT_STOCK';
export const DIFFERENT_PERFORMER_PRODUCT = 'DIFFERENT_PERFORMER_PRODUCT';
export const MISSING_CONFIG_PAYMENT_GATEWAY = 'MISSING_CONFIG_PAYMENT_GATEWAY';
export const ORDER_UPDATE_CHANNEL = 'ORDER_UPDATE_CHANNEL';

export const ORDER_STATUS = {
  PROCESSING: 'processing',
  SHIPPING: 'shipping',
  DELIVERED: 'delivered',
  REFUNDED: 'refunded',
  CREATED: 'created',
  PAID: 'paid'
};

export const DELIVERY_STATUS = {
  PROCESSING: 'processing',
  SHIPPING: 'shipping',
  DELIVERED: 'delivered',
  CREATED: 'created',
  REFUNDED: 'refunded'
};

export const PRODUCT_TYPE = {
  MONTHLY_SUBSCRIPTION: 'monthly_subscription',
  YEARLY_SUBSCRIPTION: 'yearly_subscription',
  DIGITAL_PRODUCT: 'digital',
  PHYSICAL_PRODUCT: 'physical',
  TOKEN: 'token'
};

