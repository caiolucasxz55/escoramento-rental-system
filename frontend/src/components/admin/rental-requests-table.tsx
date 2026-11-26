import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { StatusBadge } from "@/components/rental-requests/status-badge";
import { formatDateTime } from "@/lib/format";
import type { RentalRequestListItem } from "@/types";

export function RentalRequestsTable({ items }: { items: RentalRequestListItem[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Solicitante</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 text-center font-medium">Arquivos</th>
            <th className="px-4 py-3 font-medium">Criada em</th>
            <th className="w-10" aria-label="Abrir" />
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {items.map((item) => (
            <tr key={item.id} className="group relative hover:bg-canvas">
              <td className="px-4 py-3 font-medium text-ink">
                {/* link estendido: a linha inteira e clicavel */}
                <Link href={`/admin/requests/${item.id}`} className="after:absolute after:inset-0">
                  {item.name}
                </Link>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={item.status} />
              </td>
              <td className="px-4 py-3 text-center text-ink-muted">{item.filesCount}</td>
              <td className="px-4 py-3 text-ink-muted">{formatDateTime(item.createdAt)}</td>
              <td className="px-2 text-ink-muted group-hover:text-brand-600">
                <ChevronRight className="size-4" aria-hidden />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
