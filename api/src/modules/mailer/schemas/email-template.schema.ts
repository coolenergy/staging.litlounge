import { Schema } from 'mongoose';

export const EmailTemplateSchema = new Schema({
  name: { type: String },
  description: { type: String, default: '' },
  key: { type: String, index: true, unique: true },
  subject: { type: String },
  content: { type: String, default: '' },
  layout: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
