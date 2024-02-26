import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

import { dropDatabase } from './utils';

require('dotenv').config();

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  const testUser = {
    email: 'test@example.com',
    password: '123456'
  };

  beforeAll(async () => {
    await dropDatabase();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule
      ]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await dropDatabase();
  });

  it('/auth/register', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(200);

    const { body } = response;
    expect(body).toHaveProperty('userId');
  });

  it('shoud not register with same email', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(400);
  });

  it('shoud login success', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(testUser)
      .expect(200);

    const { body } = response;
    expect(body).toHaveProperty('token');
  });
});
