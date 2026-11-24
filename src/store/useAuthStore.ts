import { resetApiSession } from "@/services/api/queryCache";
import { create } from "zustand";
import { UserProfile } from "@/types";
import { apiClient } from "@/services/api/apiClient";
import { assetUrl } from "@/services/api/config";
import { session, tokenClaims } from "@/services/api/session";
import { useAppStore } from "./useAppStore";
import { ApiError } from "@/services/api/apiError";

export const emptyUser: UserProfile = {
  name: "", role: "", email: "", avatarUrl: "", college: "", amsVersion: "1.0.0",
};
interface AuthState {
  isAuthenticated: boolean;
  sessionToken: string | null;
  user: UserProfile;
  adminId: string | null;
  permissions: Record<string, unknown>;
  sessionExpiry: number | null;
  login: (credentials: { email: string; password?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkSession: () => boolean;
  touchSession: () => void;
}
const initialToken = session.token();
const claims = tokenClaims(initialToken);
const restored = claims ? session.user<UserProfile>() : null;
export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: Boolean(claims && restored),
  sessionToken: restored ? initialToken : null,
  adminId: restored ? claims?.adminId || null : null,
  permissions: {},
  user: restored || emptyUser,
  sessionExpiry: restored && claims ? claims.exp * 1000 : null,
  login: async ({ email, password }) => {
    if (!email.trim() || !password?.trim()) return { success: false, error: "Email and password are required." };
    try {
      const result = await apiClient.post<{ success: boolean; token: string }>("/api/admin/auth/login", { email: email.trim(), password }, { skipAuth: true });
      const decoded = tokenClaims(result.token);
      if (!result.success || !decoded) throw new Error("The server did not return a valid session.");
      const response = await apiClient.get<{ admin: Record<string, any> }>(`/api/admin/admin-profile/${decoded.adminId}`, {
        skipAuth: true, headers: { Authorization: `Bearer ${result.token}` },
      });
      const admin = response.admin;
      const user: UserProfile = {
        ...emptyUser, name: admin.name || "", email: admin.email || "", role: admin.type || "",
        avatarUrl: assetUrl(admin.logo_name, "/uploads"), phone: admin.phone || "",
        city: admin.address?.city || "", state: admin.address?.state || "", country: admin.address?.country || "",
        status: admin.status || "", joinedDate: admin.createdAt || "",
      };
      session.save(result.token, user);
      useAppStore.setState({ adminProfile: user, activities: [], notifications: [] });
      set({ isAuthenticated: true, sessionToken: result.token, adminId: decoded.adminId, user,
        permissions: admin.accessPermissions || {}, sessionExpiry: decoded.exp * 1000 });
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof ApiError
        ? error.status === 401 ? "Invalid email or password." : error.userMessage
        : "Unable to establish your session. Please try again." };
    }
  },
  logout: () => {
    resetApiSession(null);
    session.clear();
    useAppStore.setState({ adminProfile: emptyUser, activities: [], notifications: [] });
    set({ isAuthenticated: false, sessionToken: null, sessionExpiry: null, adminId: null, user: emptyUser, permissions: {} });
    window.dispatchEvent(new Event("ams-session-ended"));
  },
  checkSession: () => {
    if (!tokenClaims(get().sessionToken)) {
      if (get().isAuthenticated) get().logout();
      return false;
    }
    return true;
  },
  touchSession: () => { get().checkSession(); },
}));
