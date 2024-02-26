import * as mongoose from 'mongoose';

export const RequestLogSchema = new mongoose.Schema({
  path: String,
  ip: String,
  query: {
    type: mongoose.Schema.Types.Mixed
  },
  body: {
    type: mongoose.Schema.Types.Mixed
  },
  headers: {
    type: mongoose.Schema.Types.Mixed
  },
  authData: {
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'requestlogs'
});
