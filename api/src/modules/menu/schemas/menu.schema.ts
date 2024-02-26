import { Schema } from 'mongoose';

export const MenuSchema = new Schema({
  title: { type: String, default: '' },
  path: { type: String, default: '' },
  internal: { type: Boolean, default: false },
  parentId: { type: Schema.Types.ObjectId, index: true },
  help: { type: String, default: '' },
  section: { type: String, default: '', enum: ['main', 'header', 'footer'] },
  public: { type: Boolean, default: false },
  isOpenNewTab: { type: Boolean, default: false },
  ordering: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
