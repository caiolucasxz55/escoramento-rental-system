import { hashSync } from 'bcryptjs';

export const ADMIN_EMAIL = 'admin@escoramento.test';
export const ADMIN_PASSWORD = 'senha-de-teste';

// tudo explicito: o teste nao depende do .env de quem roda
Object.assign(process.env, {
  PORT: '3999', // nao abre porta: o supertest usa o server direto
  FRONTEND_URL: 'http://localhost:3000',
  JWT_SECRET: 'segredo-so-de-teste',
  JWT_EXPIRES_IN: '1h',
  ADMIN_EMAIL,
  ADMIN_PASSWORD_HASH: hashSync(ADMIN_PASSWORD, 4),
  S3_BUCKET: 'bucket-de-teste',
  S3_REGION: 'us-east-1',
  S3_ENDPOINT: '',
  S3_PUBLIC_ENDPOINT: '',
  S3_FORCE_PATH_STYLE: 'false',
  S3_ACCESS_KEY_ID: 'teste',
  S3_SECRET_ACCESS_KEY: 'teste',
  SIGNED_URL_TTL_SECONDS: '300',
  MAX_FILE_SIZE_MB: '1',
});
