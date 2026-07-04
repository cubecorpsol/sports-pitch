import { apiRequest } from "@/lib/apiClient";
import type { ApiSettings } from "@/types";

export async function fetchSettings(): Promise<ApiSettings> {
  const res = await apiRequest<{ settings: ApiSettings }>("/api/settings");
  return res.settings;
}

export async function updateSettings(input: Partial<ApiSettings>): Promise<ApiSettings> {
  const res = await apiRequest<{ settings: ApiSettings }>("/api/settings", { method: "PUT", body: input });
  return res.settings;
}

export async function changeAdminPin(currentPin: string, newPin: string): Promise<void> {
  await apiRequest("/api/settings/pin", { method: "PUT", body: { currentPin, newPin } });
}

export async function verifyAdminPin(pin: string): Promise<boolean> {
  const res = await apiRequest<{ valid: boolean }>("/api/settings/verify-pin", {
    method: "POST",
    body: { pin },
  });
  return res.valid;
}
