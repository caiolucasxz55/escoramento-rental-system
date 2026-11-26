import type { ReactNode } from "react";
import { CircleAlert } from "lucide-react";

import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: ReactNode;
  error?: string | null;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

// rotulo + controle + dica/erro com o mesmo espacamento em todo o app
export function Field({ label, htmlFor, hint, error, required, className, children }: FieldProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {required && <span className="ml-0.5 text-danger" aria-hidden>*</span>}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-message`} className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-danger">
          <CircleAlert className="size-4 shrink-0" aria-hidden />
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${htmlFor}-message`} className="mt-1.5 text-xs text-ink-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
