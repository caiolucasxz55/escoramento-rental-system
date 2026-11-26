"use client";

import { useState, type FormEvent } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";

import { RentalRequestFields } from "@/components/rental-requests/rental-request-fields";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { adminApi } from "@/lib/api";
import { errorMessage } from "@/lib/error-messages";
import { isFinal } from "@/lib/rental-request-status";
import type { RentalRequestDetail, RentalRequestInput } from "@/types";

interface DataFormProps {
  request: RentalRequestDetail;
  onSaved: (updated: RentalRequestDetail) => void;
}

const pick = ({ name, email, phone, description }: RentalRequestDetail): RentalRequestInput => ({
  name,
  email,
  phone,
  description,
});

export function RentalRequestDataForm({ request, onSaved }: DataFormProps) {
  const [values, setValues] = useState(() => pick(request));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const locked = isFinal(request.status);
  const dirty = JSON.stringify(values) !== JSON.stringify(pick(request));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await adminApi.updateRentalRequest(request.id, values);
      setValues(pick(updated));
      onSaved(updated);
      toast.success("Dados atualizados");
    } catch (err) {
      // o que foi digitado continua no formulario
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardTitle>Dados do solicitante</CardTitle>
      {locked && (
        <Alert className="mt-4">Solicitação aprovada ou cancelada: os dados ficam somente leitura.</Alert>
      )}
      <form onSubmit={handleSubmit} className="mt-5 space-y-5">
        <RentalRequestFields
          idPrefix="edit"
          values={values}
          onChange={setValues}
          disabled={locked || saving}
        />
        {error && <Alert tone="error">{error}</Alert>}
        {!locked && (
          <Button type="submit" loading={saving} disabled={!dirty}>
            {!saving && <Save aria-hidden />} Salvar alterações
          </Button>
        )}
      </form>
    </Card>
  );
}
