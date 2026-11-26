import type { Metadata } from "next";

import { NewRentalRequestView } from "@/components/rental-requests/new-rental-request-view";

export const metadata: Metadata = { title: "Solicitar escoramento" };

export default function NewRentalRequestPage() {
  return <NewRentalRequestView />;
}
