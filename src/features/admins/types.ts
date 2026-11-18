export type AdminStatus = "Active" | "Away" | "Offline" | "Suspended";

export interface AdminRosterItem {
  id: string;
  employeeId: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatarUrl: string;
  department: string;
  country: string;
  city?: string;
  state?: string;
  password?: string;
  accessLevel: string;
  status: AdminStatus;
  lastActive: string;
  joinedDate: string;
  location: string;
  twoFactorEnabled: boolean;
  permissionsCount: number;
  bio?: string;
  assignedModules?: string[];
}

export interface AdminFilterState {
  searchQuery: string;
  department: string;
  role: string;
  status: string;
  accessLevel: string;
  sortBy: "name-asc" | "name-desc" | "role" | "recent" | "department";
}

export interface AdminRosterStats {
  totalAdmins: number;
  activeCount: number;
  awayCount: number;
  offlineCount: number;
  superAdminCount: number;
  twoFactorCompliantPercent: number;
  departmentCount: number;
}
