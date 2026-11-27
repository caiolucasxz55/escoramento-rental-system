"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "./button";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  // viewer: altura fixa, o conteudo (PDF, imagem) se ajusta dentro; default: altura do conteudo
  size?: "default" | "viewer";
  className?: string;
}

// <dialog> nativo: foco preso, Esc e camada modal sem dependencia
export function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
  size = "default",
  className,
}: DialogProps) {
  const viewer = size === "viewer";
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      // clique no fundo (fora do conteudo) fecha
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className={cn(
        "m-auto w-[min(56rem,calc(100vw-2rem))] max-w-none rounded-xl border border-line bg-surface p-0 text-ink shadow-xl backdrop:bg-ink/60",
        viewer && "h-[min(85vh,calc(100vh-2rem))] max-h-none",
        className,
      )}
    >
      {open && (
        <div className={cn("flex flex-col", viewer ? "h-full" : "max-h-[calc(100vh-4rem)]")}>
          <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
            <h2 className="min-w-0 truncate font-semibold">{title}</h2>
            <Button variant="ghost" size="icon" className="size-10" aria-label="Fechar" onClick={onClose}>
              <X aria-hidden />
            </Button>
          </header>
          <div className="min-h-0 flex-1 overflow-auto bg-canvas">{children}</div>
          {footer && (
            <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-5 py-3">
              {footer}
            </footer>
          )}
        </div>
      )}
    </dialog>
  );
}
