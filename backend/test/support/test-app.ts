import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Model } from 'mongoose';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { configureApp } from '../../src/app.setup';
import { RentalRequest } from '../../src/rental-requests/schemas/rental-request.schema';
import { InMemoryStorage } from '../../src/storage/in-memory.storage';
import { STORAGE } from '../../src/storage/storage.interface';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from './setup-env';

export interface TestApp {
  app: INestApplication<App>;
  http: () => ReturnType<typeof request>;
  storage: InMemoryStorage;
  model: Model<RentalRequest>;
  adminToken: string;
  close: () => Promise<void>;
}

// app real (pipes, filtro, guards); so o S3 vira memoria
export async function createTestApp(): Promise<TestApp> {
  const storage = new InMemoryStorage();
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(STORAGE)
    .useValue(storage)
    .compile();

  const app = moduleRef.createNestApplication<INestApplication<App>>();
  configureApp(app);
  await app.init();

  const model = app.get<Model<RentalRequest>>(
    getModelToken(RentalRequest.name),
  );
  await model.deleteMany({});
  await model.syncIndexes();

  const http = () => request(app.getHttpServer());
  const login = await http()
    .post('/api/auth/login')
    .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    .expect(200);

  return {
    app,
    http,
    storage,
    model,
    adminToken: (login.body as { accessToken: string }).accessToken,
    close: () => app.close(),
  };
}
