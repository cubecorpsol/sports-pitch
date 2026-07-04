import { apiRequest } from "@/lib/apiClient";
import type { ApiSportFee, Sport } from "@/types";

// Sports themselves are a fixed enum on the backend (Cricket, Badminton,
// Karate, Kabaddi) baked into three Mongoose schemas -- the "Sports" tab
// therefore edits each sport's fee rather than adding/removing sports.
export async function fetchSportFees(): Promise<ApiSportFee[]> {
  const res = await apiRequest<{ sportFees: ApiSportFee[] }>("/api/sport-fees");
  return res.sportFees;
}

export async function updateSportFee(sport: Sport, monthlyFee: number): Promise<void> {
  await apiRequest(`/api/sport-fees/${sport}`, { method: "PUT", body: { monthlyFee } });
}
