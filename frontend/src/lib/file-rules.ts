// validacao so para UX; o backend detecta o tipo real pelo conteudo

export const MAX_FILES = 5;
export const ACCEPTED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg"];
export const ACCEPT_ATTRIBUTE = ".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg";

const positive = (raw: string | undefined): number | undefined => {
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : undefined;
};

export interface UploadLimits {
  maxFileMb: number;
  // soma de um envio; em producao (Lambda) fica abaixo dos 6 MB do payload
  maxTotalMb?: number;
}

// acesso literal a process.env: o Next so embute NEXT_PUBLIC_* escritas assim
export const UPLOAD_LIMITS: UploadLimits = {
  maxFileMb: positive(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB) ?? 10,
  maxTotalMb: positive(process.env.NEXT_PUBLIC_MAX_TOTAL_UPLOAD_MB),
};
export const MAX_FILE_SIZE_MB = UPLOAD_LIMITS.maxFileMb;

const MB = 1024 * 1024;

type FileLike = Pick<File, "name" | "size">;

const hasAcceptedExtension = (name: string) =>
  ACCEPTED_EXTENSIONS.some((ext) => name.toLowerCase().endsWith(ext));

// primeira violacao encontrada, ou null
export function validateFiles(files: FileLike[], limits: UploadLimits = UPLOAD_LIMITS): string | null {
  if (files.length > MAX_FILES) {
    return `Envie no máximo ${MAX_FILES} arquivos por solicitação.`;
  }
  const empty = files.find((f) => f.size === 0);
  if (empty) return `O arquivo "${empty.name}" está vazio.`;

  const tooBig = files.find((f) => f.size > limits.maxFileMb * MB);
  if (tooBig) {
    return `"${tooBig.name}" passa de ${limits.maxFileMb} MB.`;
  }
  const total = files.reduce((sum, f) => sum + f.size, 0);
  if (limits.maxTotalMb && total > limits.maxTotalMb * MB) {
    return `Os arquivos somam ${(total / MB).toFixed(1).replace(".", ",")} MB; o limite é ${limits.maxTotalMb} MB por envio.`;
  }
  const wrongType = files.find((f) => !hasAcceptedExtension(f.name));
  if (wrongType) {
    return `"${wrongType.name}" não é PDF, PNG ou JPEG.`;
  }
  return null;
}
