import { Module, forwardRef } from '@nestjs/common';
import {
  StatisticService
} from './services';
import {
  StatisticController
} from './controllers';
import { AuthModule } from '../auth/auth.module';
import { PerformerAssetsModule } from '../performer-assets/performer-assets.module';
import { PerformerModule } from '../performer/performer.module';
import { UserModule } from '../user/user.module';
import { EarningModule } from '../earning/earning.module';
import { PaymentModule } from '../payment/payment.module';
import { StudioModule } from '../studio/studio.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    forwardRef(() => PerformerModule),
    forwardRef(() => PerformerAssetsModule),
    forwardRef(() => EarningModule),
    forwardRef(() => PaymentModule),
    forwardRef(() => StudioModule)
  ],
  providers: [
    StatisticService
  ],
  controllers: [
    StatisticController
  ],
  exports: []
})
export class StatisticModule {}
