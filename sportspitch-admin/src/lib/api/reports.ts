import { apiRequest } from "@/lib/apiClient";

export async function fetchRevenueStats(params: { month?: number; year?: number; startDate?: string; endDate?: string } = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v !== undefined && qs.set(k, String(v)));
  return apiRequest<{
    stats: {
      totalRevenue: number;
      currentMonthRevenue: number;
      currentYearRevenue: number;
      allTimeRevenue: number;
    };
  }>(`/api/payment/payment/revenue-stats?${qs.toString()}`);
}

export async function fetchPendingFeeReport() {
  return apiRequest<{ data: { customers: unknown[]; totalPending: number } }>(
    "/api/payment/reports/pending-fees"
  );
}

export async function fetchSportWiseRevenue(month?: number, year?: number) {
  const qs = new URLSearchParams();
  if (month) qs.set("month", String(month));
  if (year) qs.set("year", String(year));
  return apiRequest<{ data: { sportRevenue: { sport: string; revenue: number; percentage: string }[]; totalRevenue: number } }>(
    `/api/payment/reports/sport-wise-revenue?${qs.toString()}`
  );
}
