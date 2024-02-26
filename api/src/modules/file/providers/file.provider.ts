import { Connection } from 'mongoose';
import { MONGO_DB_PROVIDER } from 'src/kernel';
import { FileSchema } from '../schemas';

export const FILE_MODEL_PROVIDER = 'FILE_MODEL_PROVIDER';

export const fileProviders = [
  {
    provide: FILE_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('File', FileSchema),
    inject: [MONGO_DB_PROVIDER]
  }
];
