import { KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { LoginInput } from "@/types";

interface DemoCredentialsHintProps {
  credentials: LoginInput;
  onUse: (credentials: LoginInput) => void;
}

export function DemoCredentialsHint({ credentials, onUse }: DemoCredentialsHintProps) {
  return (
    <div className="mt-5 rounded-lg border border-brand-100 bg-brand-50 p-3 text-sm">
      <p className="flex items-center gap-1.5 font-semibold text-brand-700">
        <KeyRound className="size-4" aria-hidden /> Acesso de demonstração
      </p>
      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-ink">
        <dt className="text-ink-muted">E-mail</dt>
        <dd className="font-mono break-all">{credentials.email}</dd>
        <dt className="text-ink-muted">Senha</dt>
        <dd className="font-mono break-all">{credentials.password}</dd>
      </dl>
      <Button variant="outline" size="sm" className="mt-3" onClick={() => onUse(credentials)}>
        Preencher
      </Button>
    </div>
  );
}
