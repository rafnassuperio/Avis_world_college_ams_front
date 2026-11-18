import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  Users,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  UserPlus,
  Download,
  RotateCcw,
  Edit3,
  MapPin,
  Lock,
  ArrowUpDown,
  Filter,
  Verified,
  SortAsc,
  Trash,
} from "lucide-react";
import BreadcrumbBanner from "@/components/common/BreadcrumbBanner";
import { DataTable, ColumnDef, TableCard } from "@/components/ui/Table";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterSelect, FilterSelectOption } from "@/components/ui/FilterSelect";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { dashboardContainerVariants, dashboardSectionVariants } from "@/components/animations/transitions";
import { getAdminsRoster, saveAdminsRoster } from "./data/mockAdminsData";
import { AdminRosterItem, AdminStatus } from "./types";
import { AdminDetailsModal } from "./components/AdminDetailsModal";
import { AddAdminModal } from "./components/AddAdminModal";
import { EditAdminModal } from "./components/EditAdminModal";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { exportAdminsToCsv } from "./utils/exportAdminsCsv";
import { toast } from "@/components/common/ToastMessage";
import { cn } from "@/lib/utils";

export const TotalAdminsPage: React.FC = () => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const containerVariants = shouldReduceMotion ? { hidden: { opacity: 1 }, visible: { opacity: 1 } } : dashboardContainerVariants;
  const sectionVariants = shouldReduceMotion ? { hidden: { opacity: 1 }, visible: { opacity: 1 } } : dashboardSectionVariants;

  // Master admins list state
  const [adminsList, setAdminsList] = useState<AdminRosterItem[]>(() => getAdminsRoster());

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState<"name-asc" | "name-desc" | "role" | "recent" | "department">("recent");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Modals state
  const [selectedAdminForView, setSelectedAdminForView] = useState<AdminRosterItem | null>(null);
  const [selectedAdminForEdit, setSelectedAdminForEdit] = useState<AdminRosterItem | null>(null);
  const [selectedAdminForDelete, setSelectedAdminForDelete] = useState<AdminRosterItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Save changes to storage whenever adminsList changes
  const updateAdminsList = useCallback((updated: AdminRosterItem[]) => {
    setAdminsList(updated);
    saveAdminsRoster(updated);
  }, []);

  // Handle adding an administrator
  const handleAddAdmin = (newAdmin: AdminRosterItem) => {
    const updated = [newAdmin, ...adminsList];
    updateAdminsList(updated);
    toast.success("Administrator Added", {
      description: `${newAdmin.name} has been successfully added to the roster.`,
    });
  };

  // Handle editing an administrator
  const handleSaveAdmin = (updatedAdmin: AdminRosterItem) => {
    const updated = adminsList.map((adm) => (adm.id === updatedAdmin.id ? updatedAdmin : adm));
    updateAdminsList(updated);
    if (selectedAdminForView?.id === updatedAdmin.id) {
      setSelectedAdminForView(updatedAdmin);
    }
    toast.success("Profile Updated", {
      description: `Details for ${updatedAdmin.name} have been saved successfully.`,
    });
  };

  // Handle deleting an administrator
  const handleDeleteAdmin = () => {
    if (!selectedAdminForDelete) return;
    const adminToDelete = selectedAdminForDelete;
    const updated = adminsList.filter((adm) => adm.id !== adminToDelete.id);
    updateAdminsList(updated);

    if (selectedAdminForView?.id === adminToDelete.id) {
      setSelectedAdminForView(null);
    }
    if (selectedAdminForEdit?.id === adminToDelete.id) {
      setSelectedAdminForEdit(null);
    }

    if (paginatedAdmins.length === 1 && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }

    setSelectedAdminForDelete(null);
    toast.success("Administrator Removed", {
      description: `${adminToDelete.name} has been successfully removed from the roster.`,
    });
  };

  // Handle quick status change
  const handleStatusChange = (adminId: string, newStatus: AdminStatus) => {
    const targetAdmin = adminsList.find((a) => a.id === adminId);
    const updated = adminsList.map((adm) => {
      if (adm.id === adminId) {
        return {
          ...adm,
          status: newStatus,
          lastActive: newStatus === "Active" ? "Active now" : adm.lastActive,
        };
      }
      return adm;
    });
    updateAdminsList(updated);
    if (selectedAdminForView?.id === adminId) {
      setSelectedAdminForView((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    toast.info("Status Changed", {
      description: `${targetAdmin?.name || "Administrator"} status set to "${newStatus}".`,
    });
  };

  // Filter options derived dynamically from data
  const departmentOptions: FilterSelectOption[] = useMemo(() => {
    const unique = Array.from(new Set(adminsList.map((a) => a.department))).filter(Boolean);
    return [{ label: "All Departments", value: "all" }, ...unique.map((dept) => ({ label: dept, value: dept, icon: Building2 }))];
  }, [adminsList]);

  const roleOptions: FilterSelectOption[] = useMemo(() => {
    const unique = Array.from(new Set(adminsList.map((a) => a.role))).filter(Boolean);
    return [{ label: "All Roles", value: "all" }, ...unique.map((role) => ({ label: role, value: role, icon: ShieldCheck }))];
  }, [adminsList]);

  const statusOptions: FilterSelectOption[] = [
    { label: "All Statuses", value: "all" },
    { label: "Active", value: "Active", badgeDot: "bg-emerald-500" },
    { label: "Away", value: "Away", badgeDot: "bg-amber-500" },
    { label: "Offline", value: "Offline", badgeDot: "bg-slate-400" },
    { label: "Suspended", value: "Suspended", badgeDot: "bg-red-500" },
  ];

  const sortOptions: FilterSelectOption[] = [
    { label: "Recently Active", value: "recent", icon: ArrowUpDown },
    { label: "Name: A to Z", value: "name-asc", icon: ArrowUpDown },
    { label: "Name: Z to A", value: "name-desc", icon: ArrowUpDown },
    { label: "Department", value: "department", icon: Building2 },
    { label: "Role Hierarchy", value: "role", icon: ShieldCheck },
  ];

  // Active filter count for clear button
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedDepartment !== "all") count++;
    if (selectedRole !== "all") count++;
    if (selectedStatus !== "all") count++;
    return count;
  }, [searchQuery, selectedDepartment, selectedRole, selectedStatus]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedDepartment("all");
    setSelectedRole("all");
    setSelectedStatus("all");
    setSortBy("recent");
    setCurrentPage(1);
    toast.info("Filters Reset", {
      description: "Search query and active filter criteria have been reset.",
    });
  };

  // Filtered and sorted dataset
  const filteredAdmins = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    const filtered = adminsList.filter((adm) => {
      const matchesSearch =
        !q ||
        adm.name.toLowerCase().includes(q) ||
        adm.email.toLowerCase().includes(q) ||
        adm.country.toLowerCase().includes(q) ||
        adm.employeeId.toLowerCase().includes(q) ||
        adm.role.toLowerCase().includes(q) ||
        adm.department.toLowerCase().includes(q) ||
        adm.location.toLowerCase().includes(q) ||
        adm.phone.toLowerCase().includes(q);

      const matchesDept = selectedDepartment === "all" || adm.department === selectedDepartment;
      const matchesRole = selectedRole === "all" || adm.role === selectedRole;
      const matchesStatus = selectedStatus === "all" || adm.status === selectedStatus;

      return matchesSearch && matchesDept && matchesRole && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      if (sortBy === "department") return a.department.localeCompare(b.department);
      if (sortBy === "role") {
        if (a.role === "Super Admin") return -1;
        if (b.role === "Super Admin") return 1;
        return a.role.localeCompare(b.role);
      }
      // "recent" default
      if (a.status === "Active" && b.status !== "Active") return -1;
      if (b.status === "Active" && a.status !== "Active") return 1;
      return 0;
    });
  }, [adminsList, searchQuery, selectedDepartment, selectedRole, selectedStatus, sortBy]);

  // Paginated dataset
  const totalItems = filteredAdmins.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedAdmins = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAdmins.slice(start, start + pageSize);
  }, [filteredAdmins, currentPage, pageSize]);

  // KPI Statistics
  const stats = useMemo(() => {
    const total = adminsList.length;
    const active = adminsList.filter((a) => a.status === "Active").length;
    const superAdmins = adminsList.filter((a) => a.role.toLowerCase().includes("super admin")).length;
    const uniqueDepts = new Set(adminsList.map((a) => a.department)).size;
    const twoFactorCount = adminsList.filter((a) => a.twoFactorEnabled).length;
    const compliancePercent = total > 0 ? Math.round((twoFactorCount / total) * 100) : 100;

    return {
      total,
      active,
      superAdmins,
      uniqueDepts,
      compliancePercent,
    };
  }, [adminsList]);

  // Define Table Columns
  // No | Administrator | Role & Access Scope | Country | Contact Details | Status & Last Active | Actions
  const columns: ColumnDef<AdminRosterItem>[] = useMemo(
    () => [
      {
        key: "no",
        header: "No",
        width: 60,
        minWidth: 50,
        maxWidth: 80,
        resizable: false,
        headerClassName: "text-center",
        className: "text-center",
        cell: (_adm, index) => {
          const rowNumber = (currentPage - 1) * pageSize + index + 1;
          return (
            <span className="font-mono text-xs font-semibold text-text-muted">
              {String(rowNumber).padStart(2, "0")}
            </span>
          );
        },
      },
      {
        key: "adminProfile",
        header: "Administrator",
        width: 250,
        minWidth: 200,
        resizable: true,
        cell: (adm) => {
          const isSuper = adm.role.toLowerCase().includes("super admin");
          return (
            <div
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/profile?id=${encodeURIComponent(adm.id)}`, { state: { admin: adm } });
              }}
              title={`View ${adm.name}'s profile`}
              className="group/admin flex cursor-pointer items-center gap-3 transition-transform duration-150 hover:translate-x-0.5"
            >
              <div className="relative shrink-0">
                <img
                  src={adm.avatarUrl}
                  alt={adm.name}
                  className="shadow-2xs h-10 w-10 rounded-full border border-brand-border object-cover transition-all group-hover/admin:border-burgundy-primary group-hover/admin:ring-2 group-hover/admin:ring-burgundy-primary/20"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/avis-emblem.png";
                  }}
                />
                <span className="absolute bottom-0 right-0 flex h-3 w-3">
                  {adm.status === "Active" && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  )}
                  <span
                    className={cn(
                      "relative inline-flex h-3 w-3 rounded-full border-2 border-white",
                      adm.status === "Active" ? "bg-emerald-500" : adm.status === "Away" ? "bg-amber-500" : "bg-slate-400",
                    )}
                  />
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-xs font-bold text-text-primary transition-colors group-hover/admin:text-burgundy-primary group-hover/admin:underline">
                    {adm.name}
                  </span>
                  {isSuper && (
                    <span
                      title="Super Admin - Root Governance"
                      className="inline-flex shrink-0 items-center rounded-full bg-burgundy-primary/10 p-0.5 text-burgundy-primary"
                    >
                      <ShieldCheck className="h-3 w-3 stroke-[2.5]" />
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="font-mono text-[10px] font-semibold text-text-muted">{adm.employeeId}</span>
                  <span className="text-text-muted/60">•</span>
                  <span className="text-[10px] text-text-muted">{adm.joinedDate}</span>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        key: "roleTitle",
        header: "Role & Access Scope",
        width: 220,
        minWidth: 180,
        resizable: true,
        cell: (adm) => {
          const isSuper = adm.role.toLowerCase().includes("super admin");
          const isDean = adm.role.toLowerCase().includes("dean");
          const isFinance = adm.role.toLowerCase().includes("finance");
          const isRegistrar = adm.role.toLowerCase().includes("registrar");

          return (
            <div className="space-y-1">
              <span
                className={cn(
                  "inline-flex items-center rounded-lg px-2 py-0.5 text-[11px] font-bold",
                  isSuper
                    ? "border border-burgundy-primary/20 bg-burgundy-primary/10 text-burgundy-primary"
                    : isDean
                      ? "border border-purple-200 bg-purple-50 text-purple-700"
                      : isFinance
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                        : isRegistrar
                          ? "border border-blue-200 bg-blue-50 text-blue-700"
                          : "border border-brand-border bg-brand-bg text-text-secondary",
                )}
              >
                {adm.role}
              </span>
              <p
                className="truncate text-[10.5px] text-text-muted"
                title={adm.accessLevel}
              >
                {adm.accessLevel}
              </p>
            </div>
          );
        },
      },
      {
        key: "departmentOffice",
        header: "Country",
        width: 230,
        minWidth: 180,
        resizable: true,
        cell: (adm) => (
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-burgundy-primary" />
              <span
                className="truncate"
                title={adm.country}
              >
                {adm.country}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "contactInfo",
        header: "Contact Details",
        width: 210,
        minWidth: 170,
        resizable: true,
        cell: (adm) => (
          <div className="space-y-0.5 text-xs">
            <a
              href={`mailto:${adm.email}`}
              onClick={(e) => e.stopPropagation()}
              className="group/mail flex items-center gap-1.5 font-medium text-text-secondary transition-colors hover:text-burgundy-primary"
              title={`Send email to ${adm.email}`}
            >
              <Mail className="h-3 w-3 shrink-0 text-text-muted group-hover/mail:text-burgundy-primary" />
              <span className="truncate text-[11px]">{adm.email}</span>
            </a>
            <a
              href={`tel:${adm.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="group/phone flex items-center gap-1.5 font-medium text-text-muted transition-colors hover:text-text-primary"
              title={`Call ${adm.phone}`}
            >
              <Phone className="h-3 w-3 shrink-0 text-text-muted group-hover/phone:text-burgundy-primary" />
              <span className="text-[10.5px]">{adm.phone}</span>
            </a>
          </div>
        ),
      },
      {
        key: "statusActivity",
        header: "Status & Last Active",
        width: 160,
        minWidth: 140,
        resizable: true,
        cell: (adm) => {
          const isActive = adm.status === "Active";
          const isAway = adm.status === "Away";
          return (
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10.5px] font-bold",
                    isActive
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : isAway
                        ? "border-amber-200 bg-amber-50 text-amber-700"
                        : "border-slate-200 bg-slate-100 text-slate-600",
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", isActive ? "bg-emerald-500" : isAway ? "bg-amber-500" : "bg-slate-400")} />
                  <span>{adm.status}</span>
                </span>
              </div>
              <p className="pl-1 text-[10px] text-text-muted">{adm.lastActive}</p>
            </div>
          );
        },
      },
      {
        key: "actions",
        header: "Actions",
        width: 130,
        minWidth: 110,
        resizable: false,
        headerClassName: "text-center",
        cell: (adm) => (
          <div
            className="flex items-center justify-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedAdminForEdit(adm)}
              title="Edit administrator details"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-brand-border bg-white text-text-secondary transition-all hover:border-burgundy-primary hover:bg-burgundy-primary/5 hover:text-burgundy-primary"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setSelectedAdminForDelete(adm)}
              title="Remove administrator"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-brand-border bg-white text-text-secondary transition-all hover:border-red-400 hover:bg-red-400/5 hover:text-red-400"
            >
              <Trash className="h-3.5 w-3.5" />
            </button>
          </div>
        ),
      },
    ],
    [navigate, currentPage, pageSize],
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative mx-auto w-full space-y-4 pt-1"
    >
      {/* 1. Breadcrumb Banner with Action Buttons */}
      <motion.div variants={sectionVariants}>
        <BreadcrumbBanner
          title="Total Administrators"
          items={[{ name: "Total Admins" }]}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  exportAdminsToCsv(filteredAdmins);
                  toast.success("CSV Export Completed", {
                    description: `Exported ${filteredAdmins.length} administrator records.`,
                  });
                }}
                className="shadow-2xs rounded-xl border-brand-border bg-white px-3 py-1.5 text-xs font-semibold text-text-secondary hover:border-burgundy-primary hover:bg-white hover:text-burgundy-primary"
              >
                <Download className="mr-1.5 h-3.5 w-3.5 text-burgundy-primary" />
                <span>Export CSV</span>
              </Button>

              <Button
                type="button"
                variant="burgundy"
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
                className="shadow-xs rounded-xl px-3.5 py-1.5 text-xs font-semibold"
              >
                <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                <span>Add Administrator</span>
              </Button>
            </div>
          }
        />
      </motion.div>

      {/* 2. Top Summary KPI Stats Cards */}
      <motion.div
        variants={sectionVariants}
        className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
      >
        {/* Total Admins */}
        <div className="relative overflow-hidden rounded-2xl border border-brand-border bg-white p-3.5 shadow-card sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-bold text-text-secondary">Total Administrators</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-burgundy-primary/10 text-burgundy-primary">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-text-primary">{stats.total}</span>
            <span className="text-[11px] font-semibold text-text-muted">Avis Faculty & Staff</span>
          </div>
          <div className="mt-1 text-[11px] text-text-muted">Across {stats.uniqueDepts} Departments</div>
        </div>

        {/* Active Now */}
        <div className="relative overflow-hidden rounded-2xl border border-brand-border bg-white p-3.5 shadow-card sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-bold text-text-secondary">Active Now</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-emerald-700">{stats.active}</span>
            <span className="text-[11px] font-semibold text-emerald-600">Online In AMS</span>
          </div>
          <div className="mt-1 text-[11px] text-text-muted">Live real-time session tracking</div>
        </div>

        {/* Super Admins */}
        <div className="relative overflow-hidden rounded-2xl border border-brand-border bg-white p-3.5 shadow-card sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-bold text-text-secondary">Super Admins</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-purple-100 bg-purple-50 text-purple-700">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-text-primary">{stats.superAdmins}</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-burgundy-primary">Root Access</span>
          </div>
          <div className="mt-1 text-[11px] text-text-muted">Master governance tier</div>
        </div>

        {/* 2FA Enforcement */}
        <div className="relative overflow-hidden rounded-2xl border border-brand-border bg-white p-3.5 shadow-card sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-bold text-text-secondary">2FA Compliance</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-brand-red/20 bg-brand-light-red/80 text-brand-red">
              <Lock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-text-primary">{stats.compliancePercent}%</span>
            <span className="text-[11px] font-semibold text-emerald-600">Enforced</span>
          </div>
          <div className="mt-1 text-[11px] text-text-muted">Zero-trust IAM policy active</div>
        </div>
      </motion.div>

      {/* 3. Search and Filter Bar Toolbar */}
      <motion.div variants={sectionVariants}>
        <div className="rounded-[22px] border border-brand-border bg-white p-3.5 shadow-card sm:p-4">
          <div className="flex flex-col gap-3">
            {/* Top row: Search and Filters */}
            <div className="grid grid-cols-1 items-end gap-2.5 sm:grid-cols-2 lg:grid-cols-12">
              {/* Search input: 4 cols */}
              <div className="lg:col-span-4">
                <SearchInput
                  value={searchQuery}
                  onChange={(val) => {
                    setSearchQuery(val);
                    setCurrentPage(1);
                  }}
                  onClear={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  label="Search Administrators"
                  placeholder="Search by name, role, email, employee ID..."
                  className="w-full"
                />
              </div>

              {/* Department Filter: 3 cols */}
              <div className="lg:col-span-2">
                <FilterSelect
                  label="Faculty / Department"
                  icon={Building2}
                  value={selectedDepartment}
                  options={departmentOptions}
                  onChange={(val) => {
                    setSelectedDepartment(val);
                    setCurrentPage(1);
                  }}
                  defaultValue="all"
                  searchable
                  className="w-full"
                />
              </div>

              {/* Role Filter: 2 cols */}
              <div className="lg:col-span-2">
                <FilterSelect
                  label="Role Scope"
                  icon={ShieldCheck}
                  value={selectedRole}
                  options={roleOptions}
                  onChange={(val) => {
                    setSelectedRole(val);
                    setCurrentPage(1);
                  }}
                  defaultValue="all"
                  className="w-full"
                />
              </div>

              {/* Status Filter: 2 cols */}
              <div className="lg:col-span-2">
                <FilterSelect
                  label="Status"
                  value={selectedStatus}
                  icon={Verified}
                  options={statusOptions}
                  onChange={(val) => {
                    setSelectedStatus(val);
                    setCurrentPage(1);
                  }}
                  defaultValue="all"
                  className="w-full"
                />
              </div>

              {/* Sort By Filter: 1 col or reset */}
              <div className="flex items-center justify-end lg:col-span-2">
                {activeFiltersCount > 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResetFilters}
                    className="h-[34px] w-full rounded-xl border-brand-red/30 bg-brand-light-red/50 text-[11px] font-bold text-brand-red hover:bg-brand-light-red"
                    title="Reset all active filters"
                  >
                    <RotateCcw className="mr-1 h-3 w-3" />
                    <span>Reset</span>
                  </Button>
                ) : (
                  <FilterSelect
                    label="Sort"
                    value={sortBy}
                    options={sortOptions}
                    icon={SortAsc}
                    onChange={(val) => setSortBy(val as any)}
                    defaultValue="recent"
                    align="right"
                    buttonClassName="h-[34px]"
                    className="w-full"
                  />
                )}
              </div>
            </div>

            {/* Filter Summary & Result Count Indicator */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-brand-border/60 pt-1 text-xs">
              <div className="flex items-center gap-2 text-text-muted">
                <Filter className="h-3.5 w-3.5 text-burgundy-primary" />
                <span>
                  Showing <strong className="text-text-primary">{filteredAdmins.length}</strong> of{" "}
                  <strong className="text-text-primary">{adminsList.length}</strong> administrators
                </span>
                {activeFiltersCount > 0 && (
                  <span className="rounded-full bg-brand-light-red px-2 py-0.5 text-[10.5px] font-bold text-brand-red">
                    {activeFiltersCount} active {activeFiltersCount === 1 ? "filter" : "filters"}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-text-muted">Sort by:</span>
                <span className="text-[11px] font-semibold capitalize text-text-primary">{sortOptions.find((s) => s.value === sortBy)?.label}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 4. Table Card with DataTable */}
      <motion.div variants={sectionVariants}>
        <TableCard
          showResizeGuide={false}
          className="p-3 sm:p-5"
        >
          <DataTable<AdminRosterItem>
            columns={columns}
            data={paginatedAdmins}
            keyExtractor={(adm) => adm.id}
            density="normal"
            storageKey="ams_total_admins_table_widths"
            showResizeGuide={true}
            emptyMessage={activeFiltersCount > 0 ? "No administrators match your active filter criteria." : "No administrators found in roster."}
            onRowClick={(adm) => setSelectedAdminForView(adm)}
            rowClassName="cursor-pointer hover:bg-brand-bg/40 transition-colors"
          />

          {/* Pagination Controls */}
          {filteredAdmins.length > 0 && (
            <div className="mt-4 border-t border-brand-border/70 pt-3">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                pageSizeOptions={[5, 8, 10, 20]}
                onPageChange={setCurrentPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
                showPageSize
                showTotal
              />
            </div>
          )}
        </TableCard>
      </motion.div>

      {/* 5. Modals for View, Add, and Edit */}
      <AdminDetailsModal
        isOpen={Boolean(selectedAdminForView)}
        onClose={() => setSelectedAdminForView(null)}
        admin={selectedAdminForView}
        onEdit={(adm) => setSelectedAdminForEdit(adm)}
        onStatusChange={handleStatusChange}
      />
      {isAddModalOpen && (
        <AddAdminModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddAdmin={handleAddAdmin}
          nextEmployeeId={`AWC-ADM-${String(adminsList.length + 1).padStart(3, "0")}`}
        />
      )}

      <EditAdminModal
        isOpen={Boolean(selectedAdminForEdit)}
        onClose={() => setSelectedAdminForEdit(null)}
        admin={selectedAdminForEdit}
        onSaveAdmin={handleSaveAdmin}
      />

      {/* 6. Delete Admin Confirmation Modal */}
      {selectedAdminForDelete && (
        <DeleteModal
          isOpen={Boolean(selectedAdminForDelete)}
          onClose={() => setSelectedAdminForDelete(null)}
          onConfirm={handleDeleteAdmin}
          title="Delete Administrator"
          description={`Are you sure you want to permanently remove ${selectedAdminForDelete.name} from the administrative roster? This will revoke all their institutional access permissions.`}
          confirmText="Yes, Delete Admin"
          confirmVariant="danger"
          itemPreview={
            <div className="rounded-xl border border-brand-border bg-white p-3 text-left">
              <div className="flex items-center gap-3">
                <img
                  src={selectedAdminForDelete.avatarUrl}
                  alt={selectedAdminForDelete.name}
                  className="h-10 w-10 rounded-full border border-brand-border object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/avis-emblem.png";
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-xs font-bold text-text-primary">{selectedAdminForDelete.name}</span>
                    <span className="font-mono text-[10px] text-text-muted">({selectedAdminForDelete.employeeId})</span>
                  </div>
                  <div className="truncate text-[11px] text-text-secondary">
                    {selectedAdminForDelete.role} • {selectedAdminForDelete.department}
                  </div>
                </div>
              </div>
            </div>
          }
        />
      )}
    </motion.div>
  );
};

export default TotalAdminsPage;
