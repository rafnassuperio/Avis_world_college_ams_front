import { getFinancePartners } from "@/services/reports";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Pagination } from "@/components/ui/Pagination";
import { AsyncStateView } from "@/components/common/AsyncStateView";
import React, { useState, useEffect } from "react";
import { Search, Building, UserCheck, ChevronRight } from "lucide-react";
import { AgentRepReportRecord } from "../types";
import { SearchInput } from "@/components/ui/SearchInput";
import { cn } from "@/lib/utils";

interface PartnerSidebarListProps {
  totalCount: number;
  selectedPartnerId: string;
  onSelectPartner: (partner: AgentRepReportRecord) => void;
  entityType: "Agent" | "Representative";
}

export const PartnerSidebarList: React.FC<PartnerSidebarListProps> = ({ totalCount, selectedPartnerId, onSelectPartner, entityType }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const filters = useDebouncedValue(JSON.stringify({type: entityType, search: searchQuery.trim() || undefined, status: selectedStatus === "all" ? undefined : selectedStatus}));
  const [paging, setPaging] = useState({filters: "", page: 1});
  const page = paging.filters === filters ? paging.page : 1;
  const query = useApiQuery(signal => getFinancePartners({...JSON.parse(filters), page, limit: 8}, signal), [filters, page]);
  const filteredPartners = query.data?.data || [];
  const total = query.data?.total || 0;
  useEffect(() => { if (!selectedPartnerId && filteredPartners[0]) onSelectPartner(filteredPartners[0]); }, [query.data, selectedPartnerId, onSelectPartner]);

  const isAgent = entityType === "Agent";

  const renderStatusDot = (status: AgentRepReportRecord["payoutStatus"]) => {
    switch (status) {
      case "Settled":
        return (
          <span
            className="h-2 w-2 rounded-full bg-success ring-2 ring-success-light"
            title="Settled"
          />
        );
      case "Processing":
        return (
          <span
            className="h-2 w-2 rounded-full bg-burgundy-primary ring-2 ring-brand-light-red"
            title="Processing"
          />
        );
      case "Pending":
      default:
        return (
          <span
            className="h-2 w-2 rounded-full bg-brand-red ring-2 ring-brand-light-red"
            title="Pending"
          />
        );
    }
  };

  return (
    <div className="shadow-xs flex h-full flex-col rounded-2xl border border-brand-border bg-white">
      {/* Sidebar Header */}
      <div className="border-b border-brand-border/60 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg border",
                isAgent
                  ? "border-burgundy-primary/20 bg-burgundy-primary/10 text-burgundy-primary"
                  : "border-brand-red/20 bg-brand-light-red text-brand-red",
              )}
            >
              {isAgent ? <Building className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">{isAgent ? "Partner Agencies" : "Regional Liaisons"}</h3>
              <p className="text-[11px] text-text-muted">
                {totalCount} {isAgent ? "contracted agents" : "designated reps"}
              </p>
            </div>
          </div>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-semibold",
              isAgent
                ? "border border-burgundy-primary/20 bg-burgundy-primary/5 text-burgundy-primary"
                : "border border-brand-red/20 bg-brand-light-red/60 text-brand-red",
            )}
          >
            {total} of {totalCount}
          </span>
        </div>

        {/* Search Input */}
        <div className="mt-3">
          <SearchInput
            value={searchQuery}
            onChange={(val) => setSearchQuery(val)}
            onClear={() => setSearchQuery("")}
            placeholder={`Search ${isAgent ? "agents" : "reps"} by name, org...`}
            className="w-full text-xs"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px]">
          {(["all", "Settled", "Processing", "Pending"] as const).map((status) => {
            const isActive = selectedStatus.toLowerCase() === status.toLowerCase();
            return (
              <button
                key={status}
                type="button"
                onClick={() => setSelectedStatus(status)}
                className={cn(
                  "cursor-pointer whitespace-nowrap rounded-md px-2 py-1 font-medium transition-colors",
                  isActive
                    ? isAgent
                      ? "shadow-2xs bg-burgundy-primary text-white"
                      : "shadow-2xs bg-brand-red text-white"
                    : "bg-brand-bg text-text-secondary hover:bg-brand-light-red/40 hover:text-burgundy-primary",
                )}
              >
                {status === "all" ? "All" : status}
              </button>
            );
          })}
        </div>
      </div>

      {/* Partner List Items */}
      <div
        className="flex-1 divide-y divide-brand-border/40 overflow-y-auto p-2"
        style={{ maxHeight: "640px" }}
      >
        {query.loading || query.error ? <AsyncStateView isLoading={query.loading} error={query.error} onRetry={() => void query.reload()}>{null}</AsyncStateView> : filteredPartners.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-bg text-text-muted">
              <Search className="h-5 w-5" />
            </div>
            <p className="mt-2 text-xs font-semibold text-text-primary">No partners found</p>
            <p className="mt-0.5 text-[11px] text-text-muted">Try adjusting your search or status filter</p>
          </div>
        ) : (
          filteredPartners.map((partner) => {
            const isSelected = partner.id === selectedPartnerId;
            const initials = partner.name
              .split(" ")
              .filter(Boolean)
              .map((w) => w[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();

            return (
              <button
                key={partner.id}
                type="button"
                onClick={() => onSelectPartner(partner)}
                className={cn(
                  "group relative flex w-full cursor-pointer items-center justify-between rounded-xl p-3 text-left transition-all",
                  isSelected
                    ? isAgent
                      ? "shadow-2xs border border-burgundy-primary/30 bg-burgundy-primary/5"
                      : "shadow-2xs border border-brand-red/30 bg-brand-light-red/30"
                    : "border border-transparent hover:border-brand-border hover:bg-brand-bg/60",
                )}
              >
                {/* Active Indicator Bar */}
                {isSelected && (
                  <span className={cn("absolute bottom-2.5 left-0 top-2.5 w-1 rounded-r-full", isAgent ? "bg-burgundy-primary" : "bg-brand-red")} />
                )}

                <div className="flex min-w-0 items-center gap-2.5 pl-1.5">
                  {/* Avatar Initials with Status Dot */}
                  <div className="relative shrink-0">
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-xl font-mono text-xs font-bold transition-transform group-hover:scale-105",
                        isSelected
                          ? isAgent
                            ? "bg-burgundy-primary text-white"
                            : "bg-brand-red text-white"
                          : "border border-brand-border bg-brand-bg text-text-primary",
                      )}
                    >
                      {initials}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5">{renderStatusDot(partner.payoutStatus)}</span>
                  </div>

                  {/* Partner Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-xs font-bold text-text-primary group-hover:text-burgundy-primary">{partner.name}</span>
                    </div>
                    <p className="truncate text-[11px] text-text-muted">{partner.organization}</p>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-text-secondary">
                      <span className="font-mono font-medium text-burgundy-primary">{partner.id}</span>
                      <span>•</span>
                      <span>{partner.studentsReferredCount} students</span>
                    </div>
                  </div>
                </div>

                {/* Right Arrow & Split Amount */}
                <div className="ml-2 flex shrink-0 flex-col items-end">
                  <span className="font-mono text-xs font-bold text-text-primary">${(partner.totalCourseVolume / 1000).toFixed(0)}k</span>
                  <span className="text-[10px] text-text-muted">Volume</span>
                  <ChevronRight
                    className={cn(
                      "mt-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5",
                      isSelected ? (isAgent ? "text-burgundy-primary" : "text-brand-red") : "text-text-muted",
                    )}
                  />
                </div>
              </button>
            );
          })
        )}
      </div>
      {total > 8 && <Pagination currentPage={page} totalPages={Math.ceil(total / 8)} onPageChange={page => setPaging({filters, page})} controlsOnly />}
    </div>
  );
};
