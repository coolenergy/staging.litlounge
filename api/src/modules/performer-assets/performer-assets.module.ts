import { Module, forwardRef } from '@nestjs/common';
import { MongoDBModule, QueueModule } from 'src/kernel';
import { PurchasedItemModule } from 'src/modules/purchased-item/purchased-item.module';
import { AuthModule } from '../auth/auth.module';
import { assetsProviders } from './providers';
import { UserModule } from '../user/user.module';
import { FileModule } from '../file/file.module';
import { VideoService } from './services/video.service';
import { AdminPerformerVideosController } from './controllers/admin-video.controller';
import { PerformerModule } from '../performer/performer.module';
import { VideoSearchService } from './services/video-search.service';
import { GalleryService } from './services/gallery.service';
import { AdminPerformerGalleryController } from './controllers/admin-gallery.controller';
import { PhotoService } from './services/photo.service';
import { AdminPerformerPhotoController } from './controllers/admin-photo.controller';
import { PhotoSearchService } from './services/photo-search.service';
import { ProductSearchService } from './services/product-search.service';
import { ProductService } from './services/product.service';
import { AdminPerformerProductsController } from './controllers/admin-product.controller';
import { PerformerProductController } from './controllers/performer-product.controller';
import { PerformerVideosController } from './controllers/performer-video.controller';
import { UserProductsController } from './controllers/user-product.controller';
import { UserVideosController } from './controllers/user-video.controller';
import { UserPhotosController } from './controllers/user-photo.controller';
import { PerformerPhotoController } from './controllers/performer-photo.controller';
import { PerformerGalleryController } from './controllers/performer-gallery.controller';
import { StockProductListener, PerformerAssetsListener } from './listeners';
import { UserGalleryController } from './controllers/user-gallery.controller';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  imports: [
    MongoDBModule,
    QueueModule.forRoot(),
    // inject user module because we request guard from auth, need to check and fix dependencies if not needed later
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    forwardRef(() => FileModule),
    forwardRef(() => PerformerModule),
    forwardRef(() => PurchasedItemModule),
    forwardRef(() => MailerModule)
  ],
  providers: [
    ...assetsProviders,
    VideoService,
    VideoSearchService,
    GalleryService,
    PhotoService,
    PhotoSearchService,
    ProductService,
    ProductSearchService,
    StockProductListener,
    PerformerAssetsListener
  ],
  controllers: [
    AdminPerformerVideosController,
    AdminPerformerGalleryController,
    AdminPerformerPhotoController,
    AdminPerformerProductsController,
    PerformerProductController,
    PerformerVideosController,
    PerformerPhotoController,
    PerformerGalleryController,
    UserProductsController,
    UserVideosController,
    UserPhotosController,
    UserGalleryController
  ],
  exports: [
    ...assetsProviders,
    VideoService,
    VideoSearchService,
    GalleryService,
    PhotoService,
    PhotoSearchService,
    ProductService,
    ProductSearchService
  ]
})
export class PerformerAssetsModule {}
