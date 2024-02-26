import { Connection } from 'mongoose';
import { MONGO_DB_PROVIDER } from 'src/kernel';
import { AuthSchema, VerificationSchema, ForgotSchema } from '../schemas';

export const AUTH_MODEL_PROVIDER = 'AUTH_MODEL';

export const VERIFICATION_MODEL_PROVIDER = 'VERIFICATION_MODEL_PROVIDER';
export const FORGOT_MODEL_PROVIDER = 'FORGOT_MODEL_PROVIDER';

export const authProviders = [
  {
    provide: AUTH_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('Auth', AuthSchema),
    inject: [MONGO_DB_PROVIDER]
  },

  {
    provide: VERIFICATION_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('Verification', VerificationSchema),
    inject: [MONGO_DB_PROVIDER]
  },

  {
    provide: FORGOT_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('Forgot', ForgotSchema),
    inject: [MONGO_DB_PROVIDER]
  }
];
