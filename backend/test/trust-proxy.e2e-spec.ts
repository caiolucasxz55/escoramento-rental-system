import './support/trust-proxy-env';
import { RATE_LIMIT } from '../src/common/rate-limit';
import { ADMIN_EMAIL } from './support/setup-env';
import { createTestApp, TestApp } from './support/test-app';

// atras do balanceador (TRUST_PROXY_HOPS=1): o limite conta por cliente, nao pelo IP do balanceador
describe('Rate limit atras de proxy (e2e)', () => {
  let t: TestApp;
  beforeAll(async () => (t = await createTestApp({ rateLimit: true })));
  afterAll(async () => {
    delete process.env.TRUST_PROXY_HOPS;
    await t?.close();
  });

  const login = (clientIp: string) =>
    t
      .http()
      .post('/api/auth/login')
      // o balanceador acrescenta o IP de quem conectou no fim da lista
      .set('X-Forwarded-For', clientIp)
      .send({ email: ADMIN_EMAIL, password: 'errada' });

  it('cada cliente tem o seu limite', async () => {
    for (let i = 0; i < RATE_LIMIT.limit; i++) {
      await login('203.0.113.10').expect(401);
    }

    await login('203.0.113.10').expect(429);
    await login('203.0.113.20').expect(401);
  });
});
