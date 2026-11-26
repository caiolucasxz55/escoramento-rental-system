import type { Metadata } from "next";

import { StatusLookupView } from "@/components/rental-requests/status-lookup-view";

export const metadata: Metadata = { title: "Consultar status" };

export default function StatusPage() {
  return <StatusLookupView />;
}
