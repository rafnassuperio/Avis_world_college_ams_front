import React from "react";
import { motion } from "framer-motion";
import { Calculator, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FeeSummaryCardProps {
  totalFee?: number;
  outstandingAmount?: number;
  isSettled?: boolean;
  courseCode?: string;
  courseName?: string;
  tuitionFee?: number;
  feeProtection?: number;
  amountExclGst?: number;
  gstAmount?: number;
  gstRatePercent?: number;
  totalCourseFee?: number;
  totalAmountAfterComm?: number;
  adminAppFee?: number;
  className?: string;
}

export const FeeSummaryCard: React.FC<FeeSummaryCardProps> = ({
  totalFee = 2561.5,
  outstandingAmount,
  isSettled = false,
  courseCode = "DHM",
  courseName = "Diploma in Hospitality Mgt.",
  tuitionFee = 2000.0,
  feeProtection = 150.0,
  amountExclGst = 2150.0,
  gstAmount = 193.5,
  gstRatePercent = 9,
  totalCourseFee = 2343.5,
  totalAmountAfterComm = 681.5,
  adminAppFee = 218.0,
  className,
}) => {
  const fmt = (val: number) => {
    return val.toLocaleString("en-US", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    });
  };

  const currentOutstanding = outstandingAmount !== undefined ? outstandingAmount : isSettled ? 0 : totalFee;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "relative flex flex-col justify-between overflow-hidden rounded-2xl border border-brand-border bg-white p-5 shadow-card transition-all duration-200 hover:shadow-card-hover",
        className,
      )}
    >
      {/* Subtle Accent Glow */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-burgundy-primary/5 blur-2xl" />

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-border/70 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-burgundy-primary/10 text-burgundy-primary">
              <Calculator className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">Fee Summary</h3>
              <p className="text-[11px] text-text-muted">Approved institutional fee schedule</p>
            </div>
          </div>
          <span className="rounded-full border border-burgundy-primary/20 bg-burgundy-primary/5 px-2.5 py-0.5 text-[11px] font-bold text-burgundy-primary">
            {courseCode}
          </span>
        </div>

        {/* Total Fee & Outstanding Amount Key Stat Cards */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Total Fee */}
          <div className="rounded-xl border border-brand-border/80 bg-brand-bg/50 p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Total Fee</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-mono text-base font-extrabold text-text-primary">SGD {fmt(totalFee)}</span>
            </div>
            <p className="mt-0.5 text-[10px] text-text-secondary">Gross institutional sum</p>
          </div>

          {/* Outstanding Amount */}
          <div className="rounded-xl border border-burgundy-primary/25 bg-brand-light-red/30 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-burgundy-primary">Outstanding</span>
              <span className={cn("h-2 w-2 rounded-full", isSettled ? "bg-success" : "animate-pulse bg-brand-red")} />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-mono text-base font-extrabold text-burgundy-primary">
                SGD {fmt(currentOutstanding)}
              </span>
            </div>
            <p className="mt-0.5 text-[10px] text-text-secondary">
              {isSettled ? "Fully settled" : "Due for settlement"}
            </p>
          </div>
        </div>

        {/* Sub-Card: Fee Breakdown - DHM */}
        <div className="rounded-xl border border-brand-border/70 bg-white p-3.5 shadow-2xs">
          <div className="mb-2.5 flex items-center justify-between border-b border-brand-border/60 pb-2">
            <div className="flex items-center gap-1.5">
              <Receipt className="h-3.5 w-3.5 text-burgundy-primary" />
              <span className="text-xs font-bold text-text-primary">Fee Breakdown - {courseCode}</span>
            </div>
            <span className="text-[10px] font-medium text-text-muted">{courseName}</span>
          </div>

          {/* Breakdown Rows */}
          <div className="space-y-2 text-xs">
            {/* 1. Tuition Fee */}
            <div className="flex items-center justify-between text-text-secondary">
              <span>Tuition Fee</span>
              <span className="font-mono font-semibold text-text-primary">SGD {fmt(tuitionFee)}</span>
            </div>

            {/* 2. Fee Protection */}
            <div className="flex items-center justify-between text-text-secondary">
              <span>Fee Protection</span>
              <span className="font-mono font-semibold text-text-primary">SGD {fmt(feeProtection)}</span>
            </div>

            {/* 3. Amount (Excl. GST) */}
            <div className="flex items-center justify-between border-t border-brand-border/60 pt-1.5 font-medium text-text-primary">
              <span className="font-bold">Amount (Excl. GST)</span>
              <span className="font-mono font-bold text-text-primary">SGD {fmt(amountExclGst)}</span>
            </div>

            {/* 4. GST (9%) */}
            <div className="flex items-center justify-between text-text-secondary">
              <span className="flex items-center gap-1">
                GST ({gstRatePercent}%)
                <span className="text-[10px] text-text-muted">Govt. Tax</span>
              </span>
              <span className="font-mono font-semibold text-text-primary">SGD {fmt(gstAmount)}</span>
            </div>

            {/* 5. Total Course Fee */}
            <div className="flex items-center justify-between rounded-lg border border-burgundy-primary/20 bg-brand-light-red/40 px-2.5 py-2 font-bold text-burgundy-primary">
              <span className="text-xs uppercase tracking-wide">Total Course Fee</span>
              <span className="font-mono text-sm font-extrabold text-burgundy-primary">
                SGD {fmt(totalCourseFee)}
              </span>
            </div>
          </div>
        </div>

        {/* Highlight Box: After Commission */}
        <div className="rounded-xl border border-success/30 bg-gradient-to-r from-success-light/70 via-white to-success-light/40 p-3 shadow-2xs">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-success">After Commission</span>
              <p className="text-xs font-bold text-text-primary">Total amount after commission</p>
              <p className="mt-0.5 text-[10px] text-text-secondary">Net college revenue after recruitment incentives</p>
            </div>
            <div className="text-right">
              <span className="font-mono text-base font-black text-success">
                SGD {fmt(totalAmountAfterComm)}
              </span>
              <span className="block text-[10px] font-bold text-success/80">29.1% retained</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footnote */}
      <div className="mt-4 border-t border-brand-border/60 pt-2 text-[10px] text-text-muted">
        <span className="font-semibold text-text-secondary">Institutional Note:</span> Total fee SGD {fmt(totalFee)} includes SGD {fmt(adminAppFee)} application & registration fees (inclusive of {gstRatePercent}% GST).
      </div>
    </motion.div>
  );
};

