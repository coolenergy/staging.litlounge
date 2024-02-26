import {
  Post, HttpCode, HttpStatus, Body, Controller
} from '@nestjs/common';
import { UserService } from 'src/modules/user/services';
import { DataResponse } from 'src/kernel';
import { SettingService } from 'src/modules/settings';
import { STATUS_PENDING, STATUS_INACTIVE } from 'src/modules/user/constants';
import { LoginByEmailPayload, LoginByUsernamePayload } from '../payloads';
import { AuthService } from '../services';
import {
  EmailOrPasswordIncorrectException,
  EmailNotVerifiedException,
  UsernameOrPasswordIncorrectException,
  AccountInactiveException,
  AccountNotFoundxception,
  AccountPendingException
} from '../exceptions';

@Controller('auth')
export class LoginController {
  constructor(private readonly userService: UserService, private readonly authService: AuthService) {}

  @Post('users/login')
  @HttpCode(HttpStatus.OK)
  public async loginByEmail(@Body() req: LoginByEmailPayload): Promise<DataResponse<{ token: string }>> {
    const user = await this.userService.findByEmail(req.email.toLowerCase());
    if (!user) {
      throw new EmailOrPasswordIncorrectException();
    }

    const auth = await this.authService.findBySource({
      source: 'user',
      sourceId: user._id,
      type: 'email'
    });
    if (!auth) {
      throw new AccountNotFoundxception();
    }
    if (!this.authService.verifyPassword(req.password, auth)) {
      throw new EmailOrPasswordIncorrectException();
    }

    if (SettingService.getValueByKey('requireEmailVerification') && !user.emailVerified) {
      throw new EmailNotVerifiedException();
    }

    if (user.status === STATUS_PENDING) {
      throw new AccountPendingException();
    } else if (user.status === STATUS_INACTIVE) {
      throw new AccountInactiveException();
    }

    return DataResponse.ok({
      token: this.authService.generateJWT(auth, {
        expiresIn: req.remember ? 60 * 60 * 365 : 60 * 60 * 24
      })
    });
  }

  @Post('users/login/username')
  @HttpCode(HttpStatus.OK)
  public async loginByUsername(@Body() req: LoginByUsernamePayload): Promise<DataResponse<{ token: string }>> {
    const user = await this.userService.findByUsername(req.username.toLowerCase());
    if (!user) {
      throw new UsernameOrPasswordIncorrectException();
    }
    const auth = await this.authService.findBySource({
      source: 'user',
      sourceId: user._id,
      type: 'username'
    });
    if (!auth) {
      throw new AccountNotFoundxception();
    }
    if (!this.authService.verifyPassword(req.password, auth)) {
      throw new UsernameOrPasswordIncorrectException();
    }

    if (SettingService.getValueByKey('requireEmailVerification') && !user.emailVerified) {
      throw new EmailNotVerifiedException();
    }

    if (user.status === STATUS_PENDING) {
      throw new AccountPendingException();
    } else if (user.status === STATUS_INACTIVE) {
      throw new AccountInactiveException();
    }

    return DataResponse.ok({
      token: this.authService.generateJWT(auth, {
        expiresIn: req.remember ? 60 * 60 * 365 : 60 * 60 * 24
      })
    });
  }
}
