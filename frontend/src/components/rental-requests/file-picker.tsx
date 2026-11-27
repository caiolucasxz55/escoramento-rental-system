"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import { FileText, UploadCloud, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ACCEPT_ATTRIBUTE, MAX_FILES, UPLOAD_LIMITS, validateFiles } from "@/lib/file-rules";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/utils";

interface FilePickerProps {
  files: File[];
  onChange: (files: File[]) => void;
  onError: (message: string | null) => void;
  disabled?: boolean;
}

export function FilePicker({ files, onChange, onError, disabled }: FilePickerProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleSelect(selected: FileList | null) {
    const next = [...files, ...Array.from(selected ?? [])];
    const problem = validateFiles(next);
    onError(problem);
    if (!problem) onChange(next);
    // permite escolher o mesmo arquivo de novo depois de remover
    if (inputRef.current) inputRef.current.value = "";
  }

  function remove(index: number) {
    onError(null);
    onChange(files.filter((_, i) => i !== index));
  }

  const blocked = disabled || files.length >= MAX_FILES;

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    if (!blocked) handleSelect(event.dataTransfer.files);
  }

  return (
    <div>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        multiple
        accept={ACCEPT_ATTRIBUTE}
        className="peer sr-only"
        disabled={blocked}
        onChange={(e) => handleSelect(e.target.files)}
      />
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          if (!blocked) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-1 rounded-lg border-2 border-dashed border-line px-4 py-6 text-center transition-colors hover:border-brand-500 hover:bg-brand-50/50 peer-focus-visible:border-brand-500 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500/30",
          dragging && "border-brand-500 bg-brand-50",
          blocked && "cursor-not-allowed opacity-60 hover:border-line hover:bg-transparent",
        )}
      >
        <UploadCloud className="size-7 text-brand-600" aria-hidden />
        <span className="text-sm font-medium text-ink">
          {files.length >= MAX_FILES ? "Limite de arquivos atingido" : "Arraste os arquivos ou clique para escolher"}
        </span>
        <span className="text-xs text-ink-muted">
          PDF, PNG ou JPEG · até {UPLOAD_LIMITS.maxFileMb} MB cada
          {UPLOAD_LIMITS.maxTotalMb && ` · ${UPLOAD_LIMITS.maxTotalMb} MB no total`} · {files.length}/{MAX_FILES}
        </span>
      </label>

      {files.length > 0 && (
        <ul className="mt-3 divide-y divide-line rounded-lg border border-line">
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`} className="flex items-center gap-3 px-3 py-2 text-sm">
              <FileText className="size-4 shrink-0 text-ink-muted" aria-hidden />
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              <span className="text-xs text-ink-muted">{formatBytes(file.size)}</span>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remover ${file.name}`}
                disabled={disabled}
                onClick={() => remove(index)}
              >
                <X aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
