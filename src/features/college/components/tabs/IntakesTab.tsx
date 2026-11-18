import React, { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  CalendarRange,
  Clock,
  RotateCcw,
  X,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  StepForward,
} from "lucide-react";
import { initialIntakesData } from "../../data/collegeTabData";
import { CollegeIntake, IntakeTimetable } from "../../types";
import { getIntakeTimetables } from "../../data/timetableData";
import { DataTable, ColumnDef } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { FilterSelect, FilterSelectOption } from "@/components/ui/FilterSelect";
import { SearchInput } from "@/components/ui/SearchInput";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { Pagination } from "@/components/ui/Pagination";
import { IntakeModal, normalizeIntakeStatus } from "../IntakeModal";
import { TimetablePdfModal } from "../TimetablePdfModal";
import { toast } from "@/components/common/ToastMessage";
import { safeStorage } from "@/lib/security";
import { cn } from "@/lib/utils";

export interface IntakesTabProps {
  intakes?: CollegeIntake[];
  className?: string;
  onIntakesChange?: (intakes: CollegeIntake[]) => void;
}

const STORAGE_KEY = "ams_college_intakes_list";

/** Format dates into readable string like "19 Jan 2026" */
const formatDisplayDate = (dateStr?: string): string => {
  if (!dateStr) return "—";
  if (/^\d{1,2}\s+[A-Za-z]{3}\s+\d{4}$/.test(dateStr)) return dateStr;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

/** Status badge color themes */
const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  ongoing: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  incoming: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
    dot: "bg-sky-500",
  },
  closed: {
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
};

