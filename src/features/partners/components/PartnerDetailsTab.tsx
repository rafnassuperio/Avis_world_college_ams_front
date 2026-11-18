import React from "react";
import { AgentItem } from "@/features/agents/types";
import { RepresentativeItem } from "@/features/representatives/types";
import { PartnerKPIs } from "../types";
import { Button } from "@/components/ui/Button";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Globe,
  Briefcase,
  Users,
  ShieldCheck,
  CheckCircle2,
  Edit3,
  Award,
  FileText,
} from "lucide-react";

export interface PartnerDetailsTabProps {
  partnerType: "agent" | "representative";
  agent?: AgentItem | null;
  representative?: RepresentativeItem | null;
  kpis: PartnerKPIs;
  onEditClick: () => void;
  onSwitchToRep?: (repName: string) => void;
}

export const PartnerDetailsTab: React.FC<PartnerDetailsTabProps> = ({
  partnerType,
  agent,
  representative,
  kpis,
  onEditClick,
  onSwitchToRep,
}) => {
  const isAgent = partnerType === "agent";

  return (
    <div className="space-y-6">
      {/* 1. Quick KPI Metric Summary Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-brand-border/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {isAgent ? "Students Enrolled" : "Total Regional Network"}
            </span>
            <Users className="h-4 w-4 text-burgundy-primary" />
          </div>
          <div className="mt-2 text-xl font-extrabold text-text-primary">
            {isAgent ? kpis.totalStudents : `${representative?.agentCount || 18} Agencies`}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
            <CheckCircle2 className="h-3 w-3" />
            <span>Active Avis World Roster</span>
          </div>
        </div>

        <div className="rounded-2xl border border-brand-border/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[11px] font-bold uppercase tracking-wider">Visa Success Rate</span>
            <Award className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-xl font-extrabold text-emerald-600">
            {kpis.visaApprovalRate}%
          </div>
          <div className="mt-1 text-[10px] text-text-muted font-medium">
            Based on recent student cohorts
          </div>
        </div>

        <div className="rounded-2xl border border-brand-border/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {isAgent ? "Commission Tier" : "Liaison Territory"}
            </span>
            <Briefcase className="h-4 w-4 text-burgundy-primary" />
          </div>
          <div className="mt-2 text-xl font-extrabold text-text-primary">
            {isAgent ? "15% Standard" : representative?.region || "Asia Pacific"}
          </div>
          <div className="mt-1 text-[10px] text-text-muted font-medium">
            {isAgent ? "Platinum Recruiter" : "Regional Accreditation"}
          </div>
        </div>

        <div className="rounded-2xl border border-brand-border/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-[11px] font-bold uppercase tracking-wider">Compliance Status</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-xl font-extrabold text-text-primary">
            {kpis.complianceRating}%
          </div>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
            <CheckCircle2 className="h-3 w-3" />
            <span>Audit Verified (2026)</span>
          </div>
        </div>
      </div>

      {/* 2. Details Grid: Identity & Representation Scope */}
      <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12">
        {/* Left Column: Official Profile Credentials */}
        <div className="flex flex-col justify-between rounded-2xl border border-brand-border/80 bg-white p-5 shadow-xs sm:rounded-[24px] sm:p-6 lg:col-span-7">
          <div>
            <div className="mb-4 flex items-center justify-between border-b border-brand-border/70 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-burgundy-primary/10 text-burgundy-primary">
                  {isAgent ? <Briefcase className="h-4.5 w-4.5" /> : <Users className="h-4.5 w-4.5" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary sm:text-base">
                    {isAgent ? "Agency Credentials & Affiliation" : "Representative Accreditation Details"}
                  </h3>
                  <p className="text-xs text-text-muted">Official partner registration and governance hierarchy</p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onEditClick}
                className="rounded-xl text-xs font-semibold hover:bg-brand-bg"
              >
                <Edit3 className="mr-1 h-3.5 w-3.5" />
                <span>Edit</span>
              </Button>
            </div>

            {/* Key-Value Pairs Grid */}
            <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
              {/* Full Legal Name */}
              <div className="rounded-xl border border-brand-border/60 bg-brand-bg/70 p-3">
                <span className="flex items-center gap-1.5 font-medium text-text-muted">
                  <Building2 className="h-3.5 w-3.5 text-burgundy-primary" />
                  <span>Full Entity / Contact Name</span>
                </span>
                <p className="mt-1 truncate text-sm font-bold text-text-primary">
                  {(isAgent ? agent?.name : representative?.name) || "Avis Partner"}
                </p>
              </div>

              {/* Unique Partner Code */}
              <div className="rounded-xl border border-brand-border/60 bg-brand-bg/70 p-3">
                <span className="flex items-center gap-1.5 font-medium text-text-muted">
                  <Award className="h-3.5 w-3.5 text-burgundy-primary" />
                  <span>{isAgent ? "Agent Code" : "Representative Code"}</span>
                </span>
                <p className="mt-1 font-mono text-sm font-bold text-burgundy-primary">
                  {(isAgent ? agent?.agentCode : representative?.repCode) || "AWC-N/A"}
                </p>
              </div>

              {/* Status */}
              <div className="rounded-xl border border-brand-border/60 bg-brand-bg/70 p-3">
                <span className="flex items-center gap-1.5 font-medium text-text-muted">
                  <ShieldCheck className="h-3.5 w-3.5 text-burgundy-primary" />
                  <span>Roster Status</span>
                </span>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                    ● {(isAgent ? agent?.status : representative?.status) || "Active"}
                  </span>
                  <span className="text-[10px] text-text-muted">(Authorized Portal Access)</span>
                </div>
              </div>

              {/* Partner Type or Organization */}
              <div className="rounded-xl border border-brand-border/60 bg-brand-bg/70 p-3">
                <span className="flex items-center gap-1.5 font-medium text-text-muted">
                  <Briefcase className="h-3.5 w-3.5 text-burgundy-primary" />
                  <span>{isAgent ? "Partnership Classification" : "Designated Mission"}</span>
                </span>
                <p className="mt-1 truncate text-sm font-bold text-text-primary">
                  {isAgent ? agent?.type || "General Partner" : representative?.organization || "Regional Bureau"}
                </p>
              </div>

              {/* Organization / Agency */}
              <div className="rounded-xl border border-brand-border/60 bg-brand-bg/70 p-3">
                <span className="flex items-center gap-1.5 font-medium text-text-muted">
                  <Building2 className="h-3.5 w-3.5 text-burgundy-primary" />
                  <span>Parent Agency / Institution</span>
                </span>
                <p className="mt-1 truncate text-sm font-bold text-text-primary">
                  {isAgent ? agent?.agencyName || agent?.name : representative?.organization || "Avis World College"}
                </p>
              </div>

              {/* Contract Date */}
              <div className="rounded-xl border border-brand-border/60 bg-brand-bg/70 p-3">
                <span className="flex items-center gap-1.5 font-medium text-text-muted">
                  <Calendar className="h-3.5 w-3.5 text-burgundy-primary" />
                  <span>Contract Inception Date</span>
                </span>
                <p className="mt-1 text-sm font-bold text-text-primary">
                  {(isAgent ? agent?.joinedDate : representative?.joinedDate) || "15 Jan 2024"}
                </p>
              </div>

              {/* Supervision Link (for Agent) or Network Count (for Rep) */}
              <div className="rounded-xl border border-brand-border/60 bg-brand-bg/70 p-3 sm:col-span-2">
                <span className="flex items-center gap-1.5 font-medium text-text-muted">
                  <Users className="h-3.5 w-3.5 text-burgundy-primary" />
                  <span>{isAgent ? "Supervising Regional Representative" : "Subordinate Agency Network"}</span>
                </span>
                <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                  {isAgent ? (
                    <>
                      <span className="text-sm font-bold text-text-primary">
                        {agent?.representative || "Unassigned"}
                      </span>
                      {agent?.representative && onSwitchToRep && (
                        <button
                          type="button"
                          onClick={() => onSwitchToRep(agent.representative)}
                          className="rounded-lg bg-burgundy-primary/10 px-2.5 py-1 text-xs font-bold text-burgundy-primary hover:bg-burgundy-primary/20"
                        >
                          View Representative Profile →
                        </button>
                      )}
                    </>
                  ) : (
                    <span className="text-sm font-bold text-text-primary">
                      {representative?.agentCount || 0} Registered Recruitment Partners in Jurisdiction
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Communications & Operational Territory */}
        <div className="flex flex-col justify-between rounded-2xl border border-brand-border/80 bg-white p-5 shadow-xs sm:rounded-[24px] sm:p-6 lg:col-span-5">
          <div>
            <div className="mb-4 flex items-center justify-between border-b border-brand-border/70 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-burgundy-primary/10 text-burgundy-primary">
                  <Globe className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary sm:text-base">Contact & Jurisdiction</h3>
                  <p className="text-xs text-text-muted">Territory bounds and direct communication lines</p>
                </div>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Email */}
              <div className="rounded-xl border border-brand-border/60 bg-brand-bg/70 p-3">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-text-muted">Official Email</span>
                <a
                  href={`mailto:${(isAgent ? agent?.email : representative?.email) || ""}`}
                  className="mt-1 flex items-center gap-2 text-sm font-bold text-text-primary hover:text-burgundy-primary hover:underline"
                >
                  <Mail className="h-4 w-4 text-burgundy-primary shrink-0" />
                  <span className="truncate">{(isAgent ? agent?.email : representative?.email) || "N/A"}</span>
                </a>
              </div>

              {/* Phone */}
              <div className="rounded-xl border border-brand-border/60 bg-brand-bg/70 p-3">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-text-muted">Telephone Hotline</span>
                <a
                  href={`tel:${(isAgent ? agent?.phone : representative?.phone) || ""}`}
                  className="mt-1 flex items-center gap-2 text-sm font-bold text-text-primary hover:text-burgundy-primary hover:underline"
                >
                  <Phone className="h-4 w-4 text-burgundy-primary shrink-0" />
                  <span>{(isAgent ? agent?.phone : representative?.phone) || "N/A"}</span>
                </a>
              </div>

              {/* Country & Region */}
              <div className="rounded-xl border border-brand-border/60 bg-brand-bg/70 p-3">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-text-muted">
                  Territory / Country of Operations
                </span>
                <div className="mt-1 flex items-center gap-2 text-sm font-bold text-text-primary">
                  <MapPin className="h-4 w-4 text-burgundy-primary shrink-0" />
                  <span>
                    {(isAgent ? agent?.country : representative?.country) || "International"}
                    {!isAgent && representative?.region ? ` (${representative.region})` : ""}
                  </span>
                </div>
              </div>

              {/* College Campus Liaison */}
              <div className="rounded-xl border border-brand-border/60 bg-brand-bg/70 p-3">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-text-muted">Avis Host Campus</span>
                <div className="mt-1 flex items-center gap-2 text-sm font-bold text-text-primary">
                  <Building2 className="h-4 w-4 text-burgundy-primary shrink-0" />
                  <span>Avis World College • Central Admissions Liaison</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Scope / Notes Section */}
      {((isAgent ? agent?.notes : representative?.notes)) && (
        <div className="rounded-2xl border border-brand-border/80 bg-white p-5 shadow-xs sm:rounded-[24px] sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-burgundy-primary" />
            <h4 className="text-sm font-bold text-text-primary">
              {isAgent ? "Agency Scope & Operational Mandate" : "Regional Territory Mission Brief"}
            </h4>
          </div>
          <p className="text-xs leading-relaxed text-text-secondary">
            {(isAgent ? agent?.notes : representative?.notes)}
          </p>
        </div>
      )}
    </div>
  );
};
