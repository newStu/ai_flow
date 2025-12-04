import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';

describe('Users (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/users/check-username/:username (GET)', () => {
    return request(app.getHttpServer())
      .get('/users/check-username/testuser')
      .expect(200)
      .expect({ available: true });
  });

  it('/users/check-email/:email (GET)', () => {
    return request(app.getHttpServer())
      .get('/users/check-email/test@example.com')
      .expect(200)
      .expect({ available: true });
  });

  afterAll(async () => {
    await app.close();
  });
});
