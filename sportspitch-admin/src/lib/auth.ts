import { API_BASE_URL } from "@/lib/config";

const AUTH_KEY = "adminAuthenticated";
const TOKEN_KEY = "adminAuthToken";

export async function login(username: string, password: string): Promise<boolean> {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.token) {
    return false;
  }

  localStorage.setItem(AUTH_KEY, "true");
  localStorage.setItem(TOKEN_KEY, data.token);
  return true;
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return localStorage.getItem(AUTH_KEY) === "true" && Boolean(localStorage.getItem(TOKEN_KEY));
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