export const IntakesTab: React.FC<IntakesTabProps> = ({ intakes: externalIntakes, className, onIntakesChange }) => {
  // Intakes list state with local persistence
  const [intakeList, setIntakeList] = useState<CollegeIntake[]>(() => {
    if (externalIntakes && externalIntakes.length > 0) return externalIntakes;
    return safeStorage.getItem<CollegeIntake[]>(STORAGE_KEY, initialIntakesData);
  });

  // Keep in sync if parent passes updated intakes
  useEffect(() => {
    if (externalIntakes && externalIntakes.length > 0) {
      setIntakeList(externalIntakes);
    }
  }, [externalIntakes]);

  // Persist intake changes
  const saveIntakes = useCallback(
    (newList: CollegeIntake[]) => {
      setIntakeList(newList);
      safeStorage.setItem(STORAGE_KEY, newList);
      onIntakesChange?.(newList);
    },
    [onIntakesChange],
  );

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIntakeFilter, setSelectedIntakeFilter] = useState("All Intakes");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All Statuses");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Modals State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIntake, setEditingIntake] = useState<CollegeIntake | null>(null);
  const [intakeToDelete, setIntakeToDelete] = useState<CollegeIntake | null>(null);

  // Collapsible Row State (Click table row to collapse/expand Available Timetables)
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Timetable PDF Modal State
  const [selectedTimetableForPdf, setSelectedTimetableForPdf] = useState<IntakeTimetable | null>(null);
  const [selectedIntakeForPdf, setSelectedIntakeForPdf] = useState<CollegeIntake | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const toggleRowExpansion = useCallback((id: string) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  }, []);

  // Dynamic available intake names for Filter by Intake
  const availableIntakeNames = useMemo(() => {
    const set = new Set<string>();
    intakeList.forEach((item) => {
      const name = item.intakeName || item.name;
      if (name) set.add(name);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [intakeList]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedIntakeFilter, selectedStatusFilter]);

  // Filtered Intakes
  const filteredIntakes = useMemo(() => {
    return intakeList.filter((item) => {
      const query = searchQuery.trim().toLowerCase();
      const name = (item.intakeName || item.name || "").toLowerCase();
      const month = (item.intakeMonth || "").toLowerCase();
      const year = (item.year || item.academicYear || "").toLowerCase();
      const status = normalizeIntakeStatus(item.status);
      const intakeDate = (item.intakeDate || item.commenceDate || "").toLowerCase();
      const completionDate = (item.completionDate || "").toLowerCase();
      const examDate = (item.finalExamResultDate || "").toLowerCase();
      const confermentDate = (item.confermentDate || "").toLowerCase();

      const matchesSearch =
        !query ||
        name.includes(query) ||
        month.includes(query) ||
        year.includes(query) ||
        status.includes(query) ||
        intakeDate.includes(query) ||
        completionDate.includes(query) ||
        examDate.includes(query) ||
        confermentDate.includes(query);

      const matchesIntakeName =
        selectedIntakeFilter === "All Intakes" || (item.intakeName || item.name).toLowerCase() === selectedIntakeFilter.toLowerCase();

      const matchesStatus = selectedStatusFilter === "All Statuses" || status.toLowerCase() === selectedStatusFilter.toLowerCase();

      return matchesSearch && matchesIntakeName && matchesStatus;
    });
  }, [intakeList, searchQuery, selectedIntakeFilter, selectedStatusFilter]);

  // Paginated slice
  const totalItems = filteredIntakes.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedIntakes = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredIntakes.slice(startIndex, startIndex + pageSize);
  }, [filteredIntakes, currentPage, pageSize]);

  const isIntakeFiltered = selectedIntakeFilter !== "All Intakes";
  const isStatusFiltered = selectedStatusFilter !== "All Statuses";
  const hasActiveFilters = isIntakeFiltered || isStatusFiltered || searchQuery.trim() !== "";

  const handleResetFilters = () => {
    setSelectedIntakeFilter("All Intakes");
    setSelectedStatusFilter("All Statuses");
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Add / Edit Handlers
  const handleOpenAddModal = () => {
    setEditingIntake(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (intake: CollegeIntake) => {
    setEditingIntake(intake);
    setIsModalOpen(true);
  };

  const handleSaveIntake = (savedIntake: CollegeIntake) => {
    if (editingIntake) {
      // Edit mode
      const updatedList = intakeList.map((item) => (item.id === savedIntake.id ? savedIntake : item));
      saveIntakes(updatedList);
      toast.success(`Intake "${savedIntake.intakeName || savedIntake.name}" updated successfully.`);
    } else {
      // Add mode
      const updatedList = [savedIntake, ...intakeList];
      saveIntakes(updatedList);
      toast.success(`Intake "${savedIntake.intakeName || savedIntake.name}" created successfully.`);
    }
  };

  // Quick inline status change handler
  const handleStatusChange = (intake: CollegeIntake, newStatus: string) => {
    const normalized = normalizeIntakeStatus(newStatus);
    const updatedList = intakeList.map((item) => (item.id === intake.id ? { ...item, status: normalized } : item));
    saveIntakes(updatedList);
    toast.success(`Status for "${intake.intakeName || intake.name}" set to ${normalized}.`);
  };

  // Delete Handler
  const handleConfirmDelete = () => {
    if (!intakeToDelete) return;
    const target = intakeToDelete;
    const updatedList = intakeList.filter((item) => item.id !== target.id);
    saveIntakes(updatedList);
    toast.success(`Intake "${target.intakeName || target.name}" was successfully removed.`);
    setIntakeToDelete(null);
  };

  // Filter options for "Filter by Intake"
  const intakeFilterOptions: FilterSelectOption[] = useMemo(() => {
    return [
      { label: "All Intakes", value: "All Intakes" },
      ...availableIntakeNames.map((name) => ({
        label: name,
        value: name,
      })),
    ];
  }, [availableIntakeNames]);

  // Filter options for Status
  const statusFilterOptions: FilterSelectOption[] = [
    { label: "All Statuses", value: "All Statuses" },
    { label: "ongoing", value: "ongoing", badgeDot: "bg-emerald-500" },
    { label: "incoming", value: "incoming", badgeDot: "bg-sky-500" },
    { label: "closed", value: "closed", badgeDot: "bg-slate-400" },
  ];

  // Options for custom select button in status column
  const statusCellOptions: FilterSelectOption[] = [
    { label: "Ongoing", value: "ongoing", badgeDot: "bg-emerald-500" },
    { label: "Incoming", value: "incoming", badgeDot: "bg-sky-500" },
    { label: "Closed", value: "closed", badgeDot: "bg-slate-400" },
  ];

  // DataTable columns definition matching requested fields:
  // Intake Name, Intake Month, Intake Date, Completion Date, Final Exam Result Date, Conferment Date, Year, Status(select- ongoing,incoming,closed), Actions (edit and delete)
  const columns: ColumnDef<CollegeIntake>[] = useMemo(
    () => [
      {
        key: "index",
        header: "#",
        width: 75,
        minWidth: 65,
        maxWidth: 95,
        headerClassName: "text-center",
        className: "text-center",
        cell: (intake, index) => {
          const isExpanded = expandedRowId === intake.id;
          return (
            <div className="flex items-center justify-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleRowExpansion(intake.id);
                }}
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-md border transition-all duration-200",
                  isExpanded
                    ? "shadow-2xs border-burgundy-primary bg-burgundy-primary text-white"
                    : "border-brand-border bg-brand-bg/70 text-text-muted hover:border-burgundy-primary/40 hover:bg-white hover:text-burgundy-primary",
                )}
                title={isExpanded ? "Collapse Available Timetables" : "Click to view Available Timetables"}
                aria-label={isExpanded ? "Collapse Available Timetables" : "Click to view Available Timetables"}
              >
                <ChevronRight className={cn("h-3 w-3 transition-transform duration-200", isExpanded && "rotate-90")} />
              </button>
              <span className="font-mono text-xs font-bold text-text-muted">{String((currentPage - 1) * pageSize + index + 1).padStart(2, "0")}</span>
            </div>
          );
        },
      },
      {
        key: "name",
        header: "Intake Name",
        width: 220,
        minWidth: 180,
        cell: (intake) => {
          const name = intake.intakeName || intake.name;
          const isExpanded = expandedRowId === intake.id;
          return (
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors",
                  isExpanded ? "bg-burgundy-primary text-white" : "bg-burgundy-primary/10 text-burgundy-primary",
                )}
              >
                <CalendarRange className="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-col truncate">
                <span
                  className="truncate font-bold text-text-primary"
                  title={name}
                >
                  {name}
                </span>
                {intake.term && <span className="text-[10px] text-text-muted">{intake.term}</span>}
              </div>
            </div>
          );
        },
      },
      {
        key: "intakeMonth",
        header: "Intake Month",
        width: 140,
        minWidth: 120,
        cell: (intake) => {
          const month = intake.intakeMonth || "—";
          return (
            <div className="flex items-center gap-1.5 text-xs text-text-secondary">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-text-muted" />
              <span className="font-medium text-text-primary">{month}</span>
            </div>
          );
        },
      },
      {
        key: "intakeDate",
        header: "Intake Date",
        width: 140,
        minWidth: 120,
        cell: (intake) => {
          const formatted = formatDisplayDate(intake.intakeDate || intake.commenceDate);
          return (
            <div className="flex items-center gap-1.5 text-xs text-text-secondary">
              <Clock className="h-3.5 w-3.5 shrink-0 text-text-muted" />
              <span className="font-medium">{formatted}</span>
            </div>
          );
        },
      },
      {
        key: "completionDate",
        header: "Completion Date",
        width: 150,
        minWidth: 130,
        cell: (intake) => <span className="text-xs font-medium text-text-secondary">{formatDisplayDate(intake.completionDate)}</span>,
      },
      {
        key: "finalExamResultDate",
        header: "Final Exam Result Date",
        width: 175,
        minWidth: 155,
        cell: (intake) => <span className="text-xs font-medium text-text-secondary">{formatDisplayDate(intake.finalExamResultDate)}</span>,
      },
      {
        key: "confermentDate",
        header: "Conferment Date",
        width: 155,
        minWidth: 135,
        cell: (intake) => <span className="text-xs font-medium text-text-secondary">{formatDisplayDate(intake.confermentDate)}</span>,
      },
      {
        key: "year",
        header: "Year",
        width: 95,
        minWidth: 80,
        headerClassName: "text-center",
        className: "text-center",
        cell: (intake) => {
          const year = intake.year || (intake.academicYear ? intake.academicYear.replace(/\D/g, "").slice(0, 4) : "—");
          return (
            <span className="inline-flex items-center rounded-md border border-brand-border bg-brand-bg/70 px-2 py-0.5 font-mono text-xs font-bold text-text-secondary">
              {year}
            </span>
          );
        },
      },
      {
        key: "status",
        header: "Status",
        width: 150,
        minWidth: 135,
        cell: (intake) => {
          const currentStatus = normalizeIntakeStatus(intake.status);
          const style = STATUS_STYLES[currentStatus] || STATUS_STYLES.ongoing;

          return (
            <div
              className="relative inline-flex items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <FilterSelect
                value={currentStatus}
                options={statusCellOptions}
                onChange={(val) => handleStatusChange(intake, val)}
                usePortal={true}
                size="sm"
                className="w-[120px]"
                buttonClassName={cn(
                  "h-7 rounded-full px-3 py-0 text-xs font-semibold capitalize border transition-all duration-150 shadow-2xs hover:shadow-xs justify-between",
                  style.bg,
                  style.text,
                  style.border,
                )}
                menuClassName="min-w-[120px] rounded-xl shadow-2xl border-brand-border/90 py-1"
              />
            </div>
          );
        },
      },
      {
        key: "actions",
        header: "Actions",
        width: 160,
        minWidth: 140,
        resizable: false,
        headerClassName: "text-right",
        className: "text-right",
        cell: (intake) => (
          <div
            className="flex items-center justify-start gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Edit Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEditModal(intake);
              }}
              className="group inline-flex items-center gap-1 rounded-lg border border-transparent px-2.5 py-1 text-text-muted transition-all duration-150 hover:border-burgundy-primary/30 hover:bg-burgundy-primary/10 hover:text-burgundy-primary active:scale-95"
              title={`Edit intake ${intake.intakeName || intake.name}`}
              aria-label={`Edit intake ${intake.intakeName || intake.name}`}
            >
              <Edit2 className="h-3.5 w-3.5 transition-transform duration-150 group-hover:scale-110" />
              <span className="text-xs font-semibold text-burgundy-primary">Edit</span>
            </button>

            {/* Delete Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIntakeToDelete(intake);
              }}
              className="group inline-flex items-center gap-1 rounded-lg border border-transparent px-2.5 py-1 text-text-muted transition-all duration-150 hover:border-brand-red/30 hover:bg-brand-light-red hover:text-brand-red active:scale-95"
              title={`Delete intake ${intake.intakeName || intake.name}`}
              aria-label={`Delete intake ${intake.intakeName || intake.name}`}
            >
              <Trash2 className="h-3.5 w-3.5 transition-transform duration-150 group-hover:scale-110" />
              <span className="text-xs font-semibold text-brand-red">Delete</span>
            </button>
          </div>
        ),
      },
    ],
    [currentPage, pageSize, paginatedIntakes.length, expandedRowId, toggleRowExpansion],
  );

  /**
   * Render Available Timetables in a Card Format for the expanded row
   */
  const renderTimetablesSection = (intake: CollegeIntake) => {
    const timetables = getIntakeTimetables(intake);

    return (
      <div className="border-t border-brand-border/60 bg-gradient-to-b from-brand-bg/40 to-brand-bg/70 p-3 sm:p-5">
        {/* Expanded Header Bar */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="shadow-2xs mb-3.5 flex flex-row items-center justify-between gap-2 rounded-2xl border border-brand-border/80 bg-white p-3 sm:p-3.5"
        >
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-xl bg-burgundy-primary/10 text-burgundy-primary sm:h-8 sm:w-8">
              <CalendarRange className="h-4 w-4 sm:h-4 sm:w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h4 className="text-[11px] font-bold text-text-primary sm:text-[13px]">Available Timetables</h4>
                <span className="rounded-full border border-burgundy-primary/20 bg-burgundy-primary/10 px-2 py-0.5 text-[10px] font-semibold text-burgundy-primary sm:text-[11px]">
                  {timetables.length} Allocated
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => toggleRowExpansion(intake.id)}
              className="inline-flex items-center gap-1 rounded-xl border border-brand-border bg-brand-bg/60 px-2.5 py-1 text-xs font-semibold text-text-secondary transition-colors hover:bg-brand-bg hover:text-text-primary active:scale-95 sm:px-3 sm:py-1.5"
            >
              <ChevronDown className="h-3.5 w-3.5 rotate-180 transition-transform duration-200" />
              <span>Collapse</span>
            </button>
          </div>
        </motion.div>

        {/* Timetables Grid in Mobile Responsive Card Format */}
        {timetables.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-brand-border bg-white p-6 text-center text-xs text-text-muted sm:p-8">
            No course timetables allocated for this cohort yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:gap-3.5">
            {timetables.map((tt, ttIndex) => (
              <motion.div
                key={tt.id}
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.2,
                  delay: Math.min(ttIndex * 0.025, 0.15),
                  ease: "easeOut",
                }}
                className="group flex flex-col justify-between rounded-2xl border border-brand-border/80 bg-white p-3 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-burgundy-primary/30 hover:shadow-card-hover sm:p-3.5"
              >
                <div>
                  {/* Card Header: Class Code & View Button */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="shadow-2xs inline-flex min-w-0 max-w-[calc(100%-2.25rem)] items-center gap-1 truncate rounded-lg border border-burgundy-primary/25 bg-burgundy-primary/10 px-2 py-1 font-mono text-xs font-bold text-burgundy-primary sm:px-2.5"
                      title={tt.classCode}
                    >
                      <span className="truncate">{tt.classCode}</span>
                    </span>

                    {/* Card Action: View Button with Icon to show PDF */}
                    <div className="shrink-0">
                      <Button
                        type="button"
                        variant="burgundy"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTimetableForPdf(tt);
                          setSelectedIntakeForPdf(intake);
                          setIsPdfModalOpen(true);
                        }}
                        className="shadow-xs flex h-7 w-7 shrink-0 items-center justify-center rounded-xl p-0 text-xs font-semibold transition-transform active:scale-95 sm:h-8 sm:w-8"
                        title={`View ${tt.classCode} Course Timetable PDF`}
                        aria-label={`View ${tt.classCode} Course Timetable PDF`}
                      >
                        <StepForward className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search & Filters Toolbar */}
      <div className="flex flex-col gap-3.5 rounded-2xl border border-brand-border bg-white p-3.5 shadow-card sm:p-4">
        {/* Controls: Search, Filter by Intake, Filter by Status, and Add Intake Button */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
            {/* Search Box */}
            <div className="w-full flex-1 sm:max-w-md">
              <SearchInput
                label="Search Intakes"
                labelIcon={Search}
                placeholder="Search intakes by name, month, year, or dates..."
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </div>

            {/* Filter by Intake */}
            <div className="w-full sm:w-60">
              <FilterSelect
                label="Filter by Intake"
                icon={CalendarRange}
                value={selectedIntakeFilter}
                defaultValue="All Intakes"
                searchable={true}
                searchPlaceholder="Search intake..."
                align="left"
                options={intakeFilterOptions}
                onChange={setSelectedIntakeFilter}
              />
            </div>

            {/* Filter by Status */}
            <div className="w-full sm:w-44">
              <FilterSelect
                label="Status"
                icon={CheckCircle2}
                value={selectedStatusFilter}
                defaultValue="All Statuses"
                align="left"
                options={statusFilterOptions}
                onChange={setSelectedStatusFilter}
              />
            </div>
          </div>

          {/* Add Intake Button */}
          <div className="flex items-center gap-2 sm:ml-auto lg:mb-0.5">
            <Button
              variant="burgundy"
              size="sm"
              onClick={handleOpenAddModal}
              className="shadow-xs gap-1.5 rounded-xl text-xs font-semibold"
              title="Add New Intake"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Intake</span>
            </Button>
          </div>
        </div>

        {/* Active Filter Chips / Reset */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-brand-border/60 pt-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-text-muted">Active:</span>

              {isIntakeFiltered && (
                <span className="inline-flex items-center gap-1 rounded-lg border border-burgundy-primary/25 bg-burgundy-primary/10 px-2 py-0.5 text-[11px] font-semibold text-burgundy-primary">
                  <span>
                    Intake: <strong className="font-bold">{selectedIntakeFilter}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedIntakeFilter("All Intakes")}
                    className="ml-0.5 rounded p-0.5 hover:bg-burgundy-primary/20 hover:text-brand-red"
                    title="Remove intake filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {isStatusFiltered && (
                <span className="inline-flex items-center gap-1 rounded-lg border border-burgundy-primary/25 bg-burgundy-primary/10 px-2 py-0.5 text-[11px] font-semibold text-burgundy-primary">
                  <span>
                    Status: <strong className="font-bold capitalize">{selectedStatusFilter}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedStatusFilter("All Statuses")}
                    className="ml-0.5 rounded p-0.5 hover:bg-burgundy-primary/20 hover:text-brand-red"
                    title="Remove status filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {searchQuery && (
                <span className="inline-flex items-center gap-1 rounded-lg border border-burgundy-primary/25 bg-burgundy-primary/10 px-2 py-0.5 text-[11px] font-semibold text-burgundy-primary">
                  <span>
                    Search: &ldquo;<strong className="font-bold">{searchQuery}</strong>&rdquo;
                  </span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="ml-0.5 rounded p-0.5 hover:bg-burgundy-primary/20 hover:text-brand-red"
                    title="Clear search filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={handleResetFilters}
                className="ml-1 inline-flex items-center gap-1 text-[11px] font-semibold text-brand-red transition-colors hover:underline"
              >
                <RotateCcw className="h-3 w-3" />
                Reset filters
              </button>
            </div>

            <span className="text-[11px] text-text-muted">
              Found <strong className="text-text-primary">{filteredIntakes.length}</strong> intake
              {filteredIntakes.length === 1 ? "" : "s"}
            </span>
          </div>
        )}
      </div>

      {/* Main Intakes DataTable with Click to Collapse & Expand Available Timetables */}
      <DataTable<CollegeIntake>
        columns={columns}
        data={paginatedIntakes}
        keyExtractor={(intake) => intake.id}
        layout="fixed"
        density="normal"
        storageKey="ams_college_intakes_table_widths"
        showResizeGuide={true}
        guideStorageKey="ams_intakes_tab_resize_guide_v1"
        guideNote={
          <>
            Click any row to view <span className="font-bold text-burgundy-primary">Available Timetables</span> ┊ Drag divider lines{" "}
            <span className="font-bold">┊</span> to resize columns
          </>
        }
        onRowClick={(intake) => toggleRowExpansion(intake.id)}
        isRowExpanded={(intake) => expandedRowId === intake.id}
        renderExpandedRow={renderTimetablesSection}
        emptyMessage={
          hasActiveFilters
            ? "No intakes match your search or filter criteria. Try clearing filters."
            : "No intakes scheduled yet. Click 'Add Intake' to create one."
        }
      />

      {/* Reusable Pagination */}
      {filteredIntakes.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={[5, 8, 12, 20]}
          showTotal={true}
          showPageSize={true}
        />
      )}

      {/* Course Timetable PDF Modal */}
      <TimetablePdfModal
        isOpen={isPdfModalOpen}
        onClose={() => {
          setIsPdfModalOpen(false);
          setSelectedTimetableForPdf(null);
          setSelectedIntakeForPdf(null);
        }}
        timetable={selectedTimetableForPdf}
        intake={selectedIntakeForPdf}
      />

      {/* Add / Edit Intake Modal */}
      <IntakeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingIntake(null);
        }}
        onSave={handleSaveIntake}
        intake={editingIntake}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={Boolean(intakeToDelete)}
        onClose={() => setIntakeToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Intake"
        description="Are you sure you want to delete this intake schedule? This action cannot be undone."
        confirmText="Delete Intake"
        itemPreview={
          intakeToDelete ? (
            <div className="rounded-xl border border-brand-border/70 bg-brand-bg/50 p-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-text-primary">{intakeToDelete.intakeName || intakeToDelete.name}</span>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize",
                    STATUS_STYLES[normalizeIntakeStatus(intakeToDelete.status)]?.bg || STATUS_STYLES.ongoing.bg,
                    STATUS_STYLES[normalizeIntakeStatus(intakeToDelete.status)]?.text || STATUS_STYLES.ongoing.text,
                    STATUS_STYLES[normalizeIntakeStatus(intakeToDelete.status)]?.border || STATUS_STYLES.ongoing.border,
                  )}
                >
                  {normalizeIntakeStatus(intakeToDelete.status)}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-text-muted">
                <div>
                  <span className="block text-text-muted">Intake Month & Year:</span>
                  <span className="font-semibold text-text-primary">
                    {intakeToDelete.intakeMonth || "—"} {intakeToDelete.year || ""}
                  </span>
                </div>
                <div>
                  <span className="block text-text-muted">Intake Date:</span>
                  <span className="font-semibold text-text-primary">
                    {formatDisplayDate(intakeToDelete.intakeDate || intakeToDelete.commenceDate)}
                  </span>
                </div>
                <div>
                  <span className="block text-text-muted">Completion Date:</span>
                  <span className="font-semibold text-text-primary">{formatDisplayDate(intakeToDelete.completionDate)}</span>
                </div>
                <div>
                  <span className="block text-text-muted">Conferment Date:</span>
                  <span className="font-semibold text-text-primary">{formatDisplayDate(intakeToDelete.confermentDate)}</span>
                </div>
              </div>
            </div>
          ) : undefined
        }
      />
    </div>
  );
};

export default IntakesTab;
