import { Module, forwardRef } from '@nestjs/common';
import { MongoDBModule, QueueModule } from 'src/kernel';
import { PaymentModule } from 'src/modules/payment/payment.module';
import { AuthModule } from '../auth/auth.module';
import { menuProviders } from './providers';
import { MenuService, MenuSearchService } from './services';
import { AdminMenuController } from './controllers/menu.controller';

@Module({
  imports: [
    MongoDBModule,
    QueueModule.forRoot(),
    // inject user module because we request guard from auth, need to check and fix dependencies if not needed later
    forwardRef(() => AuthModule),
    forwardRef(() => PaymentModule)
  ],
  providers: [...menuProviders, MenuService, MenuSearchService],
  controllers: [AdminMenuController],
  exports: [...menuProviders, MenuService, MenuSearchService]
})
export class MenuModule {}
