import { apiRequest } from "@/lib/apiClient";
import { computeStatus } from "@/lib/paymentStatus";
import type { ApiCustomer, Player, Sport } from "@/types";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function mapCustomer(c: ApiCustomer, month: number, year: number): Player {
  const monthlyFee = c.monthlyFee ?? 500;
  const amountPaid = c.amountPaid ?? 0;
  const due = c.balance ?? monthlyFee;
  const apiStatus = c.paymentStatus ?? (due <= 0 ? "Paid" : amountPaid > 0 ? "Partially Paid" : "Unpaid");

  return {
    id: c._id,
    name: c.name,
    mobile: c.phone,
    sport: (c.sports?.[0] ?? "Cricket") as Sport,
    batch: c.batch ?? "",
    status: computeStatus(apiStatus),
    due,
    amountPaid,
    monthlyFee,
    month: MONTH_NAMES[month - 1],
    monthNumber: month,
    year,
    joinDate: c.createdAt,
    transactions: c.transactions ?? [],
  };
}

export async function fetchPlayers(month?: number, year?: number): Promise<Player[]> {
  const now = new Date();
  const m = month ?? now.getMonth() + 1;
  const y = year ?? now.getFullYear();
  const res = await apiRequest<{ customers: ApiCustomer[] }>(
    `/api/payment/customers?month=${m}&year=${y}`
  );
  return res.customers.map((c) => mapCustomer(c, m, y));
}

export async function createPlayer(input: {
  name: string;
  phone: string;
  sport: Sport;
  batch?: string;
  monthlyFee?: number;
}): Promise<void> {
  await apiRequest("/api/payment/customer", {
    method: "POST",
    body: { name: input.name, phone: input.phone, sports: [input.sport], batch: input.batch, monthlyFee: input.monthlyFee },
  });
}

export async function updatePlayer(
  id: string,
  input: { name: string; phone: string; sport: Sport; batch?: string; monthlyFee?: number }
): Promise<void> {
  await apiRequest("/api/payment/customer", {
    method: "POST",
    body: {
      customerId: id,
      name: input.name,
      phone: input.phone,
      sports: [input.sport],
      batch: input.batch,
      monthlyFee: input.monthlyFee,
    },
  });
}

export async function deletePlayer(id: string): Promise<void> {
  await apiRequest(`/api/payment/customer/${id}`, { method: "DELETE" });
}
