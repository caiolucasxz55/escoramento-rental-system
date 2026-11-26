import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminShell } from "@/components/layout/admin-shell";

export default function AdminPanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <AdminGuard>
      <AdminShell>{children}</AdminShell>
    </AdminGuard>
  );
}
