import {
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Controller
} from '@nestjs/common';
import { DataResponse } from 'src/kernel';
import { SettingService } from 'src/modules/settings';
import { StudioService } from 'src/modules/studio/services';
import { STUDIO_STATUES } from 'src/modules/studio/constants';
import {
  EmailOrPasswordIncorrectException,
  EmailNotVerifiedException,
  AccountInactiveException,
  AccountNotFoundxception,
  AccountPendingException
} from '../exceptions';
import { LoginByEmailPayload } from '../payloads';
import { AuthService } from '../services';

@Controller('auth/studio')
export class StudioLoginController {
  constructor(
    private readonly studoService: StudioService,
    private readonly authService: AuthService
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async loginByEmail(
    @Body() req: LoginByEmailPayload
  ): Promise<DataResponse<{ token: string }>> {
    const studio = await this.studoService.findByEmail(req.email.toLowerCase());
    if (!studio) {
      throw new EmailOrPasswordIncorrectException();
    }

    const auth = await this.authService.findBySource({
      source: 'studio',
      type: 'email',
      key: req.email.toLowerCase()
    });
    if (!auth) {
      throw new AccountNotFoundxception();
    }
    if (!this.authService.verifyPassword(req.password, auth)) {
      throw new EmailOrPasswordIncorrectException();
    }

    if (SettingService.getValueByKey('requireEmailVerification') && !studio.emailVerified) {
      throw new EmailNotVerifiedException();
    }

    if (studio.status === STUDIO_STATUES.PENDING) {
      throw new AccountPendingException();
    } else if (studio.status === STUDIO_STATUES.INACTIVE) {
      throw new AccountInactiveException();
    }

    return DataResponse.ok({
      token: this.authService.generateJWT(auth, {
        expiresIn: req.remember ? 60 * 60 * 365 : 60 * 60 * 24
      })
    });
  }
}
