import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { StringHelper, EntityNotFoundException } from 'src/kernel';
import { MailerService } from 'src/modules/mailer';
import { ConfigService } from 'nestjs-config';
import { UserService } from 'src/modules/user/services';
import { PerformerService } from 'src/modules/performer/services';
import { StudioService } from 'src/modules/studio/services';
import { VERIFICATION_MODEL_PROVIDER } from '../providers/auth.provider';
import { VerificationModel } from '../models';

@Injectable()
export class VerificationService {
  constructor(
    @Inject(VERIFICATION_MODEL_PROVIDER)
    // eslint-disable-next-line no-shadow
    private readonly VerificationModel: Model<VerificationModel>,
    private readonly mailService: MailerService,
    private readonly config: ConfigService,
    private readonly userService: UserService,
    private readonly performerService: PerformerService,
    private readonly studioService: StudioService
  ) {}

  async sendVerificationEmail(sourceId: string | ObjectId, email: string, sourceType: string, options?: any): Promise<void> {
    let verification = await this.VerificationModel.findOne({
      sourceId,
      value: email
    });
    if (!verification) {
      verification = new this.VerificationModel();
    }

    const token = StringHelper.randomString(15);
    verification.set('sourceId', sourceId);
    verification.set('sourceType', sourceType);
    verification.set('value', email);
    verification.set('token', token);
    await verification.save();
    const verificationLink = new URL(
      `auth/email-verification?token=${token}`,
      this.config.get('app.baseUrl')
    ).href;
    await this.mailService.send({
      to: email,
      subject: 'Verify your email address',
      data: {
        verificationLink,
        ...(options?.data || {})
      },
      template: options?.template || 'email-verification'
    });
  }

  async verifyEmail(token: string): Promise<void> {
    const verification = await this.VerificationModel.findOne({
      token
    });
    if (!verification) {
      throw new EntityNotFoundException();
    }
    verification.verified = true;
    await verification.save();
    switch (verification.sourceType) {
      case 'user':
        await this.userService.updateVerificationStatus(verification.sourceId);
        break;
      case 'performer':
        await this.performerService.updateVerificationStatus(verification.sourceId);
        break;
      case 'studio':
        await this.studioService.updateVerificationStatus(verification.sourceId);
        break;
      default:
        break;
    }
  }
}
