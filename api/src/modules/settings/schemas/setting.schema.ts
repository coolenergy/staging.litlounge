import { Schema } from 'mongoose';

export const SettingSchema = new Schema({
  key: { type: String, required: true, index: true },
  value: { type: Schema.Types.Mixed, required: true },
  name: { type: String },
  description: { type: String },
  group: { type: String, default: 'system', required: true },
  public: { type: Boolean, default: false },
  extra: {type: String},
  type: {
    type: String,
    default: 'text'
  },
  visible: {
    type: Boolean,
    default: true
  },
  editable: {
    type: Boolean,
    default: true
  },
  meta: {
    type: Schema.Types.Mixed
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
