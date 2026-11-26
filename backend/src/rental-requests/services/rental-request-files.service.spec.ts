import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { InMemoryStorage } from '../../storage/in-memory.storage';
import type { ValidatedUpload } from '../pipes/parse-uploads.pipe';
import { RentalRequestFilesService } from './rental-request-files.service';
import { RentalRequestsService } from './rental-requests.service';
import type { RentalRequest } from '../schemas/rental-request.schema';
import { RentalRequestStatus } from '../rules/status-transitions';

const query = <T>(value: T | Error) => ({
  lean: () =>
    value instanceof Error ? Promise.reject(value) : Promise.resolve(value),
});

const upload = (name = 'contrato.pdf'): ValidatedUpload => ({
  buffer: Buffer.from('%PDF-1.4'),
  originalName: name,
  size: 8,
  type: { kind: 'pdf', ext: '.pdf', mimeType: 'application/pdf' },
});

const config = {
  get: () => 300,
} as unknown as ConfigService;

function setup(model: Partial<Record<keyof Model<RentalRequest>, jest.Mock>>) {
  const storage = new InMemoryStorage();
  const files = new RentalRequestFilesService(
    model as unknown as Model<RentalRequest>,
    storage,
    config as never,
  );
  return { storage, files };
}

const id = new Types.ObjectId();
const fileId = new Types.ObjectId();
const doc = (
  status = RentalRequestStatus.PENDING,
  key = 'rental-requests/x/antigo.pdf',
) => ({
  _id: id,
  status,
  files: [
    {
      _id: fileId,
      key,
      originalName: 'a.pdf',
      mimeType: 'application/pdf',
      size: 1,
      uploadedAt: new Date(),
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('RentalRequestFilesService', () => {
  let logError: jest.SpyInstance;
  beforeEach(() => {
    logError = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
  });
  afterEach(() => jest.restoreAllMocks());

  describe('uploadAll', () => {
    it('grava com chave rental-requests/{id}/{uuid}.{ext}, sem o nome original', async () => {
      const { files, storage } = setup({});

      const [meta] = await files.uploadAll(id, [
        upload('../../etc/passwd.pdf'),
      ]);

      expect(meta.key).toMatch(
        new RegExp(`^rental-requests/${String(id)}/[0-9a-f-]{36}\\.pdf$`),
      );
      expect(meta.key).not.toContain('passwd');
      expect(storage.objects.get(meta.key)?.contentType).toBe(
        'application/pdf',
      );
    });

    it('se o 2o envio falha, apaga o 1o e repassa o erro', async () => {
      const { files, storage } = setup({});
      const put = jest.spyOn(storage, 'put');
      put.mockImplementationOnce(InMemoryStorage.prototype.put.bind(storage));
      put.mockRejectedValueOnce(new Error('S3 fora'));

      await expect(files.uploadAll(id, [upload(), upload()])).rejects.toThrow(
        'S3 fora',
      );
      expect(storage.objects.size).toBe(0);
    });
  });

  describe('add', () => {
    it('$push nao aplica (limite): apaga o objeto enviado e responde 409', async () => {
      const { files, storage } = setup({
        findOneAndUpdate: jest.fn(() => query(null)),
        findById: jest.fn(() => query(doc())),
      });

      await expect(files.add(String(id), [upload()])).rejects.toMatchObject({
        code: 'FILE_LIMIT_REACHED',
        status: 409,
      });
      expect(storage.objects.size).toBe(0);
    });

    it('condicao de limite vai na propria query: files.{5-n} inexistente', async () => {
      const findOneAndUpdate = jest.fn(() => query(doc()));
      const { files } = setup({ findOneAndUpdate });

      await files.add(String(id), [upload(), upload()]);

      expect(findOneAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ 'files.3': { $exists: false } }),
        expect.anything(),
        expect.anything(),
      );
    });

    it('estado final: 409 REQUEST_NOT_EDITABLE e nada fica no storage', async () => {
      const { files, storage } = setup({
        findOneAndUpdate: jest.fn(() => query(null)),
        findById: jest.fn(() => query(doc(RentalRequestStatus.APPROVED))),
      });

      await expect(files.add(String(id), [upload()])).rejects.toMatchObject({
        code: 'REQUEST_NOT_EDITABLE',
      });
      expect(storage.objects.size).toBe(0);
    });

    it('erro do Mongo no $push: apaga o objeto enviado', async () => {
      const { files, storage } = setup({
        findOneAndUpdate: jest.fn(() => query(new Error('mongo caiu'))),
      });

      await expect(files.add(String(id), [upload()])).rejects.toThrow(
        'mongo caiu',
      );
      expect(storage.objects.size).toBe(0);
    });
  });

  describe('remove', () => {
    it('$pull primeiro, depois apaga o objeto', async () => {
      const { files, storage } = setup({
        findOneAndUpdate: jest.fn(() => query(doc())),
      });
      await storage.put({
        key: 'rental-requests/x/antigo.pdf',
        body: Buffer.alloc(1),
        contentType: 'application/pdf',
      });

      await files.remove(String(id), String(fileId));

      expect(storage.objects.has('rental-requests/x/antigo.pdf')).toBe(false);
    });

    it('falha no DeleteObject apos o $pull: conclui e loga a chave orfa', async () => {
      const { files, storage } = setup({
        findOneAndUpdate: jest.fn(() => query(doc())),
      });
      jest.spyOn(storage, 'delete').mockRejectedValue(new Error('S3 fora'));

      await expect(
        files.remove(String(id), String(fileId)),
      ).resolves.toBeUndefined();
      expect(logError).toHaveBeenCalledWith(
        'Objeto orfao no storage: rental-requests/x/antigo.pdf',
        expect.any(String),
      );
    });

    it('arquivo inexistente: 404 FILE_NOT_FOUND', async () => {
      const { files } = setup({
        findOneAndUpdate: jest.fn(() => query(null)),
        findById: jest.fn(() => query({ ...doc(), files: [] })),
      });

      await expect(
        files.remove(String(id), String(fileId)),
      ).rejects.toMatchObject({ code: 'FILE_NOT_FOUND', status: 404 });
    });
  });

  describe('replace', () => {
    it('troca falhou: apaga o novo e mantem o antigo', async () => {
      const { files, storage } = setup({
        findOneAndUpdate: jest.fn(() => query(null)),
        findById: jest.fn(() => query(doc(RentalRequestStatus.CANCELLED))),
      });
      await storage.put({
        key: 'rental-requests/x/antigo.pdf',
        body: Buffer.alloc(1),
        contentType: 'application/pdf',
      });

      await expect(
        files.replace(String(id), String(fileId), upload()),
      ).rejects.toMatchObject({ code: 'REQUEST_NOT_EDITABLE' });
      expect([...storage.objects.keys()]).toEqual([
        'rental-requests/x/antigo.pdf',
      ]);
    });
  });
});

describe('RentalRequestsService.create', () => {
  it('Mongo falha apos o upload: storage.delete recebe as chaves enviadas', async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const model = {
      create: jest.fn().mockRejectedValue(new Error('mongo caiu')),
    };
    const { files, storage } = setup(model);
    const del = jest.spyOn(storage, 'delete');
    const service = new RentalRequestsService(
      model as unknown as Model<RentalRequest>,
      files,
    );

    await expect(
      service.create(
        {
          name: 'Teste',
          email: 'a@b.com',
          phone: '11987654321',
          description: 'descricao valida',
        },
        [upload(), upload()],
      ),
    ).rejects.toThrow('mongo caiu');

    const sentKeys = (model.create.mock.calls[0][0] as RentalRequest).files.map(
      (f) => f.key,
    );
    expect(del.mock.calls.map(([k]) => k).sort()).toEqual(sentKeys.sort());
    expect(storage.objects.size).toBe(0);
  });
});
