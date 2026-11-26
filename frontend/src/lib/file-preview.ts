export type PreviewKind = "pdf" | "image";

// o mimeType vem do backend (detectado pelos magic bytes), nao do navegador do cliente
export function previewKind(mimeType: string): PreviewKind | null {
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType === "image/png" || mimeType === "image/jpeg") return "image";
  return null;
}

export const MAX_PREVIEW_PAGES = 20;
