import {
  HttpCode,
  HttpStatus,
  Controller,
  Post,
  Injectable,
  ValidationPipe,
  UsePipes,
  Body,
  Request
} from '@nestjs/common';
import { DataResponse } from 'src/kernel';
import { Request as Req } from 'express';
import { RecaptchaService } from '../services';

@Injectable()
@Controller('re-captcha')
export class RecaptchaController {
  constructor(private readonly recaptchaService: RecaptchaService) {}

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() payload: { token: string },
    @Request() req: Req
  ): Promise<DataResponse<any>> {
    let ipClient = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    ipClient = Array.isArray(ipClient) ? ipClient.toString() : ipClient;
    if (ipClient.substr(0, 7) === '::ffff:') {
      ipClient = ipClient.substr(7);
    }
    const data = await this.recaptchaService.verifyGoogleRecaptcha(
      payload.token,
      ipClient
    );
    return DataResponse.ok(data);
  }
}
