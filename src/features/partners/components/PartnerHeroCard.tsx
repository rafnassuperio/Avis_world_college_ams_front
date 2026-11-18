import React, { useState } from "react";
import { toast } from "@/components/common/ToastMessage";
import {
  Mail,
  MapPin,
  Phone,
  Calendar,
  CheckCircle2,
  Copy,
  Check,
  Edit3,
  Briefcase,
  Users,
  ShieldCheck,
  Building2,
  ExternalLink,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AgentItem } from "@/features/agents/types";
import { RepresentativeItem } from "@/features/representatives/types";
import { cn } from "@/lib/utils";

export interface PartnerHeroCardProps {
  partnerType: "agent" | "representative";
  agent?: AgentItem | null;
  representative?: RepresentativeItem | null;
  onEditClick: () => void;
  onSwitchToRep?: (repName: string) => void;
}

export const PartnerHeroCard: React.FC<PartnerHeroCardProps> = ({
  partnerType,
  agent,
  representative,
  onEditClick,
  onSwitchToRep,
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const isAgent = partnerType === "agent";
  const name = isAgent ? agent?.name : representative?.name;
  const avatarUrl = (isAgent ? agent?.avatarUrl : representative?.avatarUrl) || "/avis-emblem.png";
  const email = (isAgent ? agent?.email : representative?.email) || "";
  const phone = (isAgent ? agent?.phone : representative?.phone) || "";
  const country = (isAgent ? agent?.country : representative?.country) || "International";
  const status = (isAgent ? agent?.status : representative?.status) || "Active";
  const code = isAgent ? agent?.agentCode : representative?.repCode;
  const subOrg = isAgent ? agent?.agencyName || "Recruitment Agency" : representative?.organization || "Institutional Liaison";
  const joinedDate = (isAgent ? agent?.joinedDate : representative?.joinedDate) || "2024";

  const isActive = status === "Active";

  const handleCopyEmail = () => {
    if (email) {
      navigator.clipboard.writeText(email);
      setCopiedEmail(true);
      toast.success("Email Copied", {
        description: `${email} copied to clipboard.`,
      });
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const handlePrintDossier = () => {
    window.print();
  };

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-brand-border/80 bg-white shadow-sm transition-all duration-300 hover:shadow-md sm:rounded-[26px] md:rounded-[30px]">
      {/* 1. Luxury Header Banner with Avis Emblem Watermark */}
      <div className="relative h-28 w-full overflow-hidden bg-gradient-to-r from-burgundy-primary via-[#571D2F] to-burgundy-dark sm:h-28">
        {/* Ambient 3D Radial Glow and Geometric Grid */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(210,139,150,0.35)_0%,_transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,_rgba(166,76,97,0.25)_0%,_transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:28px_28px] opacity-10" />

        {/* Institutional Watermark Badge */}
        <div className="pointer-events-none absolute -bottom-8 -right-6 select-none opacity-15 sm:-bottom-10 sm:-right-8">
          <img
            src="/avis-emblem.png"
            alt="Avis Emblem Watermark"
            className="h-36 w-36 object-contain sm:h-44 sm:w-44"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        </div>

        {/* Top Floating Type Indicator Tag */}
        <div className="absolute right-4 top-4 flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/25 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-md">
            {isAgent ? (
              <>
                <Briefcase className="h-3.5 w-3.5 text-amber-300" />
                <span>Authorized Agency Profile</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                <span>Regional Representative Profile</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Hero Body with Floating Avatar & Metadata */}
      <div className="relative px-4 pb-6 sm:px-8 sm:pb-8">
        <div className="-mt-14 mb-4 flex flex-col items-center justify-between gap-4 sm:-mt-16 sm:flex-row sm:items-end">
          {/* Avatar Container with Active Glow */}
          <div className="group relative shrink-0">
            <div className="rounded-full bg-gradient-to-tr from-burgundy-primary via-brand-red to-burgundy-dark p-[3.5px] shadow-lg shadow-burgundy-primary/20">
              <div className="rounded-full bg-white p-[3px]">
                <img
                  src={avatarUrl}
                  alt={name || "Partner"}
                  className="h-24 w-24 rounded-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-28 sm:w-28"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/avis-emblem.png";
                  }}
                />
              </div>
            </div>

            {/* Status Indicator */}
            <span
              className={cn(
                "absolute bottom-2 right-2 h-4 w-4 rounded-full border-2 border-white shadow-sm",
                isActive ? "bg-emerald-500" : "bg-amber-500",
              )}
              title={`Status: ${status}`}
            />
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrintDossier}
              className="rounded-xl border-brand-border bg-white px-3 text-xs font-semibold text-text-secondary hover:bg-brand-bg hover:text-text-primary"
            >
              <Printer className="mr-1.5 h-3.5 w-3.5" />
              <span>Print Dossier</span>
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onEditClick}
              className="rounded-xl px-3.5 text-xs font-bold shadow-sm"
            >
              <Edit3 className="mr-1.5 h-3.5 w-3.5" />
              <span>Edit {isAgent ? "Agent" : "Representative"}</span>
            </Button>
          </div>
        </div>

        {/* 3. Name, Role, Badges & Highlights */}
        <div className="space-y-3 text-center sm:text-left">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <h1 className="text-xl font-extrabold tracking-tight text-text-primary sm:text-2xl">
              {name || "Avis Partner"}
            </h1>

            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
              {code && (
                <span className="rounded-full bg-burgundy-primary/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-burgundy-primary">
                  {code}
                </span>
              )}

              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                  isActive
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border border-amber-200 bg-amber-50 text-amber-700",
                )}
              >
                <CheckCircle2 className="h-3 w-3" />
                <span>{status}</span>
              </span>

              {isAgent && agent?.type && (
                <span className="rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-[11px] font-bold text-purple-700">
                  {agent.type}
                </span>
              )}

              {!isAgent && representative?.region && (
                <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
                  {representative.region}
                </span>
              )}
            </div>
          </div>

          {/* Subtitle / Organization */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-text-secondary sm:justify-start">
            <div className="flex items-center gap-1.5 font-medium text-text-primary">
              <Building2 className="h-3.5 w-3.5 text-burgundy-primary" />
              <span>{subOrg}</span>
            </div>

            <span className="text-text-muted">•</span>

            <div className="flex items-center gap-1 text-text-muted">
              <MapPin className="h-3.5 w-3.5 text-text-muted" />
              <span>{country}</span>
            </div>

            <span className="text-text-muted">•</span>

            <div className="flex items-center gap-1 text-text-muted">
              <Calendar className="h-3.5 w-3.5 text-text-muted" />
              <span>Partner Since {joinedDate}</span>
            </div>
          </div>

          {/* Quick Contact & Supervision Ribbon */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1 sm:justify-start">
            {email && (
              <div className="flex items-center gap-1.5 rounded-xl border border-brand-border/70 bg-brand-bg/50 px-2.5 py-1 text-xs text-text-primary">
                <Mail className="h-3.5 w-3.5 text-text-muted" />
                <a
                  href={`mailto:${email}`}
                  className="truncate font-semibold hover:text-burgundy-primary hover:underline"
                >
                  {email}
                </a>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="ml-1 text-text-muted transition-colors hover:text-text-primary"
                  title="Copy email"
                >
                  {copiedEmail ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            )}

            {phone && (
              <div className="flex items-center gap-1.5 rounded-xl border border-brand-border/70 bg-brand-bg/50 px-2.5 py-1 text-xs text-text-primary">
                <Phone className="h-3.5 w-3.5 text-text-muted" />
                <a href={`tel:${phone}`} className="font-semibold hover:text-burgundy-primary hover:underline">
                  {phone}
                </a>
              </div>
            )}

            {/* Direct Link to Supervising Representative for Agent */}
            {isAgent && agent?.representative && onSwitchToRep && (
              <button
                type="button"
                onClick={() => onSwitchToRep(agent.representative)}
                className="group inline-flex items-center gap-1.5 rounded-xl border border-burgundy-primary/20 bg-burgundy-primary/5 px-2.5 py-1 text-xs font-bold text-burgundy-primary transition-all hover:bg-burgundy-primary/10 hover:shadow-xs"
              >
                <Users className="h-3.5 w-3.5" />
                <span>Supervising Rep: {agent.representative}</span>
                <ExternalLink className="h-3 w-3 opacity-70 transition-transform group-hover:translate-x-0.5" />
              </button>
            )}

            {/* Direct Count for Representative */}
            {!isAgent && (
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-burgundy-primary/20 bg-burgundy-primary/5 px-2.5 py-1 text-xs font-bold text-burgundy-primary">
                <Users className="h-3.5 w-3.5" />
                <span>{representative?.agentCount || 0} Registered Agencies Under Supervision</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
