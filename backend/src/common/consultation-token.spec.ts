import { timingSafeEqual } from 'node:crypto';
import {
  consultationTokenMatches,
  generateConsultationToken,
  hashConsultationToken,
} from './consultation-token';

// envolve o timingSafeEqual real para contar chamadas
jest.mock('node:crypto', () => {
  const actual =
    jest.requireActual<typeof import('node:crypto')>('node:crypto');
  return { ...actual, timingSafeEqual: jest.fn(actual.timingSafeEqual) };
});

describe('token de consulta', () => {
  it('gera 256 bits em base64url', () => {
    const token = generateConsultationToken();

    expect(Buffer.from(token, 'base64url')).toHaveLength(32);
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it('gera tokens diferentes a cada chamada', () => {
    expect(generateConsultationToken()).not.toBe(generateConsultationToken());
  });

  it('o hash e deterministico e nao contem o token', () => {
    const token = generateConsultationToken();
    const hash = hashConsultationToken(token);

    expect(hash).toBe(hashConsultationToken(token));
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).not.toContain(token);
  });

  it('o token certo confere', () => {
    const token = generateConsultationToken();

    expect(consultationTokenMatches(token, hashConsultationToken(token))).toBe(
      true,
    );
  });

  it('token errado nao confere', () => {
    const hash = hashConsultationToken(generateConsultationToken());

    expect(consultationTokenMatches(generateConsultationToken(), hash)).toBe(
      false,
    );
    expect(consultationTokenMatches('', hash)).toBe(false);
  });

  it('hash guardado malformado nao confere e nao lanca', () => {
    const token = generateConsultationToken();

    expect(consultationTokenMatches(token, '')).toBe(false);
    expect(consultationTokenMatches(token, 'nao-e-hex')).toBe(false);
  });

  it('compara com timingSafeEqual', () => {
    const compare = jest.mocked(timingSafeEqual);
    compare.mockClear();
    const token = generateConsultationToken();

    consultationTokenMatches(token, hashConsultationToken(token));

    expect(compare).toHaveBeenCalledTimes(1);
  });
});
