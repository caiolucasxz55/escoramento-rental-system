import { RentalRequestStatus } from '../src/rental-requests/rules/status-transitions';
import { multipart, pdf, png, Upload, VALID_FIELDS } from './support/fixtures';
import { createTestApp, TestApp } from './support/test-app';

interface Detail {
  id: string;
  status: string;
  files: { id: string; originalName: string; mimeType: string }[];
}

describe('Arquivos no admin (e2e)', () => {
  let t: TestApp;
  beforeAll(async () => (t = await createTestApp()));
  afterAll(() => t?.close());

  const auth = () => ({ Authorization: `Bearer ${t.adminToken}` });

  const create = async (files: Upload[]) => {
    const res = await multipart(
      t.http().post('/api/public/requests'),
      VALID_FIELDS,
      files,
    ).expect(201);
    return (res.body as { id: string }).id;
  };
  const detail = async (id: string) =>
    (await t.http().get(`/api/admin/requests/${id}`).set(auth()).expect(200))
      .body as Detail;
  const keysOf = async (id: string) =>
    (await t.model.findById(id).lean())!.files.map((f) => f.key);
  const add = (id: string, files: Upload[]) =>
    multipart(
      t.http().post(`/api/admin/requests/${id}/files`).set(auth()),
      {},
      files,
    );

  it('o storage dos testes e o InMemoryStorage injetado pelo token STORAGE', async () => {
    const id = await create([pdf()]);

    const [key] = await keysOf(id);
    expect(t.storage.objects.get(key)?.contentType).toBe('application/pdf');
  });

  describe('adicionar', () => {
    it('ate 5: 201 e o detalhe traz os arquivos', async () => {
      const id = await create([pdf(), pdf()]);

      const res = await add(id, [png(), png(), png()]).expect(201);

      expect((res.body as Detail).files).toHaveLength(5);
    });

    it('com 5 ja presentes: 409 e nenhum objeto novo no storage', async () => {
      const id = await create([pdf(), pdf(), pdf(), pdf(), pdf()]);
      const objects = t.storage.objects.size;

      const res = await add(id, [png()]).expect(409);

      expect(res.body).toMatchObject({ error: 'FILE_LIMIT_REACHED' });
      expect(t.storage.objects.size).toBe(objects);
    });

    it('dois uploads concorrentes nao passam de 5 arquivos', async () => {
      const id = await create([pdf(), pdf(), pdf()]);
      const objects = t.storage.objects.size;

      const results = await Promise.all([
        add(id, [png(), png()]),
        add(id, [png(), png()]),
      ]);

      expect(results.map((r) => r.status).sort((x, y) => x - y)).toEqual([
        201, 409,
      ]);
      expect(await keysOf(id)).toHaveLength(5);
      // o upload recusado nao deixa objeto orfao
      expect(t.storage.objects.size - objects).toBe(2);
    });

    it('em solicitacao APPROVED: 409', async () => {
      const id = await create([pdf()]);
      await t.model.updateOne(
        { _id: id },
        { status: RentalRequestStatus.APPROVED },
      );

      const res = await add(id, [png()]).expect(409);

      expect(res.body).toMatchObject({ error: 'REQUEST_NOT_EDITABLE' });
    });
  });

  describe('remover e substituir', () => {
    it('remover: 204, some do Mongo e do storage', async () => {
      const id = await create([pdf(), png()]);
      const { files } = await detail(id);
      const [key] = await keysOf(id);

      await t
        .http()
        .delete(`/api/admin/requests/${id}/files/${files[0].id}`)
        .set(auth())
        .expect(204);

      expect((await detail(id)).files.map((f) => f.id)).toEqual([files[1].id]);
      expect(t.storage.objects.has(key)).toBe(false);
    });

    it('substituir: 200, mesmo fileId, tipo novo e objeto antigo apagado', async () => {
      const id = await create([pdf()]);
      const [file] = (await detail(id)).files;
      const [oldKey] = await keysOf(id);

      const res = await multipart(
        t.http().put(`/api/admin/requests/${id}/files/${file.id}`).set(auth()),
        {},
        [png('novo.png')],
        'file',
      ).expect(200);

      expect((res.body as Detail).files[0]).toMatchObject({
        id: file.id,
        originalName: 'novo.png',
        mimeType: 'image/png',
      });
      expect(t.storage.objects.has(oldKey)).toBe(false);
      const [newKey] = await keysOf(id);
      expect(t.storage.objects.has(newKey)).toBe(true);
    });
  });

  describe('URL assinada', () => {
    it('arquivo da propria solicitacao: 200 com expiresIn 300', async () => {
      const id = await create([pdf()]);
      const [file] = (await detail(id)).files;

      const res = await t
        .http()
        .get(`/api/admin/requests/${id}/files/${file.id}/url`)
        .set(auth())
        .expect(200);

      expect(res.body).toEqual({
        url: expect.stringContaining('rental-requests/'),
        expiresIn: 300,
      });
      // sem parametro continua forcando o download
      expect((res.body as { url: string }).url).toContain(
        'disposition=attachment',
      );
    });

    it('disposition=inline gera URL de visualizacao', async () => {
      const id = await create([pdf()]);
      const [file] = (await detail(id)).files;

      const res = await t
        .http()
        .get(
          `/api/admin/requests/${id}/files/${file.id}/url?disposition=inline`,
        )
        .set(auth())
        .expect(200);

      expect((res.body as { url: string }).url).toContain('disposition=inline');
    });

    it('disposition invalido: 400', async () => {
      const id = await create([pdf()]);
      const [file] = (await detail(id)).files;

      await t
        .http()
        .get(`/api/admin/requests/${id}/files/${file.id}/url?disposition=evil`)
        .set(auth())
        .expect(400);
    });

    it('arquivo de outra solicitacao: 404', async () => {
      const mine = await create([pdf()]);
      const other = await create([pdf()]);
      const [otherFile] = (await detail(other)).files;

      const res = await t
        .http()
        .get(`/api/admin/requests/${mine}/files/${otherFile.id}/url`)
        .set(auth())
        .expect(404);

      expect(res.body).toMatchObject({ error: 'FILE_NOT_FOUND' });
    });
  });
});
