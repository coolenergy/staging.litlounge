import * as mongoose from 'mongoose';
import { HttpExceptionLogSchema } from './http-exception-log.schema';

mongoose.connect(process.env.MONGO_URI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

export const HttpExceptionLogModel = mongoose.model('HttpExceptionLog', HttpExceptionLogSchema);
