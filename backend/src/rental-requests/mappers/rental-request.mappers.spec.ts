import { Types } from 'mongoose';
import { toDetail, toListItem, toPublicStatus } from './rental-request.mappers';
import { RentalRequestStatus } from '../rules/status-transitions';

const now = new Date('2026-11-25T18:00:00.000Z');
const fileId = new Types.ObjectId();
const rentalRequest = {
  _id: new Types.ObjectId(),
  name: 'Construtora Teste',
  email: 'contato@exemplo.com',
  phone: '11987654321',
  description: 'Preciso de escoras por 30 dias.',
  status: RentalRequestStatus.PENDING,
  files: [
    {
      _id: fileId,
      key: 'rental-requests/abc/segredo.pdf',
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
    expect(toPublicStatus(rentalRequest)).toEqual({
      id: String(rentalRequest._id),
      status: RentalRequestStatus.PENDING,
      filesCount: 1,
      createdAt: now,
      updatedAt: now,
    });
  });

  it('toListItem usa o filesCount da projecao', () => {
    expect(
      toListItem({
        _id: rentalRequest._id,
        name: rentalRequest.name,
        status: rentalRequest.status,
        createdAt: now,
        filesCount: 3,
      }),
    ).toEqual({
      id: String(rentalRequest._id),
      name: 'Construtora Teste',
      status: RentalRequestStatus.PENDING,
      filesCount: 3,
      createdAt: now,
    });
  });

  it('toDetail inclui os arquivos sem a chave do S3', () => {
    const detail = toDetail(rentalRequest);

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
