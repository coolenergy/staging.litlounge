import { Module, forwardRef } from '@nestjs/common';
import { MongoDBModule, QueueModule } from 'src/kernel';
import { AuthModule } from '../auth/auth.module';
import { SettingModule } from '../settings/setting.module';
import { MailerService } from './services';
import { MailerController } from './controllers/mail.controller';
import { emailTemplateProviders } from './providers';

@Module({
  imports: [
    MongoDBModule,
    QueueModule.forRoot(),
    forwardRef(() => AuthModule),
    forwardRef(() => SettingModule)
  ],
  providers: [MailerService, ...emailTemplateProviders],
  controllers: [MailerController],
  exports: [MailerService]
})
export class MailerModule {}
