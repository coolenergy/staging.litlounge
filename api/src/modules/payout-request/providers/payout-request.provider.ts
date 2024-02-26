import { Connection } from 'mongoose';
import { MONGO_DB_PROVIDER } from 'src/kernel';
import { payoutRequestSchema } from '../schemas/payout-request.schema';

export const PAYOUT_REQUEST_MODEL_PROVIDER = 'PAYOUT_REQUEST_MODEL_PROVIDER';

export const payoutRequestProviders = [
  {
    provide: PAYOUT_REQUEST_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('PayoutRequest', payoutRequestSchema),
    inject: [MONGO_DB_PROVIDER]
  }
];
