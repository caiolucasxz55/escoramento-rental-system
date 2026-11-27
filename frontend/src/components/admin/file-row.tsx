"use client";

import { Eye, FileImage, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { previewKind } from "@/lib/file-preview";
import { formatBytes, formatDateTime } from "@/lib/format";
import type { RentalRequestFile } from "@/types";

const TYPE_LABEL: Record<string, string> = {
  "application/pdf": "PDF",
  "image/png": "PNG",
  "image/jpeg": "JPEG",
};

interface FileRowProps {
  file: RentalRequestFile;
  onPreview: () => void;
}

export function FileRow({ file, onPreview }: FileRowProps) {
  const isImage = previewKind(file.mimeType) === "image";
  const Icon = isImage ? FileImage : FileText;

  return (
    <li className="flex items-center gap-3 px-5 py-4 sm:gap-4 sm:px-6">
      <span className="flex size-10 shrink-0 items-center sm:size-12 justify-center rounded-lg bg-brand-50 text-brand-600">
        <Icon className="size-6" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-medium text-ink">{file.originalName}</p>
        <p className="mt-0.5 text-sm text-ink-muted">
          {TYPE_LABEL[file.mimeType] ?? file.mimeType} · {formatBytes(file.size)} ·{" "}
          {formatDateTime(file.uploadedAt)}
        </p>
      </div>
      <Button variant="outline" className="shrink-0 px-3 sm:px-4" onClick={onPreview} aria-label={`Visualizar ${file.originalName}`}>
        <Eye aria-hidden /> <span className="hidden sm:inline">Visualizar</span>
      </Button>
    </li>
  );
}
