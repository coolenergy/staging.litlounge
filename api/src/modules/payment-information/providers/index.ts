import { Connection } from 'mongoose';
import { MONGO_DB_PROVIDER } from 'src/kernel';
import { paymentInformationSchema } from '../schemas';

export const BANKING_INFORMATION_MODEL_PROVIDE = 'BANKING_INFORMATION_MODEL_PROVIDE';

export const paymentInformationProviders = [
  {
    provide: BANKING_INFORMATION_MODEL_PROVIDE,
    useFactory: (connection: Connection) => connection.model('PaymentInformation', paymentInformationSchema),
    inject: [MONGO_DB_PROVIDER]
  }
];