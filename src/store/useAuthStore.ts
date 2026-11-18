import { create } from "zustand";
import { currentUser as defaultUser } from "@/data/mockData";
import { UserProfile } from "@/types";

const SESSION_TOKEN_KEY = "ams_auth_session_token";
const SESSION_EXPIRY_KEY = "ams_auth_session_expiry";
// Default 8-hour session lifetime
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

interface AuthState {
  isAuthenticated: boolean;
  sessionToken: string | null;
  user: UserProfile;
  sessionExpiry: number | null;
  login: (credentials: { email: string; password?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkSession: () => boolean;
  touchSession: () => void;
}

/**
 * Validates active session token from sessionStorage (isolated per browser session).
 */
function getInitialAuthState(): { isAuthenticated: boolean; token: string | null; expiry: number | null } {
  if (typeof window === "undefined") {
    return { isAuthenticated: false, token: null, expiry: null };
  }

  try {
    const token = window.sessionStorage.getItem(SESSION_TOKEN_KEY);
    const rawExpiry = window.sessionStorage.getItem(SESSION_EXPIRY_KEY);
    const expiry = rawExpiry ? parseInt(rawExpiry, 10) : null;

    if (token && expiry && Date.now() < expiry) {
      return { isAuthenticated: true, token, expiry };
    }

    // Default administrative session on initial access if not explicitly logged out
    const isLoggedOut = window.sessionStorage.getItem("ams_explicit_logout") === "true";
    if (!isLoggedOut) {
      const defaultExpiry = Date.now() + SESSION_DURATION_MS;
      const defaultToken = "ams_session_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
      window.sessionStorage.setItem(SESSION_TOKEN_KEY, defaultToken);
      window.sessionStorage.setItem(SESSION_EXPIRY_KEY, defaultExpiry.toString());
      return { isAuthenticated: true, token: defaultToken, expiry: defaultExpiry };
    }

    return { isAuthenticated: false, token: null, expiry: null };
  } catch {
    return { isAuthenticated: false, token: null, expiry: null };
  }
}

const initialAuth = getInitialAuthState();

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: initialAuth.isAuthenticated,
  sessionToken: initialAuth.token,
  user: defaultUser,
  sessionExpiry: initialAuth.expiry,

  login: async ({ email, password }) => {
    // Validate credentials presence
    if (!email || !email.trim()) {
      return { success: false, error: "Administrative email is required." };
    }
    if (password !== undefined && !password.trim()) {
      return { success: false, error: "Password is required." };
    }

    // Generate secure session token and expiry
    const newExpiry = Date.now() + SESSION_DURATION_MS;
    const newToken = "ams_session_" + Math.random().toString(36).substring(2) + Date.now().toString(36);

    try {
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem("ams_explicit_logout");
        window.sessionStorage.setItem(SESSION_TOKEN_KEY, newToken);
        window.sessionStorage.setItem(SESSION_EXPIRY_KEY, newExpiry.toString());
      }
    } catch {
      // Ignore storage restrictions
    }

    set({
      isAuthenticated: true,
      sessionToken: newToken,
      sessionExpiry: newExpiry,
    });

    return { success: true };
  },

  logout: () => {
    try {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("ams_explicit_logout", "true");
        window.sessionStorage.removeItem(SESSION_TOKEN_KEY);
        window.sessionStorage.removeItem(SESSION_EXPIRY_KEY);
      }
    } catch {
      // Ignore storage restrictions
    }

    set({
      isAuthenticated: false,
      sessionToken: null,
      sessionExpiry: null,
    });
  },

  checkSession: () => {
    const { sessionExpiry, sessionToken } = get();
    if (!sessionToken || !sessionExpiry) {
      if (get().isAuthenticated) {
        get().logout();
      }
      return false;
    }

    if (Date.now() >= sessionExpiry) {
      get().logout();
      return false;
    }

    return true;
  },

  touchSession: () => {
    const { isAuthenticated } = get();
    if (!isAuthenticated) return;

    const newExpiry = Date.now() + SESSION_DURATION_MS;
    try {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(SESSION_EXPIRY_KEY, newExpiry.toString());
      }
    } catch {
      // Ignore
    }

    set({ sessionExpiry: newExpiry });
  },
}));
