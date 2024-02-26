import { Document } from 'mongoose';

export class EmailTemplateModel extends Document {
  name: string;

  description: string;

  key: string;

  value: string;

  layout: string;

  subject: string;

  content: string;

  createdAt: Date;

  updatedAt: Date;
}
