import { formatDateTime } from "@/lib/format";
import type { PublicStatus } from "@/types";

import { StatusBadge } from "./status-badge";

export function StatusResult({ result }: { result: PublicStatus }) {
  const rows: [string, string][] = [
    ["Criada em", formatDateTime(result.createdAt)],
    ["Última atualização", formatDateTime(result.updatedAt)],
    ["Arquivos anexados", String(result.filesCount)],
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">Status atual</p>
        <StatusBadge status={result.status} className="text-sm" />
      </div>
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
