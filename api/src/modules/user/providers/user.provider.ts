import { Connection } from 'mongoose';
import { MONGO_DB_PROVIDER } from 'src/kernel';
import { UserSchema } from '../schemas/user.schema';
import { ShippingInfoSchema } from '../schemas/shipping-info.schema';

export const USER_MODEL_PROVIDER = 'USER_MODEL';
export const SHIPPING_INFO_PROVIDER = 'SHIPPING_INFO_PROVIDER';
export const userProviders = [
  {
    provide: USER_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('User', UserSchema),
    inject: [MONGO_DB_PROVIDER]
  },
  {
    provide: SHIPPING_INFO_PROVIDER,
    useFactory: (connection: Connection) => connection.model('ShippingInfoUser', ShippingInfoSchema),
    inject: [MONGO_DB_PROVIDER]
  }
];
