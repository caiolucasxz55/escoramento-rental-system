"use client";

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { rentalRequestsApi } from "@/lib/api";
import { errorMessage } from "@/lib/error-messages";
import { validateFiles } from "@/lib/file-rules";
import type { CreatedRentalRequest, RentalRequestInput } from "@/types";

import { FilePicker } from "./file-picker";
import { RentalRequestFields } from "./rental-request-fields";

const EMPTY: RentalRequestInput = { name: "", email: "", phone: "", description: "" };

export function RentalRequestForm({ onCreated }: { onCreated: (created: CreatedRentalRequest) => void }) {
  const [values, setValues] = useState(EMPTY);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fileProblem = validateFiles(files);
    if (fileProblem) return setError(fileProblem);

    setSubmitting(true);
    setError(null);
    try {
      onCreated(await rentalRequestsApi.createRentalRequest(values, files));
    } catch (err) {
      // campos e arquivos ficam como estavam para corrigir e reenviar
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        <RentalRequestFields idPrefix="new" values={values} onChange={setValues} disabled={submitting} />
        <div>
          <p className="mb-2 text-sm font-medium text-ink">Documentos (opcional)</p>
          <FilePicker files={files} onChange={setFiles} onError={setError} disabled={submitting} />
        </div>
        {error && <Alert tone="error">{error}</Alert>}
        <Button type="submit" size="lg" block loading={submitting}>
          {!submitting && <Send aria-hidden />} Enviar solicitação
        </Button>
      </form>
    </Card>
  );
}
