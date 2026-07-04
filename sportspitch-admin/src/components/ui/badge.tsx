import * as React from "react";
import { cn } from "@/lib/utils";
import type { PaymentStatus, BookingStatus } from "@/types";

type BadgeStatus = PaymentStatus | BookingStatus;

const statusStyles: Record<BadgeStatus, string> = {
  overdue: "bg-status-overdue-bg text-status-overdue",
  dueSoon: "bg-status-duesoon-bg text-status-duesoon",
  pending: "bg-status-pending-bg text-status-pending",
  paid: "bg-status-paid-bg text-status-paid",
  partiallyPaid: "bg-brand-50 text-brand-600",
  approved: "bg-status-paid-bg text-status-paid",
  rejected: "bg-status-overdue-bg text-status-overdue",
};

const statusLabels: Record<BadgeStatus, string> = {
  overdue: "Overdue",
  dueSoon: "Due soon",
  pending: "Pending",
  paid: "Paid",
  partiallyPaid: "Partially paid",
  approved: "Approved",
  rejected: "Rejected",
};

export function StatusBadge({ status, className }: { status: BadgeStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        statusStyles[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
