import { Suspense } from "react";

import { RentalRequestsListView } from "@/components/admin/rental-requests-list-view";
import { FullPageSpinner } from "@/components/ui/spinner";

// a lista le a query string (useSearchParams)
export default function AdminRentalRequestsPage() {
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <RentalRequestsListView />
    </Suspense>
  );
}
