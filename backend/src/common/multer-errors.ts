import { MAX_FILES_PER_REQUEST } from '../rental-requests/rules/file-validation';

export interface KnownError {
  error: string;
  message: string;
}

// o Nest repassa o texto do Multer (em ingles); aqui vira codigo estavel + portugues
const BY_PREFIX: ReadonlyArray<[prefix: string, known: KnownError]> = [
  [
    'File too large',
    {
      error: 'FILE_TOO_LARGE',
      message: 'Arquivo acima do tamanho máximo permitido.',
    },
  ],
  [
    'Too many files',
    {
      error: 'TOO_MANY_FILES',
      message: `Envie no máximo ${MAX_FILES_PER_REQUEST} arquivos.`,
    },
  ],
  [
    'Unexpected file field',
    {
      error: 'UNEXPECTED_FILE_FIELD',
      message:
        'Campo de arquivo inesperado: use "files" (ou "file" na substituição).',
    },
  ],
];

export function multerError(message: string): KnownError | null {
  return BY_PREFIX.find(([prefix]) => message.startsWith(prefix))?.[1] ?? null;
}
