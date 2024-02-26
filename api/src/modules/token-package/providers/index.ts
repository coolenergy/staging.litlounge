import { Connection } from 'mongoose';
import { MONGO_DB_PROVIDER } from 'src/kernel';
import { tokenPackageSchema } from '../schemas';

export const TOKEN_PACKAGE_MODEL_PROVIDER = 'STREAM_MODEL_PROVIDER';

export const assetsProviders = [
  {
    provide: TOKEN_PACKAGE_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('tokenPackage', tokenPackageSchema),
    inject: [MONGO_DB_PROVIDER]
  }
];
