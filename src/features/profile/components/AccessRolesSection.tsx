import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Search, Maximize2, Minimize2, RotateCcw, Save, Info, CheckCheck, Ban } from "lucide-react";
import { AccessRoleModuleItem, PermissionAction } from "../types";
import { defaultAccessRoleModules } from "../data/accessModules";
import { AccessRolesModuleCard } from "./AccessRolesModuleCard";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/common/ToastMessage";
import { getProfile, permissionResources, permissionActions } from "@/services/profile";
import { apiClient } from "@/services/api/apiClient";
import { apiMessage } from "@/services/ams";
import { useAuthStore } from "@/store/useAuthStore";
import { useApiQuery } from "@/hooks/useApiQuery";
import { AsyncStateView } from "@/components/common/AsyncStateView";
import { cn } from "@/lib/utils";



export interface AccessRolesSectionProps {
  className?: string;
  adminId: string;
}

export const AccessRolesSection: React.FC<AccessRolesSectionProps> = ({ className, adminId }) => {
  const { data, loading, error, reload } = useApiQuery(() => getProfile(adminId), [adminId]);
  const isSuper = data?.admin.type === "super-admin";
  const canEdit = useAuthStore(state => state.user.role === "super-admin") && !isSuper;
  const [modules, setModules] = useState<AccessRoleModuleItem[]>([]);
  useEffect(() => {
    if (!data) return;
    setModules(defaultAccessRoleModules.map(module => {
      const resource = permissionResources[module.id];
      const actions = permissionActions[resource] || {};
      return { ...module, availableActions: Object.keys(actions) as PermissionAction[], readOnly: !canEdit,
        permissions: Object.fromEntries(["view", "add", "edit", "update", "delete"].map(action => [action, Boolean(actions[action] && (isSuper || data.admin.accessPermissions?.[resource]?.[actions[action]]))])) as unknown as AccessRoleModuleItem["permissions"] };
    }));
  }, [data, canEdit, isSuper]);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaved, setIsSaved] = useState(true);

  // Toggle single module accordion
  const handleToggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Expand all modules
  const handleExpandAll = () => {
    setExpandedIds(new Set(modules.map((m) => m.id)));
  };

  // Collapse all modules
  const handleCollapseAll = () => {
    setExpandedIds(new Set());
  };

  // Toggle specific permission (view, add, edit, update, delete)
  const handleTogglePermission = (moduleId: string, action: PermissionAction) => {
    if (!canEdit || !modules.find(m => m.id === moduleId)?.availableActions?.includes(action)) return;
    setModules((prev) =>
      prev.map((mod) => {
        if (mod.id === moduleId) {
          return {
            ...mod,
            permissions: {
              ...mod.permissions,
              [action]: !mod.permissions[action],
            },
          };
        }
        return mod;
      }),
    );
    setIsSaved(false);
  };

  // Toggle all permissions for a specific module
  const handleToggleAllForModule = (moduleId: string, enabled: boolean) => {
    if (!canEdit) return;
    setModules((prev) =>
      prev.map((mod) => {
        if (mod.id === moduleId) {
          return {
            ...mod,
            permissions: {
              view: enabled && Boolean(permissionActions[permissionResources[mod.id]]?.view),
              add: enabled && Boolean(permissionActions[permissionResources[mod.id]]?.add),
              edit: enabled && Boolean(permissionActions[permissionResources[mod.id]]?.edit),
              update: enabled && Boolean(permissionActions[permissionResources[mod.id]]?.update),
              delete: enabled && Boolean(permissionActions[permissionResources[mod.id]]?.delete),
            },
          };
        }
        return mod;
      }),
    );
    setIsSaved(false);
  };

  const handleGrantAll = () => {
    if (!canEdit) return;
    setModules(prev => prev.map(m => ({ ...m, permissions: Object.fromEntries(Object.keys(m.permissions).map(action => [action, m.availableActions?.includes(action as PermissionAction) || false])) as unknown as AccessRoleModuleItem["permissions"] })));
    setIsSaved(false);
  };
  const handleRevokeAll = () => {
    if (!canEdit) return;
    setModules(prev => prev.map(m => ({ ...m, permissions: { view: false, add: false, edit: false, update: false, delete: false } })));
    setIsSaved(false);
  };
  const handleSave = async () => {
    if (!canEdit || !data) return;
    const permissions = structuredClone(data.admin.accessPermissions || {});
    for (const module of modules) {
      const resource = permissionResources[module.id];
      permissions[resource] ||= {};
      for (const [action, field] of Object.entries(permissionActions[resource] || {})) permissions[resource][field] = module.permissions[action as PermissionAction];
    }
    try {
      await apiClient.put(`/api/admin/avis-profile/${adminId}/permissions`, { permissions });
      setIsSaved(true); await reload(); toast.success("Access roles saved.");
    } catch (error) { toast.error("Unable to save permissions", { description: apiMessage(error) }); }
  };
  const handleResetDefaults = () => { void reload(); setIsSaved(true); };

  // Filter modules based on search query
  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return modules;
    const q = searchQuery.toLowerCase();
    return modules.filter((m) => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q) || m.category.toLowerCase().includes(q));
  }, [modules, searchQuery]);

  // Separate into 2 columns matching the user's screenshot
  const { leftColumnModules, rightColumnModules } = useMemo(() => {
    if (searchQuery.trim()) {
      const half = Math.ceil(filteredModules.length / 2);
      return {
        leftColumnModules: filteredModules.slice(0, half),
        rightColumnModules: filteredModules.slice(half),
      };
    }

    // Exact 1-to-1 split matching screenshot
    return {
      leftColumnModules: filteredModules.slice(0, 9),
      rightColumnModules: filteredModules.slice(9, 18),
    };
  }, [filteredModules, searchQuery]);

  if (loading || error) return <AsyncStateView isLoading={loading} error={error} onRetry={() => void reload()}>{null}</AsyncStateView>;

  return (
    <div className={cn("space-y-5", className)}>
      {/* 1. Header Card with Avis Brand Banner */}
      <div className="shadow-xs rounded-2xl border border-brand-border/80 bg-white p-5 sm:rounded-[24px] sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-start gap-3.5">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-burgundy-primary to-brand-red text-white shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-text-primary sm:text-[17px]">Access Roles & Permissions Matrix</h2>
                {!isSaved && (
                  <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10.5px] font-bold text-amber-700">
                    Unsaved changes
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                Configure operational permissions (<span className="font-semibold text-text-primary">View, Add, Edit, Update, Delete</span>) with
                interactive toggle switches. Changes take effect across administrative workflows.
              </p>
            </div>
          </div>

          {/* Quick Primary Actions */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetDefaults}
              className="rounded-xl text-xs font-semibold text-text-secondary hover:bg-brand-bg"
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              <span>Reset Defaults</span>
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSave}
              className="shadow-xs rounded-xl text-xs font-semibold"
            >
              <Save className="mr-1.5 h-3.5 w-3.5" />
              <span>Save Permissions</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Search & Batch Expand/Collapse Bar */}
      <div className="shadow-2xs flex flex-col items-stretch justify-between gap-3 rounded-xl border border-brand-border/70 bg-white p-3 sm:flex-row sm:items-center">
        {/* Search input */}
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search modules (e.g. Student, Report, Payment, Fee)..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50/70 py-1.5 pl-8 pr-3 text-xs text-text-primary transition-colors placeholder:text-text-muted focus:border-brand-accent focus:bg-white focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-text-muted hover:text-text-primary"
            >
              ×
            </button>
          )}
        </div>

        {/* Batch Expand & Toggle Buttons */}
        <div className="flex items-center justify-end gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={expandedIds.size === modules.length ? handleCollapseAll : handleExpandAll}
            className="h-8 rounded-lg px-2.5 text-xs text-text-secondary hover:text-text-primary"
          >
            {expandedIds.size === modules.length ? (
              <>
                <Minimize2 className="mr-1 h-3.5 w-3.5" />
                <span>Collapse All</span>
              </>
            ) : (
              <>
                <Maximize2 className="mr-1 h-3.5 w-3.5" />
                <span>Expand All</span>
              </>
            )}
          </Button>

          <span className="mx-0.5 h-4 w-px bg-slate-200" />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleGrantAll}
            className="h-8 rounded-lg px-2.5 text-xs text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
          >
            <CheckCheck className="mr-1 h-3.5 w-3.5" />
            <span>Grant All</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRevokeAll}
            className="h-8 rounded-lg px-2.5 text-xs text-slate-600 hover:bg-red-50 hover:text-red-700"
          >
            <Ban className="mr-1 h-3.5 w-3.5" />
            <span>Revoke All</span>
          </Button>
        </div>
      </div>

      {/* 4. The 2-Column Collapsible Cards Grid (Exact Screenshot Layout) */}
      {filteredModules.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-text-primary">No Modules Found</h3>
          <p className="mt-1 text-xs text-text-secondary">No subsystems matching "{searchQuery}". Try a different keyword or reset search.</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSearchQuery("")}
            className="mt-4 rounded-xl text-xs"
          >
            Clear Search
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
          {/* Left Column (Items 1 - 9) */}
          <div className="space-y-3">
            {leftColumnModules.map((mod) => (
              <AccessRolesModuleCard
                key={mod.id}
                module={mod}
                isExpanded={expandedIds.has(mod.id)}
                onToggleExpand={() => handleToggleExpand(mod.id)}
                onTogglePermission={(action) => handleTogglePermission(mod.id, action)}
                onToggleAll={(enabled) => handleToggleAllForModule(mod.id, enabled)}
              />
            ))}
          </div>

          {/* Right Column (Items 10 - 18) */}
          <div className="space-y-3">
            {rightColumnModules.map((mod) => (
              <AccessRolesModuleCard
                key={mod.id}
                module={mod}
                isExpanded={expandedIds.has(mod.id)}
                onToggleExpand={() => handleToggleExpand(mod.id)}
                onTogglePermission={(action) => handleTogglePermission(mod.id, action)}
                onToggleAll={(enabled) => handleToggleAllForModule(mod.id, enabled)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 5. Bottom Sticky-Ready Save Floating Bar (When changes are unsaved) */}
      <AnimatePresence>
        {!isSaved && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="sticky bottom-4 z-20 flex items-center justify-between gap-4 rounded-2xl border border-brand-accent/40 bg-white/95 p-4 shadow-xl backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Info className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-text-primary">You have unsaved permission updates</p>
                <p className="text-[11px] text-text-muted">Click Save Changes to apply these permission rules to your Super Admin profile.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetDefaults}
                className="rounded-xl text-xs"
              >
                Discard
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSave}
                className="shadow-xs rounded-xl text-xs font-semibold"
              >
                <Save className="mr-1 h-3.5 w-3.5" />
                <span>Save Changes</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccessRolesSection;
