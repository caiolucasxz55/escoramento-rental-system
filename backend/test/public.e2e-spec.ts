import { createTestApp, TestApp } from './support/test-app';
import {
  EXE,
  multipart,
  PDF,
  pdf,
  png,
  VALID_FIELDS,
} from './support/fixtures';

interface Created {
  id: string;
  token: string;
  status: string;
}

describe('Area publica (e2e)', () => {
  let t: TestApp;
  beforeAll(async () => (t = await createTestApp()));
  afterAll(() => t?.close());

  const create = (files = [pdf(), png()], fields = VALID_FIELDS) =>
    multipart(t.http().post('/api/public/requests'), fields, files);

  describe('POST /api/public/requests', () => {
    it('dados validos e 2 arquivos: 201, PENDING, id e token, 2 objetos no storage', async () => {
      const before = t.storage.objects.size;

      const res = await create().expect(201);
      const body = res.body as Created;

      expect(body).toEqual({
        id: expect.stringMatching(/^[0-9a-f]{24}$/),
        token: expect.any(String),
        status: 'PENDING',
      });
      expect(t.storage.objects.size - before).toBe(2);

      const saved = await t.model
        .findById(body.id)
        .select('+consultationTokenHash')
        .lean();
      expect(saved?.consultationTokenHash).toMatch(/^[0-9a-f]{64}$/);
      expect(JSON.stringify(saved)).not.toContain(body.token);
      for (const file of saved!.files) {
        expect(file.key).toMatch(
          new RegExp(`^rental-requests/${body.id}/[0-9a-f-]{36}\\.(pdf|png)$`),
        );
        expect(t.storage.objects.has(file.key)).toBe(true);
      }
    });

    it.each([
      ['e-mail invalido', { ...VALID_FIELDS, email: 'nao-e-email' }],
      ['campo extra', { ...VALID_FIELDS, status: 'APPROVED' }],
    ])('%s: 400', async (_label, fields) => {
      const res = await create([], fields).expect(400);

      expect(res.body).toMatchObject({ error: 'VALIDATION_ERROR' });
    });

    it.each([
      [
        'descricao curta',
        { ...VALID_FIELDS, description: '  curta   ' },
        'A descrição deve ter entre 10 e 2000 caracteres.',
      ],
      [
        'campo extra',
        { ...VALID_FIELDS, status: 'APPROVED' },
        'O campo "status" não é permitido.',
      ],
    ])('%s: mensagem em portugues', async (_label, fields, message) => {
      const res = await create([], fields).expect(400);

      expect(res.body.message).toContain(message);
    });

    it('6 arquivos: 400 e nada gravado no Mongo nem no storage', async () => {
      const docs = await t.model.countDocuments();
      const objects = t.storage.objects.size;

      const res = await create(Array.from({ length: 6 }, () => pdf())).expect(
        400,
      );

      expect(res.body).toMatchObject({
        error: 'TOO_MANY_FILES',
        message: 'Envie no máximo 5 arquivos.',
      });

      expect(await t.model.countDocuments()).toBe(docs);
      expect(t.storage.objects.size).toBe(objects);
    });

    it('executavel renomeado para .pdf: 415 e nada no storage', async () => {
      const objects = t.storage.objects.size;

      const res = await create([
        pdf(),
        { buffer: EXE, name: 'nota.pdf' },
      ]).expect(415);

      expect(res.body).toMatchObject({ error: 'UNSUPPORTED_FILE_TYPE' });
      expect(t.storage.objects.size).toBe(objects);
    });

    it('PDF renomeado para .png e aceito como PDF', async () => {
      const res = await create([{ buffer: PDF, name: 'foto.png' }]).expect(201);

      const saved = await t.model.findById((res.body as Created).id).lean();
      expect(saved?.files[0]).toMatchObject({
        originalName: 'foto.png',
        mimeType: 'application/pdf',
      });
      expect(saved?.files[0].key).toMatch(/\.pdf$/);
    });

    it('arquivo acima do limite (1 MB no teste): 413', async () => {
      const big = Buffer.concat([PDF, Buffer.alloc(1024 * 1024)]);

      const res = await create([{ buffer: big, name: 'grande.pdf' }]).expect(
        413,
      );

      expect(res.body).toMatchObject({ error: 'FILE_TOO_LARGE' });
    });
  });

  describe('GET /api/public/requests/:id/status', () => {
    let created: Created;
    beforeAll(async () => {
      created = (await create().expect(201)).body as Created;
    });

    const status = (id: string, token?: string) => {
      const req = t.http().get(`/api/public/requests/${id}/status`);
      return token === undefined ? req : req.set('X-Consultation-Token', token);
    };

    it('token certo: 200 sem e-mail, telefone nem links', async () => {
      const res = await status(created.id, created.token).expect(200);

      expect(Object.keys(res.body as object).sort()).toEqual(
        ['createdAt', 'filesCount', 'id', 'status', 'updatedAt'].sort(),
      );
      expect(res.body).toMatchObject({
        id: created.id,
        status: 'PENDING',
        filesCount: 2,
      });
    });

    it('token errado e id inexistente: o mesmo 404', async () => {
      const wrong = await status(created.id, 'token-errado').expect(404);
      const missing = await status(
        '665f1c2b9a1e4b0012345678',
        created.token,
      ).expect(404);

      const comparable = (b: object) => {
        const {
          path: _p,
          timestamp: _t,
          ...rest
        } = b as Record<string, unknown>;
        return rest;
      };
      expect(comparable(wrong.body as object)).toEqual(
        comparable(missing.body as object),
      );
    });

    it('token so na query string nao vale: 404', async () => {
      await t
        .http()
        .get(`/api/public/requests/${created.id}/status?token=${created.token}`)
        .expect(404);
    });

    it('id malformado: 400', async () => {
      await status('abc', created.token).expect(400);
    });
  });
});
