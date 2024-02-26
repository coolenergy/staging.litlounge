import { Connection } from 'mongoose';
import { MONGO_DB_PROVIDER } from 'src/kernel';
import { studioSchema } from '../schemas';

export const STUDIO_MODEL_PROVIDER = 'STUDIO_MODEL_PROVIDER';
export const studioProviders = [
  {
    provide: STUDIO_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('Studio', studioSchema),
    inject: [MONGO_DB_PROVIDER]
  }
];
