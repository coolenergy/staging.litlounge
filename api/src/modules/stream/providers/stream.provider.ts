import { Connection } from 'mongoose';
import { MONGO_DB_PROVIDER } from 'src/kernel';
import { StreamSchema } from '../schemas';

export const STREAM_MODEL_PROVIDER = 'STREAM_MODEL_PROVIDER';

export const assetsProviders = [
  {
    provide: STREAM_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('Stream', StreamSchema),
    inject: [MONGO_DB_PROVIDER]
  }
];
