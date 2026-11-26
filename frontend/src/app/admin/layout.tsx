import { Suspense } from "react";
import type { Metadata } from "next";

import { FullPageSpinner } from "@/components/ui/spinner";
import { AdminSessionProvider } from "@/store/admin-session";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

// o provider le sessionStorage (so no navegador): o fallback e o HTML do servidor
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <AdminSessionProvider>{children}</AdminSessionProvider>
    </Suspense>
  );
}
