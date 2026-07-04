import { apiRequest } from "@/lib/apiClient";
import type { ApiTransaction } from "@/types";

export async function recordPayment(input: {
  customerId: string;
  amount: number;
  paymentMethod: string;
  remarks?: string;
  month?: number;
  year?: number;
}): Promise<{ totalAmountPaid: number; balance: number; paymentStatus: string }> {
  return apiRequest("/api/payment/payment/record", { method: "POST", body: input });
}

export async function updatePaymentStatus(input: {
  customerId: string;
  status: "Paid" | "Unpaid" | "Partially Paid";
  month?: number;
  year?: number;
  editedBy: string;
}): Promise<void> {
  await apiRequest("/api/payment/payment/update-status", { method: "POST", body: input });
}

// PIN-gated edit of an existing transaction -- amount / method / remarks --
// with a full audit trail (editedBy, editedAt, editHistory) kept server-side.
export async function editTransaction(
  transactionId: string,
  input: { amount?: number; paymentMethod?: string; remarks?: string; editedBy: string }
): Promise<{ transaction: ApiTransaction; balance: number; paymentStatus: string }> {
  return apiRequest(`/api/payment/transaction/${transactionId}`, { method: "PUT", body: input });
}

export async function fetchPaymentHistory(customerId: string) {
  return apiRequest<{
    history: {
      year: number;
      month: number;
      monthName: string;
      monthlyFee: number;
      amountPaid: number;
      balance: number;
      paymentStatus: string;
      transactions: ApiTransaction[];
    }[];
    summary: { totalMonthsPaid: number; totalMonthsNotPaid: number; monthsSinceJoin: number };
  }>(`/api/payment/payment/history/${customerId}`);
}
