import { formatDateTime } from "@/lib/format";
import type { CreatedRentalRequest } from "@/types";

export function receiptFilename(id: string): string {
  return `comprovante-solicitacao-${id}.txt`;
}

// texto puro: abre em qualquer aparelho e da para copiar cada valor
export function buildReceipt(created: CreatedRentalRequest, statusUrl: string, sentAt: Date): string {
  return [
    "Comprovante de solicitação de locação",
    "",
    `Enviada em: ${formatDateTime(sentAt.toISOString())}`,
    `Identificador: ${created.id}`,
    `Token de consulta: ${created.token}`,
    "",
    `Para acompanhar, acesse ${statusUrl} e informe o identificador e o token.`,
    "Guarde este arquivo: o token não pode ser recuperado.",
    "",
  ].join("\r\n");
}

export function downloadText(filename: string, text: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const link = Object.assign(document.createElement("a"), { href: url, download: filename });
  link.click();
  // libera depois do clique: revogar na hora pode cancelar o download em alguns navegadores
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
