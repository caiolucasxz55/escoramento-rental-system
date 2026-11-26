import {
  checkFile,
  detectFileType,
  megabytesToBytes,
  sanitizeFilename,
} from './file-validation';

// arquivos reais minimos (PNG/JPEG 1x1, PDF de 1 pagina)
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);
const JPEG = Buffer.from(
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=',
  'base64',
);
const PDF = Buffer.from(
  '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n' +
    '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
    '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 10 10]>>endobj\n' +
    'trailer<</Root 1 0 R>>\n%%EOF\n',
  'latin1',
);
// cabecalho MZ de executavel Windows
const EXE = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]);
const TEXT = Buffer.from('isto e um texto qualquer, renomeado para .pdf');

const MAX = megabytesToBytes(10);

describe('detectFileType', () => {
  it.each([
    ['PDF', PDF, 'pdf', '.pdf', 'application/pdf'],
    ['PNG', PNG, 'png', '.png', 'image/png'],
    ['JPEG', JPEG, 'jpg', '.jpg', 'image/jpeg'],
  ])('reconhece %s real', (_label, buffer, kind, ext, mimeType) => {
    expect(detectFileType(buffer)).toEqual({ kind, ext, mimeType });
  });

  it.each([
    ['texto', TEXT],
    ['executavel', EXE],
    ['buffer vazio', Buffer.alloc(0)],
    ['so parte da assinatura do PNG', PNG.subarray(0, 4)],
  ])('recusa %s', (_label, buffer) => {
    expect(detectFileType(buffer)).toBeNull();
  });

  it('ignora nome e mimetype: PNG enviado como contrato.pdf e png', () => {
    const upload = {
      originalname: 'contrato.pdf',
      mimetype: 'application/pdf',
      buffer: PNG,
    };

    expect(detectFileType(upload.buffer)?.kind).toBe('png');
  });

  it('executavel renomeado para .pdf continua recusado', () => {
    const upload = {
      originalname: 'nota.pdf',
      mimetype: 'application/pdf',
      buffer: EXE,
    };

    expect(detectFileType(upload.buffer)).toBeNull();
  });
});

describe('checkFile', () => {
  it('aceita arquivo valido dentro do limite', () => {
    expect(checkFile(PDF, MAX)).toEqual({
      ok: true,
      type: { kind: 'pdf', ext: '.pdf', mimeType: 'application/pdf' },
    });
  });

  it('recusa arquivo vazio como EMPTY_FILE, nao como tipo invalido', () => {
    expect(checkFile(Buffer.alloc(0), MAX)).toEqual({
      ok: false,
      reason: 'EMPTY_FILE',
    });
  });

  it('recusa acima do limite como FILE_TOO_LARGE', () => {
    const big = Buffer.concat([PDF, Buffer.alloc(MAX)]);

    expect(checkFile(big, MAX)).toEqual({
      ok: false,
      reason: 'FILE_TOO_LARGE',
    });
  });

  it('aceita exatamente no limite', () => {
    const exact = Buffer.concat([PDF, Buffer.alloc(MAX - PDF.length)]);

    expect(checkFile(exact, MAX).ok).toBe(true);
  });

  it('recusa tipo nao aceito como UNSUPPORTED_FILE_TYPE', () => {
    expect(checkFile(TEXT, MAX)).toEqual({
      ok: false,
      reason: 'UNSUPPORTED_FILE_TYPE',
    });
  });
});

describe('sanitizeFilename', () => {
  it.each([
    ['contrato.pdf', 'contrato.pdf'],
    ['nome "com" aspas.pdf', 'nome com aspas.pdf'],
    ['../../etc/passwd.pdf', '....etcpasswd.pdf'],
    ['a\\b.pdf', 'ab.pdf'],
    ['quebra\r\nde\tlinha.pdf', 'quebradelinha.pdf'],
    ['  espacos    demais  .pdf ', 'espacos demais .pdf'],
    ['orçamento.pdf', 'orçamento.pdf'],
  ])('%p -> %p', (input, expected) => {
    expect(sanitizeFilename(input, 'arquivo.pdf')).toBe(expected);
  });

  it('nome que some todo vira o fallback', () => {
    expect(sanitizeFilename('"/\\', 'arquivo.pdf')).toBe('arquivo.pdf');
  });

  it('corta nomes muito longos', () => {
    expect(sanitizeFilename('a'.repeat(500), 'x')).toHaveLength(200);
  });
});
