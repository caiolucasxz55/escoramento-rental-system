"use client";

import { useState } from "react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/rental-requests/status-badge";
import { StatusProgress } from "@/components/rental-requests/status-progress";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { adminApi } from "@/lib/api";
import { ApiError } from "@/lib/api/client";
import { errorMessage } from "@/lib/error-messages";
import { isFinal, nextStatuses, STATUS_ACTION_LABEL, STATUS_LABEL } from "@/lib/rental-request-status";
import type { RentalRequestDetail, RentalRequestStatus } from "@/types";

const VARIANT: Partial<Record<RentalRequestStatus, ButtonProps["variant"]>> = {
  APPROVED: "success",
  CANCELLED: "danger",
};

interface StatusActionsProps {
  request: RentalRequestDetail;
  onChanged: (updated: RentalRequestDetail) => void;
  // 409: outro admin mudou antes; a tela recarrega o detalhe
  onConflict: () => void;
}

export function StatusActions({ request, onChanged, onConflict }: StatusActionsProps) {
  const [pending, setPending] = useState<RentalRequestStatus | null>(null);
  const options = nextStatuses(request.status);

  async function apply(next: RentalRequestStatus) {
    // aprovar e cancelar nao tem volta
    if (isFinal(next) && !window.confirm(`${STATUS_ACTION_LABEL[next]} a solicitação? Não dá para desfazer.`)) {
      return;
    }
    setPending(next);
    try {
      onChanged(await adminApi.changeStatus(request.id, next));
      toast.success(`Status alterado para ${STATUS_LABEL[next]}`);
    } catch (err) {
      toast.error(errorMessage(err));
      if (err instanceof ApiError && err.status === 409) onConflict();
    } finally {
      setPending(null);
    }
  }

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <CardTitle>Status</CardTitle>
        <StatusBadge status={request.status} />
      </div>
      <StatusProgress status={request.status} className="mt-5" />
      {options.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
          {options.map((next) => (
            <Button
              key={next}
              variant={VARIANT[next] ?? "primary"}
              loading={pending === next}
              disabled={pending !== null}
              onClick={() => apply(next)}
            >
              {STATUS_ACTION_LABEL[next]}
            </Button>
          ))}
        </div>
      ) : (
        <p className="mt-5 border-t border-line pt-4 text-sm text-ink-muted">
          Status final: não há próximas etapas.
        </p>
      )}
    </Card>
  );
}
