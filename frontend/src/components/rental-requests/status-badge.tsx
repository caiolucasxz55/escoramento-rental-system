import { cva } from "class-variance-authority";

import { STATUS_LABEL } from "@/lib/rental-request-status";
import { cn } from "@/lib/utils";
import type { RentalRequestStatus } from "@/types";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      status: {
        PENDING: "bg-warning-soft text-warning",
        UNDER_REVIEW: "bg-info-soft text-info",
        APPROVED: "bg-success-soft text-success",
        CANCELLED: "bg-danger-soft text-danger",
      },
    },
  },
);

export function StatusBadge({ status, className }: { status: RentalRequestStatus; className?: string }) {
  return <span className={cn(badgeVariants({ status }), className)}>{STATUS_LABEL[status]}</span>;
}
