import Link from "next/link";
import { ChevronRight, Paperclip } from "lucide-react";

import { StatusBadge } from "@/components/rental-requests/status-badge";
import { formatDateTime } from "@/lib/format";
import type { RentalRequestListItem } from "@/types";

const detailHref = (id: string) => `/admin/requests/${id}`;

// tabela no desktop, cards no celular: tabela larga nao cabe em tela pequena
export function RentalRequestsTable({ items }: { items: RentalRequestListItem[] }) {
  return (
    <>
      <ul className="divide-y divide-line sm:hidden">
        {items.map((item) => (
          <li key={item.id}>
            <Link href={detailHref(item.id)} className="flex items-center gap-3 px-4 py-3 active:bg-canvas">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{item.name}</p>
                <p className="mt-1 flex items-center gap-2 text-xs text-ink-muted">
                  {formatDateTime(item.createdAt)}
                  <span className="inline-flex items-center gap-0.5">
                    <Paperclip className="size-3" aria-hidden /> {item.filesCount}
                  </span>
                </p>
              </div>
              <StatusBadge status={item.status} />
              <ChevronRight className="size-4 text-ink-muted" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto sm:block">
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
              <tr key={item.id} className="group relative hover:bg-brand-50/60">
                <td className="px-4 py-3 font-medium text-ink">
                  {/* link estendido: a linha inteira e clicavel */}
                  <Link href={detailHref(item.id)} className="after:absolute after:inset-0">
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
    </>
  );
}
