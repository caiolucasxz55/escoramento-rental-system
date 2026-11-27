import Link from "next/link";
import { ArrowRight, Check, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ShoringIllustration } from "./shoring-illustration";

export const REQUEST_PATH = "/solicitar";

export function HomeHero() {
  return (
    <section className="relative flex min-h-[calc(100vh-8rem)] items-center overflow-hidden">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:py-16">
        <div>
          <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            O escoramento certo para sua obra{" "}
            <span className="text-brand-600">sair do papel.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
            Escoras metálicas, vigas e torres para lajes e estruturas. Envie sua solicitação em
            poucos minutos e acompanhe cada etapa pelo status.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Button size="lg" asChild className="group">
              <Link href={REQUEST_PATH}>
                Solicitar escoramento
                <ArrowRight className="transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </Button>
            <Link
              href="/status"
              className="group inline-flex items-center gap-1 text-sm font-semibold text-ink transition-colors hover:text-brand-600"
            >
              Já fiz uma solicitação
              <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>

        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative isolate mx-auto w-full max-w-md lg:max-w-none">
      {/* aneis decorativos atras do card */}
      <div aria-hidden className="absolute inset-0 -z-10 grid place-items-center">
        <div className="aspect-square w-[115%] rounded-full border border-line/80" />
        <div className="absolute aspect-square w-[88%] rounded-full border border-dashed border-line" />
      </div>

      <div className="rounded-3xl border border-line bg-surface p-5 shadow-xl shadow-brand-700/5 sm:p-6 lg:rotate-[1.5deg]">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand-700">
            <span className="size-1.5 rounded-full bg-brand-500" aria-hidden />
            Disponível para locação
          </span>
          <span className="text-ink-muted/50" aria-hidden>•••</span>
        </div>

        <ShoringIllustration className="mt-4" />

        <div className="mt-4 flex items-center justify-between gap-4 border-t border-line pt-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Linha completa</p>
            <p className="mt-0.5 font-semibold text-ink">Escoras, vigas e torres</p>
          </div>
          <Link
            href={REQUEST_PATH}
            aria-label="Solicitar escoramento"
            className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition-colors hover:bg-brand-100"
          >
            <ArrowRight className="size-5" aria-hidden />
          </Link>
        </div>
      </div>

      <div className="absolute -top-5 -right-2 hidden items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 shadow-lg sm:flex lg:-right-8">
        <span className="flex size-8 items-center justify-center rounded-full bg-success-soft text-success">
          <Check className="size-4" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold text-ink">Solicitação enviada</p>
          <p className="text-xs text-ink-muted">Acompanhe pelo token</p>
        </div>
      </div>
    </div>
  );
}
