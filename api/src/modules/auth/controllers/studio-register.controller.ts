import {
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Controller,
  UseInterceptors
} from '@nestjs/common';
import { DataResponse, getConfig } from 'src/kernel';
import { SettingService } from 'src/modules/settings';
import { StudioService } from 'src/modules/studio/services';
import { StudioCreatePayload } from 'src/modules/studio/payloads';
import { FileDto, FileUploaded, FileUploadInterceptor } from 'src/modules/file';
import { SETTING_KEYS } from 'src/modules/settings/constants';
import { omit } from 'lodash';
import { EXCLUDE_FIELDS, STATUS } from 'src/kernel/constants';
import { DocumentMissiongException } from '../exceptions';
import { VerificationService, AuthService } from '../services';

@Controller('auth/studio')
export class StudioRegisterController {
  constructor(
    private readonly studioService: StudioService,
    private readonly authService: AuthService,
    private readonly verificationService: VerificationService
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileUploadInterceptor('document-verification', 'documentVerification', {
      destination: getConfig('file').documentDir
    })
  )
  async register(
    @Body() payload: StudioCreatePayload,
    @FileUploaded() file: FileDto
  ): Promise<DataResponse<{ message: string }>> {
    if (file.type !== 'document-verification') {
      throw new DocumentMissiongException();
    }

    const requireEmailVerification = SettingService.getValueByKey(
      SETTING_KEYS.REQUIRE_EMAIL_VERIFICATION
    );

    const studio = await this.studioService.register(
      {
        ...omit(payload, EXCLUDE_FIELDS),
        documentVerificationId: file._id,
        emailVerified: !requireEmailVerification,
        status: requireEmailVerification ? STATUS.PENDING : STATUS.ACTIVE
      }
    );

    // create auth, email notification, etc...
    await Promise.all([
      this.authService.create({
        source: 'studio',
        sourceId: studio._id,
        type: 'email',
        key: studio.email,
        value: payload.password
      }),
      this.authService.create({
        source: 'studio',
        sourceId: studio._id,
        type: 'username',
        key: studio.username,
        value: payload.password
      })
    ]);

    // notify to verify email address
    // TODO - check and verify me!
    requireEmailVerification &&
      (await this.verificationService.sendVerificationEmail(
        studio._id,
        studio.email,
        'studio'
      ));

    return DataResponse.ok({
      message: requireEmailVerification
        ? 'We have sent an email to verify your email, please check your inbox.'
        : 'Your register has been successfully.'
    });
  }
}
