import { Connection } from 'mongoose';
import { MONGO_DB_PROVIDER } from 'src/kernel';
import { favouriteSchema } from '../schemas';

export const FAVOURITE_MODEL_PROVIDER = 'FAVOURITE_MODEL_PROVIDER';

export const assetsProviders = [
  {
    provide: FAVOURITE_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('favorite', favouriteSchema),
    inject: [MONGO_DB_PROVIDER]
  }
];
