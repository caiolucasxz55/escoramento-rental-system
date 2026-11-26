import './support/quota-env';
import { multipart, PDF, VALID_FIELDS } from './support/fixtures';
import { createTestApp, TestApp } from './support/test-app';

// cota de 1 MB (quota-env); arquivos de ~600 KB: o primeiro cabe, o segundo nao
describe('Cota de armazenamento (e2e)', () => {
  let t: TestApp;
  beforeAll(async () => (t = await createTestApp()));
  afterAll(async () => {
    delete process.env.STORAGE_QUOTA_MB;
    await t?.close();
  });

  const half = {
    buffer: Buffer.concat([PDF, Buffer.alloc(600 * 1024)]),
    name: 'grande.pdf',
  };
  const create = (files = [half]) =>
    multipart(t.http().post('/api/public/requests'), VALID_FIELDS, files);

  it('dentro da cota: 201', async () => {
    await create().expect(201);
  });

  it('passando da cota: 507, nada novo no Mongo nem no storage', async () => {
    const docs = await t.model.countDocuments();
    const objects = t.storage.objects.size;

    const res = await create().expect(507);

    expect(res.body).toMatchObject({ error: 'STORAGE_QUOTA_EXCEEDED' });
    expect(await t.model.countDocuments()).toBe(docs);
    expect(t.storage.objects.size).toBe(objects);
  });

  it('sem anexos continua aceitando', async () => {
    await create([]).expect(201);
  });
});
