const TOKEN_KEY = "ams_auth_session_token";
const USER_KEY = "ams_auth_user";
export interface TokenClaims { adminId: string; exp: number }
export function tokenClaims(token: string | null): TokenClaims | null {
  try {
    if (!token) return null;
    const segment = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const claims = JSON.parse(atob(segment)) as TokenClaims;
    return claims.adminId && Number.isFinite(claims.exp) && claims.exp * 1000 > Date.now() ? claims : null;
  } catch { return null; }
}
export const session = {
  token(): string | null {
    try { const value = sessionStorage.getItem(TOKEN_KEY); return tokenClaims(value) ? value : null; }
    catch { return null; }
  },
  user<T>(): T | null {
    try { return JSON.parse(sessionStorage.getItem(USER_KEY) || "null") as T | null; }
    catch { return null; }
  },
  save(token: string, user: unknown) {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear() {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
      sessionStorage.removeItem("ams_recent_searches_api_v1");
      sessionStorage.removeItem("ams_auth_session_expiry");
      sessionStorage.removeItem("ams_explicit_logout");
    } catch { /* Storage may be unavailable. */ }
  },
};
