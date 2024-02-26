import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  Query
} from '@nestjs/common';
import { DataResponse } from 'src/kernel';
import { Response } from 'express';
import { SettingService } from 'src/modules/settings';
import { SETTING_KEYS } from 'src/modules/settings/constants';
import { AccountNotFoundxception } from '../exceptions';
import { ResendVerificationEmailPaload } from '../payloads';
import { AuthService, VerificationService } from '../services';

@Controller('verification')
export class VerifycationController {
  constructor(
    private readonly verificationService: VerificationService,
    private readonly authService: AuthService,
    private readonly settingService: SettingService
  ) {}

  @Post('/resend-verification-email')
  @HttpCode(HttpStatus.OK)
  async resendVerificationEmail(
    @Body() payload: ResendVerificationEmailPaload
  ) {
    const { email, source } = payload;
    const auth = await this.authService.findBySource({
      source,
      type: 'email',
      key: email
    });
    if (!auth) {
      throw new AccountNotFoundxception();
    }

    await this.verificationService.sendVerificationEmail(
      auth.sourceId,
      email,
      source
    );
    return DataResponse.ok({ success: true });
  }

  @Get('email-verification')
  public async verifyEmail(
    @Res() res: Response,
    @Query('token') token: string
  ) {
    if (!token) {
      return res.render('404.html');
    }

    await this.verificationService.verifyEmail(token);
    const [emailVerificationSuccessUrl, userUrl] = await Promise.all([
      this.settingService.getKeyValue(SETTING_KEYS.EMAIL_VERIFICATION_SUCCESS_URL),
      this.settingService.getKeyValue(SETTING_KEYS.USER_URL)
    ]);
    return res.redirect(emailVerificationSuccessUrl || userUrl || process.env.USER_URL);
  }
}
