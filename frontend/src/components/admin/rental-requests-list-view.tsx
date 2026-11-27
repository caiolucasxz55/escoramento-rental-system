"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Inbox, SearchX, X } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { ListSkeleton } from "@/components/ui/skeleton";
import { useApiResource } from "@/hooks/use-api-resource";
import { useStatusCounts } from "@/hooks/use-status-counts";
import { adminApi } from "@/lib/api";
import { errorMessage } from "@/lib/error-messages";
import { pageRange, parseListQuery, toQueryString, type ListQuery } from "@/lib/list-query";
import { cn } from "@/lib/utils";

import { RentalRequestsTable } from "./rental-requests-table";
import { SearchBox } from "./search-box";
import { StatusFilter } from "./status-filter";

const PAGE_SIZE = 10;

// usa useSearchParams: precisa de <Suspense> acima
export function RentalRequestsListView() {
  const router = useRouter();
  const pathname = usePathname();
  const query = parseListQuery(useSearchParams());
  const queryString = toQueryString(query);

  const { data, error, loading } = useApiResource(queryString, () =>
    adminApi.listRentalRequests({ ...query, limit: PAGE_SIZE }),
  );
  const counts = useStatusCounts(query.q);

  // filtro e pagina vivem na URL: recarregar ou compartilhar mantem a tela
  const navigate = (next: ListQuery) => router.replace(`${pathname}${toQueryString(next)}`);
  const range = data ? pageRange(data.meta) : null;
  const filtered = Boolean(query.status || query.q);

  // estavel: o SearchBox usa no efeito da espera; busca nova volta para a pagina 1
  const status = query.status;
  const search = useCallback(
    (q: string | undefined) => router.replace(`${pathname}${toQueryString({ page: 1, status, q })}`),
    [router, pathname, status],
  );

  return (
    <>
      <PageHeader title="Solicitações" subtitle="Pedidos de locação recebidos pelo site" />

      <Card className="overflow-hidden p-0 sm:p-0">
        <div className="space-y-3 border-b border-line px-5 py-4 sm:px-6">
          <SearchBox value={query.q} onSearch={search} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <StatusFilter
              value={query.status}
              counts={counts}
              onChange={(next) => navigate({ page: 1, status: next, q: query.q })}
            />
            {filtered && (
              <Button variant="ghost" onClick={() => navigate({ page: 1 })}>
                <X aria-hidden /> Limpar filtros
              </Button>
            )}
          </div>
        </div>

        {error ? (
          <div className="p-5 sm:p-6">
            <Alert tone="error">{errorMessage(error)}</Alert>
          </div>
        ) : loading && !data ? (
          <ListSkeleton rows={6} />
        ) : data && data.data.length > 0 ? (
          // troca de pagina/filtro: mantem a lista anterior esmaecida em vez de piscar
          <div className={cn("transition-opacity", loading && "opacity-60")} aria-busy={loading}>
            <RentalRequestsTable items={data.data} />
            <Pagination
              className="border-t border-line px-5 py-4 sm:px-6"
              page={data.meta.page}
              totalPages={data.meta.totalPages}
              label={range && `Mostrando ${range.from}–${range.to} de ${range.total}`}
              onPageChange={(page) => navigate({ ...query, page })}
            />
          </div>
        ) : (
          <EmptyState
            icon={query.q ? SearchX : Inbox}
            title={query.q ? "Nada encontrado" : "Nenhuma solicitação"}
            description={
              query.q
                ? `Nenhuma solicitação com “${query.q}”${query.status ? " nesse status" : ""}.`
                : query.status
                  ? "Nada com esse status."
                  : "As solicitações enviadas aparecem aqui."
            }
            action={
              filtered && (
                <Button variant="outline" onClick={() => navigate({ page: 1 })}>
                  Ver todas
                </Button>
              )
            }
          />
        )}
      </Card>
    </>
  );
}
