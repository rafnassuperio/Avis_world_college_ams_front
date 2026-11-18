import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion, Variants } from "framer-motion";
import {
  Search,
  RotateCcw,
  Eye,
  CreditCard,
  CheckCircle2,
  History,
  Download,
  X,
  ArrowRight,
  GraduationCap,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal,
} from "lucide-react";
import BreadcrumbBanner from "@/components/common/BreadcrumbBanner";
import { DataTable, ColumnDef } from "@/components/ui/Table";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { SearchInput } from "@/components/ui/SearchInput";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/common/ToastMessage";
import { dashboardContainerVariants, dashboardSectionVariants, smoothEase } from "@/components/animations/transitions";
import { PaymentRecord, PaymentPageView } from "./types";
import { PaymentHistoryModal } from "./components/PaymentHistoryModal";
import { PaymentHistoryView } from "./components/PaymentHistoryView";
import { getPaymentRecords, savePaymentRecords } from "./utils/paymentStorage";
import { cn } from "@/lib/utils";

export const PaymentPage: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active view mode: "payments-table" or "payment-history" synchronized with URL
  const isHistoryView = searchParams.get("view") === "history";
  const currentView: PaymentPageView = isHistoryView ? "payment-history" : "payments-table";

  const handleSwitchToHistory = () => {
    setSearchParams({ view: "history" });
  };

  const handleSwitchToPayments = () => {
    navigate("/payment");
  };

  // Dataset state synchronized with storage
  const [records, setRecords] = useState<PaymentRecord[]>(() => getPaymentRecords());

  // Listen for storage synchronization events across views/pages
  useEffect(() => {
    const handleSync = () => {
      setRecords(getPaymentRecords());
    };
    window.addEventListener("ams_payment_records_updated", handleSync);
    return () => window.removeEventListener("ams_payment_records_updated", handleSync);
  }, []);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("All Courses");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedCardStatus, setSelectedCardStatus] = useState("All Card Status");
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");
  const [sortMethod, setSortMethod] = useState<string>("default");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Selected record for Payment History modal (opened via red eye button)
  const [selectedRecordForModal, setSelectedRecordForModal] = useState<PaymentRecord | null>(null);

  // Animations
  const containerVariants = shouldReduceMotion ? { hidden: { opacity: 1 }, visible: { opacity: 1 } } : dashboardContainerVariants;
  const sectionVariants = shouldReduceMotion ? { hidden: { opacity: 1 }, visible: { opacity: 1 } } : dashboardSectionVariants;

  // Smooth page view transition between table and payment history ledger
  const pageViewVariants: Variants = useMemo(() => {
    if (shouldReduceMotion) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.15 } },
        exit: { opacity: 0, transition: { duration: 0.12 } },
      };
    }
    return {
      initial: { opacity: 0, y: 14, filter: "blur(2px)" },
      animate: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.35, ease: smoothEase },
      },
      exit: {
        opacity: 0,
        y: -10,
        filter: "blur(2px)",
        transition: { duration: 0.22, ease: smoothEase },
      },
    };
  }, [shouldReduceMotion]);

  // Range validation: min should not exceed max
  const isRangeInvalid = Boolean(minAmount.trim() !== "" && maxAmount.trim() !== "" && Number(minAmount) > Number(maxAmount));

  // Unique course options dynamically extracted from dataset
  const courseOptions = useMemo(() => {
    const set = new Set<string>();
    records.forEach((rec) => {
      if (rec.student?.course) {
        set.add(rec.student.course);
      }
    });
    return [
      { label: "All Courses", value: "All Courses" },
      ...Array.from(set)
        .sort((a, b) => a.localeCompare(b))
        .map((course) => ({ label: course, value: course })),
    ];
  }, [records]);

  // Filtered & sorted dataset (matching course, status, card, and typed min/max amounts, sorted min to max)
  const filteredRecords = useMemo(() => {
    const minVal = minAmount.trim() !== "" ? Number(minAmount) : null;
    const maxVal = maxAmount.trim() !== "" ? Number(maxAmount) : null;

    const list = records.filter((rec) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        rec.no.includes(q) ||
        rec.student.name.toLowerCase().includes(q) ||
        rec.student.studentCode.toLowerCase().includes(q) ||
        rec.student.course.toLowerCase().includes(q) ||
        (rec.notes && rec.notes.toLowerCase().includes(q));

      const matchesStatus = selectedStatus === "All Status" || rec.status.toLowerCase() === selectedStatus.toLowerCase();
      const matchesCourse = selectedCourse === "All Courses" || rec.student.course.toLowerCase() === selectedCourse.toLowerCase();
      const matchesCard = selectedCardStatus === "All Card Status" || rec.cardStatus.toLowerCase() === selectedCardStatus.toLowerCase();

      // Number text typing min and max amount filters
      const matchesMinAmount = minVal === null || rec.totalFee >= minVal;
      const matchesMaxAmount = maxVal === null || rec.totalFee <= maxVal;

      return matchesSearch && matchesStatus && matchesCourse && matchesCard && matchesMinAmount && matchesMaxAmount;
    });

    // Sort method: minimum to maximum sort (default) or maximum to minimum
    if (sortMethod === "min-to-max") {
      return [...list].sort((a, b) => a.totalFee - b.totalFee);
    }
    if (sortMethod === "max-to-min") {
      return [...list].sort((a, b) => b.totalFee - a.totalFee);
    }

    return list;
  }, [records, searchQuery, selectedStatus, selectedCourse, selectedCardStatus, minAmount, maxAmount, sortMethod]);

  // Reset pagination on filter, typed amount, or sort method changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, selectedCourse, selectedCardStatus, minAmount, maxAmount, sortMethod]);

  // Pagination slicing
  const totalItems = filteredRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRecords = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, safePage, pageSize]);

  // Check if any filters or sorting are active
  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedCourse !== "All Courses" ||
    selectedStatus !== "All Status" ||
    selectedCardStatus !== "All Card Status" ||
    minAmount.trim() !== "" ||
    maxAmount.trim() !== "" ||
    sortMethod !== "default";

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCourse("All Courses");
    setSelectedStatus("All Status");
    setSelectedCardStatus("All Card Status");
    setMinAmount("");
    setMaxAmount("");
    setSortMethod("min-to-max");
    setCurrentPage(1);
  };

  // Card Reset action handler (Paid/Settled -> Pending)
  const handleResetCard = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecords((prev) => {
      const next = prev.map((r) => {
        if (r.id === id) {
          toast.info("Payment Reset", {
            description: `Payment status for ${r.student.name} reset to Pending.`,
          });
          return { ...r, status: "Pending" as const, cardStatus: "Pending" as const };
        }
        return r;
      });
      savePaymentRecords(next);
      return next;
    });
  };

  // Breadcrumb items based on active view with explicit /payment path
  const breadcrumbParts = useMemo(() => {
    if (currentView === "payment-history") {
      return [
        {
          name: "Payment",
          path: "/payment",
          onClick: handleSwitchToPayments,
        },
        {
          name: "Payment History",
        },
      ];
    }
    return [
      {
        name: "Payment",
        path: "/payment",
      },
    ];
  }, [currentView]);

  /**
   * Reusable Table Column Definitions with Grouped Commission Headers
   * Fully resizable via Table.tsx DataTable drag dividers!
   */
  const columns = useMemo<ColumnDef<PaymentRecord>[]>(
    () => [
      {
        key: "no",
        header: "NO",
        width: 65,
        minWidth: 50,
        className: "border-r border-brand-border/40 text-center font-mono font-semibold text-text-secondary",
        headerClassName: "text-center",
        cell: (item) => item.no,
      },
      {
        key: "date",
        header: "DATE",
        width: 120,
        minWidth: 95,
        className: "border-r border-brand-border/40 whitespace-nowrap font-medium text-text-primary",
        cell: (item) => item.date,
      },
      {
        key: "student",
        header: "STUDENT",
        width: 220,
        minWidth: 170,
        className: "border-r border-brand-border/40",
        cell: (item) => (
          <div className="flex flex-col">
            <Link
              to={`/payment/settle/${item.id}`}
              className="font-bold text-text-primary transition-colors hover:text-burgundy-primary hover:underline"
              title={`Settle payment for ${item.student.name}`}
            >
              {item.student.name}
            </Link>
            <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
              <span>•</span>
              <span
                className="max-w-[250px] font-medium text-text-secondary"
                title={item.student.course}
              >
                {item.student.course}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "totalFee",
        header: (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => {
              setSortMethod((prev) => {
                if (prev === "min-to-max") return "max-to-min";
                if (prev === "max-to-min") return "default";
                return "min-to-max";
              });
            }}
            className="group ml-auto inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-text-secondary transition-colors hover:text-burgundy-primary"
            title="Click to toggle: Minimum to Maximum / Maximum to Minimum sort"
          >
            <span>TOTAL FEE</span>
            <motion.span
              key={sortMethod}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2, ease: smoothEase }}
              className="inline-flex items-center"
            >
              {sortMethod === "min-to-max" ? (
                <ArrowUp className="h-3.5 w-3.5 stroke-[2.5] text-burgundy-primary" />
              ) : sortMethod === "max-to-min" ? (
                <ArrowDown className="h-3.5 w-3.5 stroke-[2.5] text-burgundy-primary" />
              ) : (
                <ArrowUpDown className="h-3 w-3 opacity-40 transition-opacity group-hover:opacity-100" />
              )}
            </motion.span>
          </motion.button>
        ),
        width: 140,
        minWidth: 110,
        className: "border-r border-brand-border/40 text-right font-mono font-bold text-text-primary whitespace-nowrap",
        headerClassName: "text-right",
        cell: (item) => `${item.currency} ${item.totalFee.toLocaleString()}`,
      },
      {
        key: "amountToCollege",
        header: "AMOUNT TO COLLEGE",
        width: 165,
        minWidth: 130,
        className: "border-r border-brand-border/40 text-right font-mono font-bold text-emerald-700 whitespace-nowrap",
        headerClassName: "text-right",
        cell: (item) => `${item.currency} ${item.amountToCollege.toLocaleString()}`,
      },
      {
        key: "repCommission",
        header: "REP COMMISSION",
        groupHeader: "COMMISSION",
        width: 155,
        minWidth: 120,
        className: "border-r border-brand-border/40 text-right font-mono font-bold text-burgundy-primary whitespace-nowrap",
        headerClassName: "text-right",
        cell: (item) => `${item.currency} ${item.repCommission.toLocaleString()}`,
      },
      {
        key: "agentCommission",
        header: "AGENT COMMISSION",
        groupHeader: "COMMISSION",
        width: 165,
        minWidth: 130,
        className: "border-r border-brand-border/40 text-right font-mono font-bold text-brand-red whitespace-nowrap",
        headerClassName: "text-right",
        cell: (item) => `${item.currency} ${item.agentCommission.toLocaleString()}`,
      },
      {
        key: "status",
        header: "STATUS",
        width: 115,
        minWidth: 90,
        className: "border-r border-brand-border/40 text-center whitespace-nowrap",
        headerClassName: "text-center",
        cell: (item) => (
          <span
            className={cn(
              "shadow-2xs inline-flex items-center justify-center rounded-md px-3 py-1 text-xs font-bold text-white",
              item.status === "Paid" ? "bg-[#00a854]" : "bg-amber-500",
            )}
          >
            {item.status}
          </span>
        ),
      },
      {
        key: "card",
        header: "CARD",
        width: 175,
        minWidth: 140,
        className: "border-r border-brand-border/40 text-center whitespace-nowrap",
        headerClassName: "text-center",
        cell: (item) => {
          const isPaid = item.status === "Paid" || item.cardStatus === "Settled";

          if (isPaid) {
            return (
              <div className="inline-flex items-center justify-center gap-1.5">
                <Link
                  to={`/payment/settle/${item.id}`}
                  className="shadow-2xs inline-flex items-center justify-center rounded-md bg-[#00a854] px-2.5 py-1 text-xs font-semibold text-white transition-all duration-200 hover:brightness-105"
                  title={`View settlement details for ${item.student.name}`}
                >
                  Settled
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  type="button"
                  onClick={(e) => handleResetCard(item.id, e)}
                  className="shadow-2xs inline-flex cursor-pointer items-center justify-center rounded-md border border-burgundy-primary/25 bg-burgundy-primary/10 px-2.5 py-1 text-xs font-semibold text-burgundy-primary transition-all hover:bg-burgundy-primary hover:text-white"
                  title={`Reset payment status to Pending for ${item.student.name}`}
                >
                  Reset
                </motion.button>
              </div>
            );
          }

          return (
            <div className="inline-flex items-center justify-center">
              <Link
                to={`/payment/settle/${item.id}`}
                className="shadow-2xs hover:shadow-xs inline-flex cursor-pointer items-center justify-center rounded-md border border-emerald-600/30 bg-emerald-100 px-3.5 py-1 text-xs font-semibold text-emerald-700 transition-all hover:border-[#00a854] hover:bg-[#00a854] hover:text-white"
                title={`Settle payment for ${item.student.name}`}
              >
                Settle
              </Link>
            </div>
          );
        },
      },
      {
        key: "paymentHistory",
        header: "PAYMENT HISTORY",
        width: 145,
        minWidth: 115,
        className: "text-center whitespace-nowrap",
        headerClassName: "text-center",
        cell: (item) => (
          <div className="flex items-center justify-center">
            <motion.button
              whileHover={{ scale: 1.14, rotate: 6 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              type="button"
              onClick={() => setSelectedRecordForModal(item)}
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-brand-red to-burgundy-primary text-white shadow-sm transition-shadow duration-200 hover:shadow-md hover:shadow-brand-red/35"
              title={`View Payment History for ${item.student.name}`}
              aria-label={`View Payment History for ${item.student.name}`}
            >
              <Eye className="h-4 w-4 stroke-[2.2]" />
            </motion.button>
          </div>
        ),
      },
    ],
    [sortMethod],
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative mx-auto w-full space-y-4 pt-1"
    >
      {/* Breadcrumb Banner with Action Buttons */}
      <motion.div variants={sectionVariants}>
        <BreadcrumbBanner
          title={currentView === "payment-history" ? "Payment History" : "Payment & Commissions"}
          items={breadcrumbParts}
          showBackButton={true}
          backPath={currentView === "payment-history" ? "/payment" : "/"}
          onBack={
            currentView === "payment-history"
              ? handleSwitchToPayments
              : () => {
                  if (window.history.state && window.history.state.idx > 0) {
                    navigate(-1);
                  } else {
                    navigate("/");
                  }
                }
          }
          backAriaLabel={currentView === "payment-history" ? "Back to Payments" : "Go back"}
          containerClassName="mb-0"
        />
      </motion.div>

      {/* Render Payment History Page View when active with smooth transition */}
      <AnimatePresence
        mode="wait"
        initial={false}
      >
        {currentView === "payment-history" ? (
          <motion.div
            key="payment-history-view"
            variants={pageViewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <PaymentHistoryView records={records} />
          </motion.div>
        ) : (
          /* Render Primary Fee & Commission Payments Table View */
          <motion.div
            key="payments-table-view"
            variants={pageViewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-4"
          >
            {/* Search, Filter Toolbar, and Payment History Page Button */}
            <motion.div
              variants={sectionVariants}
              className="shadow-2xs rounded-2xl border border-brand-border bg-white p-3.5 transition-all duration-200 sm:p-4"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                {/* Search Box */}
                <div className="w-full flex-1 lg:max-w-md">
                  <SearchInput
                    label="Search Payments"
                    labelIcon={Search}
                    placeholder="Search by student name, code, course..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                  />
                </div>

                {/* Action Buttons: Payment History with page button */}
                <div className="flex items-center gap-2 sm:ml-auto lg:mb-0.5">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="burgundy"
                      size="sm"
                      onClick={handleSwitchToHistory}
                      className="group gap-1.5 shadow-sm transition-all"
                      title="Open full Payment History page with transactions ledger"
                    >
                      <History className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-[-25deg]" />
                      <span>Payment History</span>
                      <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        toast.success("Payments Exported", {
                          description: `Exported ${filteredRecords.length} payment records.`,
                        });
                      }}
                      className="group gap-1.5 rounded-xl border-brand-border bg-white text-xs font-semibold text-text-primary transition-all hover:bg-brand-bg hover:text-burgundy-primary"
                      title="Export payments table to spreadsheet"
                    >
                      <Download className="h-3.5 w-3.5 text-burgundy-primary transition-transform duration-200 group-hover:-translate-y-0.5" />
                      <span>Export</span>
                    </Button>
                  </motion.div>
                </div>
              </div>

              {/* FilterSelect Dropdowns Section */}
              <div className="mt-3 flex flex-col gap-2.5 border-t border-brand-border/60 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Filter By Attributes</span>
                  <AnimatePresence>
                    {hasActiveFilters && (
                      <motion.button
                        key="header-reset-btn"
                        type="button"
                        initial={{ opacity: 0, scale: 0.9, x: 6 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, x: 6 }}
                        transition={{ duration: 0.2, ease: smoothEase }}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={handleResetFilters}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-red transition-colors hover:underline"
                      >
                        <RotateCcw className="h-3 w-3 transition-transform duration-300 hover:-rotate-90" />
                        <span>Reset filters</span>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                  {/* 1. Filter by Course */}
                  <FilterSelect
                    label="Filter by Course"
                    icon={GraduationCap}
                    value={selectedCourse}
                    defaultValue="All Courses"
                    searchable={true}
                    searchPlaceholder="Search courses..."
                    align="left"
                    options={courseOptions}
                    onChange={setSelectedCourse}
                  />

                  {/* 2. Filter by Status */}
                  <FilterSelect
                    label="Filter by Status"
                    icon={CheckCircle2}
                    value={selectedStatus}
                    defaultValue="All Status"
                    align="left"
                    options={[
                      { label: "All Status", value: "All Status" },
                      { label: "Paid", value: "Paid", badgeDot: "bg-[#00a854]" },
                      { label: "Pending", value: "Pending", badgeDot: "bg-amber-500" },
                    ]}
                    onChange={setSelectedStatus}
                  />

                  {/* 3. Filter by Card Status */}
                  <FilterSelect
                    label="Filter by Card Status"
                    icon={CreditCard}
                    value={selectedCardStatus}
                    defaultValue="All Card Status"
                    align="left"
                    options={[
                      { label: "All Card Status", value: "All Card Status" },
                      { label: "Settled", value: "Settled", badgeDot: "bg-[#00a854]" },
                      { label: "Pending", value: "Pending", badgeDot: "bg-amber-500" },
                    ]}
                    onChange={setSelectedCardStatus}
                  />

                  {/* 4. Min Amount (Number Text Typing) */}
                  <Input
                    label="Min Amount"
                    labelIcon={SlidersHorizontal}
                    type="text"
                    inputMode="numeric"
                    size="sm"
                    isMono={true}
                    prefix="SGD"
                    placeholder="e.g. 10,000"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value.replace(/[^0-9]/g, ""))}
                    hasError={isRangeInvalid}
                    helperText={isRangeInvalid ? "Min exceeds Max" : undefined}
                    suffix={
                      <AnimatePresence>
                        {minAmount ? (
                          <motion.button
                            key="clear-min"
                            type="button"
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.6 }}
                            transition={{ duration: 0.15 }}
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.85 }}
                            onClick={() => setMinAmount("")}
                            className="pointer-events-auto rounded p-0.5 text-text-muted transition-colors hover:text-brand-red"
                            title="Clear Min Amount"
                          >
                            <X className="h-3 w-3" />
                          </motion.button>
                        ) : undefined}
                      </AnimatePresence>
                    }
                  />

                  {/* 5. Max Amount (Number Text Typing) */}
                  <Input
                    label="Max Amount"
                    labelIcon={SlidersHorizontal}
                    type="text"
                    inputMode="numeric"
                    size="sm"
                    isMono={true}
                    prefix="SGD"
                    placeholder="e.g. 20,000"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value.replace(/[^0-9]/g, ""))}
                    hasError={isRangeInvalid}
                    suffix={
                      <AnimatePresence>
                        {maxAmount ? (
                          <motion.button
                            key="clear-max"
                            type="button"
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.6 }}
                            transition={{ duration: 0.15 }}
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.85 }}
                            onClick={() => setMaxAmount("")}
                            className="pointer-events-auto rounded p-0.5 text-text-muted transition-colors hover:text-brand-red"
                            title="Clear Max Amount"
                          >
                            <X className="h-3 w-3" />
                          </motion.button>
                        ) : undefined}
                      </AnimatePresence>
                    }
                  />
                </div>

                {/* Active Filter Chips */}
                <AnimatePresence initial={false}>
                  {hasActiveFilters && (
                    <motion.div
                      key="active-filters-chips-bar"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.28, ease: smoothEase }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                        <span className="text-[11px] font-medium text-text-muted">Active:</span>

                        <AnimatePresence mode="popLayout">
                          {selectedCourse !== "All Courses" && (
                            <motion.span
                              layout
                              initial={{ opacity: 0, scale: 0.85, y: -4 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8, y: -4 }}
                              transition={{ duration: 0.2, ease: smoothEase }}
                              className="shadow-2xs inline-flex items-center gap-1 rounded-lg border border-burgundy-primary/25 bg-burgundy-primary/10 px-2 py-0.5 text-[11px] font-semibold text-burgundy-primary"
                            >
                              <span>
                                Course: <strong className="font-bold">{selectedCourse}</strong>
                              </span>
                              <button
                                type="button"
                                onClick={() => setSelectedCourse("All Courses")}
                                className="rounded p-0.5 transition-colors hover:bg-burgundy-primary/20 hover:text-brand-red"
                                title="Remove course filter"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </motion.span>
                          )}

                          {selectedStatus !== "All Status" && (
                            <motion.span
                              layout
                              initial={{ opacity: 0, scale: 0.85, y: -4 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8, y: -4 }}
                              transition={{ duration: 0.2, ease: smoothEase }}
                              className="shadow-2xs inline-flex items-center gap-1 rounded-lg border border-burgundy-primary/25 bg-burgundy-primary/10 px-2 py-0.5 text-[11px] font-semibold text-burgundy-primary"
                            >
                              <span>
                                Status: <strong className="font-bold">{selectedStatus}</strong>
                              </span>
                              <button
                                type="button"
                                onClick={() => setSelectedStatus("All Status")}
                                className="rounded p-0.5 transition-colors hover:bg-burgundy-primary/20 hover:text-brand-red"
                                title="Remove status filter"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </motion.span>
                          )}

                          {selectedCardStatus !== "All Card Status" && (
                            <motion.span
                              layout
                              initial={{ opacity: 0, scale: 0.85, y: -4 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8, y: -4 }}
                              transition={{ duration: 0.2, ease: smoothEase }}
                              className="shadow-2xs inline-flex items-center gap-1 rounded-lg border border-burgundy-primary/25 bg-burgundy-primary/10 px-2 py-0.5 text-[11px] font-semibold text-burgundy-primary"
                            >
                              <span>
                                Card: <strong className="font-bold">{selectedCardStatus}</strong>
                              </span>
                              <button
                                type="button"
                                onClick={() => setSelectedCardStatus("All Card Status")}
                                className="rounded p-0.5 transition-colors hover:bg-burgundy-primary/20 hover:text-brand-red"
                                title="Remove card filter"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </motion.span>
                          )}

                          {minAmount.trim() !== "" && (
                            <motion.span
                              layout
                              initial={{ opacity: 0, scale: 0.85, y: -4 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8, y: -4 }}
                              transition={{ duration: 0.2, ease: smoothEase }}
                              className="shadow-2xs inline-flex items-center gap-1 rounded-lg border border-burgundy-primary/25 bg-burgundy-primary/10 px-2 py-0.5 text-[11px] font-semibold text-burgundy-primary"
                            >
                              <span>
                                Min Fee: <strong className="font-mono font-bold">SGD {Number(minAmount).toLocaleString()}</strong>
                              </span>
                              <button
                                type="button"
                                onClick={() => setMinAmount("")}
                                className="rounded p-0.5 transition-colors hover:bg-burgundy-primary/20 hover:text-brand-red"
                                title="Remove min amount filter"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </motion.span>
                          )}

                          {maxAmount.trim() !== "" && (
                            <motion.span
                              layout
                              initial={{ opacity: 0, scale: 0.85, y: -4 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8, y: -4 }}
                              transition={{ duration: 0.2, ease: smoothEase }}
                              className="shadow-2xs inline-flex items-center gap-1 rounded-lg border border-burgundy-primary/25 bg-burgundy-primary/10 px-2 py-0.5 text-[11px] font-semibold text-burgundy-primary"
                            >
                              <span>
                                Max Fee: <strong className="font-mono font-bold">SGD {Number(maxAmount).toLocaleString()}</strong>
                              </span>
                              <button
                                type="button"
                                onClick={() => setMaxAmount("")}
                                className="rounded p-0.5 transition-colors hover:bg-burgundy-primary/20 hover:text-brand-red"
                                title="Remove max amount filter"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </motion.span>
                          )}
                        </AnimatePresence>

                        <motion.button
                          layout
                          type="button"
                          onClick={handleResetFilters}
                          className="ml-1 text-[11px] font-bold text-brand-red transition-colors hover:underline"
                        >
                          Clear all filters
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div
              variants={sectionVariants}
              className="space-y-4"
            >
              <DataTable<PaymentRecord>
                columns={columns}
                data={paginatedRecords}
                keyExtractor={(item) => item.id}
                storageKey="ams_payment_fee_table_widths_v2"
                layout="fixed"
                density="normal"
                showResizeGuide={true}
                guideStorageKey="ams_payment_table_resize_guide_v2"
                guideNote={
                  <>
                    Drag divider lines <span className="font-bold">┊</span> between column headers to resize columns
                  </>
                }
                emptyMessage={hasActiveFilters ? "No payment records match your filters." : "No payment records found."}
              />

              {/* Pagination Component */}
              {filteredRecords.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: smoothEase }}
                >
                  <Pagination
                    currentPage={safePage}
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
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment History View Button Modal */}
      {selectedRecordForModal && (
        <PaymentHistoryModal
          isOpen={!!selectedRecordForModal}
          onClose={() => setSelectedRecordForModal(null)}
          record={selectedRecordForModal}
        />
      )}
    </motion.div>
  );
};

export default PaymentPage;
