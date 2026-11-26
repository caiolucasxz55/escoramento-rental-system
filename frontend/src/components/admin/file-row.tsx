"use client";

import { ExternalLink, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatBytes, formatDateTime } from "@/lib/format";
import type { RentalRequestFile } from "@/types";

interface FileRowProps {
  file: RentalRequestFile;
  busy: boolean;
  onOpen: () => void;
}

export function FileRow({ file, busy, onOpen }: FileRowProps) {
  return (
    <li className="flex items-center gap-3 px-4 py-3 text-sm">
      <FileText className="size-4 shrink-0 text-ink-muted" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink">{file.originalName}</p>
        <p className="text-xs text-ink-muted">
          {formatBytes(file.size)} · {formatDateTime(file.uploadedAt)}
        </p>
      </div>
      <Button variant="outline" size="sm" disabled={busy} onClick={onOpen}>
        <ExternalLink aria-hidden /> Abrir
      </Button>
    </li>
  );
}
