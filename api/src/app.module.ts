import { Module } from '@nestjs/common';
import { ConfigModule } from 'nestjs-config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SocketModule } from './modules/socket/socket.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { SettingModule } from './modules/settings/setting.module';
import { MailerModule } from './modules/mailer/mailer.module';
import { PostModule } from './modules/post/post.module';
import { FileModule } from './modules/file/file.module';
import { PerformerModule } from './modules/performer/performer.module';
import { UtilsModule } from './modules/utils/utils.module';
import { PerformerAssetsModule } from './modules/performer-assets/performer-assets.module';
import { StreamModule } from './modules/stream/stream.module';
import { TokenPackageModule } from './modules/token-package/token-package.module';
import { FavouriteModule } from './modules/favourite/favourite.module';
import { PaymentModule } from './modules/payment/payment.module';
import { MessageModule } from './modules/message/message.module';
import { PurchasedItemModule } from './modules/purchased-item/purchased-item.module';
import { EarningModule } from './modules/earning/earning.module';
import { RefundRequestModule } from './modules/refund-request/refund.module';
import { PayoutRequestModule } from './modules/payout-request/payout.module';
import { MenuModule } from './modules/menu/menu.module';
import { BannerModule } from './modules/banner/banner.module';
import { PaymentInformationModule } from './modules/payment-information/payment-information.module';
import { StatisticModule } from './modules/statistic/statistic.module';
import { StudioModule } from './modules/studio/studio.module';
import { ContactModule } from './modules/contact/contact.module';

@Module({
  imports: [
    ConfigModule.resolveRootPath(__dirname).load('config/**/!(*.d).{ts,js}'),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public')
    }),
    SocketModule,
    AuthModule,
    SettingModule,
    UserModule,
    PostModule,
    MailerModule,
    FileModule,
    UtilsModule,
    PerformerModule,
    PerformerAssetsModule,
    StreamModule,
    TokenPackageModule,
    FavouriteModule,
    PaymentModule,
    MessageModule,
    PurchasedItemModule,
    EarningModule,
    RefundRequestModule,
    PayoutRequestModule,
    MenuModule,
    BannerModule,
    PaymentInformationModule,
    StatisticModule,
    StudioModule,
    ContactModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
