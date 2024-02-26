import * as mongoose from 'mongoose';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';

let userToken;

export const dropDatabase = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await mongoose.connection.dropDatabase();
};

export const dropCollection = async (collection) => {
  await mongoose.connect(process.env.MONGO_URI);
  await mongoose.connection.dropCollection(collection);
};

export const createSampleUser = async () => {};

export const getAuthToken = async (app: INestApplication) => {
  const user = {
    email: 'user@example.com',
    password: '123456'
  };
  if (userToken) {
    return userToken;
  }

  await request(app.getHttpServer())
    .post('/auth/register')
    .send(user)
    .expect(200);
  const resp = await request(app.getHttpServer())
    .post('/auth/login')
    .send(user)
    .expect(200);

  userToken = resp.body.token;
  return userToken;
};
