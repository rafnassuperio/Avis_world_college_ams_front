import React, { useState, useMemo } from "react";
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
  Briefcase,
  Search,
} from "lucide-react";
import BreadcrumbBanner from "@/components/common/BreadcrumbBanner";
import { DataTable, ColumnDef, TableCard } from "@/components/ui/Table";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterSelect, FilterSelectOption } from "@/components/ui/FilterSelect";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { dashboardContainerVariants, dashboardSectionVariants } from "@/components/animations/transitions";
import { agents } from "@/services/ams";
import { useApiCollection } from "@/hooks/useApiCollection";
import { AsyncStateView } from "@/components/common/AsyncStateView";
import { AgentItem, AgentType } from "./types";
import { ROUTES } from "@/app/routes";
import { AddAgentModal } from "./components/AddAgentModal";
import { EditAgentModal } from "./components/EditAgentModal";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { exportAgentsToCsv } from "./utils/exportAgentsCsv";
import { toast } from "@/components/common/ToastMessage";
import { cn } from "@/lib/utils";

export const TotalAgentsPage: React.FC = () => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const containerVariants = shouldReduceMotion ? { hidden: { opacity: 1 }, visible: { opacity: 1 } } : dashboardContainerVariants;
  const sectionVariants = shouldReduceMotion ? { hidden: { opacity: 1 }, visible: { opacity: 1 } } : dashboardSectionVariants;

  // Master agents state
  const { data: agentsList, saveList: updateAgentsList, loading, error, reload } = useApiCollection(agents);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedRepresentative, setSelectedRepresentative] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [sortBy, setSortBy] = useState<"name-asc" | "name-desc" | "rep" | "type" | "recent">("recent");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Modals state
  const [selectedAgentForEdit, setSelectedAgentForEdit] = useState<AgentItem | null>(null);
  const [selectedAgentForDelete, setSelectedAgentForDelete] = useState<AgentItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Persistence handler


  // Add Agent
  const handleAddAgent = async (newAgent: AgentItem) => {
    const updated = [newAgent, ...agentsList];
    if (!await updateAgentsList(updated)) return false;
    toast.success("Agent Added", {
      description: `${newAgent.name} has been successfully added to the roster.`,
    });
  };

  // Edit Agent
  const handleSaveAgent = async (updatedAgent: AgentItem) => {
    const updated = agentsList.map((a) => (a.id === updatedAgent.id ? updatedAgent : a));
    if (!await updateAgentsList(updated)) return false;
    toast.success("Agent Updated", {
      description: `Details for ${updatedAgent.name} have been saved successfully.`,
    });
  };

  // Delete Agent
  const handleDeleteAgent = async () => {
    if (!selectedAgentForDelete) return;
    const agentToDelete = selectedAgentForDelete;
    const updated = agentsList.filter((a) => a.id !== agentToDelete.id);
    if (!await updateAgentsList(updated)) return false;

    if (selectedAgentForEdit?.id === agentToDelete.id) {
      setSelectedAgentForEdit(null);
    }

    if (paginatedAgents.length === 1 && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }

    setSelectedAgentForDelete(null);
    toast.success("Agent Removed", {
      description: `${agentToDelete.name} has been removed from the roster.`,
    });
  };

  // Dynamic filter options
  const typeOptions: FilterSelectOption[] = useMemo(() => {
    const uniqueTypes = Array.from(new Set(agentsList.map((a) => a.type))).filter(Boolean);
    return [{ label: "All Partner Types", value: "all" }, ...uniqueTypes.map((t) => ({ label: t, value: t, icon: Briefcase }))];
  }, [agentsList]);

  const representativeOptions: FilterSelectOption[] = useMemo(() => {
    const uniqueReps = Array.from(new Set(agentsList.map((a) => a.representative))).filter(Boolean);
    return [{ label: "All Representatives", value: "all" }, ...uniqueReps.map((r) => ({ label: r, value: r, icon: UserCheck }))];
  }, [agentsList]);

  const countryOptions: FilterSelectOption[] = useMemo(() => {
    const uniqueCountries = Array.from(new Set(agentsList.map((a) => a.country))).filter(Boolean);
    return [{ label: "All Countries", value: "all" }, ...uniqueCountries.map((c) => ({ label: c, value: c, icon: Globe }))];
  }, [agentsList]);

  const sortOptions: FilterSelectOption[] = [
    { label: "Recently Added", value: "recent", icon: ArrowUpDown },
    { label: "Name: A to Z", value: "name-asc", icon: ArrowUpDown },
    { label: "Name: Z to A", value: "name-desc", icon: ArrowUpDown },
    { label: "Representative", value: "rep", icon: UserCheck },
    { label: "Partner Type", value: "type", icon: Briefcase },
  ];

  // Active filter count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedType !== "all") count++;
    if (selectedRepresentative !== "all") count++;
    if (selectedCountry !== "all") count++;
    return count;
  }, [searchQuery, selectedType, selectedRepresentative, selectedCountry]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setSelectedRepresentative("all");
    setSelectedCountry("all");
    setSortBy("recent");
    setCurrentPage(1);
    toast.info("Filters Reset", {
      description: "Search query and active filter criteria have been reset.",
    });
  };

  // Filtered and sorted dataset
  const filteredAgents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    const filtered = agentsList.filter((ag) => {
      const matchesSearch =
        !q ||
        ag.name.toLowerCase().includes(q) ||
        ag.email.toLowerCase().includes(q) ||
        ag.phone.toLowerCase().includes(q) ||
        ag.type.toLowerCase().includes(q) ||
        ag.representative.toLowerCase().includes(q) ||
        ag.country.toLowerCase().includes(q) ||
        ag.agentCode.toLowerCase().includes(q);

      const matchesType = selectedType === "all" || ag.type === selectedType;
      const matchesRep = selectedRepresentative === "all" || ag.representative === selectedRepresentative;
      const matchesCountry = selectedCountry === "all" || ag.country === selectedCountry;

      return matchesSearch && matchesType && matchesRep && matchesCountry;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      if (sortBy === "rep") return a.representative.localeCompare(b.representative);
      if (sortBy === "type") return a.type.localeCompare(b.type);
      return 0;
    });
  }, [agentsList, searchQuery, selectedType, selectedRepresentative, selectedCountry, sortBy]);

  // Pagination
  const totalItems = filteredAgents.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedAgents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAgents.slice(start, start + pageSize);
  }, [filteredAgents, currentPage, pageSize]);

  // Executive Metric Calculations
  const stats = useMemo(() => {
    const total = agentsList.length;
    const uniqueReps = new Set(agentsList.map((a) => a.representative)).size;
    const uniqueCountries = new Set(agentsList.map((a) => a.country)).size;
    const active = agentsList.filter((a) => a.status === "Active").length;
    return {
      total,
      uniqueReps,
      uniqueCountries,
      active,
    };
  }, [agentsList]);

  // Badge styling per agent type
  const getTypeBadgeStyle = (type: AgentType) => {
    switch (type) {
      case "Exclusive Partner":
        return "border-burgundy-primary/20 bg-burgundy-primary/10 text-burgundy-primary";
      case "Direct Recruiter":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "Institutional Agent":
        return "border-blue-200 bg-blue-50 text-blue-700";
      case "Authorized Consultant":
        return "border-purple-200 bg-purple-50 text-purple-700";
      case "Regional Partner":
        return "border-amber-200 bg-amber-50 text-amber-700";
      default:
        return "border-brand-border bg-brand-bg text-text-secondary";
    }
  };

  // Columns definition matching requested:
  // No | Full Name | Email | Phone | Type | Representative | Country | Actions edit and delete
  const columns: ColumnDef<AgentItem>[] = useMemo(
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
        cell: (_ag, index) => {
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
        width: 250,
        minWidth: 200,
        resizable: true,
        cell: (ag) => (
          <div
            onClick={(e) => {
              e.stopPropagation();
              navigate(ROUTES.getPartnerProfile("agent", ag.id), {
                state: { agent: ag, partnerType: "agent" },
              });
            }}
            title={`View profile for ${ag.name}`}
            className="group/ag flex cursor-pointer items-center gap-3 transition-transform duration-150 hover:translate-x-0.5"
          >
            <div className="relative shrink-0">
              <img
                src={ag.avatarUrl}
                alt={ag.name}
                className="h-10 w-10 rounded-full border border-brand-border object-cover transition-all group-hover/ag:border-burgundy-primary group-hover/ag:ring-2 group-hover/ag:ring-burgundy-primary/20"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/avis-emblem.png";
                }}
              />
              <span
                className={cn(
                  "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white",
                  ag.status === "Active" ? "bg-emerald-500" : "bg-amber-500",
                )}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-xs font-bold text-text-primary transition-colors group-hover/ag:text-burgundy-primary group-hover/ag:underline">
                  {ag.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="font-mono text-[10px] font-semibold text-text-muted">{ag.agentCode}</span>
                <span className="text-text-muted/60">•</span>
                <span className="text-[10px] text-text-muted">{ag.agencyName || "Agent Agency"}</span>
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "email",
        header: "Email",
        width: 210,
        minWidth: 170,
        resizable: true,
        cell: (ag) => (
          <a
            href={`mailto:${ag.email}`}
            onClick={(e) => e.stopPropagation()}
            className="group/mail flex items-center gap-1.5 text-xs font-medium text-text-secondary transition-colors hover:text-burgundy-primary"
            title={`Send email to ${ag.email}`}
          >
            <Mail className="h-3.5 w-3.5 shrink-0 text-text-muted group-hover/mail:text-burgundy-primary" />
            <span className="truncate text-[11.5px]">{ag.email}</span>
          </a>
        ),
      },
      {
        key: "phone",
        header: "Phone",
        width: 170,
        minWidth: 140,
        resizable: true,
        cell: (ag) => (
          <a
            href={`tel:${ag.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="group/phone flex items-center gap-1.5 text-xs font-medium text-text-muted transition-colors hover:text-text-primary"
            title={`Call ${ag.phone}`}
          >
            <Phone className="h-3 w-3 shrink-0 text-text-muted group-hover/phone:text-burgundy-primary" />
            <span className="text-[11px] font-medium text-text-secondary">{ag.phone}</span>
          </a>
        ),
      },
      {
        key: "type",
        header: "Type",
        width: 180,
        minWidth: 150,
        resizable: true,
        cell: (ag) => (
          <span className={cn("inline-flex items-center rounded-lg border px-2 py-0.5 text-[11px] font-bold", getTypeBadgeStyle(ag.type))}>
            {ag.type}
          </span>
        ),
      },
      {
        key: "representative",
        header: "Representative",
        width: 210,
        minWidth: 170,
        resizable: true,
        cell: (ag) => (
          <div className="flex items-center gap-1.5">
            <span className="shadow-2xs inline-flex items-center gap-1.5 rounded-md border border-brand-border bg-white px-2 py-0.5 text-[11px] font-semibold text-text-primary">
              <UserCheck className="h-3 w-3 text-burgundy-primary" />
              <span className="truncate">{ag.representative}</span>
            </span>
          </div>
        ),
      },
      {
        key: "country",
        header: "Country",
        width: 170,
        minWidth: 140,
        resizable: true,
        cell: (ag) => (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-burgundy-primary" />
            <span
              className="truncate"
              title={ag.country}
            >
              {ag.country}
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
        cell: (ag) => (
          <div
            className="flex items-center justify-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedAgentForEdit(ag)}
              title="Edit agent details"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-brand-border bg-white text-text-secondary transition-all hover:border-burgundy-primary hover:bg-burgundy-primary/5 hover:text-burgundy-primary"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setSelectedAgentForDelete(ag)}
              title="Remove agent"
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

  if (loading || error) return <AsyncStateView isLoading={loading} error={error} onRetry={() => void reload()}>{null}</AsyncStateView>;

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
          title="Total Agents"
          items={[{ name: "Total Agents" }]}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  exportAgentsToCsv(filteredAgents);
                  toast.success("CSV Export Completed", {
                    description: `Exported ${filteredAgents.length} agent records.`,
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
                <span>Add Agent</span>
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
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Total Agents</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-burgundy-primary/10 text-burgundy-primary">
                <Users className="h-4 w-4 stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold tracking-tight text-text-primary">{stats.total}</span>
              <span className="text-xs text-text-muted">contracted partners</span>
            </div>
          </div>

          <div className="shadow-xs group relative overflow-hidden rounded-2xl border border-brand-border bg-white p-3.5 sm:p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Associated Reps</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-burgundy-primary/10 text-burgundy-primary">
                <UserCheck className="h-4 w-4 stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold tracking-tight text-burgundy-primary">{stats.uniqueReps}</span>
              <span className="text-xs text-text-muted">liaison officers</span>
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
              <span className="text-xs text-text-muted">global regions</span>
            </div>
          </div>

          <div className="shadow-xs group relative overflow-hidden rounded-2xl border border-brand-border bg-white p-3.5 sm:p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Active In Field</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Building2 className="h-4 w-4 stroke-[2.2]" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-mono text-2xl font-bold tracking-tight text-emerald-600">{stats.active}</span>
              <span className="text-xs text-text-muted">certified recruiters</span>
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
                  placeholder="Search agent, email, phone, rep, country..."
                  className="w-full"
                  inputClassName="h-[36px]"
                />
              </div>

              {/* Type Filter */}
              <div className="lg:col-span-2">
                <FilterSelect
                  label="Type"
                  value={selectedType}
                  options={typeOptions}
                  icon={Briefcase}
                  onChange={(val) => {
                    setSelectedType(val);
                    setCurrentPage(1);
                  }}
                  defaultValue="all"
                  buttonClassName="h-[36px]"
                  className="w-full"
                />
              </div>

              {/* Representative Filter */}
              <div className="lg:col-span-2">
                <FilterSelect
                  label="Representative"
                  value={selectedRepresentative}
                  options={representativeOptions}
                  icon={UserCheck}
                  onChange={(val) => {
                    setSelectedRepresentative(val);
                    setCurrentPage(1);
                  }}
                  defaultValue="all"
                  buttonClassName="h-[36px]"
                  className="w-full"
                />
              </div>

              {/* Country Filter */}
              <div className="lg:col-span-2">
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
                  Showing <strong className="text-text-primary">{filteredAgents.length}</strong> of{" "}
                  <strong className="text-text-primary">{agentsList.length}</strong> agents
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
          <DataTable<AgentItem>
            columns={columns}
            data={paginatedAgents}
            keyExtractor={(ag) => ag.id}
            density="normal"
            storageKey="ams_total_agents_table_widths"
            showResizeGuide={true}
            emptyMessage={activeFiltersCount > 0 ? "No agents match your active filter criteria." : "No agents found in roster."}
            onRowClick={(ag) => {
              navigate(ROUTES.getPartnerProfile("agent", ag.id), {
                state: { agent: ag, partnerType: "agent" },
              });
            }}
            rowClassName="cursor-pointer hover:bg-brand-bg/40 transition-colors"
          />

          {/* Pagination Controls */}
          {filteredAgents.length > 0 && (
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
        <AddAgentModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddAgent}
          nextAgentCode={`AWC-AG-${String(agentsList.length + 1).padStart(3, "0")}`}
        />
      )}

      <EditAgentModal
        isOpen={Boolean(selectedAgentForEdit)}
        onClose={() => setSelectedAgentForEdit(null)}
        agent={selectedAgentForEdit}
        onSave={handleSaveAgent}
      />

      {/* 6. Delete Confirmation Modal */}
      {selectedAgentForDelete && (
        <DeleteModal
          isOpen={Boolean(selectedAgentForDelete)}
          onClose={() => setSelectedAgentForDelete(null)}
          onConfirm={handleDeleteAgent}
          title="Delete Agent"
          description={`Are you sure you want to permanently remove ${selectedAgentForDelete.name} from the agency roster? This will disconnect their enrollment portal access.`}
          confirmText="Yes, Delete Agent"
          confirmVariant="danger"
          itemPreview={
            <div className="rounded-xl border border-brand-border bg-white p-3 text-left">
              <div className="flex items-center gap-3">
                <img
                  src={selectedAgentForDelete.avatarUrl}
                  alt={selectedAgentForDelete.name}
                  className="h-10 w-10 rounded-full border border-brand-border object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/avis-emblem.png";
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-xs font-bold text-text-primary">{selectedAgentForDelete.name}</span>
                    <span className="font-mono text-[10px] text-text-muted">({selectedAgentForDelete.agentCode})</span>
                  </div>
                  <div className="truncate text-[11px] text-text-secondary">
                    {selectedAgentForDelete.type} • Rep: {selectedAgentForDelete.representative}
                  </div>
                  <div className="text-[10px] text-text-muted">
                    {selectedAgentForDelete.country} • {selectedAgentForDelete.email}
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

export default TotalAgentsPage;
