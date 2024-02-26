import { Module, forwardRef } from '@nestjs/common';
import { MongoDBModule, QueueModule } from 'src/kernel';
import { RefundRequestUpdateListener } from 'src/modules/refund-request/listeners';
import { AuthModule } from '../auth/auth.module';
import { refundRequestProviders } from './providers/refund-request.provider';
import { RefundRequestService } from './services/refund-request.service';
import { RefundRequestController } from './controllers/refund-request.controller';
import { UserModule } from '../user/user.module';
import { PerformerModule } from '../performer/performer.module';
import { PerformerAssetsModule } from '../performer-assets/performer-assets.module';
import { MailerModule } from '../mailer/mailer.module';
import { SettingModule } from '../settings/setting.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [
    MongoDBModule,
    QueueModule.forRoot(),
    // inject user module because we request guard from auth, need to check and fix dependencies if not needed later
    UserModule,
    forwardRef(() => AuthModule),
    forwardRef(() => PerformerModule),
    forwardRef(() => PerformerAssetsModule),
    forwardRef(() => MailerModule),
    forwardRef(() => SettingModule),
    forwardRef(() => PaymentModule)
  ],
  providers: [
    ...refundRequestProviders,
    RefundRequestUpdateListener,
    RefundRequestService
  ],
  controllers: [RefundRequestController],
  exports: [RefundRequestService]
})
export class RefundRequestModule {}
