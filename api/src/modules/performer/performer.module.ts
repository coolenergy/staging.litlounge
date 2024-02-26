import { Module, forwardRef } from '@nestjs/common';
import { AgendaModule, MongoDBModule, QueueModule } from 'src/kernel';
import { SettingModule } from 'src/modules/settings/setting.module';
import { MessageModule } from 'src/modules/message/message.module';
import { UtilsModule } from 'src/modules/utils/utils.module';
import { RedisModule } from 'nestjs-redis';
import { ConfigService } from 'nestjs-config';
import { AuthModule } from '../auth/auth.module';
import { performerProviders } from './providers';
import {
  CategoryService,
  CategorySearchService,
  PerformerService,
  PerformerSearchService,
  PerformerCommissionService,
  PerformerBlockSettingService
} from './services';
import {
  CategoryController,
  AdminCategoryController,
  AdminPerformerController,
  PerformerController,
  AdminPerformerCommissionController
} from './controllers';
import { UserModule } from '../user/user.module';
import { FileModule } from '../file/file.module';
import {
  PerformerAssetsListener,
  PerformerConnectedListener,
  PerformerFavoriteListener,
  BlockUserListener,
  PerformerListener
} from './listeners';
import { StreamModule } from '../stream/stream.module';
import { FavouriteModule } from '../favourite/favourite.module';
import { SocketModule } from '../socket/socket.module';
import { StudioModule } from '../studio/studio.module';
import { PerformerTask } from './tasks/performer.task';

@Module({
  imports: [
    MongoDBModule,
    // inject user module because we request guard from auth, need to check and fix dependencies if not needed later
    RedisModule.forRootAsync({
      // TODO - load config for redis socket
      useFactory: (configService: ConfigService) => configService.get('redis'),
      // useFactory: async (configService: ConfigService) => configService.get('redis'),
      inject: [ConfigService]
    }),
    AgendaModule.register(),
    QueueModule.forRoot(),
    forwardRef(() => UserModule),
    forwardRef(() => FavouriteModule),
    forwardRef(() => SettingModule),
    forwardRef(() => AuthModule),
    forwardRef(() => StreamModule),
    forwardRef(() => FileModule),
    forwardRef(() => SocketModule),
    forwardRef(() => UtilsModule),
    forwardRef(() => StudioModule),
    MessageModule
  ],
  providers: [
    ...performerProviders,
    CategoryService,
    CategorySearchService,
    PerformerService,
    PerformerSearchService,
    PerformerAssetsListener,
    PerformerConnectedListener,
    PerformerFavoriteListener,
    BlockUserListener,
    PerformerCommissionService,
    PerformerBlockSettingService,
    PerformerListener,
    PerformerTask
  ],
  controllers: [
    CategoryController,
    AdminCategoryController,
    AdminPerformerController,
    PerformerController,
    AdminPerformerCommissionController
  ],
  exports: [
    ...performerProviders,
    CategoryService,
    PerformerService,
    PerformerCommissionService,
    PerformerSearchService,
    PerformerBlockSettingService
  ]
})
export class PerformerModule {}
