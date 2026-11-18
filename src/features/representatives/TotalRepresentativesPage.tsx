import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  Users,
  UserCheck,
  Building2,
  Mail,
  Phone,
  UserPlus,
  Download,
  RotateCcw,
  Edit3,
  MapPin,
  ArrowUpDown,
  Filter,
  SortAsc,
  Trash,
  Globe,
} from "lucide-react";
import BreadcrumbBanner from "@/components/common/BreadcrumbBanner";
import { DataTable, ColumnDef, TableCard } from "@/components/ui/Table";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterSelect, FilterSelectOption } from "@/components/ui/FilterSelect";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { dashboardContainerVariants, dashboardSectionVariants } from "@/components/animations/transitions";
import { getRepresentativesList, saveRepresentativesList } from "./data/mockRepresentativesData";
import { RepresentativeItem } from "./types";
import { ROUTES } from "@/app/routes";
import { AddRepresentativeModal } from "./components/AddRepresentativeModal";
import { EditRepresentativeModal } from "./components/EditRepresentativeModal";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { exportRepresentativesToCsv } from "./utils/exportRepresentativesCsv";
import { toast } from "@/components/common/ToastMessage";
import { cn } from "@/lib/utils";

export const TotalRepresentativesPage: React.FC = () => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const containerVariants = shouldReduceMotion ? { hidden: { opacity: 1 }, visible: { opacity: 1 } } : dashboardContainerVariants;
  const sectionVariants = shouldReduceMotion ? { hidden: { opacity: 1 }, visible: { opacity: 1 } } : dashboardSectionVariants;

  // Master representatives state
  const [representativesList, setRepresentativesList] = useState<RepresentativeItem[]>(() => getRepresentativesList());

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState<"name-asc" | "name-desc" | "agents-high" | "agents-low" | "recent">("recent");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Modals state
  const [selectedRepForEdit, setSelectedRepForEdit] = useState<RepresentativeItem | null>(null);
  const [selectedRepForDelete, setSelectedRepForDelete] = useState<RepresentativeItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Persistence handler
  const updateRepresentativesList = useCallback((updated: RepresentativeItem[]) => {
    setRepresentativesList(updated);
    saveRepresentativesList(updated);
  }, []);

  // Add Representative
  const handleAddRepresentative = (newRep: RepresentativeItem) => {
    const updated = [newRep, ...representativesList];
    updateRepresentativesList(updated);
    toast.success("Representative Added", {
      description: `${newRep.name} has been successfully added to the roster.`,
    });
  };

  // Edit Representative
  const handleSaveRepresentative = (updatedRep: RepresentativeItem) => {
    const updated = representativesList.map((r) => (r.id === updatedRep.id ? updatedRep : r));
    updateRepresentativesList(updated);
    toast.success("Profile Updated", {
      description: `Details for ${updatedRep.name} have been saved successfully.`,
    });
  };

  // Delete Representative
  const handleDeleteRepresentative = () => {
    if (!selectedRepForDelete) return;
    const repToDelete = selectedRepForDelete;
    const updated = representativesList.filter((r) => r.id !== repToDelete.id);
    updateRepresentativesList(updated);

    if (selectedRepForEdit?.id === repToDelete.id) {
      setSelectedRepForEdit(null);
    }

    if (paginatedReps.length === 1 && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }

    setSelectedRepForDelete(null);
    toast.success("Representative Removed", {
      description: `${repToDelete.name} has been removed from the roster.`,
    });
  };

  // Country filter options
  const countryOptions: FilterSelectOption[] = useMemo(() => {
    const uniqueCountries = Array.from(new Set(representativesList.map((r) => r.country))).filter(Boolean);
    return [{ label: "All Countries", value: "all" }, ...uniqueCountries.map((c) => ({ label: c, value: c, icon: Globe }))];
  }, [representativesList]);

  const statusOptions: FilterSelectOption[] = [
    { label: "All Statuses", value: "all" },
    { label: "Active", value: "Active", badgeDot: "bg-emerald-500" },
    { label: "Inactive", value: "Inactive", badgeDot: "bg-amber-500" },
    { label: "Suspended", value: "Suspended", badgeDot: "bg-red-500" },
  ];

  const sortOptions: FilterSelectOption[] = [
    { label: "Recently Added", value: "recent", icon: ArrowUpDown },
    { label: "Name: A to Z", value: "name-asc", icon: ArrowUpDown },
    { label: "Name: Z to A", value: "name-desc", icon: ArrowUpDown },
    { label: "Agent Count: High to Low", value: "agents-high", icon: Users },
    { label: "Agent Count: Low to High", value: "agents-low", icon: Users },
  ];

  // Active filter count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedCountry !== "all") count++;
    if (selectedStatus !== "all") count++;
    return count;
  }, [searchQuery, selectedCountry, selectedStatus]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCountry("all");
    setSelectedStatus("all");
    setSortBy("recent");
    setCurrentPage(1);
    toast.info("Filters Reset", {
      description: "Search query and active filter criteria have been reset.",
    });
  };

  // Filtered and sorted dataset
  const filteredReps = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    const filtered = representativesList.filter((rep) => {
      const matchesSearch =
        !q ||
        rep.name.toLowerCase().includes(q) ||
        rep.email.toLowerCase().includes(q) ||
        rep.country.toLowerCase().includes(q) ||
        rep.repCode.toLowerCase().includes(q) ||
        (rep.organization && rep.organization.toLowerCase().includes(q));

      const matchesCountry = selectedCountry === "all" || rep.country === selectedCountry;
      const matchesStatus = selectedStatus === "all" || rep.status === selectedStatus;

      return matchesSearch && matchesCountry && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      if (sortBy === "agents-high") return b.agentCount - a.agentCount;
      if (sortBy === "agents-low") return a.agentCount - b.agentCount;
      return 0;
    });
  }, [representativesList, searchQuery, selectedCountry, selectedStatus, sortBy]);

  // Pagination
  const totalItems = filteredReps.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedReps = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredReps.slice(start, start + pageSize);
  }, [filteredReps, currentPage, pageSize]);

  // Executive Metric Calculations
  const stats = useMemo(() => {
    const total = representativesList.length;
    const totalAgents = representativesList.reduce((acc, curr) => acc + (curr.agentCount || 0), 0);
    const uniqueCountries = new Set(representativesList.map((r) => r.country)).size;
    const active = representativesList.filter((r) => r.status === "Active").length;
    return {
      total,
      totalAgents,
      uniqueCountries,
      active,
    };
  }, [representativesList]);

  // Columns definition matching requested:
  // No | Full Name | Email Id | Country | Agent Count | Actions (edit and delete)
  const columns: ColumnDef<RepresentativeItem>[] = useMemo(
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
        cell: (_rep, index) => {
          const rowNumber = (currentPage - 1) * pageSize + index + 1;
          return (
            <span className="font-mono text-xs font-semibold text-text-muted">
              {String(rowNumber).padStart(2, "0")}
            </span>
          );
        },
      },
      {
        key: "fullName",
        header: "Full Name",
        width: 260,
        minWidth: 210,
        resizable: true,
        cell: (rep) => (
          <div
            onClick={(e) => {
              e.stopPropagation();
              navigate(ROUTES.getPartnerProfile("representative", rep.id), {
                state: { representative: rep, partnerType: "representative" },
              });
            }}
            title={`View profile for ${rep.name}`}
            className="group/rep flex cursor-pointer items-center gap-3 transition-transform duration-150 hover:translate-x-0.5"
          >
            <div className="relative shrink-0">
              <img
                src={rep.avatarUrl}
                alt={rep.name}
                className="h-10 w-10 rounded-full border border-brand-border object-cover transition-all group-hover/rep:border-burgundy-primary group-hover/rep:ring-2 group-hover/rep:ring-burgundy-primary/20"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/avis-emblem.png";
                }}
              />
              <span
                className={cn(
                  "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white",
                  rep.status === "Active" ? "bg-emerald-500" : "bg-amber-500",
                )}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-xs font-bold text-text-primary transition-colors group-hover/rep:text-burgundy-primary group-hover/rep:underline">
                  {rep.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="font-mono text-[10px] font-semibold text-text-muted">{rep.repCode}</span>
                <span className="text-text-muted/60">•</span>
                <span className="text-[10px] text-text-muted">{rep.organization || "Representative"}</span>
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "emailId",
        header: "Email Id",
        width: 250,
        minWidth: 200,
        resizable: true,
        cell: (rep) => (
          <div className="space-y-0.5 text-xs">
            <a
              href={`mailto:${rep.email}`}
              onClick={(e) => e.stopPropagation()}
              className="group/mail flex items-center gap-1.5 font-medium text-text-secondary transition-colors hover:text-burgundy-primary"
              title={`Send email to ${rep.email}`}
            >
              <Mail className="h-3.5 w-3.5 shrink-0 text-text-muted group-hover/mail:text-burgundy-primary" />
              <span className="truncate text-[11.5px]">{rep.email}</span>
            </a>
            {rep.phone && (
              <a
                href={`tel:${rep.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="group/phone flex items-center gap-1.5 font-medium text-text-muted transition-colors hover:text-text-primary"
                title={`Call ${rep.phone}`}
              >
                <Phone className="h-3 w-3 shrink-0 text-text-muted group-hover/phone:text-burgundy-primary" />
                <span className="text-[10.5px]">{rep.phone}</span>
              </a>
            )}
          </div>
        ),
      },
      {
        key: "country",
        header: "Country",
        width: 200,
        minWidth: 160,
        resizable: true,
        cell: (rep) => (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-burgundy-primary" />
            <span
              className="truncate"
              title={rep.country}
            >
              {rep.country}
            </span>
          </div>
        ),
      },
      {
        key: "agentCount",
        header: "Agent Count",
        width: 170,
        minWidth: 140,
        resizable: true,
        cell: (rep) => (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-burgundy-primary/20 bg-burgundy-primary/5 px-2.5 py-1 text-xs font-bold text-burgundy-primary">
              <Users className="h-3.5 w-3.5 stroke-[2.2]" />
              <span>{rep.agentCount} Agents</span>
            </span>
          </div>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        width: 120,
        minWidth: 100,
        resizable: false,
        headerClassName: "text-center",
        cell: (rep) => (
          <div
            className="flex items-center justify-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedRepForEdit(rep)}
              title="Edit representative details"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-brand-border bg-white text-text-secondary transition-all hover:border-burgundy-primary hover:bg-burgundy-primary/5 hover:text-burgundy-primary"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setSelectedRepForDelete(rep)}
              title="Remove representative"
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
          title="Total Representatives"
          items={[{ name: "Total Representatives" }]}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  exportRepresentativesToCsv(filteredReps);
                  toast.success("CSV Export Completed", {
                    description: `Exported ${filteredReps.length} representative records.`,
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
                className="shadow-xs rounded-xl px-3.5 py-1.5 text-xs font-bold text-white shadow-burgundy/20 hover:shadow-md"
              >
                <UserPlus className="mr-1.5 h-3.5 w-3.5 stroke-[2.4]" />
                <span>Add Representative</span>
              </Button>
            </div>
          }
        />
      </motion.div>

      {/* 2. Top Summary KPI Metric Cards */}
      <motion.div variants={sectionVariants}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="shadow-xs group relative overflow-hidden rounded-2xl border border-brand-border bg-white p-3.5 sm:p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Total Reps</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-burgundy-primary/10 text-burgundy-primary">
                <UserCheck className="h-4 w-4 stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold tracking-tight text-text-primary">{stats.total}</span>
              <span className="text-xs text-text-muted">regional leaders</span>
            </div>
          </div>

          <div className="shadow-xs group relative overflow-hidden rounded-2xl border border-brand-border bg-white p-3.5 sm:p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Linked Agents</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-burgundy-primary/10 text-burgundy-primary">
                <Users className="h-4 w-4 stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold tracking-tight text-burgundy-primary">{stats.totalAgents}</span>
              <span className="text-xs text-text-muted">agents managed</span>
            </div>
          </div>

          <div className="shadow-xs group relative overflow-hidden rounded-2xl border border-brand-border bg-white p-3.5 sm:p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Countries</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Globe className="h-4 w-4 stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold tracking-tight text-text-primary">{stats.uniqueCountries}</span>
              <span className="text-xs text-text-muted">jurisdictions</span>
            </div>
          </div>

          <div className="shadow-xs group relative overflow-hidden rounded-2xl border border-brand-border bg-white p-3.5 sm:p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Active Status</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Building2 className="h-4 w-4 stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold tracking-tight text-emerald-600">{stats.active}</span>
              <span className="text-xs text-text-muted">active in field</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 3. Search and Filters Card */}
      <motion.div variants={sectionVariants}>
        <div className="shadow-xs rounded-2xl border border-brand-border bg-white p-3 sm:p-4">
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-12">
              {/* Search Bar */}
              <div className="lg:col-span-5">
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
                  placeholder="Search by representative name, email, country, or code..."
                  className="w-full"
                  label="Search"
                  inputClassName="h-[36px]"
                />
              </div>

              {/* Country Filter */}
              <div className="lg:col-span-3">
                <FilterSelect
                  label="Country"
                  value={selectedCountry}
                  options={countryOptions}
                  icon={Globe}
                  onChange={(val) => {
                    setSelectedCountry(val);
                    setCurrentPage(1);
                  }}
                  defaultValue="all"
                  buttonClassName="h-[36px]"
                  className="w-full"
                  searchable
                />
              </div>

              {/* Status Filter */}
              <div className="lg:col-span-2">
                <FilterSelect
                  label="Status"
                  value={selectedStatus}
                  options={statusOptions}
                  icon={Filter}
                  onChange={(val) => {
                    setSelectedStatus(val);
                    setCurrentPage(1);
                  }}
                  defaultValue="all"
                  buttonClassName="h-[36px]"
                  className="w-full"
                />
              </div>

              {/* Sort By Filter or Reset */}
              <div className="flex items-center gap-2 lg:col-span-2">
                {activeFiltersCount > 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResetFilters}
                    className="h-[36px] w-full rounded-xl border-dashed border-brand-red/40 bg-brand-light-red/30 text-xs font-semibold text-brand-red hover:bg-brand-light-red"
                  >
                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                    <span>Reset ({activeFiltersCount})</span>
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
                    buttonClassName="h-[36px]"
                    className="w-full"
                  />
                )}
              </div>
            </div>

            {/* Filter Summary & Result Count Indicator */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-brand-border/60 pt-2 text-xs">
              <div className="flex items-center gap-2 text-text-muted">
                <Filter className="h-3.5 w-3.5 text-burgundy-primary" />
                <span>
                  Showing <strong className="text-text-primary">{filteredReps.length}</strong> of{" "}
                  <strong className="text-text-primary">{representativesList.length}</strong> representatives
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
          <DataTable<RepresentativeItem>
            columns={columns}
            data={paginatedReps}
            keyExtractor={(rep) => rep.id}
            density="normal"
            storageKey="ams_total_representatives_table_widths"
            showResizeGuide={true}
            emptyMessage={activeFiltersCount > 0 ? "No representatives match your active filter criteria." : "No representatives found in roster."}
            onRowClick={(rep) => {
              navigate(ROUTES.getPartnerProfile("representative", rep.id), {
                state: { representative: rep, partnerType: "representative" },
              });
            }}
            rowClassName="cursor-pointer hover:bg-brand-bg/40 transition-colors"
          />

          {/* Pagination Controls */}
          {filteredReps.length > 0 && (
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

      {/* 5. Modals for Add and Edit */}
      {isAddModalOpen && (
        <AddRepresentativeModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddRepresentative}
          nextRepCode={`AWC-REP-${String(representativesList.length + 1).padStart(3, "0")}`}
        />
      )}

      <EditRepresentativeModal
        isOpen={Boolean(selectedRepForEdit)}
        onClose={() => setSelectedRepForEdit(null)}
        representative={selectedRepForEdit}
        onSave={handleSaveRepresentative}
      />

      {/* 6. Delete Confirmation Modal */}
      {selectedRepForDelete && (
        <DeleteModal
          isOpen={Boolean(selectedRepForDelete)}
          onClose={() => setSelectedRepForDelete(null)}
          onConfirm={handleDeleteRepresentative}
          title="Delete Representative"
          description={`Are you sure you want to permanently remove ${selectedRepForDelete.name} from the institutional representative roster? This will disconnect their managed agent networks.`}
          confirmText="Yes, Delete Representative"
          confirmVariant="danger"
          itemPreview={
            <div className="rounded-xl border border-brand-border bg-white p-3 text-left">
              <div className="flex items-center gap-3">
                <img
                  src={selectedRepForDelete.avatarUrl}
                  alt={selectedRepForDelete.name}
                  className="h-10 w-10 rounded-full border border-brand-border object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/avis-emblem.png";
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-xs font-bold text-text-primary">{selectedRepForDelete.name}</span>
                    <span className="font-mono text-[10px] text-text-muted">({selectedRepForDelete.repCode})</span>
                  </div>
                  <div className="truncate text-[11px] text-text-secondary">
                    {selectedRepForDelete.country} • {selectedRepForDelete.agentCount} Agents Managed
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

export default TotalRepresentativesPage;
