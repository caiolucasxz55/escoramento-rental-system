import type { ReactNode } from "react";
import Link from "next/link";

import { NavLink } from "./nav-link";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-4 px-4">
          <Link href="/" className="font-semibold text-ink">
            Escoramento
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <NavLink href="/">Nova solicitação</NavLink>
            <NavLink href="/status">Consultar status</NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">{children}</main>
      <footer className="border-t border-line py-4 text-center text-xs text-ink-muted">
        <Link href="/admin" className="hover:text-ink">
          Área administrativa
        </Link>
      </footer>
    </div>
  );
}
