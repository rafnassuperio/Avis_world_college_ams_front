import React from "react";
import { motion } from "framer-motion";
import { Calculator, FileText, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AppFeeSummaryCardProps {
  totalFee?: number;
  outstandingAmount?: number;
  isSettled?: boolean;
  processingFee?: number;
  verificationFee?: number;
  amountExclGst?: number;
  gstAmount?: number;
  gstRatePercent?: number;
  currency?: string;
  className?: string;
}

export const AppFeeSummaryCard: React.FC<AppFeeSummaryCardProps> = ({
  totalFee = 0.0,
  outstandingAmount = 0.0,
  isSettled = true,
  processingFee = 0.0,
  verificationFee = 0.0,
  amountExclGst = 0.0,
  gstAmount = 0.0,
  gstRatePercent = 9,
  currency = "SGD",
  className,
}) => {
  const fmt = (val: number) => {
    return val.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

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
      {/* Ambient Brand Accent Glow */}
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
              <p className="text-[11px] text-text-muted">Application & student pass processing schedule</p>
            </div>
          </div>
          <span className="rounded-full border border-burgundy-primary/20 bg-burgundy-primary/5 px-2.5 py-0.5 text-[11px] font-bold text-burgundy-primary">
            Application
          </span>
        </div>

        {/* Total Fee & Outstanding Amount Key Stat Cards (Requested Values) */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* 1. Total Fee - SGD 0.00 */}
          <div className="rounded-xl border border-brand-border/80 bg-brand-bg/50 p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Total Fee</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-mono text-base font-extrabold text-text-primary">
                {currency} {fmt(totalFee)}
              </span>
            </div>
            <p className="mt-0.5 text-[10px] text-text-secondary">Official institutional fee</p>
          </div>

          {/* 2. Outstanding Amount - SGD 0.00 */}
          <div className="rounded-xl border border-burgundy-primary/25 bg-brand-light-red/30 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-burgundy-primary">
                Outstanding Amount
              </span>
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  outstandingAmount === 0 ? "bg-success" : "animate-pulse bg-brand-red",
                )}
              />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-mono text-base font-extrabold text-burgundy-primary">
                {currency} {fmt(outstandingAmount)}
              </span>
            </div>
            <p className="mt-0.5 text-[10px] text-text-secondary">
              {outstandingAmount === 0 ? "No balance pending" : "Due for settlement"}
            </p>
          </div>
        </div>

        {/* Sub-Card: Application Fee Breakdown */}
        <div className="rounded-xl border border-brand-border/70 bg-white p-3.5 shadow-2xs">
          <div className="mb-2.5 flex items-center justify-between border-b border-brand-border/60 pb-2">
            <div className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-burgundy-primary" />
              <span className="text-xs font-bold text-text-primary">Application Fee Breakdown</span>
            </div>
            <span className="text-[10px] font-medium text-text-muted">Standard Institutional Schedule</span>
          </div>

          {/* Breakdown Rows */}
          <div className="space-y-2 text-xs">
            {/* 1. Processing Fee */}
            <div className="flex items-center justify-between text-text-secondary">
              <span>Application Processing Fee</span>
              <span className="font-mono font-semibold text-text-primary">{currency} {fmt(processingFee)}</span>
            </div>

            {/* 2. Verification Fee */}
            <div className="flex items-center justify-between text-text-secondary">
              <span>Student Pass Document Verification</span>
              <span className="font-mono font-semibold text-text-primary">{currency} {fmt(verificationFee)}</span>
            </div>

            {/* 3. Amount Excl. GST */}
            <div className="flex items-center justify-between border-t border-brand-border/60 pt-1.5 font-medium text-text-primary">
              <span className="font-bold">Amount (Excl. GST)</span>
              <span className="font-mono font-bold text-text-primary">{currency} {fmt(amountExclGst)}</span>
            </div>

            {/* 4. GST (9%) */}
            <div className="flex items-center justify-between text-text-secondary">
              <span className="flex items-center gap-1">
                GST ({gstRatePercent}%)
                <span className="text-[10px] text-text-muted">Govt. Tax</span>
              </span>
              <span className="font-mono font-semibold text-text-primary">{currency} {fmt(gstAmount)}</span>
            </div>

            {/* 5. Total Application Fee */}
            <div className="flex items-center justify-between rounded-lg border border-burgundy-primary/20 bg-brand-light-red/40 px-2.5 py-2 font-bold text-burgundy-primary">
              <span className="text-xs uppercase tracking-wide">Total Application Fee</span>
              <span className="font-mono text-sm font-extrabold text-burgundy-primary">
                {currency} {fmt(totalFee)}
              </span>
            </div>
          </div>
        </div>

        {/* Status Callout Card */}
        <div className="rounded-xl border border-success/30 bg-gradient-to-r from-success-light/70 via-white to-success-light/40 p-3 shadow-2xs">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/20 text-success">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-success">Fee Clearance Status</span>
                <p className="text-xs font-bold text-text-primary">
                  {outstandingAmount === 0 ? "Application Fee Cleared" : "Payment Pending"}
                </p>
                <p className="mt-0.5 text-[10px] text-text-secondary">
                  {outstandingAmount === 0
                    ? "Student application requirements satisfied. No pending balance due."
                    : "Outstanding application processing payment required."}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center rounded-full border border-success/30 bg-success-light px-2 py-0.5 text-[10px] font-bold text-success">
                {isSettled ? "Settled" : "Pending"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footnote */}
      <div className="mt-4 border-t border-brand-border/60 pt-2 text-[10px] text-text-muted">
        <span className="font-semibold text-text-secondary">Notice:</span> Application fees cover registration, administrative document validation, and student pass submission processing.
      </div>
    </motion.div>
  );
};

