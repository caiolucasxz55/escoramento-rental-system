import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CONSULTATION_TOKEN_HEADER } from './rental-requests/rules/consultation-token';

// usado pelo main (servidor) e pelo lambda
export function setupSwagger(app: INestApplication): void {
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Escoramento - Solicitações de locação')
      .setVersion('1.0')
      .addBearerAuth()
      .addApiKey(
        { type: 'apiKey', in: 'header', name: CONSULTATION_TOKEN_HEADER },
        CONSULTATION_TOKEN_HEADER,
      )
      .build(),
  );
  SwaggerModule.setup('api/docs', app, document);
}
