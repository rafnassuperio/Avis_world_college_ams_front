import React, { useState, useMemo, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  ExternalLink,
  Edit3,
  Trash,
  Download,
  RotateCcw,
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Landmark,
  Compass,
} from "lucide-react";
import BreadcrumbBanner from "@/components/common/BreadcrumbBanner";
import { DataTable, ColumnDef, TableCard } from "@/components/ui/Table";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterSelect, FilterSelectOption } from "@/components/ui/FilterSelect";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { toast } from "@/components/common/ToastMessage";
import { dashboardContainerVariants, dashboardSectionVariants } from "@/components/animations/transitions";
import { sanitizeUrl } from "@/lib/security";
import { cn } from "@/lib/utils";

import { InstituteItem, InstituteCategory, InstituteSortOption } from "./types";
import { getInstitutesList, saveInstitutesList } from "./data/mockInstitutesData";
import { AddInstituteModal } from "./components/AddInstituteModal";
import { EditInstituteModal } from "./components/EditInstituteModal";
import { InstituteDetailsModal } from "./components/InstituteDetailsModal";
import { exportInstitutesToCsv } from "./utils/exportInstitutesCsv";

export const InstitutePage: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const containerVariants = shouldReduceMotion ? { hidden: { opacity: 1 }, visible: { opacity: 1 } } : dashboardContainerVariants;
  const sectionVariants = shouldReduceMotion ? { hidden: { opacity: 1 }, visible: { opacity: 1 } } : dashboardSectionVariants;

  // Master institutes list state with persistence
  const [institutesList, setInstitutesList] = useState<InstituteItem[]>(() => getInstitutesList());

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState<InstituteSortOption>("recent");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Modals state
  const [selectedInstituteForView, setSelectedInstituteForView] = useState<InstituteItem | null>(null);
  const [selectedInstituteForEdit, setSelectedInstituteForEdit] = useState<InstituteItem | null>(null);
  const [selectedInstituteForDelete, setSelectedInstituteForDelete] = useState<InstituteItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // State persistence handler
  const updateInstitutesList = useCallback((updated: InstituteItem[]) => {
    setInstitutesList(updated);
    saveInstitutesList(updated);
  }, []);

  // Handlers for Add, Edit, Delete
  const handleAddInstitute = (newInstitute: InstituteItem) => {
    const updated = [newInstitute, ...institutesList];
    updateInstitutesList(updated);
    toast.success("Institute Added", {
      description: `${newInstitute.name} has been successfully added to the directory.`,
    });
  };

  const handleSaveInstitute = (updatedInstitute: InstituteItem) => {
    const updated = institutesList.map((inst) => (inst.id === updatedInstitute.id ? updatedInstitute : inst));
    updateInstitutesList(updated);
    if (selectedInstituteForView?.id === updatedInstitute.id) {
      setSelectedInstituteForView(updatedInstitute);
    }
    toast.success("Institute Updated", {
      description: `Details for ${updatedInstitute.name} have been saved successfully.`,
    });
  };

  const handleDeleteInstitute = () => {
    if (!selectedInstituteForDelete) return;
    const instToDelete = selectedInstituteForDelete;
    const updated = institutesList.filter((inst) => inst.id !== instToDelete.id);
    updateInstitutesList(updated);

    if (selectedInstituteForView?.id === instToDelete.id) {
      setSelectedInstituteForView(null);
    }
    if (selectedInstituteForEdit?.id === instToDelete.id) {
      setSelectedInstituteForEdit(null);
    }

    if (paginatedInstitutes.length === 1 && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }

    setSelectedInstituteForDelete(null);
    toast.success("Institute Removed", {
      description: `${instToDelete.name} has been removed from the directory.`,
    });
  };

  // Next institute code generator
  const nextInstituteCode = useMemo(() => {
    const highestNum = institutesList.reduce((max, inst) => {
      const match = inst.instituteCode.match(/(\d+)$/);
      if (match) {
        const val = parseInt(match[1], 10);
        return val > max ? val : max;
      }
      return max;
    }, 0);
    return `AWC-INST-${String(highestNum + 1).padStart(3, "0")}`;
  }, [institutesList]);

  // Dynamic filter options
  const countryOptions: FilterSelectOption[] = useMemo(() => {
    const uniqueCountries = Array.from(new Set(institutesList.map((inst) => inst.country)))
      .filter(Boolean)
      .sort();
    return [{ label: "All Countries", value: "all" }, ...uniqueCountries.map((c) => ({ label: c, value: c, icon: Globe }))];
  }, [institutesList]);

  const categoryOptions: FilterSelectOption[] = useMemo(() => {
    const categories: InstituteCategory[] = ["Main Campus", "Branch Campus", "Affiliated Institute", "Partner University", "Research Center"];
    return [{ label: "All Categories", value: "all" }, ...categories.map((cat) => ({ label: cat, value: cat, icon: Building2 }))];
  }, []);

  const sortOptions: FilterSelectOption[] = [
    { label: "Recently Added", value: "recent", icon: ArrowUpDown },
    { label: "Name: A to Z", value: "name-asc", icon: ArrowUpDown },
    { label: "Name: Z to A", value: "name-desc", icon: ArrowUpDown },
    { label: "Country: A to Z", value: "country-asc", icon: Globe },
    { label: "Institute Code", value: "code-asc", icon: Landmark },
  ];

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedCountry !== "all") count++;
    if (selectedCategory !== "all") count++;
    if (selectedStatus !== "all") count++;
    return count;
  }, [searchQuery, selectedCountry, selectedCategory, selectedStatus]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCountry("all");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setSortBy("recent");
    setCurrentPage(1);
    toast.info("Filters Reset", {
      description: "Search and filter criteria have been reset.",
    });
  };

  // Filtered and sorted dataset
  const filteredInstitutes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    const filtered = institutesList.filter((inst) => {
      const matchesSearch =
        !q ||
        inst.name.toLowerCase().includes(q) ||
        inst.instituteCode.toLowerCase().includes(q) ||
        inst.email.toLowerCase().includes(q) ||
        inst.contactNo.toLowerCase().includes(q) ||
        inst.country.toLowerCase().includes(q) ||
        inst.address.toLowerCase().includes(q);

      const matchesCountry = selectedCountry === "all" || inst.country === selectedCountry;
      const matchesCategory = selectedCategory === "all" || inst.category === selectedCategory;
      const matchesStatus = selectedStatus === "all" || inst.status === selectedStatus;

      return matchesSearch && matchesCountry && matchesCategory && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      if (sortBy === "country-asc") return a.country.localeCompare(b.country);
      if (sortBy === "code-asc") return a.instituteCode.localeCompare(b.instituteCode);
      return 0;
    });
  }, [institutesList, searchQuery, selectedCountry, selectedCategory, selectedStatus, sortBy]);

  // Pagination calculation
  const totalItems = filteredInstitutes.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedInstitutes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredInstitutes.slice(start, start + pageSize);
  }, [filteredInstitutes, currentPage, pageSize]);

  // Executive Metric Calculations
  const stats = useMemo(() => {
    const total = institutesList.length;
    const uniqueCountries = new Set(institutesList.map((inst) => inst.country)).size;
    const activeCampuses = institutesList.filter((inst) => inst.status === "Active").length;
    const affiliatedCount = institutesList.filter((inst) => inst.category === "Affiliated Institute").length;
    return {
      total,
      uniqueCountries,
      activeCampuses,
      affiliatedCount,
    };
  }, [institutesList]);

  // Columns definition matching requested:
  // # | Image | Name | Email ID | Contact No | Country | Address | Google Location | Action edit and delete
  const columns: ColumnDef<InstituteItem>[] = useMemo(
    () => [
      {
        key: "rowNumber",
        header: "#",
        width: 65,
        minWidth: 55,
        resizable: false,
        headerClassName: "text-center",
        cell: (_inst, index) => {
          const rowNum = (currentPage - 1) * pageSize + index + 1;
          return (
            <div className="flex items-center justify-center">
              <span className="font-mono text-xs font-bold text-text-muted">#{String(rowNum).padStart(2, "0")}</span>
            </div>
          );
        },
      },
      {
        key: "image",
        header: "Image",
        width: 85,
        minWidth: 75,
        resizable: false,
        headerClassName: "text-center",
        cell: (inst) => (
          <div className="flex items-center justify-center">
            <div className="relative shrink-0">
              <img
                src={inst.imageUrl}
                alt={inst.name}
                className="shadow-2xs h-10 w-10 rounded-xl border border-brand-border object-cover transition-all hover:scale-105 hover:ring-2 hover:ring-burgundy-primary/20"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/avis-emblem.png";
                }}
              />
              <span
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white",
                  inst.status === "Active" ? "bg-emerald-500" : "bg-amber-500",
                )}
                title={inst.status}
              />
            </div>
          </div>
        ),
      },
      {
        key: "name",
        header: "Name",
        width: 260,
        minWidth: 200,
        resizable: true,
        cell: (inst) => (
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-1.5">
              <span
                className="cursor-pointer truncate text-xs font-bold text-text-primary transition-colors hover:text-burgundy-primary hover:underline"
                title={inst.name}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedInstituteForView(inst);
                }}
              >
                {inst.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="font-mono text-[10px] font-semibold text-text-muted">{inst.instituteCode}</span>
              {inst.category && (
                <>
                  <span className="text-text-muted/60">•</span>
                  <span className="truncate text-[10px] text-text-muted">{inst.category}</span>
                </>
              )}
            </div>
          </div>
        ),
      },
      {
        key: "email",
        header: "Email ID",
        width: 220,
        minWidth: 170,
        resizable: true,
        cell: (inst) => (
          <a
            href={`mailto:${inst.email}`}
            onClick={(e) => e.stopPropagation()}
            className="group/mail flex items-center gap-1.5 text-xs font-medium text-text-secondary transition-colors hover:text-burgundy-primary"
            title={`Send email to ${inst.email}`}
          >
            <Mail className="h-3.5 w-3.5 shrink-0 text-text-muted group-hover/mail:text-burgundy-primary" />
            <span className="truncate text-[11.5px]">{inst.email}</span>
          </a>
        ),
      },
      {
        key: "contactNo",
        header: "Contact No",
        width: 170,
        minWidth: 140,
        resizable: true,
        cell: (inst) => (
          <a
            href={`tel:${inst.contactNo}`}
            onClick={(e) => e.stopPropagation()}
            className="group/phone flex items-center gap-1.5 text-xs font-medium text-text-secondary transition-colors hover:text-burgundy-primary"
            title={`Call ${inst.contactNo}`}
          >
            <Phone className="h-3 w-3 shrink-0 text-text-muted group-hover/phone:text-burgundy-primary" />
            <span className="text-[11px] font-medium">{inst.contactNo}</span>
          </a>
        ),
      },
      {
        key: "country",
        header: "Country",
        width: 160,
        minWidth: 130,
        resizable: true,
        cell: (inst) => (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
            <Globe className="h-3.5 w-3.5 shrink-0 text-burgundy-primary" />
            <span
              className="truncate"
              title={inst.country}
            >
              {inst.country}
            </span>
          </div>
        ),
      },
      {
        key: "address",
        header: "Address",
        width: 240,
        minWidth: 180,
        resizable: true,
        cell: (inst) => (
          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-text-muted" />
            <span
              className="truncate"
              title={`${inst.address}, ${inst.country}`}
            >
              {inst.address}
            </span>
          </div>
        ),
      },
      {
        key: "googleLocation",
        header: "Google Location",
        width: 160,
        minWidth: 140,
        resizable: true,
        headerClassName: "text-center",
        cell: (inst) => {
          const mapUrl = inst.googleLocation
            ? sanitizeUrl(inst.googleLocation)
            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${inst.name}, ${inst.address}, ${inst.country}`)}`;

          return (
            <div
              className="flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={`Open ${inst.name} in Google Maps`}
                className="group/map shadow-2xs inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-white px-2.5 py-1 text-xs font-semibold text-text-secondary transition-all hover:border-burgundy-primary hover:bg-burgundy-primary/5 hover:text-burgundy-primary"
              >
                <Compass className="h-3.5 w-3.5 text-burgundy-primary transition-transform group-hover/map:scale-110" />
                <span className="truncate text-[11px]">View Map</span>
                <ExternalLink className="h-3 w-3 text-text-muted transition-colors group-hover/map:text-burgundy-primary" />
              </a>
            </div>
          );
        },
      },
      {
        key: "actions",
        header: "Action",
        width: 120,
        minWidth: 100,
        resizable: false,
        headerClassName: "text-center",
        cell: (inst) => (
          <div
            className="flex items-center justify-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedInstituteForEdit(inst)}
              title={`Edit ${inst.name}`}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-brand-border bg-white text-text-secondary transition-all hover:border-burgundy-primary hover:bg-burgundy-primary/5 hover:text-burgundy-primary"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setSelectedInstituteForDelete(inst)}
              title={`Delete ${inst.name}`}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-brand-border bg-white text-text-secondary transition-all hover:border-red-400 hover:bg-red-400/5 hover:text-red-500"
            >
              <Trash className="h-3.5 w-3.5" />
            </button>
          </div>
        ),
      },
    ],
    [currentPage, pageSize],
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
          title="Institutes"
          items={[{ name: "Institutes" }]}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  exportInstitutesToCsv(filteredInstitutes);
                  toast.success("CSV Export Completed", {
                    description: `Exported ${filteredInstitutes.length} institute records.`,
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
                <Plus className="mr-1.5 h-3.5 w-3.5 stroke-[2.4]" />
                <span>Add Institute</span>
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
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Total Institutes</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-burgundy-primary/10 text-burgundy-primary">
                <Building2 className="h-4 w-4 stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold tracking-tight text-text-primary">{stats.total}</span>
              <span className="text-xs text-text-muted">registered entities</span>
            </div>
          </div>

          <div className="shadow-xs group relative overflow-hidden rounded-2xl border border-brand-border bg-white p-3.5 sm:p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Global Countries</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Globe className="h-4 w-4 stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold tracking-tight text-blue-600">{stats.uniqueCountries}</span>
              <span className="text-xs text-text-muted">countries active</span>
            </div>
          </div>

          <div className="shadow-xs group relative overflow-hidden rounded-2xl border border-brand-border bg-white p-3.5 sm:p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Active Campuses</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Landmark className="h-4 w-4 stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold tracking-tight text-emerald-600">{stats.activeCampuses}</span>
              <span className="text-xs text-text-muted">operational centres</span>
            </div>
          </div>

          <div className="shadow-xs group relative overflow-hidden rounded-2xl border border-brand-border bg-white p-3.5 sm:p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Affiliated Hubs</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Compass className="h-4 w-4 stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold tracking-tight text-purple-600">{stats.affiliatedCount}</span>
              <span className="text-xs text-text-muted">partner academies</span>
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
                  label="Search"
                  icon={Search}
                  placeholder="Search by name, email, phone, country, address..."
                  className="w-full"
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

              {/* Category Filter */}
              <div className="lg:col-span-3">
                <FilterSelect
                  label="Category"
                  value={selectedCategory}
                  options={categoryOptions}
                  icon={Building2}
                  onChange={(val) => {
                    setSelectedCategory(val);
                    setCurrentPage(1);
                  }}
                  defaultValue="all"
                  buttonClassName="h-[36px]"
                  className="w-full"
                />
              </div>

              {/* Sort By or Reset Filter */}
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
                    icon={ArrowUpDown}
                    onChange={(val) => setSortBy(val as InstituteSortOption)}
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
                  Showing <strong className="text-text-primary">{filteredInstitutes.length}</strong> of{" "}
                  <strong className="text-text-primary">{institutesList.length}</strong> institutes
                </span>
                {activeFiltersCount > 0 && (
                  <span className="rounded-full bg-brand-light-red px-2 py-0.5 text-[10.5px] font-bold text-brand-red">
                    {activeFiltersCount} active {activeFiltersCount === 1 ? "filter" : "filters"}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-text-muted">Sort:</span>
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
          <DataTable<InstituteItem>
            columns={columns}
            data={paginatedInstitutes}
            keyExtractor={(inst) => inst.id}
            density="normal"
            storageKey="ams_institutes_master_table_widths"
            showResizeGuide={true}
            emptyMessage={
              activeFiltersCount > 0 ? "No institutes match your active search and filter criteria." : "No institutes found in directory."
            }
            onRowClick={(inst) => setSelectedInstituteForView(inst)}
            rowClassName="cursor-pointer hover:bg-brand-bg/40 transition-colors"
          />

          {/* Pagination Controls */}
          {filteredInstitutes.length > 0 && (
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

      {/* 5. Modals for View, Add, Edit, and Delete */}
      <InstituteDetailsModal
        isOpen={Boolean(selectedInstituteForView)}
        onClose={() => setSelectedInstituteForView(null)}
        institute={selectedInstituteForView}
        onEdit={(inst) => setSelectedInstituteForEdit(inst)}
      />
      {isAddModalOpen && (
        <AddInstituteModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddInstitute}
          nextInstituteCode={nextInstituteCode}
        />
      )}

      <EditInstituteModal
        isOpen={Boolean(selectedInstituteForEdit)}
        onClose={() => setSelectedInstituteForEdit(null)}
        institute={selectedInstituteForEdit}
        onSave={handleSaveInstitute}
      />

      {/* Reusable Delete Modal */}
      <DeleteModal
        isOpen={Boolean(selectedInstituteForDelete)}
        onClose={() => setSelectedInstituteForDelete(null)}
        onConfirm={handleDeleteInstitute}
        title="Remove Institute"
        description={`Are you sure you want to remove "${selectedInstituteForDelete?.name}" from the active institute directory? This action cannot be undone.`}
        confirmText="Remove Institute"
        cancelText="Keep Institute"
        itemPreview={
          selectedInstituteForDelete ? (
            <div className="flex items-center gap-3 rounded-2xl border border-brand-border/80 bg-brand-bg/50 p-3 text-left">
              <img
                src={selectedInstituteForDelete.imageUrl}
                alt={selectedInstituteForDelete.name}
                className="h-12 w-12 rounded-xl border border-brand-border object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/avis-emblem.png";
                }}
              />
              <div className="min-w-0 flex-1">
                <h4 className="truncate text-xs font-bold text-text-primary">{selectedInstituteForDelete.name}</h4>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-text-muted">
                  <span className="font-mono">{selectedInstituteForDelete.instituteCode}</span>
                  <span>•</span>
                  <span>{selectedInstituteForDelete.country}</span>
                </div>
              </div>
            </div>
          ) : undefined
        }
      />
    </motion.div>
  );
};

export default InstitutePage;
