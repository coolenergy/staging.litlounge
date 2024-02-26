/* eslint-disable camelcase */
import { Document } from 'mongoose';

export class TokenPackageModel extends Document {
  name?: string;

  description?: string;

  ordering?: number;

  price?: number;

  tokens?: number;

  isActive?: boolean;

  pi_code?: string;

  updatedAt?: Date;

  createdAt?: Date;
}
