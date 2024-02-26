import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { EntityNotFoundException } from 'src/kernel';
import crypto = require('crypto');

export interface CCBillSubscription {
  salt: string;
  flexformId: string;
  subAccountNumber: string;
  price: number;
  transactionId: string | ObjectId;
  subscriptionType: string;
}

export interface CCBillSinglePurchase {
  salt: string;
  flexformId: string;
  subAccountNumber: string;
  transactionId: string | ObjectId;
  price: number;
  currencyCode?: string | number;
}

@Injectable()
export class CCBillService {
  public singlePurchase(options: CCBillSinglePurchase) {
    const { transactionId } = options;
    const { salt } = options;
    const { flexformId } = options;
    const { subAccountNumber } = options;
    const initialPrice = options.price.toFixed(2);
    const currencyCode = options.currencyCode || '840';
    const initialPeriod = 30;
    if (!salt || !flexformId || !subAccountNumber || !transactionId || !initialPrice) {
      throw new EntityNotFoundException();
    }
    const formDigest = crypto
      .createHash('md5')
      .update(`${initialPrice}${initialPeriod}${currencyCode}${salt}`)
      .digest('hex');
    return {
      paymentUrl: `https://api.ccbill.com/wap-frontflex/flexforms/${flexformId}?transactionId=${transactionId}&initialPrice=${initialPrice}&initialPeriod=${initialPeriod}&clientSubacc=${subAccountNumber}&currencyCode=${currencyCode}&formDigest=${formDigest}`
    };
  }
}
