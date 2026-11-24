import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useLocation, useParams } from "react-router-dom";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import BreadcrumbBanner from "@/components/common/BreadcrumbBanner";
import { dashboardContainerVariants, dashboardSectionVariants } from "@/components/animations/transitions";
import { Briefcase, UserCheck, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/common/ToastMessage";

// Agent & Representative Roster Storage
import { agents, representatives } from "@/services/ams";
import { useApiCollection } from "@/hooks/useApiCollection";
import { getFinancePartner } from "@/services/reports";
import { useApiQuery } from "@/hooks/useApiQuery";
import { AsyncStateView } from "@/components/common/AsyncStateView";
import { AgentItem } from "@/features/agents/types";

import { RepresentativeItem } from "@/features/representatives/types";

// Partner Components
import { PartnerHeroCard } from "./components/PartnerHeroCard";
import { PartnerDetailsTab } from "./components/PartnerDetailsTab";
import { PartnerPerformanceTab } from "./components/PartnerPerformanceTab";
import { EditPartnerModal } from "./components/EditPartnerModal";

// Mock Metrics & Applications

import { PartnerType, PartnerTabId } from "./types";

const iosSpringTransition = {
  type: "spring" as const,
  stiffness: 440,
  damping: 32,
  mass: 0.65,
};

const iosContentTransition = {
  type: "spring" as const,
  stiffness: 380,
  damping: 30,
  mass: 0.75,
};

export const PartnerProfilePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const params = useParams<{ partnerType?: string; partnerId?: string }>();

  // Master lists
  const { data: agentsList, saveList: saveAgentsList, loading: loadingAgents, error: agentError } = useApiCollection(agents);
  const { data: representativesList, saveList: saveRepresentativesList, loading: loadingReps, error: repError } = useApiCollection(representatives);

  // Determine active partner type and ID from query, path params, or location state
  const rawType = params.partnerType || searchParams.get("type") || (location.state?.partnerType as string);
  const rawId = params.partnerId || searchParams.get("id") || searchParams.get("agentId") || searchParams.get("repId");

  // State
  const [partnerType, setPartnerType] = useState<PartnerType>(() => {
    if (rawType === "representative" || rawType === "rep") return "representative";
    if (rawType === "agent") return "agent";
    if (rawId?.startsWith("rep-") || rawId?.startsWith("AWC-REP-")) return "representative";
    return "agent";
  });

  const [activePartnerId, setActivePartnerId] = useState<string>(() => {
    if (rawId) return rawId;
    return partnerType === "representative" ? representativesList[0]?.id || "" : agentsList[0]?.id || "";
  });

  const tabParam = searchParams.get("tab") as PartnerTabId;
  const initialTab: PartnerTabId = tabParam === "performance" ? "performance" : "overview";
  const [activeTab, setActiveTab] = useState<PartnerTabId>(initialTab);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Sync when query params change
  useEffect(() => {
    if (rawType === "representative" || rawType === "rep") {
      setPartnerType("representative");
    } else if (rawType === "agent") {
      setPartnerType("agent");
    } else if (rawId?.startsWith("rep-") || rawId?.startsWith("AWC-REP-")) {
      setPartnerType("representative");
    }

    if (rawId) {
      setActivePartnerId(rawId);
    }
  }, [rawType, rawId]);

  // Current Agent / Representative data
  const currentAgent = useMemo<AgentItem | null>(() => {
    if (partnerType !== "agent") return null;
    return agentsList.find((a) => a.id === activePartnerId || a.agentCode === activePartnerId || a.name === activePartnerId) || (!activePartnerId ? agentsList[0] : null) || null;
  }, [partnerType, activePartnerId, agentsList]);

  const currentRepresentative = useMemo<RepresentativeItem | null>(() => {
    if (partnerType !== "representative") return null;
    return (
      representativesList.find((r) => r.id === activePartnerId || r.repCode === activePartnerId || r.name === activePartnerId) ||
      (!activePartnerId ? representativesList[0] : null) ||
      null
    );
  }, [partnerType, activePartnerId, representativesList]);

  // Active entity details
  const activeName = partnerType === "agent" ? currentAgent?.name : currentRepresentative?.name;
  const activeCode = partnerType === "agent" ? currentAgent?.agentCode : currentRepresentative?.repCode;

  const partnerId = partnerType === "agent" ? currentAgent?.id : currentRepresentative?.id;
  const {data: finance, loading: loadingFinance, error: financeError, reload} = useApiQuery(signal => partnerId ? getFinancePartner(partnerType === "agent" ? "Agent" : "Representative", partnerId, signal) : Promise.resolve({partner: null}), [partnerType, partnerId]);
  const metrics = finance?.partner;
  const kpis = { totalStudents: metrics?.studentsReferredCount || 0, activeApplications: metrics?.activeApplications || 0,
    visaApprovalRate: 0, totalCommission: String(metrics?.earnedCommission || 0), earnedCommission: String(metrics?.amountPaid || 0), pendingCommission: String(metrics?.amountPending || 0),
    totalCommissionPaid: String(metrics?.amountPaid || 0), partnerTier: "—", complianceRating: 0, contractRenewalDate: "—" };

  // Tab change handler
  const handleTabChange = (tabId: PartnerTabId) => {
    setActiveTab(tabId);
    setSearchParams(
      {
        type: partnerType,
        id: activePartnerId,
        tab: tabId,
      },
      { replace: true },
    );
  };

  // Switch to specific Representative (e.g. from agent's supervisor link)
  const handleSwitchToRepresentative = useCallback(
    (repIdentifier: string) => {
      const match = representativesList.find(
        (r) =>
          r.name.toLowerCase() === repIdentifier.toLowerCase() || r.id === repIdentifier || r.repCode.toLowerCase() === repIdentifier.toLowerCase(),
      );
      if (match) {
        setPartnerType("representative");
        setActivePartnerId(match.id);
        setSearchParams(
          {
            type: "representative",
            id: match.id,
            tab: "overview",
          },
          { replace: true },
        );
        toast.info(`Switched to Representative Profile: ${match.name}`);
      }
    },
    [representativesList, setSearchParams],
  );

  // Save Agent Changes
  const handleSaveAgent = async (updatedAgent: AgentItem) => {
    const updated = agentsList.map((a) => (a.id === updatedAgent.id ? updatedAgent : a));
    if (!await saveAgentsList(updated)) return false;
    await reload();
  };

  // Save Representative Changes
  const handleSaveRepresentative = async (updatedRep: RepresentativeItem) => {
    const updated = representativesList.map((r) => (r.id === updatedRep.id ? updatedRep : r));
    if (!await saveRepresentativesList(updated)) return false;
    await reload();
  };

  // Tab definitions
  const tabs = [
    {
      id: "overview" as const,
      label: "Profile Overview",
      icon: partnerType === "agent" ? Briefcase : UserCheck,
    },
    {
      id: "performance" as const,
      label: "Intake & Performance",
      icon: GraduationCap,
    },
  ];

  if (loadingAgents || loadingReps || loadingFinance || agentError || repError || financeError) return <AsyncStateView isLoading={loadingAgents || loadingReps || loadingFinance} error={agentError || repError || financeError} onRetry={() => window.location.reload()}>{null}</AsyncStateView>;

  return (
    <motion.div
      variants={dashboardContainerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto w-full pt-1"
    >
      {/* 1. Top Breadcrumb Banner & Partner Switcher */}
      <BreadcrumbBanner
        title={activeName ? `${activeName} (${activeCode})` : "Partner Profile"}
        items={[
          {
            name: partnerType === "agent" ? "Total Agents" : "Total Representatives",
            path: partnerType === "agent" ? "/agents" : "/representatives",
          },
          { name: activeName || "Profile" },
        ]}
      />

      {/* 3. Hero Profile Card with Avis Emblem & Styling */}
      <motion.div variants={dashboardSectionVariants}>
        <PartnerHeroCard
          partnerType={partnerType}
          agent={currentAgent}
          representative={currentRepresentative}
          onEditClick={() => setIsEditModalOpen(true)}
          onSwitchToRep={handleSwitchToRepresentative}
        />
      </motion.div>

      {/* 4. Segmented Liquid Navigation Tabs Bar */}
      <motion.div
        variants={dashboardSectionVariants}
        className="mb-4"
      >
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto rounded-[22px] border border-brand-border/80 bg-white/90 p-1.5 shadow-[0_2px_12px_-2px_rgba(66,27,41,0.05)] backdrop-blur-md">
          <LayoutGroup id="partner-profile-segmented-tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <motion.button
                  key={tab.id}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    "group relative flex cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-[16px] px-4 py-1.5 text-[11px] font-semibold transition-colors duration-200 sm:text-[12px]",
                    isActive ? "text-white" : "text-text-secondary hover:bg-brand-bg/60 hover:text-text-primary",
                  )}
                >
                  {/* Sliding Liquid Spring Active Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="partner-profile-active-tab-indicator"
                      className="absolute inset-0 z-0 overflow-hidden rounded-[16px] border border-white/25 bg-gradient-to-r from-burgundy-primary via-[#571D2F] to-brand-red shadow-[0_4px_16px_-2px_rgba(112,43,64,0.32),0_2px_6px_-1px_rgba(166,76,97,0.22)]"
                      transition={iosSpringTransition}
                    >
                      <div className="ios-liquid-sheen-active pointer-events-none absolute inset-0 z-10 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    </motion.div>
                  )}

                  {/* Icon & Label */}
                  <span className="relative z-10 flex items-center gap-2">
                    <motion.span
                      animate={{ scale: isActive ? 1.08 : 1 }}
                      transition={{ type: "spring", stiffness: 420, damping: 25 }}
                      className={cn("transition-colors duration-200", isActive ? "text-white" : "text-brand-red group-hover:scale-105")}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </motion.span>
                    <span className={cn("transition-all duration-200", isActive && "font-bold tracking-tight")}>{tab.label}</span>
                  </span>
                </motion.button>
              );
            })}
          </LayoutGroup>
        </div>
      </motion.div>

      {/* 5. Tab Views with Framer Motion AnimatePresence */}
      <motion.div variants={dashboardSectionVariants}>
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="tab-overview"
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={iosContentTransition}
            >
              <PartnerDetailsTab
                partnerType={partnerType}
                agent={currentAgent}
                representative={currentRepresentative}
                kpis={kpis}
                onEditClick={() => setIsEditModalOpen(true)}
                onSwitchToRep={handleSwitchToRepresentative}
              />
            </motion.div>
          )}

          {activeTab === "performance" && (
            <motion.div
              key="tab-performance"
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={iosContentTransition}
            >
              <PartnerPerformanceTab
                partnerType={partnerType}
                partnerName={activeName || "Partner"}
                partnerId={partnerId || ""}
                applicationCount={metrics?.applicationCount || 0}
                kpis={kpis}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 6. Edit Partner Modal */}
      {isEditModalOpen && (
        <EditPartnerModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          partnerType={partnerType}
          agent={currentAgent}
          representative={currentRepresentative}
          allRepresentatives={representativesList}
          onSaveAgent={handleSaveAgent}
          onSaveRepresentative={handleSaveRepresentative}
        />
      )}
    </motion.div>
  );
};

export default PartnerProfilePage;
