import { Module, forwardRef } from '@nestjs/common';
import { MailerModule } from 'src/modules/mailer/mailer.module';
import { ContactController } from './controllers';
import { ContactService } from './services';

@Module({
  imports: [
    forwardRef(() => MailerModule)
  ],
  providers: [ContactService],
  controllers: [ContactController],
  exports: []
})
export class ContactModule {}
