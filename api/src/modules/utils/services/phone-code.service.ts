import { Injectable } from '@nestjs/common';
import { uniqBy } from 'lodash';
import { PHONE_CODE } from '../constants';

@Injectable()
export class PhoneCodeService {
  private phoneCodeList;

  public getList() {
    if (this.phoneCodeList) {
      return this.phoneCodeList;
    }

    this.phoneCodeList = uniqBy(PHONE_CODE, (c) => c.dialCode).map((c) => ({
      name: c.name,
      code: c.dialCode
    }));
    return this.phoneCodeList;
  }
}
