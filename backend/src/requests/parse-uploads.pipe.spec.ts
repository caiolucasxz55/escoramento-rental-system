import { ConfigService } from '@nestjs/config';
import { ParseUploadsPipe } from './parse-uploads.pipe';

const PDF = Buffer.from('%PDF-1.4 conteudo');
const pipe = new ParseUploadsPipe({
  get: () => 1, // MAX_FILE_SIZE_MB
} as unknown as ConfigService as never);

const file = (buffer: Buffer, originalname = 'a.pdf') =>
  ({ buffer, originalname, size: buffer.length }) as Express.Multer.File;

describe('ParseUploadsPipe', () => {
  it('sem arquivos devolve lista vazia', () => {
    expect(pipe.transform(undefined)).toEqual([]);
  });

  it('aceita arquivo unico ou lista e usa o tipo detectado', () => {
    const [single] = pipe.transform(file(PDF, 'foto.png'));

    expect(single.type.mimeType).toBe('application/pdf');
    expect(single.originalName).toBe('foto.png');
    expect(pipe.transform([file(PDF), file(PDF)])).toHaveLength(2);
  });

  it.each([
    ['vazio', Buffer.alloc(0), 'EMPTY_FILE', 400],
    [
      'acima do limite',
      Buffer.concat([PDF, Buffer.alloc(1024 * 1024)]),
      'FILE_TOO_LARGE',
      413,
    ],
    [
      'tipo nao aceito',
      Buffer.from('MZ executavel'),
      'UNSUPPORTED_FILE_TYPE',
      415,
    ],
  ])('%s -> %s %s', (_label, buffer, code, status) => {
    expect(() => pipe.transform(file(buffer))).toThrow(
      expect.objectContaining({ code, status }),
    );
  });

  it('um arquivo ruim recusa o lote inteiro', () => {
    expect(() =>
      pipe.transform([file(PDF), file(Buffer.from('texto'))]),
    ).toThrow(expect.objectContaining({ code: 'UNSUPPORTED_FILE_TYPE' }));
  });
});
