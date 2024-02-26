import { Connection } from 'mongoose';
import { MONGO_DB_PROVIDER } from 'src/kernel';
import { EmailTemplateSchema } from '../schemas/email-template.schema';

export const EMAIL_TEMPLATE_PROVIDER = 'EMAIL_TEMPLATE_PROVIDER';

export const emailTemplateProviders = [
  {
    provide: EMAIL_TEMPLATE_PROVIDER,
    useFactory: (connection: Connection) => connection.model('EmailTemplate', EmailTemplateSchema),
    inject: [MONGO_DB_PROVIDER]
  }
];
