"use client";

import { useEffect, useRef, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { MAX_PREVIEW_PAGES } from "@/lib/file-preview";
import { loadPdfjs } from "@/lib/pdf";

type State =
  | { kind: "loading" }
  | { kind: "ready"; shown: number; total: number }
  | { kind: "error" };

// paginas desenhadas em canvas pelo pdf.js: nada do PDF executa (sem JS, sem leitor do sistema)
export function PdfPreview({ url }: { url: string }) {
  const pagesRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    const container = pagesRef.current;
    if (!container) return;
    let cancelled = false;
    let destroy: (() => Promise<void>) | undefined;

    (async () => {
      const pdfjs = await loadPdfjs();
      const task = pdfjs.getDocument({ url });
      destroy = () => task.destroy();
      const doc = await task.promise;

      const total = doc.numPages;
      const shown = Math.min(total, MAX_PREVIEW_PAGES);
      const width = Math.min(container.clientWidth, 900);
      const ratio = window.devicePixelRatio || 1;

      for (let n = 1; n <= shown && !cancelled; n++) {
        const page = await doc.getPage(n);
        const fit = width / page.getViewport({ scale: 1 }).width;
        const viewport = page.getViewport({ scale: fit * ratio });

        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = `${Math.floor(viewport.width / ratio)}px`;
        canvas.className = "mx-auto block bg-white shadow-sm";
        canvas.setAttribute("aria-label", `Página ${n} de ${total}`);
        container.append(canvas);

        await page.render({ canvas, viewport }).promise;
      }
      if (!cancelled) setState({ kind: "ready", shown, total });
    })().catch(() => {
      if (!cancelled) setState({ kind: "error" });
    });

    return () => {
      cancelled = true;
      void destroy?.();
      container.replaceChildren();
    };
  }, [url]);

  return (
    <div className="p-4">
      {state.kind === "loading" && (
        <div className="grid min-h-[50vh] place-items-center">
          <Spinner label="Carregando o PDF" />
        </div>
      )}
      {state.kind === "error" && (
        <Alert tone="error">Não foi possível exibir este PDF. Ele pode estar corrompido.</Alert>
      )}
      <div ref={pagesRef} className="space-y-4" />
      {state.kind === "ready" && state.shown < state.total && (
        <p className="mt-4 text-center text-xs text-ink-muted">
          Mostrando {state.shown} de {state.total} páginas.
        </p>
      )}
    </div>
  );
}
