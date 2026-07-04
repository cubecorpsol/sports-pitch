import type { PaymentStatus } from "@/types";

// The backend only stores Paid / Partially Paid / Unpaid with no due-date
// field anywhere. Per the approved plan, Overdue and Due soon are computed
// client-side from a simple, documented monthly due-date rule so the UI
// can still group by urgency without any schema change:
//
//   - Paid / Partially Paid map straight through.
//   - Unpaid and today is on/before the due day        -> "pending"
//   - Unpaid and today is within the warning window     -> "dueSoon"
//     after the due day
//   - Unpaid and today is past the warning window        -> "overdue"
//
// Adjust DUE_DAY / WARNING_DAYS here if the turf's actual billing cycle
// differs -- this is the single place that logic lives.
const DUE_DAY = 5;
const WARNING_DAYS = 5;

export function computeStatus(
  apiStatus: "Paid" | "Unpaid" | "Partially Paid",
  today: Date = new Date()
): PaymentStatus {
  if (apiStatus === "Paid") return "paid";
  if (apiStatus === "Partially Paid") return "partiallyPaid";

  const dayOfMonth = today.getDate();
  if (dayOfMonth <= DUE_DAY) return "pending";
  if (dayOfMonth <= DUE_DAY + WARNING_DAYS) return "dueSoon";
  return "overdue";
}
