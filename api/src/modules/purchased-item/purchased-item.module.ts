import { MongoDBModule, QueueModule } from 'src/kernel';
import { Module, forwardRef } from '@nestjs/common';
import { StudioModule } from 'src/modules/studio/studio.module';
import { MessageModule } from 'src/modules/message/message.module';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { PerformerModule } from '../performer/performer.module';
import { PerformerAssetsModule } from '../performer-assets/performer-assets.module';
import { paymentTokenProviders } from './providers';
import { SettingModule } from '../settings/setting.module';
import { FileModule } from '../file/file.module';
import { MailerModule } from '../mailer/mailer.module';
import {
  PurchaseItemService,
  PurchasedItemSearchService,
  PaymentTokenService
} from './services';
import {
  PaymentTokenController,
  PaymentTokenSearchController,
  MemberPaymentToken
} from './controllers';
import { TokenPackageModule } from '../token-package/token-package.module';
import { PaymentTokenListener } from './listeners';
import { SocketModule } from '../socket/socket.module';

@Module({
  imports: [
    MongoDBModule,
    QueueModule.forRoot(),
    // inject user module because we request guard from auth, need to check and fix dependencies if not needed later
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    forwardRef(() => PerformerModule),
    forwardRef(() => SettingModule),
    forwardRef(() => PerformerAssetsModule),
    forwardRef(() => FileModule),
    forwardRef(() => MailerModule),
    forwardRef(() => TokenPackageModule),
    forwardRef(() => SocketModule),
    forwardRef(() => StudioModule),
    forwardRef(() => MessageModule)
  ],
  providers: [
    ...paymentTokenProviders,
    PurchaseItemService,
    PurchasedItemSearchService,
    PaymentTokenListener,
    PaymentTokenService
  ],
  controllers: [
    PaymentTokenController,
    PaymentTokenSearchController,
    MemberPaymentToken
  ],
  exports: [
    PurchaseItemService,
    PurchasedItemSearchService,
    PaymentTokenService
  ]
})
export class PurchasedItemModule {}
