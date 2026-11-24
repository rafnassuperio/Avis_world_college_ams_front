import { session } from "@/services/api/session";
import { create } from 'zustand';
import {


  quickActionsData,

} from '@/data/uiConfig';
import { NotificationItem, QuickAction, RecentActivity, UserProfile } from '@/types';
import { safeStorage } from '@/lib/security';

const currentUser: UserProfile = (session.token() ? session.user<UserProfile>() : null) || { name: "", role: "", email: "", avatarUrl: "", college: "", amsVersion: "1.0.0" };

const initialNotifications: NotificationItem[] = [];

const ADMIN_PROFILE_STORAGE_KEY = 'ams_admin_profile';


interface AppState {
  // Admin Profile state
  adminProfile: UserProfile;
  updateAdminProfile: (updated: Partial<UserProfile>) => void;
  resetAdminProfile: () => void;

  // Sidebar state
  sidebarCollapsed: boolean;
  isMobileSidebarOpen: boolean;
  academicsSubmenuOpen: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleMobileSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleAcademicsSubmenu: () => void;

  // Search Palette state
  isSearchOpen: boolean;
  searchQuery: string;
  setIsSearchOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;

  // Filter dropdowns
  overviewFilter: 'This Year' | 'Last Year' | 'All Time';
  setOverviewFilter: (filter: 'This Year' | 'Last Year' | 'All Time') => void;
  intakeFilter: string;
  setIntakeFilter: (filter: string) => void;
  feeMonthFilter: string;
  setFeeMonthFilter: (filter: string) => void;

  // Modals
  activeModal: string | null;
  modalData: Record<string, unknown> | null;
  openModal: (modalType: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;

  // PWA Install Modal
  isPWAInstallOpen: boolean;
  openPWAInstall: () => void;
  closePWAInstall: () => void;

  // Notifications
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Dynamic Activities & Quick Actions
  activities: RecentActivity[];
  quickActions: QuickAction[];
  addActivity: (activity: RecentActivity) => void;
  removeActivity: (id: string) => void;
  clearActivities: () => void;
  resetActivities: () => void;
}

if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('ams-theme');
    document.documentElement.classList.remove('dark');
  } catch {
    // ignore
  }
}

export const useAppStore = create<AppState>((set) => ({
  // Admin Profile state & persistence
  adminProfile: currentUser,
  updateAdminProfile: (updated) =>
    set((state) => {
      const newProfile = { ...state.adminProfile, ...updated };
      safeStorage.setItem(ADMIN_PROFILE_STORAGE_KEY, newProfile);
      return { adminProfile: newProfile };
    }),
  resetAdminProfile: () =>
    set(() => {
      safeStorage.setItem(ADMIN_PROFILE_STORAGE_KEY, currentUser);
      return { adminProfile: currentUser };
    }),

  sidebarCollapsed: false,
  isMobileSidebarOpen: false,
  academicsSubmenuOpen: false,

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleMobileSidebar: () =>
    set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
  setMobileSidebarOpen: (open) => set({ isMobileSidebarOpen: open }),
  toggleAcademicsSubmenu: () =>
    set((state) => ({ academicsSubmenuOpen: !state.academicsSubmenuOpen })),

  isSearchOpen: false,
  searchQuery: '',
  setIsSearchOpen: (open) => set({ isSearchOpen: open }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  overviewFilter: 'This Year',
  setOverviewFilter: (filter) => set({ overviewFilter: filter }),
  intakeFilter: 'This Intake',
  setIntakeFilter: (filter) => set({ intakeFilter: filter }),
  feeMonthFilter: 'This Month',
  setFeeMonthFilter: (filter) => set({ feeMonthFilter: filter }),

  activeModal: null,
  modalData: null,
  openModal: (modalType, data = {}) => {
    if (modalType === 'pwa-install') {
      set({ isPWAInstallOpen: true });
    } else {
      set({ activeModal: modalType, modalData: data });
    }
  },
  closeModal: () => set({ activeModal: null, modalData: null, isPWAInstallOpen: false }),

  isPWAInstallOpen: false,
  openPWAInstall: () => set({ isPWAInstallOpen: true }),
  closePWAInstall: () => set({ isPWAInstallOpen: false }),

  notifications: initialNotifications,
  markNotificationAsRead: async (id) => {
    try {
      const { apiClient } = await import("@/services/api/apiClient");
      await apiClient.patch(`/lms-api/notifications/read/${id}`);
      set(state => ({ notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n) }));
    } catch { const { toast } = await import("@/components/common/ToastMessage"); toast.error("Unable to mark notification as read."); }
  },
  markAllNotificationsAsRead: async () => {
    try {
      const { tokenClaims } = await import("@/services/api/session");
      const adminId = tokenClaims(session.token())?.adminId;
      if (!adminId) return;
      const { apiClient } = await import("@/services/api/apiClient");
      await apiClient.patch(`/lms-api/notifications/read-all/${adminId}`);
      set(state => ({ notifications: state.notifications.map(n => ({ ...n, isRead: true })) }));
    } catch { const { toast } = await import("@/components/common/ToastMessage"); toast.error("Unable to mark notifications as read."); }
  },

  activities: [],
  quickActions: quickActionsData,
  addActivity: (activity) =>
    set((state) => {
      const updated = [activity, ...state.activities];
      return { activities: updated };
    }),
  removeActivity: (id) =>
    set((state) => {
      const updated = state.activities.filter((act) => act.id !== id);
      return { activities: updated };
    }),
  clearActivities: () =>
    set(() => {
      return { activities: [] };
    }),
  resetActivities: () => { window.dispatchEvent(new Event("ams-refresh-activities")); },
}));

