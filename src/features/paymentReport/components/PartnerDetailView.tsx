import React, { useState } from "react";
import {
  Mail,
  Phone,
  Building2,
  UserCheck,
  TrendingUp,
  Wallet,
  Clock,
  Copy,
  Check,
  Calendar,
  BadgePercent,
  GraduationCap,
  Receipt,
} from "lucide-react";
import { AgentRepReportRecord } from "../types";
import { mockPaymentReportList } from "../data/mockPaymentReportData";
import { cn } from "@/lib/utils";

interface PartnerDetailViewProps {
  partner: AgentRepReportRecord;
  entityType: "Agent" | "Representative";
}

export const PartnerDetailView: React.FC<PartnerDetailViewProps> = ({ partner, entityType }) => {
  const [copiedField, setCopiedField] = useState<"email" | "phone" | null>(null);

  const isAgent = entityType === "Agent";

  // Filter student transactions referring to this agent or representative
  const associatedTransactions = mockPaymentReportList.filter((item) => (isAgent ? item.agentName === partner.name : item.repName === partner.name));

  const handleCopy = (text: string, field: "email" | "phone") => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="space-y-4">
      {/* 1. Partner Profile Card */}
      <div
        className={cn(
          "shadow-xs relative overflow-hidden rounded-2xl border bg-white p-5 transition-all",
          isAgent
            ? "border-burgundy-primary/20 bg-gradient-to-br from-white via-brand-bg/60 to-brand-light-red/20"
            : "border-brand-red/20 bg-gradient-to-br from-white via-brand-bg/60 to-brand-light-red/30",
        )}
      >
        {/* Subtle decorative glow */}
        <div
          className={cn(
            "pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-2xl",
            isAgent ? "bg-burgundy-primary/10" : "bg-brand-red/10",
          )}
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            {/* Entity Badge / Avatar */}
            <div
              className={cn(
                "shadow-xs flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border font-mono text-xl font-bold",
                isAgent
                  ? "border-burgundy-primary/25 bg-burgundy-primary/10 text-burgundy-primary"
                  : "border-brand-red/25 bg-brand-light-red text-brand-red",
              )}
            >
              {isAgent ? <Building2 className="h-5 w-5" /> : <UserCheck className="h-5 w-5" />}
            </div>

            {/* Identity Details */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[18px] font-bold tracking-tight text-text-primary">{partner.name}</h2>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    isAgent
                      ? "border border-burgundy-primary/25 bg-burgundy-primary/10 text-burgundy-primary"
                      : "border border-brand-red/25 bg-brand-light-red text-brand-red",
                  )}
                >
                  {isAgent ? "Enrollment Agent" : "Regional Representative"}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    partner.payoutStatus === "Settled"
                      ? "border border-success/30 bg-success-light text-success"
                      : partner.payoutStatus === "Processing"
                        ? "border border-burgundy-primary/25 bg-burgundy-primary/10 text-burgundy-primary"
                        : "border border-brand-red/30 bg-brand-light-red/80 text-brand-red",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      partner.payoutStatus === "Settled"
                        ? "bg-success"
                        : partner.payoutStatus === "Processing"
                          ? "bg-burgundy-primary"
                          : "bg-brand-red",
                    )}
                  />
                  {partner.payoutStatus}
                </span>
              </div>

              <p className="text-xs font-medium text-text-secondary">{partner.organization}</p>

              {/* Contact Chips: Email & Phone */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2.5 pt-1 text-xs">
                {/* Email */}
                <div className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-brand-bg px-2.5 py-1 text-text-secondary">
                  <Mail className="h-3.5 w-3.5 text-text-muted" />
                  <a
                    href={`mailto:${partner.email}`}
                    className="font-medium hover:text-burgundy-primary hover:underline"
                  >
                    {partner.email}
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopy(partner.email, "email")}
                    className="ml-1 cursor-pointer text-text-muted transition-colors hover:text-text-primary"
                    title="Copy email"
                  >
                    {copiedField === "email" ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>

                {/* Phone */}
                <div className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-brand-bg px-2.5 py-1 text-text-secondary">
                  <Phone className="h-3.5 w-3.5 text-text-muted" />
                  <a
                    href={`tel:${partner.phone}`}
                    className="font-medium hover:text-burgundy-primary hover:underline"
                  >
                    {partner.phone}
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopy(partner.phone, "phone")}
                    className="ml-1 cursor-pointer text-text-muted transition-colors hover:text-text-primary"
                    title="Copy phone number"
                  >
                    {copiedField === "phone" ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>

                {/* Partner ID */}
                <div className="inline-flex items-center gap-1 rounded-lg border border-brand-border/80 bg-white px-2 py-1 font-mono text-[11px] font-semibold text-text-secondary">
                  <span>ID: {partner.id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Tag */}
          <div className="flex shrink-0 flex-row gap-2 sm:flex-col sm:items-end">
            <div className="flex items-center gap-1.5 rounded-xl border border-brand-border bg-brand-bg px-3 py-1.5">
              <BadgePercent className="h-4 w-4 text-burgundy-primary" />
              <div className="flex flex-col text-right">
                <span className="font-mono text-xs font-bold text-burgundy-primary">{partner.commissionRate}%</span>
                <span className="text-[10px] text-text-muted">Split Rate</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-brand-border bg-brand-bg px-3 py-1.5">
              <Calendar className="h-4 w-4 text-text-muted" />
              <div className="flex flex-col text-right">
                <span className="font-mono text-[11px] font-semibold text-text-secondary">{partner.lastPayoutDate}</span>
                <span className="text-[10px] text-text-muted">Last Payout</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Three Metric Cards: Channel Revenue, Processed Split, Awaiting Clearance */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Card 1: Channel Revenue */}
        <div className="shadow-xs group relative overflow-hidden rounded-2xl border border-brand-border bg-white p-4 transition-all hover:border-burgundy-primary/40 hover:shadow-sm">
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-burgundy-primary/5 blur-xl transition-colors group-hover:bg-burgundy-primary/10" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Channel Revenue</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-burgundy-primary/20 bg-burgundy-primary/10 text-burgundy-primary transition-transform group-hover:scale-110">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="font-mono text-2xl font-bold tracking-tight text-text-primary">${formatCurrency(partner.totalCourseVolume)}</span>
            <span className="ml-1 text-xs font-semibold text-text-secondary">SGD</span>
          </div>
          <p className="mt-1 text-[11px] text-text-muted">Gross tuition referrals generated</p>
        </div>

        {/* Card 2: Processed Split */}
        <div className="shadow-xs group relative overflow-hidden rounded-2xl border border-brand-border bg-white p-4 transition-all hover:border-brand-red/40 hover:shadow-sm">
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-brand-light-red blur-xl transition-colors group-hover:bg-brand-red/10" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Processed Split</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-red/20 bg-brand-light-red text-brand-red transition-transform group-hover:scale-110">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="font-mono text-2xl font-bold tracking-tight text-brand-red">${formatCurrency(partner.amountPaid)}</span>
            <span className="ml-1 text-xs font-semibold text-text-secondary">SGD</span>
          </div>
          <p className="mt-1 text-[11px] text-text-muted">Disbursed commission remuneration</p>
        </div>

        {/* Card 3: Awaiting Clearance */}
        <div className="shadow-xs group relative overflow-hidden rounded-2xl border border-brand-border bg-white p-4 transition-all hover:border-burgundy-primary/40 hover:shadow-sm">
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-burgundy-primary/5 blur-xl transition-colors group-hover:bg-burgundy-primary/10" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Awaiting Clearance</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-burgundy-primary/20 bg-burgundy-primary/10 text-burgundy-primary transition-transform group-hover:scale-110">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <span
              className={cn("font-mono text-2xl font-bold tracking-tight", partner.amountPending > 0 ? "text-burgundy-primary" : "text-text-muted")}
            >
              ${formatCurrency(partner.amountPending)}
            </span>
            <span className="ml-1 text-xs font-semibold text-text-secondary">SGD</span>
          </div>
          <p className="mt-1 text-[11px] text-text-muted">Pending institutional audit clearance</p>
        </div>
      </div>

      {/* 3. Associated Referrals & Payment Ledger */}
      <div className="shadow-xs overflow-hidden rounded-2xl border border-brand-border bg-white">
        <div className="flex items-center justify-between border-b border-brand-border/60 bg-brand-bg/40 px-4 py-3">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-burgundy-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
              Referred Candidate Settlements ({associatedTransactions.length})
            </h3>
          </div>
          <span className="text-[11px] text-text-muted">Lifetime referrals: {partner.studentsReferredCount} candidates</span>
        </div>

        {associatedTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <GraduationCap className="h-8 w-8 text-text-muted" />
            <p className="mt-2 text-xs font-semibold text-text-primary">No active tranche settlements</p>
            <p className="text-[11px] text-text-muted">Candidate records for {partner.name} will appear here as enrollments settle.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-brand-border bg-brand-bg/60 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                <tr>
                  <th className="px-3.5 py-2.5">Candidate</th>
                  <th className="px-3.5 py-2.5">Program & Intake</th>
                  <th className="px-3.5 py-2.5 text-right">Fee Payload</th>
                  <th className="px-3.5 py-2.5 text-right">Earned Split</th>
                  <th className="px-3.5 py-2.5 text-center">Status</th>
                  <th className="px-3.5 py-2.5 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/50 text-text-primary">
                {associatedTransactions.map((tx) => {
                  const commission = isAgent ? tx.agentCommission : tx.repCommission;
                  return (
                    <tr
                      key={tx.id}
                      className="transition-colors hover:bg-brand-bg/40"
                    >
                      <td className="px-3.5 py-2.5">
                        <div className="font-bold text-text-primary">{tx.studentName}</div>
                        <div className="font-mono text-[10px] text-text-muted">{tx.studentId}</div>
                      </td>
                      <td className="px-3.5 py-2.5">
                        <div className="font-medium text-burgundy-primary">{tx.course}</div>
                        <div className="text-[10px] text-text-muted">{tx.intake}</div>
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-mono font-semibold">
                        ${tx.totalFee.toLocaleString()}
                        <span className="ml-1 text-[10px] text-text-muted">SGD</span>
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-mono font-bold text-burgundy-primary">
                        ${commission.toLocaleString()}
                        <span className="ml-1 text-[10px] text-text-muted">SGD</span>
                      </td>
                      <td className="px-3.5 py-2.5 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            tx.status === "Paid"
                              ? "border border-success/30 bg-success-light text-success"
                              : "border border-brand-red/30 bg-brand-light-red text-brand-red",
                          )}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3.5 py-2.5 text-right font-mono text-[11px] text-text-secondary">{tx.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
