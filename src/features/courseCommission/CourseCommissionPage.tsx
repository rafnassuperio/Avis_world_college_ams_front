import React, { useState, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Plus,
  Download,
  Edit3,
  Trash2,
  Layers,
  BookOpen,
  Building2,
  ShieldCheck,
  UserCheck,
  ArrowUpDown,
  TrendingUp,
  Search,
  Filter,
  RotateCcw,
} from "lucide-react";
import BreadcrumbBanner from "@/components/common/BreadcrumbBanner";
import { DataTable, ColumnDef, TableCard } from "@/components/ui/Table";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterSelect, FilterSelectOption } from "@/components/ui/FilterSelect";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { dashboardContainerVariants, dashboardSectionVariants } from "@/components/animations/transitions";
import { commissions } from "@/services/ams";
import { useApiCollection } from "@/hooks/useApiCollection";
import { AsyncStateView } from "@/components/common/AsyncStateView";
import { CourseCommissionConfig } from "./types";
import { AddCourseCommissionModal } from "./components/AddCourseCommissionModal";
import { EditCourseCommissionModal } from "./components/EditCourseCommissionModal";
import { exportCommissionToCsv } from "./utils/exportCommissionCsv";
import { toast } from "@/components/common/ToastMessage";

export const CourseCommissionPage: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const containerVariants = shouldReduceMotion ? { hidden: { opacity: 1 }, visible: { opacity: 1 } } : dashboardContainerVariants;
  const sectionVariants = shouldReduceMotion ? { hidden: { opacity: 1 }, visible: { opacity: 1 } } : dashboardSectionVariants;

  // Master State
  const { data: commissionList, saveList: updateCommissionList, loading, error, reload } = useApiCollection(commissions);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState<"name-asc" | "name-desc" | "code-asc" | "fee-high" | "rules-high">("name-asc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState<CourseCommissionConfig | null>(null);
  const [selectedForDelete, setSelectedForDelete] = useState<CourseCommissionConfig | null>(null);

  // Persistence handler


  // Add handler
  const handleAddConfig = async (newConfig: CourseCommissionConfig) => {
    const existingIndex = commissionList.findIndex((c) => c.code.toUpperCase() === newConfig.code.toUpperCase());

    let updated: CourseCommissionConfig[];
    if (existingIndex >= 0) {
      updated = commissionList.map((item, idx) =>
        idx === existingIndex
          ? {
              ...item,
              ...newConfig,
              id: item.id,
              lastUpdated: new Date().toISOString().split("T")[0],
            }
          : item,
      );
    } else {
      updated = [newConfig, ...commissionList];
    }

    if (!await updateCommissionList(updated)) return false;
    toast.success("Course Commission Config Saved", {
      description: `Commission rules for "${newConfig.courseName}" (${newConfig.code}) have been configured.`,
    });
  };

  // Edit handler
  const handleSaveConfig = async (updatedConfig: CourseCommissionConfig) => {
    const updated = commissionList.map((item) => (item.id === updatedConfig.id ? updatedConfig : item));
    if (!await updateCommissionList(updated)) return false;
    toast.success("Configuration Updated", {
      description: `Commission rates for ${updatedConfig.code} were successfully updated.`,
    });
  };

  // Delete handler
  const handleDeleteConfig = async () => {
    if (!selectedForDelete) return;
    const toDelete = selectedForDelete;
    const updated = commissionList.filter((item) => item.id !== toDelete.id);
    if (!await updateCommissionList(updated)) return false;

    if (selectedForEdit?.id === toDelete.id) {
      setSelectedForEdit(null);
    }

    if (paginatedItems.length === 1 && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }

    setSelectedForDelete(null);
    toast.success("Configuration Removed", {
      description: `Commission settings for ${toDelete.courseName} (${toDelete.code}) were deleted.`,
    });
  };

  // Export to CSV
  const handleExportCsv = () => {
    exportCommissionToCsv(filteredItems);
    toast.success("Export Complete", {
      description: `Exported ${filteredItems.length} commission configuration(s) to CSV.`,
    });
  };

  // Dropdown filter options
  const departmentOptions: FilterSelectOption[] = useMemo(() => {
    const uniqueDepts = Array.from(new Set(commissionList.map((c) => c.department).filter((d): d is string => Boolean(d))));
    return [{ label: "All Departments", value: "all" }, ...uniqueDepts.map((d) => ({ label: d, value: d, icon: Building2 }))];
  }, [commissionList]);

  const commissionTypeOptions: FilterSelectOption[] = [
    { label: "All Calc Types", value: "all" },
    { label: "Percent (%)", value: "Percent", badgeDot: "bg-brand-red" },
    { label: "Fixed ($)", value: "Fixed", badgeDot: "bg-burgundy-primary" },
  ];

  const statusOptions: FilterSelectOption[] = [
    { label: "All Statuses", value: "all" },
    { label: "Active", value: "Active", badgeDot: "bg-emerald-500" },
    { label: "Under Review", value: "Under Review", badgeDot: "bg-amber-500" },
    { label: "Inactive", value: "Inactive", badgeDot: "bg-red-500" },
  ];

  const sortOptions: FilterSelectOption[] = [
    { label: "Course Name (A-Z)", value: "name-asc", icon: ArrowUpDown },
    { label: "Course Name (Z-A)", value: "name-desc", icon: ArrowUpDown },
    { label: "Course Code (A-Z)", value: "code-asc", icon: ArrowUpDown },
    { label: "Highest Course Fee", value: "fee-high", icon: TrendingUp },
    { label: "Most Commission Rules", value: "rules-high", icon: Layers },
  ];

  // Filtering & Sorting
  const filteredItems = useMemo(() => {
    let result = [...commissionList];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.courseName.toLowerCase().includes(q) ||
          item.code.toLowerCase().includes(q) ||
          (item.department && item.department.toLowerCase().includes(q)) ||
          item.commissionTypes.some((t) => t.typeName.toLowerCase().includes(q)),
      );
    }

    // Type filter
    if (selectedType !== "all") {
      result = result.filter((item) =>
        item.commissionTypes.some((t) => t.agentShare.calcType.includes(selectedType) || t.repShare.calcType.includes(selectedType)),
      );
    }

    // Department filter
    if (selectedDepartment !== "all") {
      result = result.filter((item) => item.department === selectedDepartment);
    }

    // Status filter
    if (selectedStatus !== "all") {
      result = result.filter((item) => item.status === selectedStatus);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.courseName.localeCompare(b.courseName);
        case "name-desc":
          return b.courseName.localeCompare(a.courseName);
        case "code-asc":
          return a.code.localeCompare(b.code);
        case "fee-high":
          return (b.courseFee || 0) - (a.courseFee || 0);
        case "rules-high":
          return b.commissionTypes.length - a.commissionTypes.length;
        default:
          return 0;
      }
    });

    return result;
  }, [commissionList, searchQuery, selectedType, selectedDepartment, selectedStatus, sortBy]);

  // Pagination calculation
  const totalItems = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  // Overall Metrics
  const metrics = useMemo(() => {
    const totalCourses = commissionList.length;
    const totalRules = commissionList.reduce((acc, curr) => acc + curr.commissionTypes.length, 0);

    const agentPercentages = commissionList
      .flatMap((c) => c.commissionTypes)
      .filter((t) => t.agentShare.calcType === "Percent (%)")
      .map((t) => t.agentShare.value);
    const avgAgentRate = agentPercentages.length > 0 ? (agentPercentages.reduce((a, b) => a + b, 0) / agentPercentages.length).toFixed(1) : "15.0";

    const repPercentages = commissionList
      .flatMap((c) => c.commissionTypes)
      .filter((t) => t.repShare.calcType === "Percent (%)")
      .map((t) => t.repShare.value);
    const avgRepRate = repPercentages.length > 0 ? (repPercentages.reduce((a, b) => a + b, 0) / repPercentages.length).toFixed(1) : "3.5";

    return { totalCourses, totalRules, avgAgentRate, avgRepRate };
  }, [commissionList]);

  // Table Columns Definition matching the user's specification:
  // No | Course Name | Code | Commission Types | Actions (edit & delete)
  const columns: ColumnDef<CourseCommissionConfig>[] = useMemo(
    () => [
      {
        key: "no",
        header: "No",
        width: 60,
        minWidth: 50,
        resizable: false,
        headerClassName: "text-center",
        cell: (_item, index) => {
          const rowNumber = (currentPage - 1) * pageSize + index + 1;
          return (
            <div className="flex items-center justify-center">
              <span className="font-mono text-xs font-semibold text-text-muted">{String(rowNumber).padStart(2, "0")}</span>
            </div>
          );
        },
      },
      {
        key: "courseName",
        header: "Course Name",
        width: 320,
        minWidth: 260,
        resizable: true,
        cell: (item) => (
          <div className="space-y-1.5 py-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-text-primary transition-colors hover:text-burgundy-primary">{item.courseName}</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-text-muted">
              <span className="rounded-md border border-brand-border/60 bg-brand-bg px-1.5 py-0.5 font-medium text-text-secondary">
                {item.department}
              </span>
              <span>•</span>
              <span className="font-semibold text-text-secondary">{item.level}</span>
              <span>•</span>
              <span className="font-semibold text-burgundy-primary">
                ${(item.courseFee || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })} {item.currency || "SGD"}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "code",
        header: "Code",
        width: 140,
        minWidth: 110,
        resizable: true,
        cell: (item) => (
          <div className="flex items-center">
            <span className="shadow-2xs inline-flex items-center rounded-lg border border-burgundy-primary/20 bg-burgundy-primary/5 px-2.5 py-1 font-mono text-xs font-bold text-burgundy-primary">
              {item.code}
            </span>
          </div>
        ),
      },
      {
        key: "commissionTypes",
        header: "Commission Types",
        width: 480,
        minWidth: 380,
        resizable: true,
        cell: (item) => {
          return (
            <div className="space-y-2 py-1">
              <div className="flex flex-wrap items-center gap-2">
                {item.commissionTypes.map((type) => {
                  const agentUnit = type.agentShare.calcType === "Fixed ($)" ? "$" : "%";
                  const repUnit = type.repShare.calcType === "Fixed ($)" ? "$" : "%";

                  return (
                    <div
                      key={type.id}
                      className="shadow-2xs inline-flex items-center gap-2 rounded-xl border border-gray-200/80 bg-white px-2.5 py-1.5 text-xs"
                    >
                      {/* Type Name (e.g. Standard) */}
                      <span className="font-bold text-text-primary">{type.typeName || "Standard"}</span>

                      {/* Divider */}
                      <span className="text-gray-300">|</span>

                      {/* Agent Share Tag (Brand Red Theme) */}
                      <span className="inline-flex items-center gap-1 rounded-md border border-brand-red/25 bg-brand-light-red/80 px-1.5 py-0.5 text-[11px] font-bold text-brand-red">
                        <span className="text-[10px] font-bold uppercase text-brand-red/75">Agent:</span>
                        <span>
                          {agentUnit === "$" ? "$" : ""}
                          {type.agentShare.value}
                          {agentUnit === "%" ? "%" : ""}
                        </span>
                      </span>

                      {/* Rep Share Tag (Burgundy Primary Theme) */}
                      <span className="inline-flex items-center gap-1 rounded-md border border-burgundy-primary/25 bg-burgundy-primary/10 px-1.5 py-0.5 text-[11px] font-bold text-burgundy-primary">
                        <span className="text-[10px] font-bold uppercase text-burgundy-primary/75">Rep:</span>
                        <span>
                          {repUnit === "$" ? "$" : ""}
                          {type.repShare.value}
                          {repUnit === "%" ? "%" : ""}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
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
        cell: (item) => (
          <div
            className="flex items-center justify-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedForEdit(item)}
              title={`Edit commission config for ${item.code}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-border bg-white text-text-secondary transition-all hover:border-burgundy-primary hover:bg-burgundy-primary/5 hover:text-burgundy-primary"
            >
              <Edit3 className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setSelectedForDelete(item)}
              title={`Delete commission config for ${item.code}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-border bg-white text-text-secondary transition-all hover:border-red-400 hover:bg-red-50 hover:text-brand-red"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [currentPage, pageSize],
  );

  if (loading || error) return <AsyncStateView isLoading={loading} error={error} onRetry={() => void reload()}>{null}</AsyncStateView>;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative mx-auto w-full space-y-4 pt-1"
    >
      {/* 1. Breadcrumb Banner with Header Action Buttons */}
      <motion.div variants={sectionVariants}>
        <BreadcrumbBanner
          title="Course Commission Config"
          items={[{ name: "Agent & Representative" }, { name: "Course Commission Config" }]}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="burgundy"
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
                className="gap-1.5"
              >
                <Plus className="h-4 w-4 stroke-[2.4]" />
                <span>Add Config</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCsv}
                className="gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export CSV</span>
              </Button>
            </div>
          }
        />
      </motion.div>

      {/* 2. Top Summary KPI Cards */}
      <motion.div
        variants={sectionVariants}
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {/* KPI 1 */}
        <div className="shadow-xs rounded-2xl border border-brand-border/80 bg-white p-3.5 transition-shadow hover:shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Configured Courses</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-burgundy-primary/10 text-burgundy-primary">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-xl font-extrabold text-text-primary">
            {metrics.totalCourses}
            <span className="ml-1 text-xs font-semibold text-text-muted">Programs</span>
          </p>
        </div>

        {/* KPI 2 */}
        <div className="shadow-xs rounded-2xl border border-brand-border/80 bg-white p-3.5 transition-shadow hover:shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Active Rules</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light-red/80 text-brand-red">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-xl font-extrabold text-text-primary">
            {metrics.totalRules}
            <span className="ml-1 text-xs font-semibold text-text-muted">Rules</span>
          </p>
        </div>

        {/* KPI 3 */}
        <div className="shadow-xs rounded-2xl border border-brand-border/80 bg-white p-3.5 transition-shadow hover:shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Avg. Agent Rate</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light-red/80 text-brand-red">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-xl font-extrabold text-text-primary">
            {metrics.avgAgentRate}%<span className="ml-1 text-xs font-semibold text-brand-red">Under Agent</span>
          </p>
        </div>

        {/* KPI 4 */}
        <div className="shadow-xs rounded-2xl border border-brand-border/80 bg-white p-3.5 transition-shadow hover:shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Avg. Rep Rate</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-burgundy-primary/10 text-burgundy-primary">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-xl font-extrabold text-text-primary">
            {metrics.avgRepRate}%<span className="ml-1 text-xs font-semibold text-burgundy-primary">Under Rep</span>
          </p>
        </div>
      </motion.div>

      {/* 3. Search and Filtering Controls */}
      <motion.div variants={sectionVariants}>
        <div className="shadow-xs flex flex-col gap-3 rounded-2xl border border-brand-border/80 bg-white p-3.5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-1 flex-col flex-wrap gap-2.5 sm:flex-row sm:items-end">
            {/* Search Input */}
            <div className="w-full sm:w-72">
              <SearchInput
                label="Search"
                icon={Search}
                value={searchQuery}
                onChange={(val) => {
                  setSearchQuery(val);
                  setCurrentPage(1);
                }}
                onClear={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                placeholder="Search course name, code, rule..."
                showClearButton
                className="w-full"
                inputClassName="h-[36px]"
              />
            </div>

            {/* Filter by Commission Type */}
            <div className="w-full sm:w-44">
              <FilterSelect
                label="Commission Type"
                icon={Layers}
                value={selectedType}
                options={commissionTypeOptions}
                onChange={(val) => {
                  setSelectedType(val);
                  setCurrentPage(1);
                }}
                defaultValue="all"
                placeholder="Commission Type"
                className="w-full"
                buttonClassName="h-[36px]"
              />
            </div>

            {/* Filter by Department */}
            <div className="w-full sm:w-52">
              <FilterSelect
                label="Department"
                icon={Building2}
                value={selectedDepartment}
                options={departmentOptions}
                onChange={(val) => {
                  setSelectedDepartment(val);
                  setCurrentPage(1);
                }}
                defaultValue="all"
                placeholder="Department"
                className="w-full"
                buttonClassName="h-[36px]"
              />
            </div>

            {/* Filter by Status */}
            <div className="w-full sm:w-36">
              <FilterSelect
                label="Status"
                icon={Filter}
                value={selectedStatus}
                options={statusOptions}
                onChange={(val) => {
                  setSelectedStatus(val);
                  setCurrentPage(1);
                }}
                defaultValue="all"
                placeholder="Status"
                className="w-full"
                buttonClassName="h-[36px]"
              />
            </div>

            {/* Sort By Dropdown */}
            <div className="flex items-end gap-2">
              <div className="w-full sm:w-48">
                <FilterSelect
                  label="Sort By"
                  icon={ArrowUpDown}
                  value={sortBy}
                  options={sortOptions}
                  onChange={(val) => setSortBy(val as any)}
                  defaultValue="name-asc"
                  placeholder="Sort By"
                  className="w-full"
                  buttonClassName="h-[36px]"
                />
              </div>

              {(searchQuery || selectedType !== "all" || selectedDepartment !== "all" || selectedStatus !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedType("all");
                    setSelectedDepartment("all");
                    setSelectedStatus("all");
                    setCurrentPage(1);
                  }}
                  className="flex h-[36px] shrink-0 items-center gap-1.5 px-2.5 text-xs text-text-muted hover:text-brand-red"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Clear</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 4. Main Commission Table */}
      <motion.div variants={sectionVariants}>
        <TableCard
          showResizeGuide={false}
          className="p-3 sm:p-5"
        >
          <DataTable
            columns={columns}
            showResizeGuide={true}
            data={paginatedItems}
            keyExtractor={(item) => item.id}
            density="normal"
            storageKey="ams_course_commission_table_widths"
            footer={
              totalPages > 1 ? (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(p) => setCurrentPage(p)}
                  totalItems={totalItems}
                  pageSize={pageSize}
                  onPageSizeChange={(newSize) => {
                    setPageSize(newSize);
                    setCurrentPage(1);
                  }}
                  pageSizeOptions={[5, 8, 12, 20]}
                  showPageSize
                  showTotal
                />
              ) : undefined
            }
            emptyMessage={
              searchQuery || selectedType !== "all" || selectedDepartment !== "all"
                ? "No course commission configurations match your filters."
                : "No course commission rules configured yet. Click 'Add Config' to create one."
            }
          />
        </TableCard>
      </motion.div>

      {/* Modals */}
      {/* 1. Add Modal */}
      {isAddModalOpen && (
        <AddCourseCommissionModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddConfig}
        />
      )}

      {/* 2. Edit Modal */}
      <EditCourseCommissionModal
        isOpen={Boolean(selectedForEdit)}
        onClose={() => setSelectedForEdit(null)}
        config={selectedForEdit}
        onSave={handleSaveConfig}
      />

      {/* 3. Delete Confirmation Modal */}
      <DeleteModal
        isOpen={Boolean(selectedForDelete)}
        onClose={() => setSelectedForDelete(null)}
        onConfirm={handleDeleteConfig}
        title="Delete Commission Config"
        description="Are you sure you want to remove the commission configuration for this course? Active settlements will use general fallback defaults."
        confirmText="Delete Config"
        itemPreview={
          selectedForDelete && (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-burgundy-primary/10 text-burgundy-primary">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="truncate text-xs font-bold text-text-primary">{selectedForDelete.courseName}</h4>
                <div className="flex items-center gap-2 pt-0.5 font-mono text-[11px] text-text-muted">
                  <span className="font-bold text-burgundy-primary">{selectedForDelete.code}</span>
                  <span>•</span>
                  <span>{selectedForDelete.commissionTypes.length} Commission Rules</span>
                </div>
              </div>
            </div>
          )
        }
      />
    </motion.div>
  );
};

export default CourseCommissionPage;
