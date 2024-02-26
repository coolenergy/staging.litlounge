import { Connection } from 'mongoose';
import { MONGO_DB_PROVIDER } from 'src/kernel';
import { MessageSchema } from '../schemas';

export const MESSAGE_MODEL_PROVIDER = 'MESSAGE_MODEL_PROVIDER';

export const messageProviders = [
  {
    provide: MESSAGE_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('Message', MessageSchema),
    inject: [MONGO_DB_PROVIDER]
  }
];
