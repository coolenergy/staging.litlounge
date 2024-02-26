import { Post, HttpCode, HttpStatus, Body, Controller } from '@nestjs/common';
import { DataResponse, EntityNotFoundException } from 'src/kernel';
import { PerformerService } from 'src/modules/performer/services';
import { PERFORMER_STATUSES } from 'src/modules/performer/constants';
import { SettingService } from 'src/modules/settings';
import {
  EmailOrPasswordIncorrectException,
  EmailNotVerifiedException,
  UsernameOrPasswordIncorrectException,
  AccountInactiveException,
  AccountNotFoundxception,
  AccountPendingException
} from '../exceptions';
import { LoginByUsernamePayload, LoginByEmailPayload } from '../payloads';
import { AuthService } from '../services';

@Controller('auth')
export class PerformerLoginController {
  constructor(
    private readonly performerService: PerformerService,
    private readonly authService: AuthService
  ) {}

  @Post('performers/login')
  @HttpCode(HttpStatus.OK)
  public async loginByUsername(
    @Body() req: LoginByUsernamePayload
  ): Promise<DataResponse<{ token: string }>> {
    const auth = await this.authService.findBySource({
      source: 'performer',
      type: 'username',
      key: req.username.toLowerCase()
    });
    if (!auth) {
      throw new AccountNotFoundxception();
    }
    if (!this.authService.verifyPassword(req.password, auth)) {
      throw new UsernameOrPasswordIncorrectException();
    }

    const performer = await this.performerService.findById(auth.sourceId);
    if (!performer) {
      throw new EntityNotFoundException();
    }

    if (
      SettingService.getValueByKey('requireEmailVerification') &&
      !performer.emailVerified
    ) {
      throw new EmailNotVerifiedException();
    }

    if (performer.status === PERFORMER_STATUSES.PENDING) {
      throw new AccountPendingException();
    } else if (performer.status === PERFORMER_STATUSES.INACTIVE) {
      throw new AccountInactiveException();
    }

    return DataResponse.ok({
      token: this.authService.generateJWT(auth, {
        expiresIn: req.remember ? 60 * 60 * 365 : 60 * 60 * 24
      })
    });
  }

  @Post('performers/login/email')
  @HttpCode(HttpStatus.OK)
  public async loginByEmail(
    @Body() req: LoginByEmailPayload
  ): Promise<DataResponse<{ token: string }>> {
    const auth = await this.authService.findBySource({
      source: 'performer',
      type: 'email',
      key: req.email.toLowerCase()
    });
    if (!auth) {
      throw new AccountNotFoundxception();
    }
    if (!this.authService.verifyPassword(req.password, auth)) {
      throw new EmailOrPasswordIncorrectException();
    }

    const performer = await this.performerService.findById(auth.sourceId);
    if (!performer) {
      throw new EntityNotFoundException();
    }

    if (
      SettingService.getValueByKey('requireEmailVerification') &&
      !performer.emailVerified
    ) {
      throw new EmailNotVerifiedException();
    }

    if (performer.status === PERFORMER_STATUSES.PENDING) {
      throw new AccountPendingException();
    } else if (performer.status === PERFORMER_STATUSES.INACTIVE) {
      throw new AccountInactiveException();
    }

    return DataResponse.ok({
      token: this.authService.generateJWT(auth, {
        expiresIn: req.remember ? 60 * 60 * 365 : 60 * 60 * 24
      })
    });
  }
}
