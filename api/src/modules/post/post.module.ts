import { Module, forwardRef } from '@nestjs/common';
import { MongoDBModule, QueueModule } from 'src/kernel';
import { AuthModule } from '../auth/auth.module';
import { postProviders } from './providers';
import { PostService, CategoryService, PostSearchService } from './services';
import {
  PostController,
  AdminCategoryController,
  AdminPostController
} from './controllers';
import { UserModule } from '../user/user.module';
import { FileModule } from '../file/file.module';

@Module({
  imports: [
    MongoDBModule,
    QueueModule.forRoot(),
    // inject user module because we request guard from auth, need to check and fix dependencies if not needed later
    UserModule,
    forwardRef(() => AuthModule),
    forwardRef(() => FileModule)
  ],
  providers: [
    ...postProviders,
    PostService,
    CategoryService,
    PostSearchService
  ],
  controllers: [
    PostController,
    AdminCategoryController,
    AdminPostController
  ],
  exports: [PostService, CategoryService, PostSearchService]
})
export class PostModule {}
