import { formatDateTime } from "@/lib/format";
import type { PublicStatus, RentalRequestStatus } from "@/types";

import { StatusBadge } from "./status-badge";
import { StatusProgress } from "./status-progress";

const NEXT_STEP: Record<RentalRequestStatus, string> = {
  PENDING: "Recebemos sua solicitação. Ela entra em análise em breve.",
  UNDER_REVIEW: "Nossa equipe está analisando o pedido e os documentos.",
  APPROVED: "Solicitação aprovada. Entraremos em contato para combinar a entrega.",
  CANCELLED: "Esta solicitação foi cancelada.",
};

export function StatusResult({ result }: { result: PublicStatus }) {
  const rows: [string, string][] = [
    ["Criada em", formatDateTime(result.createdAt)],
    ["Última atualização", formatDateTime(result.updatedAt)],
    ["Arquivos anexados", String(result.filesCount)],
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">Status atual</p>
        <StatusBadge status={result.status} className="text-sm" />
      </div>
      <StatusProgress status={result.status} />
      <p className="text-sm text-ink-muted">{NEXT_STEP[result.status]}</p>
      <dl className="divide-y divide-line rounded-lg border border-line">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
            <dt className="text-ink-muted">{label}</dt>
            <dd className="font-medium text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
