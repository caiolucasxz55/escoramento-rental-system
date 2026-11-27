import { RATE_LIMIT } from '../src/common/rate-limit';
import { ADMIN_EMAIL } from './support/setup-env';
import { createTestApp, TestApp } from './support/test-app';

// padrao (sem TRUST_PROXY_HOPS): o X-Forwarded-For e ignorado, nao da para forjar outro IP
describe('X-Forwarded-For sem proxy confiavel (e2e)', () => {
  let t: TestApp;
  beforeAll(async () => (t = await createTestApp({ rateLimit: true })));
  afterAll(() => t?.close());

  const login = (ip: string) =>
    t
      .http()
      .post('/api/auth/login')
      .set('X-Forwarded-For', ip)
      .send({ email: ADMIN_EMAIL, password: 'errada' });

  it('trocar o IP no header a cada tentativa nao zera o limite', async () => {
    // o createTestApp ja fez 1 login
    for (let i = 1; i < RATE_LIMIT.limit; i++) {
      await login(`198.51.100.${i}`).expect(401);
    }

    await login('198.51.100.250').expect(429);
  });
});
