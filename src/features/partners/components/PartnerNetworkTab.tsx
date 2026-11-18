import React from "react";
import { AgentItem } from "@/features/agents/types";
import { RepresentativeItem } from "@/features/representatives/types";
import { Button } from "@/components/ui/Button";
import {
  Users,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface PartnerNetworkTabProps {
  partnerType: "agent" | "representative";
  agent?: AgentItem | null;
  representative?: RepresentativeItem | null;
  allAgents: AgentItem[];
  allRepresentatives: RepresentativeItem[];
  onSelectAgent: (ag: AgentItem) => void;
  onSelectRep: (rep: RepresentativeItem) => void;
}

export const PartnerNetworkTab: React.FC<PartnerNetworkTabProps> = ({
  partnerType,
  agent,
  representative,
  allAgents,
  allRepresentatives,
  onSelectAgent,
  onSelectRep,
}) => {
  const isAgent = partnerType === "agent";

  // If viewing an agent: find their supervising representative and peer agents
  const supervisingRep = React.useMemo(() => {
    if (!agent || !agent.representative) return null;
    return (
      allRepresentatives.find(
        (r) =>
          r.name.toLowerCase() === agent.representative.toLowerCase() ||
          r.repCode.toLowerCase() === agent.representative.toLowerCase(),
      ) || null
    );
  }, [agent, allRepresentatives]);

  const peerAgents = React.useMemo(() => {
    if (!agent || !agent.representative) return [];
    return allAgents.filter(
      (a) => a.id !== agent.id && a.representative.toLowerCase() === agent.representative.toLowerCase(),
    );
  }, [agent, allAgents]);

  // If viewing a representative: find all agents reporting to this rep
  const managedAgents = React.useMemo(() => {
    if (!representative) return [];
    return allAgents.filter(
      (a) =>
        a.representative.toLowerCase() === representative.name.toLowerCase() ||
        a.representative.toLowerCase() === representative.repCode.toLowerCase(),
    );
  }, [representative, allAgents]);

  return (
    <div className="space-y-6">
      {/* CASE 1: Viewing an AGENT -> Show their Supervising Representative */}
      {isAgent && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-brand-border/80 bg-white p-6 shadow-xs sm:rounded-[24px]">
            <div className="mb-4 flex flex-col justify-between gap-3 border-b border-brand-border/70 pb-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-burgundy-primary/10 text-burgundy-primary">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary">Supervising Regional Representative</h3>
                  <p className="text-xs text-text-muted">
                    Accredited institution representative assigned to oversee this agency
                  </p>
                </div>
              </div>

              {supervisingRep && (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => onSelectRep(supervisingRep)}
                  className="rounded-xl px-4 text-xs font-bold shadow-sm"
                >
                  <span>View Representative Profile</span>
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            {supervisingRep ? (
              <div className="flex flex-col gap-5 rounded-2xl border border-brand-border/70 bg-gradient-to-br from-brand-bg/50 via-white to-brand-bg/20 p-5 md:flex-row md:items-center">
                <div className="relative shrink-0">
                  <img
                    src={supervisingRep.avatarUrl}
                    alt={supervisingRep.name}
                    className="h-20 w-20 rounded-full border-2 border-white object-cover shadow-sm ring-2 ring-burgundy-primary/20"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/avis-emblem.png";
                    }}
                  />
                  <span
                    className={cn(
                      "absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white",
                      supervisingRep.status === "Active" ? "bg-emerald-500" : "bg-amber-500",
                    )}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base font-bold text-text-primary">{supervisingRep.name}</h4>
                    <span className="rounded-full bg-burgundy-primary/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-burgundy-primary">
                      {supervisingRep.repCode}
                    </span>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      ● {supervisingRep.status}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-text-secondary font-medium">
                    {supervisingRep.organization || "Regional Affairs Liaison"} • {supervisingRep.region || supervisingRep.country}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5 text-text-primary">
                      <Mail className="h-3.5 w-3.5 text-burgundy-primary" />
                      <a href={`mailto:${supervisingRep.email}`} className="font-semibold hover:underline">
                        {supervisingRep.email}
                      </a>
                    </div>

                    <div className="flex items-center gap-1.5 text-text-primary">
                      <Phone className="h-3.5 w-3.5 text-burgundy-primary" />
                      <a href={`tel:${supervisingRep.phone}`} className="font-semibold hover:underline">
                        {supervisingRep.phone}
                      </a>
                    </div>

                    <div className="flex items-center gap-1.5 text-text-primary">
                      <MapPin className="h-3.5 w-3.5 text-burgundy-primary" />
                      <span>{supervisingRep.country}</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-bold text-burgundy-primary">
                      <Users className="h-3.5 w-3.5" />
                      <span>{supervisingRep.agentCount} Agencies Supervised</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-brand-border p-6 text-center text-xs text-text-muted">
                No direct institutional representative linked. Designated liaison: {agent?.representative || "Central Office"}.
              </div>
            )}
          </div>

          {/* Peer Agencies under the same representative */}
          {peerAgents.length > 0 && (
            <div className="rounded-2xl border border-brand-border/80 bg-white p-6 shadow-xs sm:rounded-[24px]">
              <div className="mb-4 flex items-center justify-between border-b border-brand-border/70 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-text-primary">
                    Other Partner Agencies Supervised by {agent?.representative}
                  </h4>
                  <p className="text-xs text-text-muted">Associated partners sharing the same regional liaison</p>
                </div>
                <span className="rounded-md border border-brand-border bg-brand-bg px-2 py-0.5 text-xs font-bold text-text-secondary">
                  {peerAgents.length} Peer Agencies
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {peerAgents.map((peer) => (
                  <div
                    key={peer.id}
                    onClick={() => onSelectAgent(peer)}
                    className="group flex cursor-pointer items-center justify-between rounded-xl border border-brand-border/70 bg-brand-bg/30 p-3 transition-all hover:border-burgundy-primary/40 hover:bg-burgundy-primary/5 hover:shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={peer.avatarUrl}
                        alt={peer.name}
                        className="h-10 w-10 shrink-0 rounded-full border border-brand-border object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/avis-emblem.png";
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-bold text-text-primary group-hover:text-burgundy-primary">
                          {peer.name}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                          <span className="font-mono">{peer.agentCode}</span>
                          <span>•</span>
                          <span>{peer.country}</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-text-muted opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:text-burgundy-primary group-hover:opacity-100" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CASE 2: Viewing a REPRESENTATIVE -> Show their Supervised Agent Network */}
      {!isAgent && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-brand-border/80 bg-white p-6 shadow-xs sm:rounded-[24px]">
            <div className="mb-4 flex flex-col justify-between gap-3 border-b border-brand-border/70 pb-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-burgundy-primary/10 text-burgundy-primary">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary">Supervised Agency Network</h3>
                  <p className="text-xs text-text-muted">
                    Recruitment agencies registered and operating under {representative?.name}&apos;s jurisdiction
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-burgundy-primary/10 px-3 py-1 text-xs font-bold text-burgundy-primary">
                  {managedAgents.length > 0 ? managedAgents.length : representative?.agentCount || 0} Registered Partners
                </span>
              </div>
            </div>

            {managedAgents.length > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {managedAgents.map((ag) => (
                    <div
                      key={ag.id}
                      onClick={() => onSelectAgent(ag)}
                      className="group flex cursor-pointer flex-col justify-between rounded-2xl border border-brand-border/80 bg-white p-4 transition-all duration-200 hover:border-burgundy-primary/40 hover:shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={ag.avatarUrl}
                            alt={ag.name}
                            className="h-12 w-12 rounded-full border border-brand-border object-cover transition-transform group-hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/avis-emblem.png";
                            }}
                          />
                          <span
                            className={cn(
                              "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white",
                              ag.status === "Active" ? "bg-emerald-500" : "bg-amber-500",
                            )}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono text-[10px] font-bold text-burgundy-primary">
                              {ag.agentCode}
                            </span>
                            <span className="rounded-full bg-emerald-50 px-1.5 py-0.2 text-[9px] font-bold text-emerald-700">
                              {ag.status}
                            </span>
                          </div>
                          <h5 className="truncate text-xs font-bold text-text-primary transition-colors group-hover:text-burgundy-primary">
                            {ag.name}
                          </h5>
                          <p className="truncate text-[10px] text-text-muted">{ag.agencyName || "Recruitment Partner"}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-brand-border/50 pt-2.5 text-[11px]">
                        <div className="flex items-center gap-1 text-text-muted">
                          <MapPin className="h-3 w-3 text-burgundy-primary" />
                          <span>{ag.country}</span>
                        </div>
                        <span className="inline-flex items-center gap-1 font-bold text-burgundy-primary group-hover:underline">
                          <span>View Profile</span>
                          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-brand-border/80 p-8 text-center">
                <Users className="mx-auto h-8 w-8 text-text-muted/60" />
                <p className="mt-2 text-xs font-semibold text-text-primary">
                  {representative?.agentCount || 0} Registered Agencies in Region
                </p>
                <p className="mt-1 text-[11px] text-text-muted">
                  Agencies across {representative?.region || representative?.country} report directly into this representative bureau.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
