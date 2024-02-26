import {
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Controller,
  Put,
  UseGuards,
  Get,
  Res,
  Query
} from '@nestjs/common';
import { Response } from 'express';
import * as moment from 'moment';
import { UserService } from 'src/modules/user/services';
import { PerformerService } from 'src/modules/performer/services';
import { StudioService } from 'src/modules/studio/services';
import { UserDto } from 'src/modules/user/dtos';
import { DataResponse } from 'src/kernel';
import { AuthService } from '../services';
import { AuthGuard, RoleGuard } from '../guards';
import { CurrentUser, Roles } from '../decorators';
import { PasswordChangePayload, PasswordUserChangePayload, ForgotPayload } from '../payloads';
import { AuthUpdateDto } from '../dtos';
import { AccountNotFoundxception, PasswordIncorrectException } from '../exceptions';

@Controller('auth')
export class PasswordController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly performerService: PerformerService,
    private readonly studioService: StudioService
  ) {}

  @Put('users/me/password')
  @UseGuards(AuthGuard)
  public async updatePassword(
    @CurrentUser() user: UserDto,
    @Body() payload: PasswordChangePayload
  ): Promise<DataResponse<boolean>> {
    const auth = await this.authService.findBySource({
      source: payload.source || 'user',
      sourceId: user._id,
      type: payload.type || 'email'
    });
    if (!auth) {
      throw new AccountNotFoundxception();
    }
    if (!this.authService.verifyPassword(payload.prePassword, auth)) {
      throw new PasswordIncorrectException();
    }

    await this.authService.update(
      new AuthUpdateDto({
        source: payload.source || 'user',
        sourceId: user._id,
        type: payload.type || 'email',
        value: payload.password
      })
    );
    return DataResponse.ok(true);
  }

  @Put('users/password')
  @Roles('admin')
  @UseGuards(RoleGuard)
  public async updateUserPassword(
    @Body() payload: PasswordUserChangePayload,
    @CurrentUser() user: UserDto
  ): Promise<DataResponse<boolean>> {
    await this.authService.update(
      new AuthUpdateDto({
        source: payload.source || 'user',
        sourceId: payload.userId as any || user._id,
        value: payload.password
      })
    );
    return DataResponse.ok(true);
  }

  @Post('users/forgot')
  @HttpCode(HttpStatus.OK)
  public async forgotPassword(
    @Body() req: ForgotPayload
  ): Promise<DataResponse<{ success: boolean }>> {
    // TODO - should query from auth service only
    // need to fix
    let user = null;
    if (req.type === 'user') {
      user = await this.userService.findByEmail(req.email);
    }
    if (req.type === 'performer') {
      user = await this.performerService.findByEmail(req.email);
    }
    if (req.type === 'studio') {
      user = await this.studioService.findByEmail(req.email);
    }
    if (!user) {
      // dont show error, avoid email fetching

      throw new AccountNotFoundxception();
    }
    let auth = null;
    if (req.type === 'user') {
      auth = await this.authService.findBySource({
        source: 'user',
        sourceId: user._id,
        type: 'email'
      });
    }
    if (req.type === 'performer') {
      auth = await this.authService.findBySource({
        source: 'performer',
        sourceId: user._id,
        type: 'email'
      });
    }

    if (req.type === 'studio') {
      auth = await this.authService.findBySource({
        source: 'studio',
        sourceId: user._id,
        type: 'email'
      });
    }

    if (!auth) {
      throw new AccountNotFoundxception();
    }

    // TODO - should query from auth?
    await this.authService.forgot(auth, {
      _id: user._id,
      email: user.email
    });

    return DataResponse.ok({
      success: true
    });
  }

  @Get('password-change')
  public async renderUpdatePassword(
    @Res() res: Response,
    @Query('token') token: string
  ) {
    if (!token) {
      return res.render('404.html');
    }

    const forgot = await this.authService.getForgot(token);
    if (!forgot) {
      return res.render('404.html');
    }
    if (moment(forgot.createdAt).isAfter(moment().add(1, 'day'))) {
      await forgot.remove();
      return res.render('404.html');
    }

    return res.render('password-change.html');
  }

  @Post('password-change')
  public async updatePasswordForm(
    @Res() res: Response,
    @Query('token') token: string,
    @Body('password') password: string
  ) {
    if (!token || !password || password.length < 6) {
      return res.render('404.html');
    }

    const forgot = await this.authService.getForgot(token);
    if (!forgot) {
      return res.render('404.html');
    }
    // TODO - check forgot table
    await this.authService.update(
      new AuthUpdateDto({
        source: forgot.source,
        sourceId: forgot.sourceId,
        value: password
      })
    );
    await forgot.remove();
    // TODO - should remove other forgot link?
    return res.render('password-change.html', {
      done: true
    });
  }
}
