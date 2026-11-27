import './support/upload-total-env';
import { multipart, PDF, VALID_FIELDS } from './support/fixtures';
import { createTestApp, TestApp } from './support/test-app';

// teto de 1 MB por requisicao (upload-total-env): o mesmo papel dos 4 MB no Lambda
describe('Limite total de upload (e2e)', () => {
  let t: TestApp;
  beforeAll(async () => (t = await createTestApp()));
  afterAll(async () => {
    delete process.env.MAX_TOTAL_UPLOAD_MB;
    await t?.close();
  });

  const half = () => ({
    buffer: Buffer.concat([PDF, Buffer.alloc(600 * 1024)]),
    name: 'parte.pdf',
  });

  it('arquivos que somam mais que o teto: 413 UPLOAD_TOO_LARGE e nada gravado', async () => {
    const docs = await t.model.countDocuments();
    const objects = t.storage.objects.size;

    const res = await multipart(
      t.http().post('/api/public/requests'),
      VALID_FIELDS,
      [half(), half()],
    ).expect(413);

    expect(res.body).toMatchObject({ error: 'UPLOAD_TOO_LARGE' });
    expect(await t.model.countDocuments()).toBe(docs);
    expect(t.storage.objects.size).toBe(objects);
  });

  it('dentro do teto: 201', async () => {
    await multipart(t.http().post('/api/public/requests'), VALID_FIELDS, [
      half(),
    ]).expect(201);
  });
});
