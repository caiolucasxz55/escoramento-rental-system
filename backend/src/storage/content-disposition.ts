import type { Disposition } from './storage.interface';

// filename ASCII para clientes antigos + filename* (RFC 5987) com o nome real
export function buildContentDisposition(
  disposition: Disposition,
  filename: string,
): string {
  const ascii = filename.replace(/[^\x20-\x7e]/g, '_').replace(/["\\]/g, '_');
  const encoded = encodeURIComponent(filename).replace(
    /['()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );
  return `${disposition}; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}
