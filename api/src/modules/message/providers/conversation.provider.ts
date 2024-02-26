import { Connection } from 'mongoose';
import { MONGO_DB_PROVIDER } from 'src/kernel';
import { ConversationSchema } from '../schemas';

export const CONVERSATION_MODEL_PROVIDER = 'CONVERSATION_MODEL_PROVIDER';

export const conversationProviders = [
  {
    provide: CONVERSATION_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('Conversation', ConversationSchema),
    inject: [MONGO_DB_PROVIDER]
  }
];
