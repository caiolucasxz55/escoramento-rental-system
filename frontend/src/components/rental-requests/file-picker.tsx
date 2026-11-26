"use client";

import { useId, useRef } from "react";
import { FileText, Paperclip, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ACCEPT_ATTRIBUTE, MAX_FILE_SIZE_MB, MAX_FILES, validateFiles } from "@/lib/file-rules";
import { formatBytes } from "@/lib/format";

interface FilePickerProps {
  files: File[];
  onChange: (files: File[]) => void;
  onError: (message: string | null) => void;
  disabled?: boolean;
}

export function FilePicker({ files, onChange, onError, disabled }: FilePickerProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        multiple
        accept={ACCEPT_ATTRIBUTE}
        className="sr-only"
        disabled={disabled || files.length >= MAX_FILES}
        onChange={(e) => handleSelect(e.target.files)}
      />
      <Button
        variant="outline"
        disabled={disabled || files.length >= MAX_FILES}
        onClick={() => inputRef.current?.click()}
      >
        <Paperclip aria-hidden /> Anexar arquivos
      </Button>
      <p className="mt-1.5 text-xs text-ink-muted">
        PDF, PNG ou JPEG · até {MAX_FILES} arquivos de {MAX_FILE_SIZE_MB} MB · {files.length}/
        {MAX_FILES}
      </p>

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
