import { Module, forwardRef } from '@nestjs/common';
import { MongoDBModule, QueueModule } from 'src/kernel';
import { MenuModule } from 'src/modules/menu/menu.module';
import { PerformerModule } from 'src/modules/performer/performer.module';
import { settingProviders } from './providers';
import { SettingService } from './services';
import { SettingController } from './controllers/setting.controller';
import { AuthModule } from '../auth/auth.module';
import { SettingFileUploadController } from './controllers/setting-file-upload.controller';
import { FileModule } from '../file/file.module';
import { AdminSettingController } from './controllers/admin-setting.controller';

@Module({
  imports: [
    QueueModule.forRoot(),
    MongoDBModule,
    forwardRef(() => PerformerModule),
    forwardRef(() => AuthModule),
    forwardRef(() => FileModule),
    forwardRef(() => MenuModule)
  ],
  providers: [...settingProviders, SettingService],
  controllers: [
    SettingController,
    SettingFileUploadController,
    AdminSettingController
  ],
  exports: [...settingProviders, SettingService]
})
export class SettingModule {
  constructor(private settingService: SettingService) {
    this.settingService.syncCache();
  }
}
