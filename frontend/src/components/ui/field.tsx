import type { ReactNode } from "react";

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
  const message = error ?? hint;
  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {required && <span className="ml-0.5 text-danger" aria-hidden>*</span>}
      </label>
      {children}
      {message && (
        <p
          id={`${htmlFor}-message`}
          className={cn("mt-1.5 text-xs", error ? "text-danger" : "text-ink-muted")}
        >
          {message}
        </p>
      )}
    </div>
  );
}
