"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleCheck, Download } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { buildReceipt, downloadText, receiptFilename } from "@/lib/receipt";
import type { CreatedRentalRequest } from "@/types";

import { CopyField } from "./copy-field";

interface ConfirmationCardProps {
  created: CreatedRentalRequest;
}

// token so existe em memoria: some ao recarregar, nunca vai para a URL
export function ConfirmationCard({ created }: ConfirmationCardProps) {
  const { copied, copy } = useCopyToClipboard();
  const [sentAt] = useState(() => new Date());
  const both = `Identificador: ${created.id}\nToken de consulta: ${created.token}`;

  const downloadReceipt = () =>
    downloadText(receiptFilename(created.id), buildReceipt(created, `${window.location.origin}/status`, sentAt));

  return (
    <Card className="space-y-5">
      <div className="flex items-center gap-3">
        <CircleCheck className="size-8 text-success" aria-hidden />
        <div>
          <h2 className="text-lg font-semibold text-ink">Solicitação enviada</h2>
          <p className="text-sm text-ink-muted">Guarde os dados abaixo para acompanhar o status.</p>
        </div>
      </div>

      <Alert tone="info">
        Aqui está seu token de consulta. Guarde-o para acompanhar o andamento da sua solicitação: ele{" "}
        <strong>não aparece de novo</strong>.
      </Alert>

      <CopyField
        label="Identificador"
        value={created.id}
        copied={copied === "id"}
        onCopy={() => copy("id", created.id)}
      />
      <CopyField
        label="Token de consulta"
        value={created.token}
        copied={copied === "token"}
        onCopy={() => copy("token", created.token)}
      />

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => copy("both", both)}>
          {copied === "both" ? "Copiado" : "Copiar os dois"}
        </Button>
        <Button variant="outline" onClick={downloadReceipt}>
          <Download aria-hidden /> Baixar comprovante
        </Button>
        <Button variant="outline" asChild>
          <Link href="/status">Acompanhar solicitação</Link>
        </Button>
      </div>
    </Card>
  );
}
