"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ADMIN_LOGIN_PATH } from "@/lib/api/client";
import { useAdminSession } from "@/store/admin-session";

export function AdminShell({ children }: { children: ReactNode }) {
  const { logout } = useAdminSession();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace(ADMIN_LOGIN_PATH);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-t-4 border-b border-t-brand-500 border-b-line bg-surface">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
          <Link href="/admin" className="font-semibold text-ink">
            Escoramento <span className="font-normal text-ink-muted">· Admin</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut aria-hidden /> Sair
          </Button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
