import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Express } from 'express';
import helmet from 'helmet';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import { validationMessages } from './common/validation-messages';
import { EnvironmentVariables } from './config/env.validation';

// usado pelo main e pelos testes e2e: mesma configuracao nos dois
export function configureApp(app: INestApplication): void {
  const config = app.get(ConfigService<EnvironmentVariables, true>);

  const trustProxyHops = config.get('TRUST_PROXY_HOPS', { infer: true });
  if (trustProxyHops) {
    // o rate limit usa req.ip: sem isso, todos chegariam com o IP do balanceador
    (app.getHttpAdapter().getInstance() as Express).set(
      'trust proxy',
      trustProxyHops,
    );
  }

  app.setGlobalPrefix('api');
  app.use(helmet());
  // em lista: origem que nao confere fica sem Access-Control-Allow-Origin
  app.enableCors({ origin: [config.get('FRONTEND_URL', { infer: true })] });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      // uma mensagem por campo: sem "Informe a descricao; A descricao deve ter..."
      stopAtFirstError: true,
      exceptionFactory: (errors) =>
        new BadRequestException(validationMessages(errors)),
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
}
