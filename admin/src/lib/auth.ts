const ACCESS_TOKEN_KEY = "admin_access_token";
const REFRESH_TOKEN_KEY = "admin_refresh_token";
const USER_KEY = "admin_user";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  const t = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!t || t === "undefined") {
    if (t === "undefined") clearAuth();
    return null;
  }
  return t;
}

export function setTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === "undefined") return;
  if (accessToken && refreshToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  const t = localStorage.getItem(REFRESH_TOKEN_KEY);
  return t && t !== "undefined" ? t : null;
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function setUser(user: unknown): void {
  if (typeof window === "undefined") return;
  if (user != null) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser(): { name: string; email: string } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw || raw === "undefined") return null;
  try {
    const u = JSON.parse(raw);
    return u && typeof u === "object" ? { name: u?.name ?? "", email: u?.email ?? "" } : null;
  } catch {
    return null;
  }
}
