/* eslint-disable no-shadow */
export const STATUES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  DONE: 'done'
};

export const SOURCE_TYPE = {
  PERFORMER: 'performer',
  STUDIO: 'studio'
};

export enum PAYMENT_ACCOUNT_TYPE {
  WIRE = 'wire',
  PAYPAL = 'paypal',
  ISSUE = 'issue_check_us',
  DEPOSIT = 'deposit',
  PAYONNEER = 'payoneer',
  BITPAY = 'bitpay'
}

export const PAYOUT_REQUEST_CHANEL = 'PAYOUT_REQUEST_CHANEL';
export enum PAYOUT_REQUEST_EVENT {
  CREATED = 'CREATED',
  UPDATED = 'CREATED'
}
