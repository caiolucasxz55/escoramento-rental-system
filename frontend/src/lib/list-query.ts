import { isStatus } from "@/lib/rental-request-status";
import type { RentalRequestStatus } from "@/types";

// mesmos limites do ListQueryDto do backend
export const SEARCH_LENGTH = { min: 2, max: 100 } as const;

export interface ListQuery {
  page: number;
  status?: RentalRequestStatus;
  q?: string;
}

interface ReadableParams {
  get(name: string): string | null;
}

// valor invalido na URL vira o padrao em vez de virar 400 da API
export function parseListQuery(params: ReadableParams): ListQuery {
  const page = Number(params.get("page"));
  const status = params.get("status");
  const q = params.get("q")?.trim() ?? "";
  return {
    page: Number.isInteger(page) && page >= 1 ? page : 1,
    status: isStatus(status) ? status : undefined,
    q: q.length >= SEARCH_LENGTH.min && q.length <= SEARCH_LENGTH.max ? q : undefined,
  };
}

// "Mostrando 11–20 de 35"; pagina alem do fim (lista encolheu) nao inventa faixa
export function pageRange({ page, limit, total }: { page: number; limit: number; total: number }) {
  if (total === 0) return { from: 0, to: 0, total };
  const from = Math.min((page - 1) * limit + 1, total);
  return { from, to: Math.min(page * limit, total), total };
}

// pagina 1, sem filtro e sem busca ficam fora da URL
export function toQueryString({ page, status, q }: ListQuery): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
