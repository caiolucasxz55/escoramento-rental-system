import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "./button";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  // texto extra no centro, ex.: "Mostrando 1–10 de 35"
  label?: ReactNode;
  className?: string;
}

// paginacao do servidor: so anterior/proxima e a posicao atual
export function Pagination({ page, totalPages, onPageChange, label, className }: PaginationProps) {
  const pages = Math.max(totalPages, 1);
  return (
    <nav aria-label="Paginação" className={cn("flex items-center justify-between gap-3", className)}>
      <Button variant="outline" className="px-3 sm:px-4" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Página anterior">
        <ChevronLeft aria-hidden /> <span className="hidden sm:inline">Anterior</span>
      </Button>
      <p className="text-center text-sm text-ink-muted">
        {label && <span className="block font-medium text-ink">{label}</span>}
        Página {page} de {pages}
      </p>
      <Button variant="outline" className="px-3 sm:px-4" disabled={page >= pages} onClick={() => onPageChange(page + 1)} aria-label="Próxima página">
        <span className="hidden sm:inline">Próxima</span> <ChevronRight aria-hidden />
      </Button>
    </nav>
  );
}
