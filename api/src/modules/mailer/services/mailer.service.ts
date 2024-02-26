import { HttpException, Inject, Injectable } from '@nestjs/common';
import { EntityNotFoundException, QueueService, StringHelper } from 'src/kernel';
import { createTransport } from 'nodemailer';
import { SettingService } from 'src/modules/settings';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { render } from 'mustache';
import { SETTING_KEYS } from 'src/modules/settings/constants';
import { Model } from 'mongoose';
import { IMail } from '../interfaces';
import { EmailTemplateUpdatePayload } from '../payloads/email-template-update.payload';
import { EmailTemplateModel } from '../models/email-template.model';
import { EMAIL_TEMPLATE_PROVIDER } from '../providers';

const TEMPLATE_DIR = join(process.env.TEMPLATE_DIR, 'emails');
@Injectable()
export class MailerService {
  private mailerQueue;

  constructor(
    private readonly queueService: QueueService,
    private readonly settingService: SettingService,
    @Inject(EMAIL_TEMPLATE_PROVIDER)
    private readonly EmailTemplate: Model<EmailTemplateModel>
  ) {
    this.init();
  }

  private async init() {
    this.mailerQueue = this.queueService.createInstance('MAILER_QUEUE');
    this.mailerQueue.process(
      process.env.MAILER_CONCURRENCY || 1,
      this.process.bind(this)
    );
  }

  private async getTransport() {
    const [host, port, user, pass, secure] = await Promise.all([
      this.settingService.getKeyValue(SETTING_KEYS.SMTP_TRANSPORTER_HOST),
      this.settingService.getKeyValue(SETTING_KEYS.SMTP_TRANSPORTER_PORT),
      this.settingService.getKeyValue(SETTING_KEYS.SMTP_TRANSPORTER_USERNAME),
      this.settingService.getKeyValue(SETTING_KEYS.SMTP_TRANSPORTER_PASSWORD),
      this.settingService.getKeyValue(SETTING_KEYS.SMTP_TRANSPORTER_SECURE)
    ]);
    if (!host || !port || !user || !pass) {
      throw new HttpException('Invalid confirguration!', 400);
    }

    return createTransport({ host, port: parseInt(port, 10), secure: !!secure, auth: { user, pass }, tls: { rejectUnauthorized: false }});
  }

  private async getTemplate(template = 'default', isLayout = false): Promise<string> {
    const layout = await this.EmailTemplate.findOne({
      key: isLayout ? `layouts/${template}` : template
    });
    if (layout) return layout.content;

    // eslint-disable-next-line no-param-reassign
    template = StringHelper.getFileName(template, true);

    if (template === 'blank') {
      return isLayout ? '[[BODY]]' : '';
    }

    const layoutFile = isLayout ? join(TEMPLATE_DIR, 'layouts', `${template}.html`) : join(TEMPLATE_DIR, `${template}.html`);
    if (!existsSync(layoutFile)) {
      return isLayout ? '[[BODY]]' : '';
    }

    return readFileSync(layoutFile, 'utf8');
  }

  private async process(job: any, done: Function) {
    try {
      const transport = await this.getTransport();
      const data = job.data as IMail;
      let { html } = data;
      let layout = '[[BODY]]';
      let subject = '';
      if (!html && data.template) {
        // html = await this.getTemplate(data.template);
        const template = await this.EmailTemplate.findOne({
          key: {
            $in: [
              data.template,
              `${data.template}.html`
            ]
          }
        });
        if (!template) {
          html = '';
          layout = await this.getTemplate(data.layout, true);
        } else {
          html = template.content;
          subject = template.subject;
          layout = template.layout ? await this.getTemplate(template.layout, true) : '[[BODY]]';
        }
      }
      const settings = SettingService._settingCache;
      const body = html ? render(html, {
        ...data.data,
        settings: settings ? { ...settings } : {}
      }) : '';
      const subjectHtml = render(subject || data.subject, {
        ...data.data,
        settings: settings ? { ...settings } : {}
      }) || subject || data.subject;
      const siteName = await this.settingService.getKeyValue(SETTING_KEYS.SITE_NAME);
      const logoUrl = await this.settingService.getKeyValue(SETTING_KEYS.LOGO_URL);

      html = render(layout, {
        siteName: siteName || process.env.SITENAME || process.env.DOMAIN,
        logoUrl,
        subject: subjectHtml
      }).replace('[[BODY]]', body);
      const senderConfig = await this.settingService.getKeyValue(SETTING_KEYS.SENDER_EMAIL);
      const senderEmail = senderConfig || process.env.SENDER_EMAIL;
      await transport.sendMail({
        from: senderEmail,
        to: Array.isArray(data.to) ? data.to.join(',') : data.to,
        cc: Array.isArray(data.cc) ? data.cc.join(',') : data.cc,
        bcc: Array.isArray(data.cc) ? data.cc.join(',') : data.cc,
        subject: subjectHtml,
        html
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('mail_error', e);
    } finally {
      done();
    }
  }

  public async send(email: IMail) {
    await this.mailerQueue.createJob(email).save();
  }

  public async verify() {
    try {
      const transport = await this.getTransport();
      const siteName = await this.settingService.getKeyValue(SETTING_KEYS.SITE_NAME) || process.env.DOMAIN;
      const senderEmail = await this.settingService.getKeyValue(SETTING_KEYS.SENDER_EMAIL) || process.env.SENDER_EMAIL;
      const adminEmail = await this.settingService.getKeyValue(SETTING_KEYS.ADMIN_EMAIL) || process.env.ADMIN_EMAIL;
      return await transport.sendMail({
        from: senderEmail,
        to: adminEmail,
        subject: `Test email ${siteName}`,
        html: 'Hello, this is test email!'
      });
    } catch (e) {
      return {
        hasError: true,
        error: e
      };
    }
  }

  public async getAllTemplates() {
    return this.EmailTemplate.find();
  }

  public async findOne(id: string) {
    return this.EmailTemplate.findById(id);
  }

  public async updateTemplate(id: string, payload: EmailTemplateUpdatePayload) {
    const template = await this.EmailTemplate.findById(id);
    if (!template) throw new EntityNotFoundException();

    template.subject = payload.subject;
    template.content = payload.content;
    template.layout = payload.layout;
    return template.save();
  }
}
