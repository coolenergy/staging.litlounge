import { Connection } from 'mongoose';
import { MONGO_DB_PROVIDER } from 'src/kernel';
import {
  CategorySchema,
  performerSchema,
  BlockSettingSchema,
  performerCommissionSchema
} from '../schemas';

export const PERFORMER_MODEL_PROVIDER = 'PERFORMER_MODEL';
export const PERFORMER_CATEGORY_MODEL_PROVIDER = 'PERFORMER_CATEGORY_MODEL';
export const PERFORMER_BLOCK_SETTING_MODEL_PROVIDER = 'PERFORMER_BLOCK_SETTING_MODEL_PROVIDER';
export const PERFORMER_COMMISSION_MODEL_PROVIDER = 'PERFORMER_COMMISSION_MODEL_PROVIDER';

export const performerProviders = [
  {
    provide: PERFORMER_CATEGORY_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('PerformerCategory', CategorySchema),
    inject: [MONGO_DB_PROVIDER]
  },
  {
    provide: PERFORMER_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('Performer', performerSchema),
    inject: [MONGO_DB_PROVIDER]
  },
  {
    provide: PERFORMER_BLOCK_SETTING_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model(
      'PerformerBlockSetting',
      BlockSettingSchema
    ),
    inject: [MONGO_DB_PROVIDER]
  }, {
    provide: PERFORMER_COMMISSION_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('PerformerCommission', performerCommissionSchema),
    inject: [MONGO_DB_PROVIDER]
  }
];
