import { Connection } from 'mongoose';
import { MONGO_DB_PROVIDER } from 'src/kernel';
import {
  VideoSchema, GallerySchema, PhotoSchema, ProductSchema
} from '../schemas';

export const PERFORMER_VIDEO_MODEL_PROVIDER = 'PERFORMER_VIDEO_MODEL_PROVIDER';
export const PERFORMER_PHOTO_MODEL_PROVIDER = 'PERFORMER_PHOTO_MODEL_PROVIDER';

export const PERFORMER_GALLERY_MODEL_PROVIDER = 'PERFORMER_GALLERY_MODEL_PROVIDER';

export const PERFORMER_PRODUCT_MODEL_PROVIDER = 'PERFORMER_PRODUCT_MODEL_PROVIDER';

export const assetsProviders = [
  {
    provide: PERFORMER_VIDEO_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('PerformerVideo', VideoSchema),
    inject: [MONGO_DB_PROVIDER]
  },

  {
    provide: PERFORMER_PHOTO_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('PerformerPhoto', PhotoSchema),
    inject: [MONGO_DB_PROVIDER]
  },

  {
    provide: PERFORMER_GALLERY_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('PerformerGallery', GallerySchema),
    inject: [MONGO_DB_PROVIDER]
  },

  {
    provide: PERFORMER_PRODUCT_MODEL_PROVIDER,
    useFactory: (connection: Connection) => connection.model('PerformerProduct', ProductSchema),
    inject: [MONGO_DB_PROVIDER]
  }
];
