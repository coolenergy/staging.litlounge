import { Connection } from 'mongoose';
import { MONGO_DB_PROVIDER } from 'src/kernel';
import { RefundRequestSchema } from '../schemas/refund-request.schema';

export const REFUND_REQUEST_MODEL_PROVIDER = 'REFUND_REQUEST_MODEL_PROVIDER';

export const refundRequestProviders = [
  {
    provide: REFUND_REQUEST_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('RefundRequest', RefundRequestSchema),
    inject: [MONGO_DB_PROVIDER]
  }
];
