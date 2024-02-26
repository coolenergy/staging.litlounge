import { Injectable } from '@nestjs/common';
import { LANGUAGES } from '../constants';

@Injectable()
export class LanguageService {
  private languageList;

  public getList() {
    if (this.languageList) {
      return this.languageList;
    }

    this.languageList = LANGUAGES.map((c) => ({
      name: c.name,
      code: c.code
    }));
    return this.languageList;
  }
}
