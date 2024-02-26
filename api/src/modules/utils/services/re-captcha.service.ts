import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';
import { SettingService } from 'src/modules/settings';
import { SETTING_KEYS } from 'src/modules/settings/constants';

const ERROR_CODE = {
  'missing-input-secret': 'The secret parameter is missing.',
  'invalid-input-secret': 'The secret parameter is invalid or malformed.',
  'missing-input-response': 'The response parameter is missing.',
  'invalid-input-response': 'The response parameter is invalid or malformed.',
  'bad-request': 'The request is invalid or malformed..',
  'timeout-or-duplicate':
    'The response is no longer valid: either is too old or has been used previously.'
};
@Injectable()
export class RecaptchaService {
  constructor() {}

  public async verifyGoogleRecaptcha(
    token: string,
    remoteip: string
  ): Promise<any> {
    try {
      const googleReCaptchaSecretKey = await SettingService.getValueByKey(
        SETTING_KEYS.GOOGLE_RECAPTCHA_SECRET_KEY
      );
      if (!googleReCaptchaSecretKey) {
        throw new HttpException(
          {
            'error-codes': ['missing-input-secret']
          },
          HttpStatus.BAD_REQUEST
        );
      }

      const resp = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify?secret=${googleReCaptchaSecretKey}&response=${token}&remoteip=${remoteip}`
      );
      if (resp.data.success) {
        return {
          ...resp.data,
          remoteip
        };
      }

      throw new HttpException(resp.data, HttpStatus.BAD_REQUEST);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
      const { response, status } = error;
      if (response && response['error-codes']) {
        throw new HttpException(
          {
            data: error,
            message: response['error-codes'][0]
              ? ERROR_CODE[response['error-codes'][0]]
              : ERROR_CODE['bad-request']
          },
          status || HttpStatus.BAD_REQUEST
        );
      }

      throw new HttpException(
        ERROR_CODE['bad-request'],
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
