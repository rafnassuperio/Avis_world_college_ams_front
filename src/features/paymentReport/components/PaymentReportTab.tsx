import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  CreditCard,
  Building2,
  PieChart,
  CheckCircle2,
  RotateCcw,
  Search,
  GraduationCap,
  Trophy,
  Users,
  Award,
  Medal,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ArrowUpDown,
  Calendar,
} from "lucide-react";
import { smoothEase } from "@/components/animations/transitions";
import { DataTable, ColumnDef } from "@/components/ui/Table";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterSelect, FilterSelectOption } from "@/components/ui/FilterSelect";
import { FilterDatePicker } from "@/components/ui/FilterDatePicker";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { getFinanceLedger, useFinanceOptions } from "@/services/reports";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { AsyncStateView } from "@/components/common/AsyncStateView";
import { PaymentReportRecord } from "../types";

export const PaymentReportTab: React.FC = () => {

  // Filters, Search, Date & Period
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedMethod, setSelectedMethod] = useState("all");
  const [earliestPaymentDate, setEarliestPaymentDate] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("semi-annual");
  const [sortBy, setSortBy] = useState<"date-asc" | "date-desc" | "payload-desc" | "payload-asc" | "yield-desc" | "name-asc">("date-asc");

  const [pageSize, setPageSize] = useState(8);
  const filters = useDebouncedValue(JSON.stringify({ search: searchQuery.trim() || undefined,
    course: selectedCourse === "all" ? undefined : selectedCourse, status: selectedStatus === "all" ? undefined : selectedStatus,
    method: selectedMethod === "all" ? undefined : selectedMethod, period: selectedPeriod, sort: sortBy,
    earliest: earliestPaymentDate ? new Date(new Date(earliestPaymentDate).setHours(0, 0, 0, 0)).toISOString() : undefined, limit: pageSize }));
  const [paging, setPaging] = useState({ filters: "", page: 1 });
  const currentPage = paging.filters === filters ? paging.page : 1;
  const setCurrentPage = (page: number) => setPaging({filters, page});
  const { data: report, loading, error, reload } = useApiQuery(signal => getFinanceLedger({...JSON.parse(filters), page: currentPage}, signal), [filters, currentPage]);
  const options = useFinanceOptions();
  const courseOptions: FilterSelectOption[] = [{label: "All Courses", value: "all"}, ...(options.data?.courses || []).map(course => ({label: course, value: course}))];

  // Status options
  const statusOptions: FilterSelectOption[] = [
    { label: "All Status", value: "all" },
    { label: "Paid", value: "Paid", badgeDot: "bg-success" },
    { label: "Pending", value: "Pending", badgeDot: "bg-brand-red" },
    { label: "Partially Paid", value: "Partially Paid", badgeDot: "bg-burgundy-primary" },
    { label: "Refunded", value: "Refunded", badgeDot: "bg-text-muted" },
  ];

  // Period Timeframe options matching dropdown (Last 72 Hours, Last 7 Days, Monthly Overview, etc.)
  const periodOptions: FilterSelectOption[] = [
    { label: "Last 72 Hours", value: "last-72-hours", icon: Calendar },
    { label: "Last 7 Days", value: "last-7-days", icon: Calendar },
    { label: "Monthly Overview", value: "monthly", icon: Calendar },
    { label: "Quarterly Analysis", value: "quarterly", icon: Calendar },
    { label: "Semi-Annual", value: "semi-annual", icon: Calendar },
    { label: "Annual Performance", value: "annual", icon: Calendar },
  ];

  const filteredData = report?.data || [];
  const metrics = report?.metrics || {totalPayload: 0, totalYield: 0, totalAncillary: 0, totalApplication: 0, paidCount: 0, totalCount: 0};
  const programYields = useMemo(() => report?.programs || [], [report]);

  // Reduced motion preference
  const shouldReduceMotion = useReducedMotion();

  // Slider ref & scroll state for Program Yield Analysis cards
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollState = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 6);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
    }
  };

  useEffect(() => {
    checkScrollState();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollState, { passive: true });
      window.addEventListener("resize", checkScrollState);
      return () => {
        container.removeEventListener("scroll", checkScrollState);
        window.removeEventListener("resize", checkScrollState);
      };
    }
  }, [programYields]);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const firstCard = container.querySelector("[data-yield-card]") as HTMLElement | null;
      const cardWidth = firstCard ? firstCard.offsetWidth : 300;
      const gap = 12; // gap-3 = 12px
      const scrollStep = cardWidth + gap;

      container.scrollBy({
        left: direction === "left" ? -scrollStep : scrollStep,
        behavior: "smooth",
      });
    }
  };

  // Rank styling configuration by rank position
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
          glowClass: "bg-amber-400/10 group-hover:bg-amber-400/20",
          iconBoxClass: "border-amber-200 bg-amber-50 text-amber-600",
          icon: Trophy,
        };
      case 2:
        return {
          badgeClass: "border-burgundy-primary/20 bg-burgundy-primary/10 text-burgundy-primary",
          glowClass: "bg-burgundy-primary/5 group-hover:bg-burgundy-primary/10",
          iconBoxClass: "border-burgundy-primary/20 bg-burgundy-primary/10 text-burgundy-primary",
          icon: Medal,
        };
      case 3:
        return {
          badgeClass: "border-blue-200 bg-blue-50 text-blue-700",
          glowClass: "bg-blue-400/10 group-hover:bg-blue-400/20",
          iconBoxClass: "border-blue-200 bg-blue-50 text-blue-600",
          icon: Award,
        };
      case 4:
        return {
          badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
          glowClass: "bg-emerald-400/10 group-hover:bg-emerald-400/20",
          iconBoxClass: "border-emerald-200 bg-emerald-50 text-emerald-600",
          icon: GraduationCap,
        };
      default:
        return {
          badgeClass: "border-slate-200 bg-slate-50 text-slate-700",
          glowClass: "bg-slate-400/10 group-hover:bg-slate-400/20",
          iconBoxClass: "border-slate-200 bg-slate-50 text-slate-600",
          icon: TrendingUp,
        };
    }
  };

  const totalItems = report?.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = currentPage;
  const paginatedData = filteredData;

  // Check if any filter is active
  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedCourse !== "all" ||
    selectedStatus !== "all" ||
    selectedMethod !== "all" ||
    Boolean(earliestPaymentDate) ||
    selectedPeriod !== "semi-annual" ||
    sortBy !== "date-asc";

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCourse("all");
    setSelectedStatus("all");
    setSelectedMethod("all");
    setEarliestPaymentDate("");
    setSelectedPeriod("semi-annual");
    setSortBy("date-asc");
    setCurrentPage(1);
  };

  // Status badge renderer
  const renderStatusBadge = (status: PaymentReportRecord["status"]) => {
    switch (status) {
      case "Paid":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success-light px-2.5 py-0.5 text-xs font-semibold text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Paid
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-red/30 bg-brand-light-red/60 px-2.5 py-0.5 text-xs font-semibold text-brand-red">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-red" />
            Pending
          </span>
        );
      case "Partially Paid":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-burgundy-primary/20 bg-burgundy-primary/5 px-2.5 py-0.5 text-xs font-semibold text-burgundy-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-burgundy-primary" />
            Partial
          </span>
        );
      case "Refunded":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-border bg-brand-bg px-2.5 py-0.5 text-xs font-semibold text-text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-text-muted" />
            Refunded
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  /**
   * Reusable Table Column Definitions
   * Columns: Identity & Program, Course Yield, Application, Ancillary, Total Payload, Status
   */
  const columns = useMemo<ColumnDef<PaymentReportRecord>[]>(
    () => [
      {
        key: "no",
        header: "#",
        width: 55,
        minWidth: 45,
        maxWidth: 70,
        resizable: false,
        className: "border-r border-brand-border/40 text-center font-mono text-xs font-semibold text-text-secondary",
        headerClassName: "text-center",
        cell: (_item, index) => String((validCurrentPage - 1) * pageSize + index + 1).padStart(2, "0"),
      },
      {
        key: "identityProgram",
        header: (
          <button
            type="button"
            onClick={() => setSortBy((prev) => (prev === "date-asc" ? "date-desc" : "date-asc"))}
            className="group inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-text-secondary transition-colors hover:text-burgundy-primary"
            title="Sort by Payment Date: Earliest / Latest"
          >
            <span>IDENTITY & PROGRAM</span>
            <ArrowUpDown className="h-3 w-3 opacity-40 transition-opacity group-hover:opacity-100" />
          </button>
        ),
        width: 320,
        minWidth: 260,
        className: "border-r border-brand-border/40",
        headerClassName: "text-left",
        cell: (item) => (
          <div className="flex flex-col py-1">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-text-primary transition-colors hover:text-burgundy-primary">{item.studentName}</span>
              <span className="inline-flex items-center rounded-md border border-brand-border bg-brand-bg px-1.5 py-0.5 font-mono text-[10px] font-semibold text-text-secondary">
                {item.studentId}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-text-secondary">
              <span className="font-semibold text-burgundy-primary">{item.course}</span>
              {item.courseCode && <span className="font-mono text-[10px] text-text-muted">({item.courseCode})</span>}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-text-muted">
              <span className="font-mono font-medium text-text-secondary">{item.receiptNo}</span>
              <span>•</span>
              <span>{item.intake}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 font-medium text-text-secondary">
                <Calendar className="h-3 w-3 text-text-muted" />
                {item.date}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "courseYield",
        header: (
          <button
            type="button"
            onClick={() => setSortBy((prev) => (prev === "yield-desc" ? "date-asc" : "yield-desc"))}
            className="group ml-auto inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-text-secondary transition-colors hover:text-burgundy-primary"
            title="Sort by Course Yield: Highest First"
          >
            <span>COURSE YIELD</span>
            <ArrowUpDown className="h-3 w-3 opacity-40 transition-opacity group-hover:opacity-100" />
          </button>
        ),
        width: 155,
        minWidth: 125,
        className: "border-r border-brand-border/40 text-right whitespace-nowrap",
        headerClassName: "text-right",
        cell: (item) => {
          const yieldVal = item.courseYield ?? 0;
          return (
            <div className="flex flex-col items-end">
              <div className="font-mono text-xs font-bold text-emerald-700">
                ${yieldVal.toLocaleString()}
                <span className="ml-1 text-[10px] font-normal text-text-muted">SGD</span>
              </div>
              <span className="text-[10px] font-medium text-text-muted">Tuition Yield</span>
            </div>
          );
        },
      },
      {
        key: "application",
        header: "APPLICATION",
        width: 140,
        minWidth: 115,
        className: "border-r border-brand-border/40 text-right whitespace-nowrap",
        headerClassName: "text-right",
        cell: (item) => {
          const appFee = item.applicationFee ?? 0;
          return (
            <div className="flex flex-col items-end">
              <div className="font-mono text-xs font-semibold text-text-primary">
                ${appFee.toLocaleString()}
                <span className="ml-1 text-[10px] font-normal text-text-muted">SGD</span>
              </div>
              <span className="text-[10px] font-medium text-text-muted">Admission Fee</span>
            </div>
          );
        },
      },
      {
        key: "ancillary",
        header: "ANCILLARY",
        width: 140,
        minWidth: 115,
        className: "border-r border-brand-border/40 text-right whitespace-nowrap",
        headerClassName: "text-right",
        cell: (item) => {
          const ancFee = item.ancillaryFee ?? 0;
          return (
            <div className="flex flex-col items-end">
              <div className="font-mono text-xs font-semibold text-text-primary">
                ${ancFee.toLocaleString()}
                <span className="ml-1 text-[10px] font-normal text-text-muted">SGD</span>
              </div>
              <span className="text-[10px] font-medium text-text-muted">FPS & Admin Fee</span>
            </div>
          );
        },
      },
      {
        key: "totalPayload",
        header: (
          <button
            type="button"
            onClick={() => setSortBy((prev) => (prev === "payload-desc" ? "payload-asc" : "payload-desc"))}
            className="group ml-auto inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-text-secondary transition-colors hover:text-burgundy-primary"
            title="Sort by Total Payload: High to Low / Low to High"
          >
            <span>TOTAL PAYLOAD</span>
            <ArrowUpDown className="h-3 w-3 opacity-40 transition-opacity group-hover:opacity-100" />
          </button>
        ),
        width: 170,
        minWidth: 140,
        className: "border-r border-brand-border/40 text-right whitespace-nowrap",
        headerClassName: "text-right",
        cell: (item) => {
          const payload = item.totalPayload ?? item.totalFee;
          return (
            <div className="flex flex-col items-end">
              <div className="font-mono text-xs font-bold text-burgundy-primary">
                ${payload.toLocaleString()}
                <span className="ml-1 text-[10px] font-normal text-text-muted">SGD</span>
              </div>
              <span className="mt-0.5 inline-flex items-center gap-1 rounded bg-brand-bg px-1.5 py-0.5 text-[10px] font-medium text-slate-700">
                {item.paymentMethod}
              </span>
            </div>
          );
        },
      },
      {
        key: "status",
        header: "STATUS",
        width: 130,
        minWidth: 105,
        className: "text-center whitespace-nowrap",
        headerClassName: "text-center",
        cell: (item) => renderStatusBadge(item.status),
      },
    ],
    [validCurrentPage, pageSize],
  );

  if ((!report && loading) || error || options.error) return <AsyncStateView isLoading={loading} error={error || options.error} onRetry={() => { void reload(); void options.reload(); }}>{null}</AsyncStateView>;

  return (
    <div className="space-y-4">
      {/* 1. Summary Metric Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Payload Collections */}
        <div className="shadow-xs group relative overflow-hidden rounded-2xl border border-brand-border bg-white p-4 transition-all hover:border-brand-border/80 hover:shadow-sm">
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-burgundy-primary/5 blur-xl transition-colors group-hover:bg-burgundy-primary/10" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Total Payload</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-burgundy-primary/20 bg-burgundy-primary/10 text-burgundy-primary transition-transform group-hover:scale-110">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="font-mono text-2xl font-bold tracking-tight text-text-primary">${metrics.totalPayload.toLocaleString()}</span>
            <span className="ml-1 text-xs font-semibold text-text-secondary">SGD</span>
          </div>
          <p className="mt-1 text-[11px] text-text-muted">Gross student payload collections</p>
        </div>

        {/* Card 2: Course Yield */}
        <div className="shadow-xs group relative overflow-hidden rounded-2xl border border-brand-border bg-white p-4 transition-all hover:border-brand-border/80 hover:shadow-sm">
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-success-light/60 blur-xl transition-colors" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Course Yield</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-success/30 bg-success-light text-success transition-transform group-hover:scale-110">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="font-mono text-2xl font-bold tracking-tight text-success">${metrics.totalYield.toLocaleString()}</span>
            <span className="ml-1 text-xs font-semibold text-text-secondary">SGD</span>
          </div>
          <p className="mt-1 text-[11px] text-text-muted">Core institutional academic yield</p>
        </div>

        {/* Card 3: Ancillary & Application */}
        <div className="shadow-xs group relative overflow-hidden rounded-2xl border border-brand-border bg-white p-4 transition-all hover:border-brand-border/80 hover:shadow-sm">
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-brand-light-red blur-xl transition-colors group-hover:bg-brand-red/10" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Ancillary & App Fees</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-red/20 bg-brand-light-red text-brand-red transition-transform group-hover:scale-110">
              <PieChart className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="font-mono text-2xl font-bold tracking-tight text-brand-red">
              ${(metrics.totalAncillary + metrics.totalApplication).toLocaleString()}
            </span>
            <span className="ml-1 text-xs font-semibold text-text-secondary">SGD</span>
          </div>
          <p className="mt-1 text-[11px] text-text-muted">
            FPS (${metrics.totalAncillary.toLocaleString()}) & App (${metrics.totalApplication.toLocaleString()})
          </p>
        </div>

        {/* Card 4: Settled Transactions */}
        <div className="shadow-xs group relative overflow-hidden rounded-2xl border border-brand-border bg-white p-4 transition-all hover:border-brand-border/80 hover:shadow-sm">
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-emerald-500/10 blur-xl transition-colors group-hover:bg-emerald-500/20" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Settled Receipts</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-50 text-emerald-600 transition-transform group-hover:scale-110">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="font-mono text-2xl font-bold tracking-tight text-emerald-700">
              {metrics.paidCount}
              <span className="text-base text-text-muted">/{metrics.totalCount}</span>
            </span>
            <span className="ml-1.5 text-xs font-semibold text-text-secondary">Paid</span>
          </div>
          <p className="mt-1 text-[11px] text-text-muted">
            {metrics.totalCount > 0 ? Math.round((metrics.paidCount / metrics.totalCount) * 100) : 0}% settlement clearance rate
          </p>
        </div>
      </div>

      {/* 2. Program Yield Analysis Cards (Slider with Left & Right Buttons) */}
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-burgundy-primary/20 bg-burgundy-primary/10 text-burgundy-primary">
              <Trophy className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Program Yield Analysis</h3>
            </div>
            <span className="ml-1 inline-flex items-center gap-1 rounded-full border border-brand-border bg-brand-bg px-2.5 py-0.5 text-xs font-semibold text-text-secondary">
              <GraduationCap className="h-3.5 w-3.5 text-burgundy-primary" />
              {programYields.length} {programYields.length === 1 ? "Program" : "Programs"} Ranked
            </span>
          </div>

          {/* Slider Left and Right Controls */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <motion.button
              type="button"
              whileHover={canScrollLeft ? { scale: 1.08 } : undefined}
              whileTap={canScrollLeft ? { scale: 0.92 } : undefined}
              transition={{ duration: 0.15 }}
              onClick={() => handleScroll("left")}
              disabled={!canScrollLeft}
              className="shadow-xs flex h-8 w-8 items-center justify-center rounded-xl border border-brand-border bg-white text-text-secondary transition-colors hover:border-brand-border/80 hover:bg-brand-bg hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Previous programs"
              title="Previous programs"
            >
              <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
            </motion.button>
            <motion.button
              type="button"
              whileHover={canScrollRight ? { scale: 1.08 } : undefined}
              whileTap={canScrollRight ? { scale: 0.92 } : undefined}
              transition={{ duration: 0.15 }}
              onClick={() => handleScroll("right")}
              disabled={!canScrollRight}
              className="shadow-xs flex h-8 w-8 items-center justify-center rounded-xl border border-brand-border bg-white text-text-secondary transition-colors hover:border-brand-border/80 hover:bg-brand-bg hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Next programs"
              title="Next programs"
            >
              <ChevronRight className="h-4 w-4 stroke-[2.5]" />
            </motion.button>
          </div>
        </div>

        {/* Scrollable Cards Track */}
        <div
          ref={scrollContainerRef}
          className="no-scrollbar flex select-none items-stretch gap-3 overflow-x-auto scroll-smooth pb-1 pt-0.5"
        >
          {programYields.length === 0 ? (
            <div className="shadow-xs w-full rounded-2xl border border-dashed border-brand-border bg-white/60 p-6 text-center text-text-muted">
              <p className="text-sm font-semibold">No active program yields matching current filter</p>
              <p className="text-xs">Try selecting a different course or status filter.</p>
            </div>
          ) : (
            programYields.map((program, index) => {
              const rank = index + 1;
              const config = getRankStyle(rank);
              const IconComponent = config.icon;

              return (
                <motion.div
                  key={`yield-${program.course}-${index}`}
                  data-yield-card
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.42,
                    delay: Math.min(index * 0.05, 0.3),
                    ease: smoothEase,
                  }}
                  whileHover={
                    shouldReduceMotion
                      ? undefined
                      : {
                          y: -4,
                          boxShadow: "0 10px 25px -5px rgba(87, 0, 31, 0.08), 0 8px 10px -6px rgba(87, 0, 31, 0.04)",
                          transition: { duration: 0.2, ease: "easeOut" },
                        }
                  }
                  className="shadow-xs group relative flex w-[280px] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-2xl border border-brand-border bg-white p-4 transition-colors hover:border-brand-border/80 sm:w-[calc(50%-6px)] lg:w-[calc(25%-9px)] lg:min-w-[270px]"
                >
                  <div
                    className={`pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-xl transition-all duration-500 group-hover:scale-125 ${config.glowClass}`}
                  />

                  <div>
                    {/* Top Header: Rank & Icon */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${config.badgeClass}`}
                      >
                        Rank #{rank}
                      </span>
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-110 ${config.iconBoxClass}`}
                      >
                        <IconComponent className="h-5 w-5" />
                      </div>
                    </div>

                    {/* Course Name & Code */}
                    <div className="mt-2.5">
                      <div
                        className="truncate text-sm font-bold tracking-tight text-text-primary sm:text-base"
                        title={program.course}
                      >
                        {program.course}
                      </div>
                      <span className="text-[11px] font-semibold text-text-muted">{program.code ? `${program.code} • ` : ""}Yield Cohort</span>
                    </div>

                    {/* Amount Gross */}
                    <div className="mt-2.5">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">Course Yield Revenue</span>
                      <span className="font-mono text-2xl font-bold tracking-tight text-text-primary">${program.amountGross.toLocaleString()}</span>
                      <span className="ml-1 text-xs font-semibold text-text-secondary">SGD</span>
                    </div>
                  </div>

                  {/* Total Students */}
                  <div className="mt-3 flex items-center justify-between border-t border-brand-border/60 pt-2.5 text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-text-muted">
                      <Users className="h-3.5 w-3.5 text-text-muted" />
                      Total Students
                    </span>
                    <span className="font-mono text-xs font-bold text-text-primary">
                      {program.totalStudents} {program.totalStudents === 1 ? "Student" : "Students"}
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="shadow-xs flex flex-col gap-3 rounded-2xl border border-brand-border bg-white p-3.5 xl:flex-row xl:items-end xl:justify-between">
        <div className="w-full shrink-0 sm:max-w-xs lg:w-72 xl:w-80">
          <SearchInput
            label="Search"
            labelIcon={Search}
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery("")}
            placeholder="Search student, receipt, intake..."
            size="sm"
          />
        </div>

        <div className="flex flex-wrap items-end gap-2 sm:gap-2.5">
          {/* Course filter */}
          <FilterSelect
            label="Course"
            icon={GraduationCap}
            value={selectedCourse}
            options={courseOptions}
            onChange={setSelectedCourse}
            searchable
            size="sm"
            className="w-full sm:w-64"
          />

          {/* Status filter */}
          <FilterSelect
            label="Status"
            icon={CheckCircle2}
            value={selectedStatus}
            options={statusOptions}
            onChange={setSelectedStatus}
            size="sm"
            className="w-full sm:w-64"
          />

          {/* Earliest Payment Date Picker */}
          <FilterDatePicker
            label="Earliest Payment"
            icon={Calendar}
            buttonIcon={Calendar}
            value={earliestPaymentDate}
            onChange={setEarliestPaymentDate}
            placeholder="All Dates"
            size="sm"
            className="w-full sm:w-64"
          />

          {/* Period Timeframe Filter (Semi-Annual, Last 72 Hours, etc.) */}
          <FilterSelect
            label="Period"
            icon={Calendar}
            buttonIcon={Calendar}
            value={selectedPeriod}
            options={periodOptions}
            onChange={setSelectedPeriod}
            defaultValue="semi-annual"
            size="sm"
            className="w-full sm:w-64"
          />

          {/* Reset Filters */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="h-9 shrink-0 gap-1.5 text-xs text-text-secondary hover:text-burgundy-primary"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* 3. Payment Report Data Table (Reusable DataTable from src/components/ui/Table.tsx) */}
      <div className="space-y-3">
        <DataTable<PaymentReportRecord>
          columns={columns}
          data={paginatedData}
          keyExtractor={(item) => item.id}
          storageKey="ams_payment_report_payload_table_widths_v2"
          layout="fixed"
          density="normal"
          showResizeGuide={true}
          guideStorageKey="ams_payment_report_resize_guide_v2"
          guideNote={
            <>
              Drag divider lines <span className="font-bold">┊</span> between column headers to resize columns
            </>
          }
          emptyMessage={hasActiveFilters ? "No payment report records match your filters." : "No payment report records found."}
        />

        {/* 4. Pagination */}
        {totalItems > 0 && (
          <div className="shadow-xs rounded-2xl border border-brand-border bg-white px-4 py-3">
            <Pagination
              currentPage={validCurrentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              pageSizeOptions={[5, 8, 12, 20]}
              showPageSize
              showTotal
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentReportTab;
