import React from "react";
import { motion } from "framer-motion";
import { BadgePercent, SlidersHorizontal, Building2, UserCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface CommissionFeeSummaryCardProps {
  agentShare: number;
  repShare: number;
  totalCourseFee?: number;
  totalAmountAfterComm?: number;
  tierLabel?: string;
  onOpenChangeSplitModal: () => void;
  className?: string;
}

export const CommissionFeeSummaryCard: React.FC<CommissionFeeSummaryCardProps> = ({
  agentShare = 940.0,
  repShare = 940.0,
  totalAmountAfterComm = 681.5,
  onOpenChangeSplitModal,
  className,
}) => {
  const totalCommissionSplit = agentShare + repShare;

  const fmt = (val: number) => {
    return val.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const agentPct = totalCommissionSplit > 0 ? (agentShare / totalCommissionSplit) * 100 : 50;
  const repPct = totalCommissionSplit > 0 ? (repShare / totalCommissionSplit) * 100 : 50;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.05 }}
      className={cn(
        "relative flex flex-col justify-between overflow-hidden rounded-2xl border border-brand-border bg-white p-5 shadow-card transition-all duration-200 hover:shadow-card-hover",
        className,
      )}
    >
      {/* Subtle Accent Glow */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-brand-red/5 blur-2xl" />

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-border/70 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-burgundy-primary/10 text-burgundy-primary">
              <BadgePercent className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">Commission Fee Summary</h3>
              <p className="text-[11px] text-text-muted">Agent & rep compensation breakdown</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenChangeSplitModal}
            className="h-7 gap-1 border-burgundy-primary/30 px-2.5 text-[11px] font-bold text-burgundy-primary hover:bg-brand-light-red/40"
          >
            <SlidersHorizontal className="h-3 w-3" />
            <span>Change Split</span>
          </Button>
        </div>

        {/* Stat Cards: Total Commission Pool & College Net Retained */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Total Commission */}
          <div className="rounded-xl border border-brand-red/25 bg-brand-light-red/30 p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-red">Total Commission</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-mono text-base font-extrabold text-brand-red">SGD {fmt(totalCommissionSplit)}</span>
            </div>
            <p className="mt-0.5 text-[10px] text-text-secondary">Combined partner pool</p>
          </div>

          {/* College Retained */}
          <div className="rounded-xl border border-success/30 bg-success-light/40 p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-success">College Net</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-mono text-base font-extrabold text-success">SGD {fmt(totalAmountAfterComm)}</span>
            </div>
            <p className="mt-0.5 text-[10px] text-text-secondary">29.1% net realization</p>
          </div>
        </div>

        {/* Commission Split Section (Requested Content) */}
        <div className="shadow-2xs space-y-3 rounded-xl border border-burgundy-primary/25 bg-gradient-to-br from-white via-brand-bg/50 to-brand-light-red/25 p-3.5">
          <div className="flex items-center justify-between border-b border-brand-border/70 pb-2">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5 text-burgundy-primary" />
              <span className="text-xs font-bold text-text-primary">Commission Split</span>
            </div>
            <button
              type="button"
              onClick={onOpenChangeSplitModal}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-burgundy-primary hover:text-burgundy-sidebar hover:underline"
            >
              <span className="rounded-full bg-burgundy-primary/10 px-2 py-0.5 text-[10px]">
                {agentShare === repShare ? "Equal 50/50" : `${agentPct.toFixed(0)}/${repPct.toFixed(0)}`}
              </span>
            </button>
          </div>

          {/* Exact rows requested by user: */}
          {/* Agent Share - SGD 940.00 */}
          {/* Rep Share - SGD 940.00 */}
          {/* Total - SGD 1,880.00 */}
          <div className="space-y-2 text-xs">
            {/* 1. Agent Share */}
            <div className="flex items-center justify-between text-text-secondary">
              <span className="flex items-center gap-1.5 font-medium">
                <Building2 className="h-3.5 w-3.5 text-burgundy-primary" />
                Agent Share
              </span>
              <span className="font-mono font-bold text-text-primary">SGD {fmt(agentShare)}</span>
            </div>

            {/* 2. Rep Share */}
            <div className="flex items-center justify-between text-text-secondary">
              <span className="flex items-center gap-1.5 font-medium">
                <UserCheck className="h-3.5 w-3.5 text-brand-red" />
                Rep Share
              </span>
              <span className="font-mono font-bold text-text-primary">SGD {fmt(repShare)}</span>
            </div>

            {/* 3. Total */}
            <div className="flex items-center justify-between border-t border-brand-border/70 pt-2 font-bold text-text-primary">
              <span className="text-xs uppercase tracking-wide">Total</span>
              <span className="font-mono text-sm font-extrabold text-burgundy-primary">SGD {fmt(totalCommissionSplit)}</span>
            </div>
          </div>

          {/* Mini distribution visualization */}
          <div className="space-y-1 pt-1">
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-brand-border/60">
              <div
                style={{ width: `${agentPct}%` }}
                className="bg-burgundy-primary transition-all duration-300"
                title={`Agent Share: SGD ${fmt(agentShare)}`}
              />
              <div
                style={{ width: `${repPct}%` }}
                className="bg-[#a64c61] transition-all duration-300"
                title={`Rep Share: SGD ${fmt(repShare)}`}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-text-muted">
              <span>Agent Share: {agentPct.toFixed(0)}%</span>
              <span>Rep Share: {repPct.toFixed(0)}%</span>
            </div>
          </div>

          {/* Action Button: Change Split */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenChangeSplitModal}
            className="w-full justify-center border-burgundy-primary/30 text-xs font-bold text-burgundy-primary hover:bg-brand-light-red/40"
          >
            <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
            Change Split
          </Button>
        </div>

        {/* Detailed Partner Breakdown Cards */}
        <div className="space-y-2.5">
          {/* 1. Agent Commission Card */}
          <div className="rounded-xl border border-brand-border/80 bg-brand-bg/40 p-3 transition-colors hover:border-burgundy-primary/30 hover:bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-burgundy-primary/20 bg-burgundy-primary/10 text-burgundy-primary">
                  <Building2 className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-text-primary">Agent Commission</p>
                  <p className="text-[10px] text-text-muted">Central Enrollment Agency</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs font-bold text-text-primary">SGD {fmt(agentShare)}</span>
                <span className="block text-[10px] font-medium text-text-muted">{agentPct.toFixed(1)}% split</span>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-brand-border/50 pt-1.5 text-[10px] text-text-secondary">
              <span>Payable upon course commencement</span>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 font-bold text-amber-700">Pending Settle</span>
            </div>
          </div>

          {/* 2. Representative Commission Card */}
          <div className="rounded-xl border border-brand-border/80 bg-brand-bg/40 p-3 transition-colors hover:border-burgundy-primary/30 hover:bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-brand-red/20 bg-brand-light-red text-brand-red">
                  <UserCheck className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-text-primary">Rep Commission (Rep Comm.)</p>
                  <p className="text-[10px] text-text-muted">Regional Field Officer</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs font-bold text-text-primary">SGD {fmt(repShare)}</span>
                <span className="block text-[10px] font-medium text-text-muted">{repPct.toFixed(1)}% split</span>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-brand-border/50 pt-1.5 text-[10px] text-text-secondary">
              <span>Regional recruitment bonus</span>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 font-bold text-amber-700">Pending Clearance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Verification Footer */}
      <div className="mt-4 flex items-center gap-1.5 border-t border-brand-border/60 pt-2 text-[10px] text-text-muted">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-success" />
        <span>
          Commission Pool: SGD {fmt(totalCommissionSplit)} split as Agent SGD {fmt(agentShare)} & Rep SGD {fmt(repShare)}.
        </span>
      </div>
    </motion.div>
  );
};
