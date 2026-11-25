import { Types } from 'mongoose';
import { toDetail, toListItem, toPublicStatus } from './request.mappers';
import { RequestStatus } from './status-transitions';

const now = new Date('2026-11-25T18:00:00.000Z');
const fileId = new Types.ObjectId();
const request = {
  _id: new Types.ObjectId(),
  name: 'Construtora Teste',
  email: 'contato@exemplo.com',
  phone: '11987654321',
  description: 'Preciso de escoras por 30 dias.',
  status: RequestStatus.PENDING,
  files: [
    {
      _id: fileId,
      key: 'requests/abc/segredo.pdf',
      originalName: 'contrato.pdf',
      mimeType: 'application/pdf',
      size: 1234,
      uploadedAt: now,
    },
  ],
  createdAt: now,
  updatedAt: now,
};

describe('mappers', () => {
  it('toPublicStatus so expoe o resumo publico (H3)', () => {
    expect(toPublicStatus(request)).toEqual({
      id: String(request._id),
      status: RequestStatus.PENDING,
      filesCount: 1,
      createdAt: now,
      updatedAt: now,
    });
  });

  it('toListItem usa o filesCount da projecao', () => {
    expect(
      toListItem({
        _id: request._id,
        name: request.name,
        status: request.status,
        createdAt: now,
        filesCount: 3,
      }),
    ).toEqual({
      id: String(request._id),
      name: 'Construtora Teste',
      status: RequestStatus.PENDING,
      filesCount: 3,
      createdAt: now,
    });
  });

  it('toDetail inclui os arquivos sem a chave do S3', () => {
    const detail = toDetail(request);

    expect(detail.files).toEqual([
      {
        id: String(fileId),
        originalName: 'contrato.pdf',
        mimeType: 'application/pdf',
        size: 1234,
        uploadedAt: now,
      },
    ]);
    expect(JSON.stringify(detail)).not.toContain('segredo.pdf');
  });
});
