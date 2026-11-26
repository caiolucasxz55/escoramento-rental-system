"use client";

import { adminApi } from "@/lib/api";
import { STATUS_OPTIONS } from "@/lib/rental-request-status";
import type { RentalRequestStatus } from "@/types";

import { useApiResource } from "./use-api-resource";

export type StatusCounts = Record<RentalRequestStatus, number> & { all: number };

// a API nao tem rota de contagem: limit=1 por status devolve o total em meta
async function loadCounts(): Promise<StatusCounts> {
  const entries = await Promise.all(
    STATUS_OPTIONS.map(async (status) => {
      const { meta } = await adminApi.listRentalRequests({ status, limit: 1 });
      return [status, meta.total] as const;
    }),
  );
  const byStatus = Object.fromEntries(entries) as Record<RentalRequestStatus, number>;
  const all = entries.reduce((sum, [, total]) => sum + total, 0);
  return { ...byStatus, all };
}

// contagem e auxiliar: se falhar, os filtros so ficam sem numero
export function useStatusCounts(): StatusCounts | null {
  return useApiResource("status-counts", loadCounts).data;
}
