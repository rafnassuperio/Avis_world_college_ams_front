import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Eye,
  PlusCircle,
  Edit3,
  RefreshCw,
  Trash2,
  CheckCircle2,
  LayoutDashboard,
  BarChart3,
  GraduationCap,
  FileCheck,
  FileSpreadsheet,
  Building2,
  UserCheck,
  FolderOpen,
  BookOpen,
  Receipt,
  UploadCloud,
  CreditCard,
  Tags,
  School,
  Users,
  Percent,
  CalendarDays,
  ShieldAlert,
} from "lucide-react";
import { AccessRoleModuleItem, PermissionAction } from "../types";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { cn } from "@/lib/utils";

export interface AccessRolesModuleCardProps {
  module: AccessRoleModuleItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onTogglePermission: (action: PermissionAction) => void;
  onToggleAll: (enabled: boolean) => void;
}

export const AccessRolesModuleCard: React.FC<AccessRolesModuleCardProps> = ({
  module,
  isExpanded,
  onToggleExpand,
  onTogglePermission,
  onToggleAll,
}) => {
  const permissionsList: {
    key: PermissionAction;
    label: string;
    description: string;
    icon: React.ElementType;
    activeColor?: "burgundy" | "emerald" | "brand";
  }[] = [
    {
      key: "view",
      label: "View",
      description: "Inspect records, listings, and summary data",
      icon: Eye,
      activeColor: "burgundy",
    },
    {
      key: "add",
      label: "Add",
      description: "Create new records, entries, and registrations",
      icon: PlusCircle,
      activeColor: "burgundy",
    },
    {
      key: "edit",
      label: "Edit",
      description: "Modify existing field details and configurations",
      icon: Edit3,
      activeColor: "burgundy",
    },
    {
      key: "update",
      label: "Update",
      description: "Update operational status, approvals & workflow",
      icon: RefreshCw,
      activeColor: "burgundy",
    },
    {
      key: "delete",
      label: "Delete",
      description: "Remove, purge, or archive records permanently",
      icon: Trash2,
      activeColor: "brand",
    },
  ];

  const getModuleIcon = (iconName: string) => {
    switch (iconName) {
      case "LayoutDashboard":
        return LayoutDashboard;
      case "BarChart3":
        return BarChart3;
      case "GraduationCap":
        return GraduationCap;
      case "FileCheck":
        return FileCheck;
      case "FileSpreadsheet":
        return FileSpreadsheet;
      case "Building2":
        return Building2;
      case "UserCheck":
        return UserCheck;
      case "FolderOpen":
        return FolderOpen;
      case "BookOpen":
        return BookOpen;
      case "Receipt":
        return Receipt;
      case "UploadCloud":
        return UploadCloud;
      case "CreditCard":
        return CreditCard;
      case "Tags":
        return Tags;
      case "School":
        return School;
      case "Users":
        return Users;
      case "Percent":
        return Percent;
      case "CalendarDays":
        return CalendarDays;
      default:
        return LayoutDashboard;
    }
  };

  const IconComponent = getModuleIcon(module.iconName);

  const activeCount = Object.values(module.permissions).filter(Boolean).length;
  const isAllActive = activeCount === (module.availableActions?.length || 5);
  const isNoneActive = activeCount === 0;

  return (
    <div
      className={cn(
        "shadow-2xs group rounded-xl border bg-white transition-all duration-200",
        isExpanded ? "border-brand-accent/40 shadow-sm ring-1 ring-brand-accent/15" : "hover:shadow-xs border-slate-200/90 hover:border-slate-300",
      )}
    >
      {/* 1. Collapsed Header Bar (Matches Screenshot 1-to-1) */}
      <button
        type="button"
        onClick={onToggleExpand}
        aria-expanded={isExpanded}
        className="flex w-full select-none items-center justify-between rounded-xl px-4 py-3.5 text-left transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/40 sm:px-5 sm:py-4"
      >
        {/* Module Title with subtle icon */}
        <div className="flex min-w-0 items-center gap-3 pr-2">
          <div
            className={cn(
              "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border transition-colors",
              isExpanded
                ? "border-brand-accent/30 bg-brand-light-red text-brand-red"
                : "border-slate-200/80 bg-slate-50 text-slate-600 group-hover:border-brand-accent/20 group-hover:bg-brand-light-red/50 group-hover:text-brand-red",
            )}
          >
            <IconComponent className="h-4 w-4" />
          </div>

          <span
            className={cn(
              "truncate text-xs font-bold uppercase tracking-wider transition-colors sm:text-[13px]",
              isExpanded ? "text-burgundy-primary" : "text-slate-800 group-hover:text-burgundy-primary",
            )}
          >
            {module.name}
          </span>
        </div>

        {/* Right side: Active permissions status pill & Chevron circle */}
        <div className="flex flex-shrink-0 items-center gap-2.5">
          <span
            className={cn(
              "hidden items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold transition-colors sm:inline-flex",
              isAllActive
                ? "border-emerald-200/80 bg-emerald-50 text-emerald-700"
                : isNoneActive
                  ? "border-slate-200 bg-slate-100 text-slate-500"
                  : "border-amber-200/80 bg-amber-50 text-amber-700",
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", isAllActive ? "bg-emerald-500" : isNoneActive ? "bg-slate-400" : "bg-amber-500")} />
            <span>{activeCount}/5 Active</span>
          </span>

          {/* Screenshot-identical circular chevron button */}
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-200",
              isExpanded
                ? "shadow-2xs rotate-180 border-brand-accent/40 bg-brand-light-red/80 text-brand-red"
                : "border-slate-300/80 bg-white text-slate-500 group-hover:border-slate-400 group-hover:text-slate-700",
            )}
          >
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </button>

      {/* 2. Collapsible Expanded Drawer (View, Add, Edit, Update, Delete with Toggle Buttons) */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="module-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
              mass: 0.8,
            }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 bg-gradient-to-b from-slate-50/70 to-white px-4 pb-4 pt-3.5 sm:px-5 sm:pb-5 sm:pt-4">
              {/* Module Description & Batch Grant All Toggle */}
              <div className="mb-3 flex flex-col justify-between gap-2.5 border-b border-slate-200/70 pb-3 sm:flex-row sm:items-center">
                <p className="max-w-xl text-[11.5px] leading-relaxed text-text-secondary">{module.description}</p>

                <div className="flex flex-shrink-0 items-center gap-2 self-end sm:self-auto">
                  <span className="text-[11px] font-semibold text-text-muted">{isAllActive ? "Grant All" : "Quick Toggle"}</span>
                  <ToggleSwitch
                    size="sm"
                    checked={isAllActive}
                    disabled={module.readOnly}
                    onChange={(checked) => onToggleAll(checked)}
                    showIcons={true}
                    ariaLabel={`Toggle all permissions for ${module.name}`}
                  />
                </div>
              </div>

              {/* 5 Granular Permission Rows with Toggle Buttons */}
              <div className="space-y-2">
                {permissionsList.map((perm) => {
                  const PermIcon = perm.icon;
                  const isChecked = module.permissions[perm.key];

                  return (
                    <div
                      key={perm.key}
                      onClick={() => onTogglePermission(perm.key)}
                      className={cn(
                        "group/row flex cursor-pointer select-none items-center justify-between rounded-lg border p-2.5 transition-all duration-150 sm:px-3 sm:py-2.5",
                        isChecked
                          ? "shadow-2xs border-brand-accent/25 bg-white hover:border-brand-accent/40"
                          : "border-slate-200/70 bg-slate-50/60 opacity-80 hover:bg-slate-100/60",
                      )}
                    >
                      {/* Left: Icon, Action Name, Description */}
                      <div className="flex min-w-0 items-center gap-2.5 pr-2">
                        <div
                          className={cn(
                            "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border transition-colors",
                            isChecked ? "border-brand-accent/30 bg-brand-light-red text-brand-red" : "border-slate-200 bg-slate-100 text-slate-400",
                          )}
                        >
                          <PermIcon className="h-3.5 w-3.5" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={cn("text-xs font-bold tracking-wide transition-colors", isChecked ? "text-text-primary" : "text-slate-500")}
                            >
                              {perm.label}
                            </span>
                            <span
                              className={cn(
                                "py-0.2 rounded px-1.5 text-[9.5px] font-semibold uppercase",
                                isChecked
                                  ? "border border-emerald-200/60 bg-emerald-50 text-emerald-700"
                                  : "border border-slate-200 bg-slate-100 text-slate-400",
                              )}
                            >
                              {isChecked ? "Allowed" : "Restricted"}
                            </span>
                          </div>
                          <p className="truncate text-[10.5px] text-text-muted">{perm.description}</p>
                        </div>
                      </div>

                      {/* Right: Toggle Button */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex-shrink-0 pl-2"
                      >
                        <ToggleSwitch
                          size="sm"
                          checked={isChecked}
                          disabled={module.readOnly || !module.availableActions?.includes(perm.key)}
                          onChange={() => onTogglePermission(perm.key)}
                          activeColor={perm.activeColor}
                          showIcons={true}
                          ariaLabel={`${perm.label} permission for ${module.name}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status footer for this card */}
              <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-2.5 text-[11px] text-text-muted">
                <span className="flex items-center gap-1">
                  {isAllActive ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  ) : isNoneActive ? (
                    <ShieldAlert className="h-3.5 w-3.5 text-slate-400" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />
                  )}
                  <span>
                    Status:{" "}
                    <strong className="text-text-primary">
                      {isAllActive ? "Full Access (5/5)" : isNoneActive ? "No Privileges" : `${activeCount} of 5 Granted`}
                    </strong>
                  </span>
                </span>

                <button
                  type="button"
                  onClick={onToggleExpand}
                  className="text-[11px] font-semibold text-brand-red hover:underline"
                >
                  Collapse
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccessRolesModuleCard;
