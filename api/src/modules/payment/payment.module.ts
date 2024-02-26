import { MongoDBModule, QueueModule } from 'src/kernel';
import {
  Module,
  forwardRef,
  MiddlewareConsumer,
  NestModule,
  RequestMethod
} from '@nestjs/common';
import { RequestLoggerMiddleware } from 'src/kernel/logger/request-log.middleware';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { PerformerModule } from '../performer/performer.module';
import { PerformerAssetsModule } from '../performer-assets/performer-assets.module';
import { paymentProviders } from './providers';
import { SettingModule } from '../settings/setting.module';
import { MailerModule } from '../mailer/mailer.module';
import {
  CCBillService,
  PaymentService,
  PaymentSearchService,
  OrderService
} from './services';
import { PaymentController, PaymentSearchController, PaymentWebhookController } from './controllers';
import { TokenPackageModule } from '../token-package/token-package.module';
import { UpdateOrderStatusPaymentTransactionSuccessListener } from './listeners/update-order-status-transaction-success.listener';
import { UpdateUserBalanceFromOrderSuccessListener } from './listeners/update-user-balance-from-order-success.listener';
import { CreateOrderFromPurchasedItemListener } from './listeners/create-order-from-purchased-item.listener';
import { OrderController } from './controllers/order.controller';
import { OrderSearchService } from './services/order-search.service';
import { NotifyOrderUpdateListener } from './listeners/notify-order-update.listener';
import { FileModule } from '../file/file.module';

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
    forwardRef(() => MailerModule),
    forwardRef(() => FileModule),
    forwardRef(() => TokenPackageModule)
  ],
  providers: [
    ...paymentProviders,
    OrderService,
    OrderSearchService,
    PaymentService,
    CCBillService,
    PaymentSearchService,
    UpdateOrderStatusPaymentTransactionSuccessListener,
    UpdateUserBalanceFromOrderSuccessListener,
    CreateOrderFromPurchasedItemListener,
    NotifyOrderUpdateListener
  ],
  controllers: [
    PaymentController, 
    PaymentWebhookController, 
    PaymentSearchController,
    OrderController
  ],
  exports: [...paymentProviders, PaymentService, PaymentSearchService, OrderService]
})
export class PaymentModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggerMiddleware)
      .forRoutes({ path: '/payment/*/callhook', method: RequestMethod.ALL });
  }
}
