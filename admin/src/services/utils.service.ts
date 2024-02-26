import { APIRequest, IResponse } from './api-request';
import { ICountry, ILangguges, IPhoneCodes } from 'src/interfaces';

export class UtilsService extends APIRequest {
  countriesList(): Promise<IResponse<ICountry>> {
    return this.get('/countries/list');
  }
  languagesList(): Promise<IResponse<ILangguges>> {
    return this.get('/languages/list');
  }
  phoneCodesList(): Promise<IResponse<IPhoneCodes>> {
    return this.get('/phone-codes/list');
  }
  statistics(): Promise<IResponse<any>> {
    return this.get('/statistics/admin');
  }
}

export const utilsService = new UtilsService();
