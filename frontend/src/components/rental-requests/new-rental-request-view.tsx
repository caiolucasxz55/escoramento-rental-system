"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import type { CreatedRentalRequest } from "@/types";

import { ConfirmationCard } from "./confirmation-card";
import { HowItWorks } from "./how-it-works";
import { RentalRequestForm } from "./rental-request-form";

export function NewRentalRequestView() {
  const [created, setCreated] = useState<CreatedRentalRequest | null>(null);

  function handleCreated(result: CreatedRentalRequest) {
    setCreated(result);
    // a confirmacao substitui o formulario: volta ao topo para o token ficar a vista
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-brand-600"
      >
        <ArrowLeft className="size-4" aria-hidden /> Voltar ao início
      </Link>
      {created ? (
        <>
          <PageHeader
            title="Tudo certo!"
            subtitle="Recebemos sua solicitação. Guarde os dados abaixo para acompanhar."
          />
          <ConfirmationCard created={created} onNewRequest={() => setCreated(null)} />
        </>
      ) : (
        <>
          <PageHeader
            title="Solicitar escoramento"
            subtitle="Descreva o que precisa e anexe documentos, se tiver."
          />
          <HowItWorks />
          <RentalRequestForm onCreated={handleCreated} />
        </>
      )}
    </div>
  );
}
