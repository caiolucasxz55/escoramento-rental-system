import { RentalRequestStatus } from '../src/rental-requests/rules/status-transitions';
import { ADMIN_EMAIL } from './support/setup-env';
import { createTestApp, TestApp } from './support/test-app';

const { PENDING, UNDER_REVIEW, APPROVED, CANCELLED } = RentalRequestStatus;

describe('Area admin (e2e)', () => {
  let t: TestApp;
  beforeAll(async () => (t = await createTestApp()));
  afterAll(() => t?.close());

  const auth = () => ({ Authorization: `Bearer ${t.adminToken}` });

  // grava direto no banco: so o setup do teste, as regras passam pela API
  const seed = async (status = PENDING, name = 'Construtora Teste') => {
    const doc = await t.model.create({
      name,
      email: 'contato@exemplo.com',
      phone: '11987654321',
      description: 'Preciso de escoras por 30 dias.',
      status,
      consultationTokenHash: 'a'.repeat(64),
    });
    return String(doc._id);
  };

  const changeStatus = (id: string, status: string) =>
    t
      .http()
      .patch(`/api/admin/requests/${id}/status`)
      .set(auth())
      .send({ status });

  describe('autenticacao', () => {
    it.each([
      ['sem JWT', {}],
      ['JWT invalido', { Authorization: 'Bearer abc.def.ghi' }],
      ['esquema errado', { Authorization: `Basic ${'x'}` }],
    ])('rota admin %s: 401', async (_label, headers) => {
      await t.http().get('/api/admin/requests').set(headers).expect(401);
    });

    it('login com senha errada: 401', async () => {
      const res = await t
        .http()
        .post('/api/auth/login')
        .send({ email: ADMIN_EMAIL, password: 'errada' })
        .expect(401);

      expect(res.body).toMatchObject({ error: 'INVALID_CREDENTIALS' });
    });
  });

  describe('listagem', () => {
    beforeAll(async () => {
      await t.model.deleteMany({});
      for (let i = 0; i < 7; i++) await seed(PENDING, `Pendente ${i}`);
      for (let i = 0; i < 3; i++) await seed(APPROVED, `Aprovada ${i}`);
    });

    it('limit=5 e status=PENDING: meta correto e so o status pedido', async () => {
      const res = await t
        .http()
        .get('/api/admin/requests?limit=5&status=PENDING')
        .set(auth())
        .expect(200);
      const body = res.body as {
        data: { status: string; createdAt: string }[];
        meta: object;
      };

      expect(body.meta).toEqual({ page: 1, limit: 5, total: 7, totalPages: 2 });
      expect(body.data).toHaveLength(5);
      expect(body.data.every((d) => d.status === PENDING)).toBe(true);
      expect(
        body.data.every(
          (d, i, a) => i === 0 || a[i - 1].createdAt >= d.createdAt,
        ),
      ).toBe(true);
    });

    it('pagina 2 traz o restante', async () => {
      const res = await t
        .http()
        .get('/api/admin/requests?page=2&limit=5&status=PENDING')
        .set(auth())
        .expect(200);

      expect((res.body as { data: unknown[] }).data).toHaveLength(2);
    });

    it.each(['page=0', 'limit=51', 'status=FOO'])('%s: 400', async (qs) => {
      await t.http().get(`/api/admin/requests?${qs}`).set(auth()).expect(400);
    });
  });

  describe('mudanca de status', () => {
    it('PENDING -> UNDER_REVIEW -> APPROVED: 200 em cada passo', async () => {
      const id = await seed();

      const first = await changeStatus(id, UNDER_REVIEW).expect(200);
      const second = await changeStatus(id, APPROVED).expect(200);

      expect(first.body).toMatchObject({ status: UNDER_REVIEW });
      expect(second.body).toMatchObject({ status: APPROVED });
    });

    it.each([
      [CANCELLED, APPROVED],
      [APPROVED, PENDING],
      [PENDING, PENDING],
    ])('%s -> %s: 409', async (from, to) => {
      const id = await seed(from);

      const res = await changeStatus(id, to).expect(409);

      expect(res.body).toMatchObject({ error: 'INVALID_STATUS_TRANSITION' });
    });

    it('id inexistente: 404', async () => {
      await changeStatus('665f1c2b9a1e4b0012345678', CANCELLED).expect(404);
    });

    it('duas mudancas concorrentes a partir do mesmo status: uma 200 e uma 409', async () => {
      const id = await seed();

      // segura as duas leituras ate ambas verem PENDING: forca a corrida real
      let arrived = 0;
      let release!: () => void;
      const bothRead = new Promise<void>((resolve) => (release = resolve));
      const findById = t.model.findById.bind(t.model);
      const spy = jest
        .spyOn(t.model, 'findById')
        .mockImplementation((...args: Parameters<typeof findById>) => {
          const query = findById(...args);
          const lean = query.lean.bind(query);
          return Object.assign(query, {
            lean: () =>
              lean().then(async (doc: unknown) => {
                if (++arrived === 2) release();
                await bothRead;
                return doc;
              }),
          });
        });

      const [a, b] = await Promise.all([
        changeStatus(id, UNDER_REVIEW),
        changeStatus(id, CANCELLED),
      ]);
      spy.mockRestore();

      const codes = [a.status, b.status].sort((x, y) => x - y);
      expect(codes).toEqual([200, 409]);
      const conflict = [a, b].find((r) => r.status === 409)!;
      expect(conflict.body).toMatchObject({ error: 'STATUS_CONFLICT' });

      const winner = [a, b].find((r) => r.status === 200)!;
      const saved = await t.model.findById(id).lean();
      expect(saved?.status).toBe((winner.body as { status: string }).status);
    });
  });

  describe('edicao', () => {
    const patch = (id: string, body: object) =>
      t.http().patch(`/api/admin/requests/${id}`).set(auth()).send(body);

    it('editar solicitacao APPROVED: 409', async () => {
      const id = await seed(APPROVED);

      const res = await patch(id, { name: 'Outro Nome' }).expect(409);

      expect(res.body).toMatchObject({ error: 'REQUEST_NOT_EDITABLE' });
    });

    it('PATCH com campo status: 400', async () => {
      const id = await seed();

      await patch(id, { status: APPROVED }).expect(400);
      expect((await t.model.findById(id).lean())?.status).toBe(PENDING);
    });

    it('PATCH valido: 200 e updatedAt avanca', async () => {
      const id = await seed();
      const before = (await t.model.findById(id).lean())!.updatedAt;
      await new Promise((r) => setTimeout(r, 10));

      const res = await patch(id, { phone: '+55 (11) 91234-5678' }).expect(200);
      const body = res.body as { phone: string; updatedAt: string };

      expect(body.phone).toBe('5511912345678');
      expect(new Date(body.updatedAt).getTime()).toBeGreaterThan(
        before.getTime(),
      );
    });
  });
});
