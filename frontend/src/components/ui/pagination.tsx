import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "./button";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

// paginacao do servidor: so anterior/proxima e a posicao atual
export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  const pages = Math.max(totalPages, 1);
  return (
    <nav aria-label="Paginação" className={cn("flex items-center justify-between gap-3", className)}>
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft aria-hidden /> Anterior
      </Button>
      <span className="text-sm text-ink-muted">
        Página {page} de {pages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= pages}
        onClick={() => onPageChange(page + 1)}
      >
        Próxima <ChevronRight aria-hidden />
      </Button>
    </nav>
  );
}
