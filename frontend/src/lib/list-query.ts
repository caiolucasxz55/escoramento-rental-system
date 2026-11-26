import { isStatus } from "@/lib/rental-request-status";
import type { RentalRequestStatus } from "@/types";

export interface ListQuery {
  page: number;
  status?: RentalRequestStatus;
}

interface ReadableParams {
  get(name: string): string | null;
}

// valor invalido na URL vira o padrao em vez de virar 400 da API
export function parseListQuery(params: ReadableParams): ListQuery {
  const page = Number(params.get("page"));
  const status = params.get("status");
  return {
    page: Number.isInteger(page) && page >= 1 ? page : 1,
    status: isStatus(status) ? status : undefined,
  };
}

// "Mostrando 11–20 de 35"; pagina alem do fim (lista encolheu) nao inventa faixa
export function pageRange({ page, limit, total }: { page: number; limit: number; total: number }) {
  if (total === 0) return { from: 0, to: 0, total };
  const from = Math.min((page - 1) * limit + 1, total);
  return { from, to: Math.min(page * limit, total), total };
}

// pagina 1 e sem filtro ficam fora da URL
export function toQueryString({ page, status }: ListQuery): string {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
