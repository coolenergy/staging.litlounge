import * as mongoose from 'mongoose';
import { RequestLogSchema } from './request-log.schema';

mongoose.connect(process.env.MONGO_URI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

export const RequestLogModel = mongoose.model('RequestLog', RequestLogSchema);
