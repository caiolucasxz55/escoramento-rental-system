import { hashSync } from 'bcryptjs';
import { validateEnv } from './env.validation';

const valid = {
  MONGODB_URI: 'mongodb://localhost:27017/escoramento',
  JWT_SECRET: 'segredo-de-teste',
  ADMIN_EMAIL: 'admin@escoramento.local',
  ADMIN_PASSWORD_HASH: hashSync('senha', 4),
  S3_BUCKET: 'escoramento-docs',
  S3_REGION: 'us-east-1',
  S3_ACCESS_KEY_ID: 'minioadmin',
  S3_SECRET_ACCESS_KEY: 'minioadmin',
};

describe('validateEnv', () => {
  it('aceita o minimo obrigatorio e aplica os padroes', () => {
    const env = validateEnv(valid);

    expect(env.PORT).toBe(3001);
    expect(env.JWT_EXPIRES_IN).toBe('1h');
    expect(env.S3_FORCE_PATH_STYLE).toBe(false);
    expect(env.SIGNED_URL_TTL_SECONDS).toBe(300);
  });

  it.each(['MONGODB_URI', 'JWT_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD_HASH'])(
    'recusa subir sem %s e cita a variavel no erro',
    (name) => {
      const { [name]: _removed, ...rest } = valid as Record<string, string>;

      expect(() => validateEnv(rest)).toThrow(name);
    },
  );

  it('trata string vazia como ausente', () => {
    expect(() => validateEnv({ ...valid, JWT_SECRET: '' })).toThrow(
      'JWT_SECRET',
    );
    expect(
      validateEnv({ ...valid, S3_ENDPOINT: '' }).S3_ENDPOINT,
    ).toBeUndefined();
  });

  it('converte os tipos vindos do .env', () => {
    const env = validateEnv({
      ...valid,
      PORT: '3002',
      S3_FORCE_PATH_STYLE: 'true',
    });

    expect(env.PORT).toBe(3002);
    expect(env.S3_FORCE_PATH_STYLE).toBe(true);
  });

  it('recusa PORT nao numerica', () => {
    expect(() => validateEnv({ ...valid, PORT: 'abc' })).toThrow('PORT');
  });

  it('recusa senha em texto puro no lugar do hash', () => {
    expect(() =>
      validateEnv({ ...valid, ADMIN_PASSWORD_HASH: 'minha-senha' }),
    ).toThrow('ADMIN_PASSWORD_HASH');
  });

  it.each(['1h', '15m', '3600'])('aceita JWT_EXPIRES_IN=%s', (value) => {
    expect(
      validateEnv({ ...valid, JWT_EXPIRES_IN: value }).JWT_EXPIRES_IN,
    ).toBe(value);
  });

  it('recusa JWT_EXPIRES_IN invalido', () => {
    expect(() => validateEnv({ ...valid, JWT_EXPIRES_IN: 'uma hora' })).toThrow(
      'JWT_EXPIRES_IN',
    );
  });
});
