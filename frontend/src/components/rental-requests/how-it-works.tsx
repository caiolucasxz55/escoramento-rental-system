import type { LucideIcon } from "lucide-react";
import { ClipboardList, KeyRound, SearchCheck } from "lucide-react";

const STEPS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: ClipboardList, title: "Envie o pedido", text: "Dados, descrição e até 5 documentos." },
  { icon: KeyRound, title: "Guarde o token", text: "Você recebe um identificador e um token de consulta." },
  { icon: SearchCheck, title: "Acompanhe", text: "Veja o status quando quiser em Acompanhar solicitação." },
];

export function HowItWorks() {
  return (
    <ol className="mb-6 grid gap-3 sm:grid-cols-3">
      {STEPS.map(({ icon: Icon, title, text }, i) => (
        <li key={title} className="flex gap-3 rounded-xl bg-brand-50 p-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
            <Icon className="size-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-brand-700">
              {i + 1}. {title}
            </p>
            <p className="mt-0.5 text-xs text-ink-muted">{text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
