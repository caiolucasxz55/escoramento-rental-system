import { ConfigService } from '@nestjs/config';
import { ParseUploadsPipe } from './parse-uploads.pipe';

const PDF = Buffer.from('%PDF-1.4 conteudo');
const pipeWith = (env: Record<string, number | undefined>) =>
  new ParseUploadsPipe({
    get: (key: string) => env[key],
  } as unknown as ConfigService as never);
const pipe = pipeWith({ MAX_FILE_SIZE_MB: 1 });

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

  describe('MAX_TOTAL_UPLOAD_MB', () => {
    const half = file(Buffer.concat([PDF, Buffer.alloc(600 * 1024)]));
    const limited = pipeWith({ MAX_FILE_SIZE_MB: 1, MAX_TOTAL_UPLOAD_MB: 1 });

    it('a soma passando do teto -> 413 UPLOAD_TOO_LARGE, mesmo com cada arquivo dentro do limite', () => {
      expect(() => limited.transform([half, half])).toThrow(
        expect.objectContaining({ code: 'UPLOAD_TOO_LARGE', status: 413 }),
      );
    });

    it('dentro do teto passa; sem a variavel nao ha teto', () => {
      expect(limited.transform([half])).toHaveLength(1);
      expect(pipe.transform([half, half])).toHaveLength(2);
    });
  });
});
