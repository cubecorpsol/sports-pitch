// Base URL for the live SportsPitch backend (Render). Same env var name and
// fallback the existing admin-panel-new already used, so the same .env
// works for both.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "https://sports-pitch-2-ootl.onrender.com";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    // non-JSON response
  }

  if (!res.ok || json?.success === false) {
    throw new ApiError(json?.error ?? `Request failed (${res.status})`, res.status);
  }

  return json as T;
}
