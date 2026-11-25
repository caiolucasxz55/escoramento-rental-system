import { model, Types } from 'mongoose';
import { RequestStatus } from '../status-transitions';
import { Request, RequestSchema } from './request.schema';

// modelo sem conexao: validateSync e toJSON nao tocam o banco
const RequestModel = model(Request.name, RequestSchema);

const file = (n: number) => ({
  key: `requests/x/${n}.pdf`,
  originalName: `doc-${n}.pdf`,
  mimeType: 'application/pdf',
  size: 100,
});

const base = {
  name: 'Construtora Teste',
  email: 'Contato@Exemplo.com',
  phone: '11987654321',
  description: 'Preciso de escoras por 30 dias.',
  consultationTokenHash: 'a'.repeat(64),
};

describe('RequestSchema', () => {
  it('aceita uma solicitacao valida com status PENDING por padrao', () => {
    const doc = new RequestModel(base);

    expect(doc.validateSync()).toBeUndefined();
    expect(doc.status).toBe(RequestStatus.PENDING);
    expect(doc.email).toBe('contato@exemplo.com');
  });

  it('aceita 5 arquivos e recusa 6', () => {
    const five = new RequestModel({
      ...base,
      files: [1, 2, 3, 4, 5].map(file),
    });
    const six = new RequestModel({
      ...base,
      files: [1, 2, 3, 4, 5, 6].map(file),
    });

    expect(five.validateSync()).toBeUndefined();
    expect(six.validateSync()?.errors.files).toBeDefined();
  });

  it.each(['119876543', '11987654321000', '(11) 98765-4321'])(
    'recusa telefone %s (so 10 a 13 digitos)',
    (phone) => {
      const doc = new RequestModel({ ...base, phone });

      expect(doc.validateSync()?.errors.phone).toBeDefined();
    },
  );

  it('recusa status fora do enum', () => {
    const doc = new RequestModel({ ...base, status: 'ARCHIVED' });

    expect(doc.validateSync()?.errors.status).toBeDefined();
  });

  it('toJSON expoe id e esconde hash, __v e chave do S3', () => {
    const json = new RequestModel({
      ...base,
      files: [file(1)],
    }).toJSON() as Record<string, unknown> & {
      files: Record<string, unknown>[];
    };

    expect(json.id).toMatch(/^[0-9a-f]{24}$/);
    expect(json).not.toHaveProperty('_id');
    expect(json).not.toHaveProperty('__v');
    expect(json).not.toHaveProperty('consultationTokenHash');
    expect(json.files[0]).toHaveProperty('id');
    expect(json.files[0]).not.toHaveProperty('key');
    expect(json.files[0]).not.toHaveProperty('_id');
  });

  it('declara os indices de listagem', () => {
    const indexes = RequestSchema.indexes().map(([fields]) => fields);

    expect(indexes).toContainEqual({ status: 1, createdAt: -1 });
    expect(indexes).toContainEqual({ createdAt: -1 });
  });

  it('nao seleciona o hash do token por padrao', () => {
    expect(RequestSchema.path('consultationTokenHash').options.select).toBe(
      false,
    );
  });

  it('gera ObjectId para cada arquivo (usado como fileId)', () => {
    const doc = new RequestModel({ ...base, files: [file(1)] });

    expect(doc.files[0]._id).toBeInstanceOf(Types.ObjectId);
  });
});
