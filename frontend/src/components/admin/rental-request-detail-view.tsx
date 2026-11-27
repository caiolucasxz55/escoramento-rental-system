"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Mail, Phone } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { PageHeader } from "@/components/ui/page-header";
import { FullPageSpinner } from "@/components/ui/spinner";
import { useApiResource } from "@/hooks/use-api-resource";
import { adminApi } from "@/lib/api";
import { errorMessage } from "@/lib/error-messages";
import { formatDateTime, formatPhone, phoneHref } from "@/lib/format";

import { FilesPanel } from "./files-panel";
import { RentalRequestDataForm } from "./rental-request-data-form";
import { StatusActions } from "./status-actions";

export function RentalRequestDetailView() {
  const { id } = useParams<{ id: string }>();
  const { data: request, error, loading, reload, setData } = useApiResource(id, () =>
    adminApi.getRentalRequest(id),
  );

  const back = (
    <Link href="/admin" className="inline-flex -my-2.5 items-center py-2.5 gap-1 text-sm text-ink-muted hover:text-ink">
      <ArrowLeft className="size-4" aria-hidden /> Voltar para a lista
    </Link>
  );

  if (error) {
    return (
      <div className="space-y-4">
        {back}
        <Alert tone="error">{errorMessage(error)}</Alert>
      </div>
    );
  }
  if (loading || !request) return <FullPageSpinner />;

  return (
    <div className="space-y-6">
      {back}
      <PageHeader
        title={request.name}
        subtitle={
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <a href={`mailto:${request.email}`} className="inline-flex -my-2.5 items-center py-2.5 gap-1 hover:text-brand-600">
              <Mail className="size-3.5" aria-hidden /> {request.email}
            </a>
            <a href={phoneHref(request.phone)} className="inline-flex -my-2.5 items-center py-2.5 gap-1 hover:text-brand-600">
              <Phone className="size-3.5" aria-hidden /> {formatPhone(request.phone)}
            </a>
            <span>
              Criada em {formatDateTime(request.createdAt)} · atualizada em {formatDateTime(request.updatedAt)}
            </span>
          </span>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-6">
          {/* key no status: o form recomeca quando a solicitacao trava (estado final) */}
          <RentalRequestDataForm key={request.status} request={request} onSaved={setData} />
          <FilesPanel request={request} />
        </div>
        <div className="min-w-0">
          <StatusActions request={request} onChanged={setData} onConflict={reload} />
        </div>
      </div>
    </div>
  );
}
