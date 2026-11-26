"use client";

import { useState } from "react";

import { PageHeader } from "@/components/ui/page-header";
import type { CreatedRentalRequest } from "@/types";

import { ConfirmationCard } from "./confirmation-card";
import { HowItWorks } from "./how-it-works";
import { RentalRequestForm } from "./rental-request-form";

export function NewRentalRequestView() {
  const [created, setCreated] = useState<CreatedRentalRequest | null>(null);

  return (
    <>
      <PageHeader
        title="Solicitar locação"
        subtitle="Descreva o que precisa e anexe documentos, se tiver. Respondemos pelo status da solicitação."
      />
      {created ? (
        <ConfirmationCard created={created} onNewRequest={() => setCreated(null)} />
      ) : (
        <>
          <HowItWorks />
          <RentalRequestForm onCreated={setCreated} />
        </>
      )}
    </>
  );
}
