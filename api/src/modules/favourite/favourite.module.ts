import { Module, forwardRef } from '@nestjs/common';
import { MongoDBModule, QueueModule } from 'src/kernel';
import { assetsProviders } from './providers';
import { AuthModule } from '../auth/auth.module';
import { FavouriteService } from './services';
import { PerformerFavouriteController, UserFavouriteController } from './controllers';
import { UserModule } from '../user/user.module';
import { PerformerModule } from '../performer/performer.module';

@Module({
  imports: [
    MongoDBModule,
    QueueModule.forRoot(),
    forwardRef(() => UserModule),
    forwardRef(() => PerformerModule),
    forwardRef(() => AuthModule)
  ],
  providers: [...assetsProviders, FavouriteService],
  controllers: [PerformerFavouriteController, UserFavouriteController],
  exports: [FavouriteService]
})
export class FavouriteModule {}
