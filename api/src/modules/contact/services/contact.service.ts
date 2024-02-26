import { Injectable } from '@nestjs/common';
import { SettingService } from 'src/modules/settings';
import { MailerService } from 'src/modules/mailer/services/mailer.service';
import { SETTING_KEYS } from 'src/modules/settings/constants';
import { ContactPayload } from '../payloads';

@Injectable()
export class ContactService {
  constructor(private readonly mailService: MailerService) {}

  public async contact(data: ContactPayload) {
    const adminEmail =
      SettingService.getValueByKey(SETTING_KEYS.ADMIN_EMAIL) || `admin@${process.env.DOMAIN}`;
    await this.mailService.send({
      subject: 'New contact',
      to: adminEmail,
      data,
      template: 'contact'
    });
    return true;
  }
}
