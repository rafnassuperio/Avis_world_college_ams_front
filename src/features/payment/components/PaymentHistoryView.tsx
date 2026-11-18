import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { RotateCcw, CreditCard, CheckCircle2 } from "lucide-react";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { Pagination } from "@/components/ui/Pagination";
import { DataTable, ColumnDef } from "@/components/ui/Table";
import { PaymentRecord, PaymentHistoryItem } from "../types";
import { toast } from "@/components/common/ToastMessage";
import { dashboardContainerVariants, dashboardSectionVariants, smoothEase } from "@/components/animations/transitions";

export interface FlatPaymentTransaction extends PaymentHistoryItem {
  parentRecord: PaymentRecord;
  collegeName: string;
  studentName: string;
  studentCode: string;
  studentEmail: string;
  course: string;
  rowNumber: number;
  repCommission: number;
  agentCommission: number;
}

export interface PaymentHistoryViewProps {
  records: PaymentRecord[];
}

export const PaymentHistoryView: React.FC<PaymentHistoryViewProps> = ({ records }) => {
  const shouldReduceMotion = useReducedMotion();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("All Methods");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Smooth entrance variants
  const containerVariants = shouldReduceMotion ? { hidden: { opacity: 1 }, visible: { opacity: 1 } } : dashboardContainerVariants;
  const sectionVariants = shouldReduceMotion ? { hidden: { opacity: 1 }, visible: { opacity: 1 } } : dashboardSectionVariants;

  // Flatten all transactions from records for chronological ledger view
  const allTransactions: FlatPaymentTransaction[] = useMemo(() => {
    const list: FlatPaymentTransaction[] = [];
    let counter = 1;

    records.forEach((rec) => {
      rec.history.forEach((hist) => {
        list.push({
          ...hist,
          parentRecord: rec,
          collegeName: rec.collegeName || "Avis World College",
          studentName: rec.student.name,
          studentCode: rec.student.studentCode,
          studentEmail: rec.student.email,
          course: rec.student.course,
          rowNumber: counter++,
          repCommission: hist.repCommission ?? rec.repCommission ?? 0,
          agentCommission: hist.agentCommission ?? rec.agentCommission ?? 0,
        });
      });
    });

    return list;
  }, [records]);

  // Unique payment methods
  const methodOptions = ["All Methods", "Credit Card", "Debit Card", "Bank Transfer", "PayNow", "UPI"];

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((item) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.receiptNo.toLowerCase().includes(q) ||
        item.transactionRef.toLowerCase().includes(q) ||
        item.studentName.toLowerCase().includes(q) ||
        item.studentCode.toLowerCase().includes(q) ||
        item.collegeName.toLowerCase().includes(q) ||
        item.course.toLowerCase().includes(q) ||
        item.paymentMethod.toLowerCase().includes(q);

      const matchesMethod = selectedMethod === "All Methods" || item.paymentMethod.toLowerCase().includes(selectedMethod.toLowerCase());
      const matchesStatus = selectedStatus === "All Status" || item.status.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesMethod && matchesStatus;
    });
  }, [allTransactions, searchQuery, selectedMethod, selectedStatus]);

  // Reset pagination on filter change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedMethod, selectedStatus]);

  // Pagination slicing
  const totalItems = filteredTransactions.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedTransactions = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, safePage, pageSize]);

  const hasActiveFilters = Boolean(searchQuery || selectedMethod !== "All Methods" || selectedStatus !== "All Status");

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedMethod("All Methods");
    setSelectedStatus("All Status");
    setCurrentPage(1);
  };

  // Reusable columns definition for History DataTable
  const columns = useMemo<ColumnDef<FlatPaymentTransaction>[]>(
    () => [
      {
        key: "rowNumber",
        header: "NO",
        width: 65,
        minWidth: 50,
        className: "text-center font-mono font-semibold text-text-secondary border-r border-brand-border/40",
        headerClassName: "text-center",
        cell: (_tx, idx) => String((safePage - 1) * pageSize + idx + 1).padStart(2, "0"),
      },
      {
        key: "receiptNo",
        header: "RECEIPT #",
        width: 145,
        minWidth: 120,
        className: "border-r border-brand-border/40",
        cell: (tx) => (
          <div className="flex flex-col">
            <button
              type="button"
              onClick={() => console.log(tx.parentRecord)}
              className="text-left font-mono font-bold text-burgundy-primary transition-colors hover:underline"
              title="Click to view complete payment record details"
            >
              {tx.receiptNo}
            </button>
            <span className="text-[10px] text-text-muted">{tx.transactionRef}</span>
          </div>
        ),
      },
      {
        key: "date",
        header: "DATE & TIME",
        width: 135,
        minWidth: 110,
        className: "border-r border-brand-border/40 text-text-secondary",
        cell: (tx) => (
          <div className="flex flex-col">
            <span className="font-medium text-text-primary">{tx.date}</span>
            <span className="text-[10px] text-text-muted">{tx.time}</span>
          </div>
        ),
      },
      {
        key: "student",
        header: "STUDENT",
        width: 190,
        minWidth: 150,
        className: "border-r border-brand-border/40",
        cell: (tx) => (
          <div className="flex flex-col">
            <Link
              to={`/college/students/${tx.studentCode || tx.parentRecord.student.id}`}
              className="font-bold text-text-primary transition-colors hover:text-burgundy-primary hover:underline"
              title={`View ${tx.studentName}'s profile`}
            >
              {tx.studentName}
            </Link>
            <span className="font-mono text-[10px] text-text-muted">{tx.studentCode}</span>
          </div>
        ),
      },
      {
        key: "amount",
        header: "AMOUNT PAID",
        width: 135,
        minWidth: 110,
        className: "text-right border-r border-brand-border/40 font-mono font-extrabold text-text-primary whitespace-nowrap",
        headerClassName: "text-right",
        cell: (tx) => `${tx.currency} ${tx.amount.toLocaleString()}`,
      },
      {
        key: "repCommission",
        header: "REP COMMISSION",
        groupHeader: "COMMISSION",
        width: 155,
        minWidth: 120,
        className: "border-r border-brand-border/40 text-right font-mono font-bold text-burgundy-primary whitespace-nowrap",
        headerClassName: "text-right",
        cell: (tx) => `${tx.currency} ${(tx.repCommission ?? 0).toLocaleString()}`,
      },
      {
        key: "agentCommission",
        header: "AGENT COMMISSION",
        groupHeader: "COMMISSION",
        width: 165,
        minWidth: 130,
        className: "border-r border-brand-border/40 text-right font-mono font-bold text-brand-red whitespace-nowrap",
        headerClassName: "text-right",
        cell: (tx) => `${tx.currency} ${(tx.agentCommission ?? 0).toLocaleString()}`,
      },
      {
        key: "paymentMethod",
        header: "PAYMENT METHOD",
        width: 165,
        minWidth: 135,
        className: "border-r border-brand-border/40",
        cell: (tx) => (
          <div>
            <div className="flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 text-burgundy-primary" />
              <span className="font-medium text-text-primary">{tx.paymentMethod}</span>
            </div>
            {tx.cardNumberMasked && <span className="font-mono text-[10px] text-text-muted">{tx.cardNumberMasked}</span>}
          </div>
        ),
      },
      {
        key: "invoice",
        header: "Invoice",
        width: 185,
        minWidth: 165,
        className: "text-center whitespace-nowrap",
        headerClassName: "text-center",
        cell: (tx) => (
          <div className="flex flex-col items-center justify-center gap-1.5 py-1">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => {
                toast.success("Course Fee Receipt", {
                  description: `Course fee receipt downloaded for ${tx.studentName} (${tx.receiptNo}).`,
                });
              }}
              className="shadow-2xs hover:shadow-xs inline-flex w-full max-w-[155px] items-center justify-center rounded-lg bg-gradient-to-r from-brand-red to-burgundy-primary px-3 py-1.5 text-[11px] font-bold text-white transition-all hover:brightness-110 active:scale-95"
              title="Download Course Fee Receipt"
            >
              Course Fee Receipt
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => {
                toast.success("Application Fee Receipt", {
                  description: `Application fee receipt downloaded for ${tx.studentName} (${tx.receiptNo}).`,
                });
              }}
              className="shadow-2xs hover:shadow-xs inline-flex w-full max-w-[155px] items-center justify-center rounded-lg bg-burgundy-dark px-3 py-1.5 text-[11px] font-bold text-white transition-all hover:bg-palette-midnight active:scale-95"
              title="Download Application Fee Receipt"
            >
              Application Fee Receipt
            </motion.button>
          </div>
        ),
      },
    ],
    [safePage, pageSize],
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Top Navigation & Action Header */}
      <motion.div
        variants={sectionVariants}
        className="flex flex-col gap-3 rounded-2xl border border-brand-border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-text-primary sm:text-[16px]">Payment History & Transactions</h2>
          </div>
        </div>
      </motion.div>

      {/* Filter and Search Bar */}
      <motion.div
        variants={sectionVariants}
        className="shadow-2xs rounded-2xl border border-brand-border bg-white p-4"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="w-full flex-1 lg:max-w-md">
            <SearchInput
              label="Search Payment History"
              placeholder="Search by receipt #, student name, ID, or college..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>

          {/* Grouped Filters and Actions */}
          <div className="flex flex-wrap items-end gap-3">
            <FilterSelect
              label="Payment Method"
              icon={CreditCard}
              value={selectedMethod}
              defaultValue="All Methods"
              options={methodOptions.map((m) => ({ label: m, value: m }))}
              onChange={setSelectedMethod}
              className="w-full sm:w-56"
            />

            <FilterSelect
              label="Transaction Status"
              icon={CheckCircle2}
              value={selectedStatus}
              defaultValue="All Status"
              options={[
                { label: "All Status", value: "All Status" },
                { label: "Successful", value: "Successful", badgeDot: "bg-emerald-500" },
                { label: "Pending", value: "Pending", badgeDot: "bg-amber-500" },
                { label: "Refunded", value: "Refunded", badgeDot: "bg-rose-500" },
              ]}
              onChange={setSelectedStatus}
              className="w-full sm:w-56"
            />

            <AnimatePresence>
              {hasActiveFilters && (
                <motion.button
                  key="history-reset-filters-btn"
                  type="button"
                  initial={{ opacity: 0, scale: 0.9, x: 6 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: 6 }}
                  transition={{ duration: 0.2, ease: smoothEase }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleResetFilters}
                  className="inline-flex h-[38px] items-center gap-1 text-[11px] font-semibold text-brand-red transition-colors hover:underline"
                >
                  <RotateCcw className="h-3 w-3 transition-transform duration-300 hover:-rotate-90" />
                  <span>Reset filters</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Reusable DataTable with Resizable Columns and Persistence */}
      <motion.div variants={sectionVariants}>
        <DataTable<FlatPaymentTransaction>
          columns={columns}
          data={paginatedTransactions}
          keyExtractor={(tx) => tx.id}
          storageKey="ams_payment_history_table_widths_v3"
          layout="fixed"
          density="normal"
          showResizeGuide={true}
          guideStorageKey="ams_payment_history_resize_guide_dismissed"
          guideNote={
            <>
              Drag divider lines <span className="font-bold">┊</span> between column headers to resize columns
            </>
          }
          emptyMessage={hasActiveFilters ? "No payment transaction records match your filters." : "No payment transactions found."}
        />
      </motion.div>

      {/* Pagination */}
      {filteredTransactions.length > 0 && (
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
  );
};
