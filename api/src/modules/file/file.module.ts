import { Module } from '@nestjs/common';
import { MongoDBModule, QueueModule } from 'src/kernel';
import { FileController } from './controllers/file.controller';
import { fileProviders } from './providers';
import { FileService, VideoService } from './services';
import { ImageService } from './services/image.service';

@Module({
  imports: [
    MongoDBModule,
    QueueModule.forRoot()
  ],
  providers: [...fileProviders, FileService, ImageService, VideoService],
  controllers: [FileController],
  exports: [...fileProviders, FileService, ImageService, VideoService]
})
export class FileModule {}
