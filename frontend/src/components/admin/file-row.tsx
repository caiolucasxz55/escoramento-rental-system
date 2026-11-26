"use client";

import { useRef } from "react";
import { ExternalLink, FileText, RefreshCw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ACCEPT_ATTRIBUTE } from "@/lib/file-rules";
import { formatBytes, formatDateTime } from "@/lib/format";
import type { RentalRequestFile } from "@/types";

interface FileRowProps {
  file: RentalRequestFile;
  editable: boolean;
  busy: boolean;
  onOpen: () => void;
  onReplace: (replacement: File) => void;
  onRemove: () => void;
}

export function FileRow({ file, editable, busy, onOpen, onReplace, onRemove }: FileRowProps) {
  const replaceInput = useRef<HTMLInputElement>(null);

  return (
    <li className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
      <FileText className="size-4 shrink-0 text-ink-muted" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink">{file.originalName}</p>
        <p className="text-xs text-ink-muted">
          {formatBytes(file.size)} · {formatDateTime(file.uploadedAt)}
        </p>
      </div>
      <div className="flex gap-1">
        <Button variant="outline" size="sm" disabled={busy} onClick={onOpen}>
          <ExternalLink aria-hidden /> Abrir
        </Button>
        {editable && (
          <>
            <input
              ref={replaceInput}
              type="file"
              accept={ACCEPT_ATTRIBUTE}
              className="sr-only"
              aria-label={`Substituir ${file.originalName}`}
              onChange={(e) => {
                const replacement = e.target.files?.[0];
                e.target.value = "";
                if (replacement) onReplace(replacement);
              }}
            />
            <Button
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() => replaceInput.current?.click()}
            >
              <RefreshCw aria-hidden /> Substituir
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-danger hover:bg-danger-soft"
              disabled={busy}
              onClick={onRemove}
            >
              <Trash2 aria-hidden /> Remover
            </Button>
          </>
        )}
      </div>
    </li>
  );
}
