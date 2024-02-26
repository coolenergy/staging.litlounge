import { Module } from '@nestjs/common';
import { mongoDBProviders } from './mongodb.provider';

@Module({
  providers: [...mongoDBProviders],
  exports: [...mongoDBProviders]
})
export class MongoDBModule {}
