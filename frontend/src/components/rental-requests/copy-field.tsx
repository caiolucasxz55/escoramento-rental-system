"use client";

import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";

interface CopyFieldProps {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}

export function CopyField({ label, value, copied, onCopy }: CopyFieldProps) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</p>
      <div className="flex items-center gap-2 rounded-lg border border-line bg-canvas p-2 pl-3">
        <code className="min-w-0 flex-1 break-all font-mono text-sm text-ink">{value}</code>
        <Button variant="outline" size="sm" onClick={onCopy} aria-label={`Copiar ${label}`}>
          {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
          {copied ? "Copiado" : "Copiar"}
        </Button>
      </div>
    </div>
  );
}
