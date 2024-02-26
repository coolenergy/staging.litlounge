import { Connection } from 'mongoose';
import { MONGO_DB_PROVIDER } from 'src/kernel';
import { SettingSchema } from '../schemas';

export const SETTING_MODEL_PROVIDER = 'SETTING_MODEL_PROVIDER';

export const settingProviders = [
  {
    provide: SETTING_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('Setting', SettingSchema),
    inject: [MONGO_DB_PROVIDER]
  }
];
