import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { dropDatabase, getAuthToken } from './utils';

require('dotenv').config();

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let authToken;
  let userId;

  beforeAll(async () => {
    await dropDatabase();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule
      ]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    authToken = await getAuthToken(app);
  });

  afterAll(async () => {
    await dropDatabase();
  });

  it('Should update me success /users', async () => {
    const response = await request(app.getHttpServer())
      .put('/users')
      .set('authorization', authToken)
      .send({
        name: 'New name'
      })
      .expect(200);

    const { body } = response;
    expect(body).toHaveProperty('name');
    expect(body.name).toEqual('New name');
  });

  it('Should get me /users/me', async () => {
    const response = await request(app.getHttpServer())
      .get('/users/me')
      .set('authorization', authToken)
      .expect(200);

    const { body } = response;
    userId = body._id;
    expect(body).toHaveProperty('name');
    expect(body.name).toEqual('New name');
  });

  it('Should able search /users/search', async () => {
    const response = await request(app.getHttpServer())
      .get('/users/search?q=name')
      .set('authorization', authToken)
      .expect(200);

    const { body } = response;
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveLength(1);
  });

  it('Should get user details', async () => {
    const response = await request(app.getHttpServer())
      .get(`/users/view/${userId}`)
      .set('authorization', authToken)
      .expect(200);

    const { body } = response;
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveLength(1);
  });
});
