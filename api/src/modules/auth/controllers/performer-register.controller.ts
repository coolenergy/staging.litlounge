import {
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Controller,
  UseInterceptors,
  HttpException
} from '@nestjs/common';
import { DataResponse, getConfig } from 'src/kernel';
import { SettingService } from 'src/modules/settings';
import { MultiFileUploadInterceptor, FilesUploaded, FileDto } from 'src/modules/file';
import { FileService } from 'src/modules/file/services';
import { PerformerService } from 'src/modules/performer/services';
import { PERFORMER_STATUSES } from 'src/modules/performer/constants';
import { omit } from 'lodash';
import { EXCLUDE_FIELDS } from 'src/kernel/constants';
import { PerformerRegisterPayload } from '../payloads';
import { VerificationService, AuthService } from '../services';

@Controller('auth/performers')
export class PerformerRegisterController {
  constructor(
    private readonly performerService: PerformerService,
    private readonly authService: AuthService,
    private readonly verificationService: VerificationService,
    private readonly fileService: FileService
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    // TODO - check and support multiple files!!!
    MultiFileUploadInterceptor(
      [
        {
          type: 'performer-document',
          fieldName: 'idVerification',
          options: {
            destination: getConfig('file').documentDir
          }
        },
        {
          type: 'performer-document',
          fieldName: 'documentVerification',
          options: {
            destination: getConfig('file').documentDir
          }
        }
      ],
      {}
    )
  )
  async performerRegister(
    @Body() payload: PerformerRegisterPayload,
    @FilesUploaded() files: Record<string, FileDto>
  ): Promise<DataResponse<{ message: string }>> {
    try {
      if (!files.idVerification || !files.documentVerification) {
        throw new HttpException('Missing document!', 400);
      }

      // TODO - define key for performer separately
      const requireEmailVerification = SettingService.getValueByKey(
        'requireEmailVerification'
      );

      const performer = await this.performerService.register({
        ...omit(payload, EXCLUDE_FIELDS),
        avatarId: null, // file avatar
        headerId: null, // file header
        emailVerified: !requireEmailVerification,
        status: requireEmailVerification ? PERFORMER_STATUSES.PENDING : PERFORMER_STATUSES.ACTIVE,
        idVerificationId: files.idVerification._id as any,
        documentVerificationId: files.documentVerification._id as any
      });

      // create auth, email notification, etc...
      await Promise.all([
        this.authService.create({
          source: 'performer',
          sourceId: performer._id,
          type: 'email',
          key: performer.email.toLowerCase().trim(),
          value: payload.password
        }),
        this.authService.create({
          source: 'performer',
          sourceId: performer._id,
          type: 'username',
          key: performer.username.trim(),
          value: payload.password
        })
      ]);

      // notify to verify email address
      // TODO - check and verify me!
      requireEmailVerification
      && (await this.verificationService.sendVerificationEmail(
        performer._id,
        performer.email,
        'performer'
      ));

      return DataResponse.ok({
        message: requireEmailVerification ? 'We have sent an email to verify your email, please check your inbox.' : 'Your register has been successfully.'
      });
    } catch (e) {
      files.idVerification && await this.fileService.remove(files.idVerification._id);
      files.documentVerification && await this.fileService.remove(files.documentVerification._id);

      throw e;
    }
  }
}
