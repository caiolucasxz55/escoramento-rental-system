export type FileKind = 'pdf' | 'png' | 'jpg';

export interface DetectedFileType {
  kind: FileKind;
  ext: `.${FileKind}`;
  mimeType: string;
}

const SIGNATURES: ReadonlyArray<{ bytes: number[]; type: DetectedFileType }> = [
  {
    // %PDF-
    bytes: [0x25, 0x50, 0x44, 0x46, 0x2d],
    type: { kind: 'pdf', ext: '.pdf', mimeType: 'application/pdf' },
  },
  {
    bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
    type: { kind: 'png', ext: '.png', mimeType: 'image/png' },
  },
  {
    bytes: [0xff, 0xd8, 0xff],
    type: { kind: 'jpg', ext: '.jpg', mimeType: 'image/jpeg' },
  },
];

// nome e Content-Type do navegador sao ignorados
export function detectFileType(buffer: Buffer): DetectedFileType | null {
  const match = SIGNATURES.find(
    ({ bytes }) =>
      buffer.length >= bytes.length && bytes.every((b, i) => buffer[i] === b),
  );
  return match ? { ...match.type } : null;
}

export type FileCheck =
  | { ok: true; type: DetectedFileType }
  | {
      ok: false;
      reason: 'EMPTY_FILE' | 'FILE_TOO_LARGE' | 'UNSUPPORTED_FILE_TYPE';
    };

export function checkFile(buffer: Buffer, maxSizeBytes: number): FileCheck {
  if (buffer.length === 0) return { ok: false, reason: 'EMPTY_FILE' };
  if (buffer.length > maxSizeBytes) {
    return { ok: false, reason: 'FILE_TOO_LARGE' };
  }

  const type = detectFileType(buffer);
  return type
    ? { ok: true, type }
    : { ok: false, reason: 'UNSUPPORTED_FILE_TYPE' };
}

const MAX_FILENAME_LENGTH = 200;

// so para exibicao e Content-Disposition
export function sanitizeFilename(name: string, fallback: string): string {
  const clean = name
    .replace(/[\p{Cc}"'\\/]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_FILENAME_LENGTH);
  return clean.length > 0 ? clean : fallback;
}
