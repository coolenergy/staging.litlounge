import { Connection } from 'mongoose';
import { MONGO_DB_PROVIDER } from 'src/kernel';
import { BannerSchema } from '../schemas';

export const BANNER_PROVIDER = 'BANNER_PROVIDER';

export const bannerProviders = [
  {
    provide: BANNER_PROVIDER,
    useFactory: (connection: Connection) => connection.model('Banner', BannerSchema),
    inject: [MONGO_DB_PROVIDER]
  }
];
