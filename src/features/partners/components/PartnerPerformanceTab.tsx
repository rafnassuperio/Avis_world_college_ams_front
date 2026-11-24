import { getPartnerApplications } from "@/services/reports";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { AsyncStateView } from "@/components/common/AsyncStateView";
import React, { useState, useMemo } from "react";
import { StudentApplicationItem, PartnerKPIs } from "../types";
import { Clock, DollarSign, TrendingUp, Calendar, Filter, RotateCcw } from "lucide-react";
import { DataTable, ColumnDef } from "@/components/ui/Table";
import { SearchInput } from "@/components/ui/SearchInput";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";

export interface PartnerPerformanceTabProps {
  partnerType: "agent" | "representative";
  partnerName: string;
  partnerId: string;
  applicationCount: number;
  kpis: PartnerKPIs;
}

export const PartnerPerformanceTab: React.FC<PartnerPerformanceTabProps> = ({ partnerType, partnerName, partnerId, applicationCount, kpis }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(8);
  const filters = useDebouncedValue(JSON.stringify({type: partnerType === "agent" ? "Agent" : "Representative", partnerId, search: searchTerm.trim() || undefined, limit: pageSize}));
  const [paging, setPaging] = useState({filters: "", page: 1});
  const currentPage = paging.filters === filters ? paging.page : 1;
  const setCurrentPage = (page: number) => setPaging({filters, page});
  const query = useApiQuery(signal => getPartnerApplications({...JSON.parse(filters), page: currentPage}, signal), [filters, currentPage]);
  const totalItems = query.data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedApplications = query.data?.data || [];

  const getStatusBadge = (status?: StudentApplicationItem["status"]) => {
    switch (status) {
      case "Enrolled":
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
      case "Visa Approved":
        return "border-blue-200 bg-blue-50 text-blue-700";
      case "Under Review":
        return "border-amber-200 bg-amber-50 text-amber-700";
      case "Conditional Offer":
        return "border-purple-200 bg-purple-50 text-purple-700";
      default:
        return "border-brand-border bg-brand-bg text-text-secondary";
    }
  };

  // Columns definition: Date, Student, Course, Paid Amount, Earned Commission
  const columns: ColumnDef<StudentApplicationItem>[] = useMemo(
    () => [
      {
        key: "date",
        header: "Date",
        width: 140,
        minWidth: 120,
        resizable: true,
        className: "whitespace-nowrap font-medium text-text-secondary border-r border-brand-border/40",
        cell: (app) => (
          <div className="flex items-center gap-1.5 font-medium text-text-secondary">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-text-muted" />
            <span>{app.date || app.appliedDate}</span>
          </div>
        ),
      },
      {
        key: "student",
        header: "Student",
        width: 220,
        minWidth: 170,
        resizable: true,
        className: "border-r border-brand-border/40",
        cell: (app) => (
          <div className="flex flex-col">
            <span className="font-bold text-text-primary">{app.studentName}</span>
            <span className="font-mono text-[10px] text-text-muted">{app.studentId}</span>
          </div>
        ),
      },
      {
        key: "course",
        header: "Course",
        width: 260,
        minWidth: 200,
        resizable: true,
        className: "border-r border-brand-border/40",
        cell: (app) => (
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-text-primary">{app.course || app.program}</span>
            <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
              {app.intake && <span>{app.intake}</span>}
              {app.status && (
                <>
                  <span>•</span>
                  <span
                    className={cn(
                      "py-0.2 inline-flex items-center rounded-full border px-1.5 text-[9.5px] font-semibold",
                      getStatusBadge(app.status),
                    )}
                  >
                    {app.status}
                  </span>
                </>
              )}
            </div>
          </div>
        ),
      },
      {
        key: "paidAmount",
        header: "Paid Amount",
        width: 150,
        minWidth: 120,
        resizable: true,
        className: "text-right font-mono font-bold text-text-primary whitespace-nowrap border-r border-brand-border/40",
        headerClassName: "text-right",
        cell: (app) => app.paidAmount || app.tuitionFee,
      },
      {
        key: "earnedCommission",
        header: "Earned Commission",
        width: 170,
        minWidth: 130,
        resizable: true,
        className: "text-right font-mono font-bold whitespace-nowrap",
        headerClassName: "text-right",
        cell: (app) => {
          const val = app.earnedCommission || app.commission;
          const isNegative = String(val).includes("-");
          return <span className={cn("font-mono font-bold", isNegative ? "text-amber-700" : "text-burgundy-primary")}>{val}</span>;
        },
      },
    ],
    [],
  );

  if ((!query.data && query.loading) || query.error) return <AsyncStateView isLoading={query.loading} error={query.error} onRetry={() => void query.reload()}>{null}</AsyncStateView>;

  return (
    <div className="space-y-6">
      {/* 1. Performance Commission Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Commission */}
        <div className="shadow-xs rounded-2xl border border-brand-border/80 bg-white p-5 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted">Total Commission</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-burgundy-primary/10 text-burgundy-primary">
              <DollarSign className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black tracking-tight text-text-primary">{kpis.totalCommission || "$4087.20"}</div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-text-muted">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-burgundy-primary" />
            <span>Cumulative Contract Commission</span>
          </div>
        </div>

        {/* Earned Commission */}
        <div className="shadow-xs rounded-2xl border border-brand-border/80 bg-white p-5 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted">Earned Commission</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black tracking-tight text-emerald-600">{kpis.earnedCommission || "$6127.20"}</div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Verified & Disbursed Earnings</span>
          </div>
        </div>

        {/* Pending Commission */}
        <div className="shadow-xs rounded-2xl border border-brand-border/80 bg-white p-5 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted">Pending Commission</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <Clock className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black tracking-tight text-amber-700">{kpis.pendingCommission || "$-3380.00"}</div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-amber-700">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span>Adjustment & Outstanding Settlement</span>
          </div>
        </div>
      </div>

      {/* 2. Reusable DataTable with SearchInput and Resizable Columns */}
      <div className="shadow-xs space-y-4 rounded-2xl border border-brand-border/80 bg-white p-5 sm:rounded-[24px] sm:p-6">
        {/* Header Toolbar */}
        <div className="flex flex-col justify-between gap-3 border-b border-brand-border/70 pb-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-base font-bold text-text-primary">Earned Commission Details</h3>
            <p className="text-xs text-text-muted">Commission earned from partial payments (EMIs) for {partnerName}</p>
          </div>

          <div className="w-full sm:w-72">
            <SearchInput
              value={searchTerm}
              onChange={(val) => {
                setSearchTerm(val);
                setCurrentPage(1);
              }}
              onClear={() => {
                setSearchTerm("");
                setCurrentPage(1);
              }}
              placeholder="Search student, course, date..."
              size="sm"
            />
          </div>
        </div>

        {/* Search status & Reset chip */}
        {searchTerm.trim() && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-brand-border/60 pt-2 text-xs">
            <div className="flex items-center gap-1.5 text-text-muted">
              <Filter className="h-3.5 w-3.5 text-burgundy-primary" />
              <span>
                Showing <strong className="text-text-primary">{totalItems}</strong> of{" "}
                <strong className="text-text-primary">{applicationCount}</strong> records
              </span>
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="ml-2 inline-flex items-center gap-1 text-[11px] font-semibold text-brand-red underline underline-offset-2 hover:opacity-80"
              >
                <RotateCcw className="h-3 w-3" />
                Reset search
              </button>
            </div>
          </div>
        )}

        {/* Reusable DataTable Component */}
        <DataTable<StudentApplicationItem>
          columns={columns}
          data={paginatedApplications}
          keyExtractor={(app) => app.id}
          layout="fixed"
          density="normal"
          storageKey="ams_partner_performance_table_widths"
          showResizeGuide={true}
          guideStorageKey="ams_partner_performance_resize_guide_dismissed"
          guideNote={
            <>
              Drag divider lines <span className="font-bold">┊</span> between column headers to resize columns
            </>
          }
          emptyMessage={searchTerm.trim() ? `No student records match "${searchTerm}". Try a different keyword.` : "No student records found."}
        />

        {/* Pagination Controls */}
        {totalItems > 0 && (
          <div className="pt-2">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
              pageSizeOptions={[5, 8, 12, 20]}
              showTotal={true}
              showPageSize={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};
