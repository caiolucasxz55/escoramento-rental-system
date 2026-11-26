"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Inbox } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { ListSkeleton } from "@/components/ui/skeleton";
import { useApiResource } from "@/hooks/use-api-resource";
import { adminApi } from "@/lib/api";
import { errorMessage } from "@/lib/error-messages";
import { parseListQuery, toQueryString, type ListQuery } from "@/lib/list-query";
import { cn } from "@/lib/utils";

import { RentalRequestsTable } from "./rental-requests-table";
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

  // filtro e pagina vivem na URL: recarregar ou compartilhar mantem a tela
  const navigate = (next: ListQuery) => router.replace(`${pathname}${toQueryString(next)}`);

  return (
    <>
      <PageHeader
        title="Solicitações"
        subtitle={data ? `${data.meta.total} no total` : "Pedidos de locação recebidos"}
      />
      <StatusFilter value={query.status} onChange={(status) => navigate({ page: 1, status })} />

      <div className="mt-4">
        {error ? (
          <Alert tone="error">{errorMessage(error)}</Alert>
        ) : loading && !data ? (
          <Card className="p-0 sm:p-0">
            <ListSkeleton />
          </Card>
        ) : data && data.data.length > 0 ? (
          // troca de pagina/filtro: mantem a lista anterior esmaecida em vez de piscar
          <Card className={cn("p-0 transition-opacity sm:p-0", loading && "opacity-60")} aria-busy={loading}>
            <RentalRequestsTable items={data.data} />
            <Pagination
              className="border-t border-line px-4 py-3"
              page={data.meta.page}
              totalPages={data.meta.totalPages}
              onPageChange={(page) => navigate({ ...query, page })}
            />
          </Card>
        ) : (
          <Card>
            <EmptyState
              icon={Inbox}
              title="Nenhuma solicitação"
              description={query.status ? "Nada com esse status." : "As solicitações enviadas aparecem aqui."}
            />
          </Card>
        )}
      </div>
    </>
  );
}
