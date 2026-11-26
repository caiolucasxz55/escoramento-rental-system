import { ApiError } from "@/lib/api/client";
import { MAX_FILE_SIZE_MB, MAX_FILES } from "@/lib/file-rules";

// mensagem por `code` da API; o texto do backend so aparece em erro de validacao
const BY_CODE: Record<string, string> = {
  NETWORK_ERROR: "Não foi possível conectar à API. Tente de novo.",
  REQUEST_NOT_FOUND: "Solicitação não encontrada.",
  FILE_NOT_FOUND: "Arquivo não encontrado nesta solicitação.",
  INVALID_ID: "Identificador inválido.",
  INVALID_CREDENTIALS: "E-mail ou senha inválidos.",
  UNAUTHORIZED: "Sua sessão expirou. Entre de novo.",
  INVALID_STATUS_TRANSITION: "Essa mudança de status não é permitida.",
  STATUS_CONFLICT: "O status foi alterado por outra pessoa. Os dados foram atualizados.",
  CONCURRENT_UPDATE: "A solicitação foi alterada por outra pessoa. Tente de novo.",
  REQUEST_NOT_EDITABLE: "Solicitação aprovada ou cancelada não pode ser alterada.",
  FILE_LIMIT_REACHED: `Limite de ${MAX_FILES} arquivos por solicitação.`,
  NO_FILES: "Selecione ao menos um arquivo.",
  EMPTY_FILE: "Um dos arquivos está vazio.",
  FILE_TOO_LARGE: `Arquivo acima de ${MAX_FILE_SIZE_MB} MB.`,
  PAYLOAD_TOO_LARGE: `Arquivo acima de ${MAX_FILE_SIZE_MB} MB.`,
  UNSUPPORTED_FILE_TYPE: "Tipo de arquivo não aceito. Envie PDF, PNG ou JPEG.",
  TOO_MANY_REQUESTS: "Muitas tentativas em pouco tempo. Aguarde um minuto e tente de novo.",
  INTERNAL_ERROR: "Erro inesperado no servidor. Tente de novo em instantes.",
};

const GENERIC = "Não foi possível concluir a ação.";

export function errorMessage(error: unknown, overrides: Record<string, string> = {}): string {
  if (!(error instanceof ApiError)) return GENERIC;
  if (overrides[error.code]) return overrides[error.code];
  if (error.code === "VALIDATION_ERROR" || error.code === "BAD_REQUEST") {
    return `Confira os dados: ${error.message}`;
  }
  return BY_CODE[error.code] ?? GENERIC;
}
