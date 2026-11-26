import { RATE_LIMIT } from '../src/common/rate-limit';
import { multipart, pdf, VALID_FIELDS } from './support/fixtures';
import { ADMIN_EMAIL } from './support/setup-env';
import { createTestApp, TestApp } from './support/test-app';

// limite contado por rota: cada describe gasta o seu
describe('Rate limit (e2e)', () => {
  let t: TestApp;
  beforeAll(async () => (t = await createTestApp({ rateLimit: true })));
  afterAll(() => t?.close());

  const spend = async (times: number, send: () => PromiseLike<unknown>) => {
    for (let i = 0; i < times; i++) await send();
  };

  it(`criacao publica: a ${RATE_LIMIT.limit + 1}a no minuto da 429 e nao grava nada`, async () => {
    const create = () =>
      multipart(t.http().post('/api/public/requests'), VALID_FIELDS, [pdf()]);
    await spend(RATE_LIMIT.limit, () => create().expect(201));
    const docs = await t.model.countDocuments();
    const objects = t.storage.objects.size;

    const res = await create().expect(429);

    expect(res.body).toMatchObject({ error: 'TOO_MANY_REQUESTS' });
    expect(await t.model.countDocuments()).toBe(docs);
    expect(t.storage.objects.size).toBe(objects);
  });

  it('consulta publica: limite proprio, nao herda o gasto da criacao', async () => {
    const lookup = () =>
      t
        .http()
        .get('/api/public/requests/6b08809539d6de13ca52b57a/status')
        .set('x-consultation-token', 'errado');
    await spend(RATE_LIMIT.limit, () => lookup().expect(404));

    await lookup().expect(429);
  });

  it('login: barra a forca bruta', async () => {
    const login = () =>
      t
        .http()
        .post('/api/auth/login')
        .send({ email: ADMIN_EMAIL, password: 'errada' });
    // o createTestApp ja fez 1 login
    await spend(RATE_LIMIT.limit - 1, () => login().expect(401));

    await login().expect(429);
  });
});
