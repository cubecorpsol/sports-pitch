// Reuses the exact credential check from the existing admin-panel-new
// (username "sportspitch" / password "new2580"), which is itself the only
// auth the current backend has -- there is no login API to call. Session
// flag mirrors the old panel's localStorage key so switching between the
// two panels during rollout doesn't log the admin out unexpectedly.
const AUTH_KEY = "adminAuthenticated";
const DEFAULT_USERNAME = "sportspitch";
const DEFAULT_PASSWORD = "new2580";
const PASSWORD_OVERRIDE_KEY = "adminPasswordOverride";

export function login(username: string, password: string): boolean {
  const activePassword = localStorage.getItem(PASSWORD_OVERRIDE_KEY) ?? DEFAULT_PASSWORD;
  if (username === DEFAULT_USERNAME && password === activePassword) {
    localStorage.setItem(AUTH_KEY, "true");
    return true;
  }
  return false;
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
}

export function isAuthenticated(): boolean {
  return localStorage.getItem(AUTH_KEY) === "true";
}

export function changePassword(currentPassword: string, newPassword: string): boolean {
  const activePassword = localStorage.getItem(PASSWORD_OVERRIDE_KEY) ?? DEFAULT_PASSWORD;
  if (currentPassword !== activePassword) return false;
  localStorage.setItem(PASSWORD_OVERRIDE_KEY, newPassword);
  return true;
}
