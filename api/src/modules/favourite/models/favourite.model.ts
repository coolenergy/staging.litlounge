import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

export class FavouriteModel extends Document {
  favoriteId: ObjectId;

  ownerId: ObjectId;

  createdAt: Date;

  updatedAt: Date;
}
