export interface AdminProfileTab {
  id: "overview" | "security" | "permissions" | "audit";
  label: string;
  iconName: string;
  badge?: string;
}

export interface AdminAuditLog {
  id: string;
  action: string;
  category: "auth" | "settings" | "settlement" | "student" | "system" | "finance";
  timestamp: string;
  ipAddress: string;
  location: string;
  status: "success" | "warning" | "info";
  detail: string;
}

export interface AdminPrivilegeItem {
  id: string;
  title: string;
  description: string;
  category: "Academic" | "Finance" | "Administration" | "System";
  level: "Full Access" | "Read / Write" | "Super Admin";
  iconName: string;
}

export type PermissionAction = "view" | "add" | "edit" | "delete" | "update";

export interface ModulePermissions {
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
  update: boolean;
}

export interface AccessRoleModuleItem {
  availableActions?: PermissionAction[];
  readOnly?: boolean;
  id: string;
  name: string;
  description: string;
  category: "Overview" | "Academics" | "Administration" | "Finance" | "Partners";
  iconName: string;
  permissions: ModulePermissions;
}
