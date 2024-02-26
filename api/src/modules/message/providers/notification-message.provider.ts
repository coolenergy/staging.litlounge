import { Connection } from 'mongoose';
import { MONGO_DB_PROVIDER } from 'src/kernel';
import { NotificationMessageSchema } from '../schemas';

export const NOTIFICATION_MESSAGE_MODEL_PROVIDER = 'NOTIFICATION_MESSAGE_MODEL_PROVIDER';

export const notificationMessageProviders = [
  {
    provide: NOTIFICATION_MESSAGE_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('NotificationMessage', NotificationMessageSchema),
    inject: [MONGO_DB_PROVIDER]
  }
];
