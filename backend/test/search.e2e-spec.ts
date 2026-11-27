import { RentalRequestStatus } from '../src/rental-requests/rules/status-transitions';
import { createTestApp, TestApp } from './support/test-app';

const { PENDING, APPROVED } = RentalRequestStatus;

interface ListBody {
  data: { name: string; status: string }[];
  meta: { total: number };
}

describe('Busca na listagem do admin (e2e)', () => {
  let t: TestApp;
  beforeAll(async () => {
    t = await createTestApp();
    // grava direto no banco: so o setup do teste, a busca passa pela API
    const rows: [string, string, string, RentalRequestStatus][] = [
      ['João Silva', 'joao@obra.com', '11987654321', PENDING],
      ['Joana Souza', 'joana@obra.com', '21912345678', APPROVED],
      [
        'Construtora Conceição',
        'compras@conceicao.com',
        '31933334444',
        PENDING,
      ],
      ['Obra (.*) Especial', 'especial@obra.com', '41955556666', PENDING],
    ];
    await t.model.create(
      rows.map(([name, email, phone, status]) => ({
        name,
        email,
        phone,
        status,
        description: 'Preciso de escoras por 30 dias.',
        consultationTokenHash: 'a'.repeat(64),
      })),
    );
  });
  afterAll(() => t?.close());

  const search = async (query: string, status = 200) =>
    (
      await t
        .http()
        .get(`/api/admin/requests?${query}`)
        .set({ Authorization: `Bearer ${t.adminToken}` })
        .expect(status)
    ).body as ListBody;

  const names = (body: ListBody) => body.data.map((r) => r.name).sort();

  it('trecho sem acento acha o nome com acento, e o total conta so o que casa', async () => {
    const body = await search('q=joao');

    expect(names(body)).toEqual(['João Silva']);
    expect(body.meta.total).toBe(1);
  });

  it('busca tambem no e-mail e no telefone (com mascara)', async () => {
    expect(names(await search('q=CONCEICAO.COM'))).toEqual([
      'Construtora Conceição',
    ]);
    expect(
      names(await search(`q=${encodeURIComponent('(21) 91234')}`)),
    ).toEqual(['Joana Souza']);
  });

  it('combina com o filtro de status', async () => {
    const body = await search('q=jo&status=PENDING');

    expect(names(body)).toEqual(['João Silva']);
    expect(body.data.every((r) => r.status === PENDING)).toBe(true);
  });

  it('caracteres de regex sao literais: "(.*" nao casa tudo', async () => {
    const body = await search(`q=${encodeURIComponent('(.*')}`);

    expect(names(body)).toEqual(['Obra (.*) Especial']);
  });

  it('termo com 1 caractere: 400 com mensagem em portugues', async () => {
    const res = await t
      .http()
      .get('/api/admin/requests?q=a')
      .set({ Authorization: `Bearer ${t.adminToken}` })
      .expect(400);

    expect(res.body).toMatchObject({ error: 'VALIDATION_ERROR' });
    expect(res.body.message).toContain(
      'A busca deve ter entre 2 e 100 caracteres.',
    );
  });

  it('q vazio e ignorado: lista tudo', async () => {
    expect((await search('q=%20%20')).meta.total).toBe(4);
  });
});
