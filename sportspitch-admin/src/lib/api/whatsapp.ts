import { apiRequest } from "@/lib/apiClient";

export async function sendPaymentReminder(customerId: string, month?: number, year?: number) {
  return apiRequest<{ whatsappUrl: string; balance: number }>("/api/whatsapp/send-reminder", {
    method: "POST",
    body: { customerId, month, year },
  });
}

export async function fetchBulkReminders(month?: number, year?: number) {
  const qs = new URLSearchParams();
  if (month) qs.set("month", String(month));
  if (year) qs.set("year", String(year));
  return apiRequest<{
    customers: { customerId: string; name: string; whatsappUrl: string; balance: number }[];
  }>(`/api/whatsapp/bulk-reminders?${qs.toString()}`);
}
