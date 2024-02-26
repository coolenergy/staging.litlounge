import { Connection } from 'mongoose';
import { MONGO_DB_PROVIDER } from 'src/kernel';
import { earningSchema } from '../schemas/earning.schema';

export const EARNING_MODEL_PROVIDER = 'EARNING_MODEL_PROVIDER';

export const earningProviders = [
  {
    provide: EARNING_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('Earning', earningSchema),
    inject: [MONGO_DB_PROVIDER]
  }
];
