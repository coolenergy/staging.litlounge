import { Connection } from 'mongoose';
import { MONGO_DB_PROVIDER } from 'src/kernel';
import { PostSchema, PostMetaSchema, CategorySchema } from '../schemas';

export const POST_MODEL_PROVIDER = 'POST_MODEL';
export const POST_META_MODEL_PROVIDER = 'POST_META_MODEL';
export const POST_CATEGORY_MODEL_PROVIDER = 'POST_CATEGORY_MODEL';

export const postProviders = [
  {
    provide: POST_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('Post', PostSchema),
    inject: [MONGO_DB_PROVIDER]
  },
  {
    provide: POST_META_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('PostMeta', PostMetaSchema),
    inject: [MONGO_DB_PROVIDER]
  },
  {
    provide: POST_CATEGORY_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('PostCategory', CategorySchema),
    inject: [MONGO_DB_PROVIDER]
  }
];
