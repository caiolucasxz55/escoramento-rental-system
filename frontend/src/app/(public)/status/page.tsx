import type { Metadata } from "next";

import { StatusLookupView } from "@/components/rental-requests/status-lookup-view";

export const metadata: Metadata = { title: "Acompanhar solicitação" };

export default function StatusPage() {
  return <StatusLookupView />;
}
