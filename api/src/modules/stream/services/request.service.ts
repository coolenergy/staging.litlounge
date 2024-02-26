import { Injectable, HttpService } from '@nestjs/common';
import { DataResponse, MissingServerConfig } from 'src/kernel';
import { pick } from 'lodash';
import { SettingService } from 'src/modules/settings';
import { SETTING_KEYS } from 'src/modules/settings/constants';
import { TokenCreatePayload, TokenSearchPayload } from '../payloads';

@Injectable()
export class RequestService {
  constructor(
    private httpService: HttpService,
    private readonly settingService: SettingService
  ) {}

  init(): Promise<string[]> {
    return Promise.all([
      this.settingService.getKeyValue(SETTING_KEYS.ANT_MEDIA_API_ENDPOINT),
      this.settingService.getKeyValue(SETTING_KEYS.ANT_MEDIA_APPNAME)
    ]);
  }

  public async create(data: any): Promise<DataResponse<any>> {
    const [apiEndpoint, appName] = await this.init();
    if (!apiEndpoint || !appName) {
      throw new MissingServerConfig();
    }

    return new Promise(resolve => {
      this.httpService
        .post(`${apiEndpoint}/${appName}/rest/v2/broadcasts/create`, data)
        .subscribe(
          resp => {
            resolve(DataResponse.ok(resp.data));
          },
          ({ response: resp, code }) => {
            if (code) {
              
              resolve(DataResponse.error(new Error('Bad Request'), code));
              return;
            }

            if (resp?.status && [400, 200].includes(resp.status)) {
              resolve(DataResponse.ok(resp.data));
              return;
            }

            resolve(
              DataResponse.error(
                new Error('Stream Server Error'),
                pick(resp, ['statusText', 'status', 'data'])
              )
            );
          }
        );
    });
  }

  public async generateOneTimeToken(
    id: string,
    payload: TokenCreatePayload
  ): Promise<DataResponse<any>> {
    const [apiEndpoint, appName] = await this.init();
    if (!apiEndpoint || !appName) {
      throw new MissingServerConfig();
    }

    return new Promise(resolve => {
      this.httpService
        .get(`${apiEndpoint}/${appName}/rest/v2/broadcasts/${id}/token`, {
          params: payload
        })
        .subscribe(
          resp => {
            resolve(DataResponse.ok(resp.data));
          },
          ({ response: resp, code }) => {
            if (code) {
              resolve(DataResponse.error(new Error('Bad Request'), code));
              return;
            }

            resolve(
              DataResponse.error(
                new Error('Stream Server Error'),
                pick(resp, ['statusText', 'status', 'data'])
              )
            );
          }
        );
    });
  }

  public async removeAllTokenRelateStreamId(
    id: string
  ): Promise<DataResponse<any>> {
    const [apiEndpoint, appName] = await this.init();
    if (!apiEndpoint || !appName) {
      throw new MissingServerConfig();
    }

    return new Promise(resolve => {
      this.httpService
        .delete(`${apiEndpoint}/${appName}/rest/v2/broadcasts/${id}/tokens`)
        .subscribe(
          resp => {
            resolve(DataResponse.ok(resp.data));
          },
          ({ response: resp, code }) => {
            if (code) {
              resolve(DataResponse.error(new Error('Bad Request'), code));
              return;
            }

            resolve(
              DataResponse.error(
                new Error('Stream Server Error'),
                pick(resp, ['statusText', 'status', 'data'])
              )
            );
          }
        );
    });
  }

  public async getAllTokenRelateStreamId(
    id: string,
    payload: TokenSearchPayload
  ): Promise<DataResponse<any>> {
    const [apiEndpoint, appName] = await this.init();
    if (!apiEndpoint || !appName) {
      throw new MissingServerConfig();
    }

    const { offset, size } = payload;
    return new Promise(resolve => {
      this.httpService
        .delete(
          `${apiEndpoint}/${appName}/rest/v2/broadcasts/${id}/tokens/${offset}/${size}`
        )
        .subscribe(
          resp => {
            resolve(DataResponse.ok(resp.data));
          },
          ({ response: resp, code }) => {
            if (code) {
              resolve(DataResponse.error(new Error('Bad Request'), code));
              return;
            }

            resolve(
              DataResponse.error(
                new Error('Stream Server Error'),
                pick(resp, ['statusText', 'status', 'data'])
              )
            );
          }
        );
    });
  }

  public async getBroadcast(id: string): Promise<DataResponse<any>> {
    const [apiEndpoint, appName] = await this.init();
    if (!apiEndpoint || !appName) {
      throw new MissingServerConfig();
    }

    return new Promise(resolve => {
      this.httpService
        .get(`${apiEndpoint}/${appName}/rest/v2/broadcasts/${id}`)
        .subscribe(
          resp => {
            resolve(DataResponse.ok(resp.data));
          },
          ({ response: resp, code }) => {
            if (code) {
              resolve(DataResponse.error(new Error('Bad Request'), code));
              return;
            }

            resolve(
              DataResponse.error(
                new Error('Stream Server Error'),
                pick(resp, ['statusText', 'status', 'data'])
              )
            );
          }
        );
    });
  }
}
