import { Injectable } from '@nestjs/common';
import data from '../constants/currency-codes';

@Injectable()
export class CurrencyCodeService {
  private currencyCodes: {[key: string] : any}[];

  public getList() {
    if (this.currencyCodes) {
      return this.currencyCodes;
    }

    this.currencyCodes = data;
    return this.currencyCodes;
  }
}
