import { Module, forwardRef } from '@nestjs/common';
import { MongoDBModule, QueueModule } from 'src/kernel';
import { AuthModule } from 'src/modules/auth/auth.module';
import { PerformerModule } from 'src/modules/performer/performer.module';
import { SettingModule } from '../settings/setting.module';
import { StudioController, StudioCommissionController } from './controllers';
import { studioProviders } from './providers';
import { StudioService, StudioCommissionService } from './services';
import { StudioMemberListener, ModelListener } from './listeners';
import { FileModule } from '../file/file.module';

@Module({
  imports: [
    MongoDBModule,
    QueueModule.forRoot(),
    forwardRef(() => FileModule),
    forwardRef(() => SettingModule),
    forwardRef(() => AuthModule),
    forwardRef(() => PerformerModule)
  ],
  controllers: [StudioController, StudioCommissionController],
  providers: [
    ...studioProviders,
    StudioService,
    StudioCommissionService,
    StudioMemberListener,
    ModelListener
  ],
  exports: [...studioProviders, StudioService]
})
export class StudioModule {}
