import type { Test } from 'supertest';

export const PDF = Buffer.from(
  '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n',
  'latin1',
);
export const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);
// cabecalho MZ de executavel Windows
export const EXE = Buffer.concat([
  Buffer.from([0x4d, 0x5a, 0x90, 0x00]),
  Buffer.alloc(64),
]);

export const VALID_FIELDS = {
  name: 'Construtora Teste',
  email: 'contato@exemplo.com',
  phone: '(11) 98765-4321',
  description: 'Preciso de 40 escoras por 30 dias.',
};

export interface Upload {
  buffer: Buffer;
  name: string;
}

export const pdf = (name = 'contrato.pdf'): Upload => ({ buffer: PDF, name });
export const png = (name = 'foto.png'): Upload => ({ buffer: PNG, name });

// multipart: campos de texto + arquivos no campo `field`
export function multipart(
  req: Test,
  fields: Record<string, string>,
  files: Upload[] = [],
  field = 'files',
): Test {
  for (const [key, value] of Object.entries(fields)) req.field(key, value);
  for (const file of files) req.attach(field, file.buffer, file.name);
  return req;
}
