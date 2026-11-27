import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { BrandLogo } from "./brand-logo";
import { NavLink } from "./nav-link";

// cada pagina define a propria largura: a inicial usa a tela toda, o resto e estreito
export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-line/70 bg-surface/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
          <BrandLogo />
          <nav className="flex items-center text-sm sm:gap-3">
            <NavLink href="/status">
              <span className="sm:hidden">Acompanhar</span>
              <span className="hidden sm:inline">Acompanhar solicitação</span>
            </NavLink>
            <Link
              href="/admin"
              className="group inline-flex h-10 items-center gap-1.5 rounded-md px-2.5 font-semibold text-brand-700 transition-colors hover:text-brand-600 sm:px-3"
            >
              <span className="hidden sm:inline">Área administrativa</span>
              <span className="sm:hidden">Admin</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-line py-6">
        <p className="mx-auto max-w-6xl px-4 text-xs text-ink-muted sm:px-6">
          escoramento · solicitações de locação de escoramento
        </p>
      </footer>
    </div>
  );
}
