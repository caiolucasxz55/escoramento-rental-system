import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { MAX_FILES_PER_REQUEST } from '../../common/upload-limits';

const binary = { type: 'string', format: 'binary' } as const;

// Swagger nao infere multipart dos DTOs; descreve o corpo na mao
export const ApiCreateWithFiles = () =>
  applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: ['name', 'email', 'phone', 'description'],
        properties: {
          name: { type: 'string', example: 'Construtora Exemplo Ltda' },
          email: { type: 'string', example: 'contato@exemplo.com' },
          phone: { type: 'string', example: '(11) 98765-4321' },
          description: {
            type: 'string',
            example: 'Preciso de 40 escoras por 30 dias.',
          },
          files: {
            type: 'array',
            items: binary,
            maxItems: MAX_FILES_PER_REQUEST,
          },
        },
      },
    }),
  );

export const ApiFilesUpload = () =>
  applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: ['files'],
        properties: {
          files: {
            type: 'array',
            items: binary,
            maxItems: MAX_FILES_PER_REQUEST,
          },
        },
      },
    }),
  );

export const ApiSingleFileUpload = () =>
  applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: ['file'],
        properties: { file: binary },
      },
    }),
  );
