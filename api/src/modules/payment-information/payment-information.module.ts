import { Module, forwardRef } from '@nestjs/common';
import { MongoDBModule, QueueModule } from 'src/kernel';
import { AuthModule } from '../auth/auth.module';
import { PaymentInformationService } from './services';
import { paymentInformationProviders } from './providers';
import { PaymentInformationController } from './controllers';
import { PerformerModule } from '../performer/performer.module';
import { StudioModule } from '../studio/studio.module';

@Module({
  imports: [
    MongoDBModule,
    QueueModule.forRoot(),
    forwardRef(() => AuthModule),
    forwardRef(() => PerformerModule),
    forwardRef(() => StudioModule)
  ],
  providers: [...paymentInformationProviders, PaymentInformationService],
  controllers: [PaymentInformationController],
  exports: [PaymentInformationService]
})
export class PaymentInformationModule {}
