import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

// 256 bits aleatorios: SHA-256 basta, bcrypt nao agrega aqui
const TOKEN_BYTES = 32;

export function generateConsultationToken(): string {
  return randomBytes(TOKEN_BYTES).toString('base64url');
}

export function hashConsultationToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

// hash x hash: buffers de mesmo tamanho, timingSafeEqual nao lanca
export function consultationTokenMatches(
  token: string,
  storedHash: string,
): boolean {
  const received = Buffer.from(hashConsultationToken(token), 'hex');
  const stored = Buffer.from(storedHash, 'hex');

  return stored.length === received.length && timingSafeEqual(received, stored);
}
