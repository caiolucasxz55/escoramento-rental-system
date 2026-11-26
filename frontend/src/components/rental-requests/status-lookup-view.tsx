"use client";

import { useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { rentalRequestsApi } from "@/lib/api";
import { errorMessage } from "@/lib/error-messages";
import type { PublicStatus } from "@/types";

import { StatusLookupForm } from "./status-lookup-form";
import { StatusResult } from "./status-result";

// a API responde o mesmo 404 para id inexistente e token errado; a tela tambem
const MESSAGES = {
  REQUEST_NOT_FOUND: "Solicitação não encontrada ou token inválido. Confira os dados.",
  INVALID_ID: "Solicitação não encontrada ou token inválido. Confira os dados.",
};

export function StatusLookupView() {
  const [result, setResult] = useState<PublicStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function lookup(id: string, token: string) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await rentalRequestsApi.getPublicStatus(id, token));
    } catch (err) {
      setError(errorMessage(err, MESSAGES));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <PageHeader
        title="Acompanhar solicitação"
        subtitle="Use o identificador e o token recebidos ao enviar a solicitação."
      />
      <div className="grid gap-6">
        <Card>
          <StatusLookupForm onSubmit={lookup} loading={loading} />
        </Card>
        {error && <Alert tone="error">{error}</Alert>}
        {result && (
          <Card>
            <StatusResult result={result} />
          </Card>
        )}
      </div>
    </div>
  );
}
