import { Module, forwardRef } from '@nestjs/common';
import { MongoDBModule } from 'src/kernel';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { PerformerModule } from '../performer/performer.module';
import { PurchasedItemModule } from '../purchased-item/purchased-item.module';
import { SettingModule } from '../settings/setting.module';
import { EarningController } from './controllers/earning.controller';
import { EarningService } from './services/earning.service';
import { earningProviders } from './providers/earning.provider';
import { TransactionEarningListener } from './listeners/earning.listener';
import { StudioModule } from '../studio/studio.module';

@Module({
  imports: [
    MongoDBModule,
    StudioModule,
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    forwardRef(() => PerformerModule),
    forwardRef(() => PurchasedItemModule),
    forwardRef(() => SettingModule)
  ],
  providers: [...earningProviders, EarningService, TransactionEarningListener],
  controllers: [EarningController],
  exports: [...earningProviders, EarningService, TransactionEarningListener]
})
export class EarningModule {}
