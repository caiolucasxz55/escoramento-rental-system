import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';
import { EnvironmentVariables } from './config/env.validation';
import { setupSwagger } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // SIGTERM do deploy: fecha o servidor e a conexao com o Mongo antes de sair
  app.enableShutdownHooks();
  configureApp(app);
  setupSwagger(app);

  const config = app.get(ConfigService<EnvironmentVariables, true>);
  await app.listen(config.get('PORT', { infer: true }));
}
void bootstrap();
