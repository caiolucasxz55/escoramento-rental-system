"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { FullPageSpinner } from "@/components/ui/spinner";
import { ADMIN_LOGIN_PATH } from "@/lib/api/client";
import { useAdminSession } from "@/store/admin-session";

// so a UI: quem protege de verdade e o guard do backend
export function AdminGuard({ children }: { children: ReactNode }) {
  const { token } = useAdminSession();
  const router = useRouter();

  useEffect(() => {
    if (!token) router.replace(ADMIN_LOGIN_PATH);
  }, [token, router]);

  return token ? children : <FullPageSpinner />;
}
