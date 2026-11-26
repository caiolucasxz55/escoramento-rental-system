// validacao so para UX; o backend detecta o tipo real pelo conteudo

export const MAX_FILES = 5;
export const MAX_FILE_SIZE_MB = 10;
export const ACCEPTED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg"];
export const ACCEPT_ATTRIBUTE = ".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg";

const MAX_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

type FileLike = Pick<File, "name" | "size">;

const hasAcceptedExtension = (name: string) =>
  ACCEPTED_EXTENSIONS.some((ext) => name.toLowerCase().endsWith(ext));

// primeira violacao encontrada, ou null; `alreadyAttached` conta o que ja existe
export function validateFiles(
  files: FileLike[],
  alreadyAttached = 0,
): string | null {
  if (files.length + alreadyAttached > MAX_FILES) {
    return `Envie no máximo ${MAX_FILES} arquivos por solicitação.`;
  }
  const empty = files.find((f) => f.size === 0);
  if (empty) return `O arquivo "${empty.name}" está vazio.`;

  const tooBig = files.find((f) => f.size > MAX_BYTES);
  if (tooBig) {
    return `"${tooBig.name}" passa de ${MAX_FILE_SIZE_MB} MB.`;
  }
  const wrongType = files.find((f) => !hasAcceptedExtension(f.name));
  if (wrongType) {
    return `"${wrongType.name}" não é PDF, PNG ou JPEG.`;
  }
  return null;
}
