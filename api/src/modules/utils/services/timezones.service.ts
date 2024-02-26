import { Injectable } from '@nestjs/common';
import { TIMEZONES } from '../constants';

@Injectable()
export class TimeZonesService {
  private timezones;

  public getList() {
    if (this.timezones) {
      return this.timezones;
    }

    this.timezones = TIMEZONES.map((zone) => zone.split('|')[0]);
    return this.timezones;
  }
}
