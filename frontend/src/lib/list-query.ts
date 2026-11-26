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

// pagina 1 e sem filtro ficam fora da URL
export function toQueryString({ page, status }: ListQuery): string {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
