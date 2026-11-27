import { configure } from '@codegenie/serverless-express';
import { NestFactory } from '@nestjs/core';
import {
  ExpressAdapter,
  type NestExpressApplication,
} from '@nestjs/platform-express';
import type { Handler } from 'aws-lambda';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';
import { setupSwagger } from './swagger';

export interface LambdaApp {
  app: NestExpressApplication;
  handler: Handler;
}

// mesma app do main, sem listen: o adaptador traduz o evento da Function URL
export async function createLambdaApp(): Promise<LambdaApp> {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
  );
  app.set('trust proxy', 1);
  configureApp(app);
  setupSwagger(app);
  await app.init();
  return {
    app,
    handler: configure({ app: app.getHttpAdapter().getInstance() }),
  };
}

// criada uma vez por container; as invocacoes seguintes reaproveitam a app e a conexao com o Mongo
let ready: Promise<LambdaApp> | undefined;

export const handler: Handler = async (event, context) => {
  ready ??= createLambdaApp().catch((error: unknown) => {
    ready = undefined; // a proxima invocacao tenta de novo
    throw error;
  });
  const { handler: invoke } = await ready;
  return invoke(event, context, () => undefined);
};
