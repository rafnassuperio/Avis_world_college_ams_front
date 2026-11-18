import React, { useState, useMemo } from "react";
import { Building, UserCheck, Clock, DollarSign, Building2 } from "lucide-react";
import { mockAgentRepReportList } from "../data/mockPaymentReportData";
import { AgentRepReportRecord } from "../types";
import { PartnerSidebarList } from "./PartnerSidebarList";
import { PartnerDetailView } from "./PartnerDetailView";
import { cn } from "@/lib/utils";

export const AgentRepReportTab: React.FC = () => {
  // Active partner type sub-tab: "Agent" vs "Representative"
  const [activePartnerType, setActivePartnerType] = useState<"Agent" | "Representative">("Agent");

  // Executive Top Metrics calculations
  const metrics = useMemo(() => {
    return {
      totalCommissionPool: 28729.766,
      activeEnrollmentAgents: 7,
      activeRegionalReps: 5,
      pendingClearance: -15603.94,
    };
  }, []);

  // Filter partners by entity type
  const agents = useMemo(() => mockAgentRepReportList.filter((p) => p.entityType === "Agent"), []);

  const representatives = useMemo(() => mockAgentRepReportList.filter((p) => p.entityType === "Representative"), []);

  // Active list based on active tab
  const currentPartners = activePartnerType === "Agent" ? agents : representatives;

  // Selected partner state (distinct per tab for persistent selection)
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id || "");
  const [selectedRepId, setSelectedRepId] = useState<string>(representatives[0]?.id || "");

  const selectedPartner = useMemo(() => {
    if (activePartnerType === "Agent") {
      return agents.find((p) => p.id === selectedAgentId) || agents[0];
    }
    return representatives.find((p) => p.id === selectedRepId) || representatives[0];
  }, [activePartnerType, agents, representatives, selectedAgentId, selectedRepId]);

  const handleSelectPartner = (partner: AgentRepReportRecord) => {
    if (partner.entityType === "Agent") {
      setSelectedAgentId(partner.id);
    } else {
      setSelectedRepId(partner.id);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Summary Metric Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Commission Pool */}
        <div className="shadow-xs group relative overflow-hidden rounded-2xl border border-brand-border bg-white p-4 transition-all hover:border-brand-border/80 hover:shadow-sm">
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-brand-light-red blur-xl transition-colors group-hover:bg-brand-red/10" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Total Commission Pool</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-red/20 bg-brand-light-red text-brand-red transition-transform group-hover:scale-110">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="font-mono text-2xl font-bold tracking-tight text-brand-red">
              ${metrics.totalCommissionPool.toLocaleString("en-US", { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
            </span>
            <span className="ml-1 text-xs font-semibold text-text-secondary">SGD</span>
          </div>
          <p className="mt-1 text-[11px] text-text-muted">Total earned commissions across channels</p>
        </div>

        {/* Card 2: Active Enrollment Agents */}
        <div className="shadow-xs group relative overflow-hidden rounded-2xl border border-brand-border bg-white p-4 transition-all hover:border-brand-border/80 hover:shadow-sm">
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-burgundy-primary/5 blur-xl transition-colors group-hover:bg-burgundy-primary/10" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Active Enrollment Agents</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-burgundy-primary/20 bg-burgundy-primary/10 text-burgundy-primary transition-transform group-hover:scale-110">
              <Building className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="font-mono text-2xl font-bold tracking-tight text-burgundy-primary">{metrics.activeEnrollmentAgents}</span>
            <span className="ml-1 text-xs font-semibold text-text-secondary">Agents</span>
          </div>
          <p className="mt-1 text-[11px] text-text-muted">Contracted recruitment partner agencies</p>
        </div>

        {/* Card 3: Active Regional Reps */}
        <div className="shadow-xs group relative overflow-hidden rounded-2xl border border-brand-border bg-white p-4 transition-all hover:border-brand-border/80 hover:shadow-sm">
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-success-light/60 blur-xl transition-colors" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Active Regional Reps</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-success/30 bg-success-light text-success transition-transform group-hover:scale-110">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="font-mono text-2xl font-bold tracking-tight text-text-primary">{metrics.activeRegionalReps}</span>
            <span className="ml-1 text-xs font-semibold text-text-secondary">Reps</span>
          </div>
          <p className="mt-1 text-[11px] text-text-muted">Designated institutional regional liaisons</p>
        </div>

        {/* Card 4: Pending Clearance */}
        <div className="shadow-xs group relative overflow-hidden rounded-2xl border border-brand-border bg-white p-4 transition-all hover:border-brand-border/80 hover:shadow-sm">
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-burgundy-primary/5 blur-xl transition-colors group-hover:bg-burgundy-primary/10" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Pending Clearance</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-burgundy-primary/20 bg-burgundy-primary/10 text-burgundy-primary transition-transform group-hover:scale-110">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="font-mono text-2xl font-bold tracking-tight text-burgundy-primary">
              ${metrics.pendingClearance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="ml-1 text-xs font-semibold text-text-secondary">SGD</span>
          </div>
          <p className="mt-1 text-[11px] text-text-muted">Balance awaiting finance disbursement</p>
        </div>
      </div>

      {/* 2. Two Distinct Design Tabs: 1. Agent Details & 2. Representative Details */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Tab 1: Agent Details */}
        <button
          type="button"
          onClick={() => setActivePartnerType("Agent")}
          className={cn(
            "group relative flex cursor-pointer items-center justify-between overflow-hidden rounded-2xl border p-4 text-left transition-all",
            activePartnerType === "Agent"
              ? "border-burgundy-primary bg-gradient-to-r from-burgundy-primary/10 via-burgundy-primary/[0.04] to-white shadow-sm ring-1 ring-burgundy-primary/30"
              : "hover:shadow-2xs border-brand-border bg-white hover:border-brand-border/80 hover:bg-brand-bg/40",
          )}
        >
          <div className="flex items-center gap-3.5">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all",
                activePartnerType === "Agent"
                  ? "shadow-xs border-burgundy-primary/30 bg-burgundy-primary text-white"
                  : "border-brand-border bg-brand-bg text-text-secondary group-hover:border-burgundy-primary/20 group-hover:text-burgundy-primary",
              )}
            >
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={cn("text-sm font-bold tracking-tight", activePartnerType === "Agent" ? "text-burgundy-primary" : "text-text-primary")}
                >
                  1. Agent Details
                </span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold",
                    activePartnerType === "Agent"
                      ? "border border-burgundy-primary/25 bg-burgundy-primary/10 text-burgundy-primary"
                      : "border border-brand-border bg-brand-bg text-text-secondary",
                  )}
                >
                  {agents.length} Agencies
                </span>
              </div>
              <p className="mt-0.5 text-xs text-text-muted">Contracted recruitment partners & external consultants</p>
            </div>
          </div>

          {/* Active Accent Indicator */}
          {activePartnerType === "Agent" && (
            <div className="hidden items-center gap-1.5 sm:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-burgundy-primary" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-burgundy-primary">Active</span>
            </div>
          )}
        </button>

        {/* Tab 2: Representative Details */}
        <button
          type="button"
          onClick={() => setActivePartnerType("Representative")}
          className={cn(
            "group relative flex cursor-pointer items-center justify-between overflow-hidden rounded-2xl border p-4 text-left transition-all",
            activePartnerType === "Representative"
              ? "border-brand-red bg-gradient-to-r from-brand-light-red/40 via-brand-light-red/10 to-white shadow-sm ring-1 ring-brand-red/30"
              : "hover:shadow-2xs border-brand-border bg-white hover:border-brand-border/80 hover:bg-brand-bg/40",
          )}
        >
          <div className="flex items-center gap-3.5">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all",
                activePartnerType === "Representative"
                  ? "shadow-xs border-brand-red/30 bg-brand-red text-white"
                  : "border-brand-border bg-brand-bg text-text-secondary group-hover:border-brand-red/30 group-hover:text-brand-red",
              )}
            >
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={cn("text-sm font-bold tracking-tight", activePartnerType === "Representative" ? "text-brand-red" : "text-text-primary")}
                >
                  2. Representative Details
                </span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold",
                    activePartnerType === "Representative"
                      ? "border border-brand-red/25 bg-brand-light-red text-brand-red"
                      : "border border-brand-border bg-brand-bg text-text-secondary",
                  )}
                >
                  {representatives.length} Liaisons
                </span>
              </div>
              <p className="mt-0.5 text-xs text-text-muted">Designated institutional regional officers & counselors</p>
            </div>
          </div>

          {/* Active Accent Indicator */}
          {activePartnerType === "Representative" && (
            <div className="hidden items-center gap-1.5 sm:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-brand-red" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-red">Active</span>
            </div>
          )}
        </button>
      </div>

      {/* 3. Main Split Layout: Left = Partner List Sidebar | Right = Details + 3 Cards */}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
        {/* Left Side: Sidebar showing Partner List */}
        <div className="lg:col-span-4">
          <PartnerSidebarList
            partners={currentPartners}
            selectedPartnerId={selectedPartner?.id || ""}
            onSelectPartner={handleSelectPartner}
            entityType={activePartnerType}
          />
        </div>
        {/* Right Side: Agent / Representative Details, Contact Info, 3 Cards & Referral Ledger */}
        <div className="lg:col-span-8">
          {selectedPartner ? (
            <PartnerDetailView
              partner={selectedPartner}
              entityType={activePartnerType}
            />
          ) : (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-brand-border bg-white text-center text-xs text-text-muted">
              Select a partner from the sidebar to inspect details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentRepReportTab;
