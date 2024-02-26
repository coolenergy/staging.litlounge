import { Connection } from 'mongoose';
import { MONGO_DB_PROVIDER } from 'src/kernel';
import { MenuSchema } from '../schemas';

export const MENU_PROVIDER = 'MENU_PROVIDER';

export const menuProviders = [
  {
    provide: MENU_PROVIDER,
    useFactory: (connection: Connection) => connection.model('Menu', MenuSchema),
    inject: [MONGO_DB_PROVIDER]
  }
];
