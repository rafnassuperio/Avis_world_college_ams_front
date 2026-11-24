import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Search, Mail, Calendar, Eye, Link2, Check, X } from "lucide-react";
import { overseasRequests } from "@/services/ams";
import { useApiCollection } from "@/hooks/useApiCollection";
import { AsyncStateView } from "@/components/common/AsyncStateView";
import { CollegeOverseasRequest } from "../../types";
import { DataTable, ColumnDef } from "@/components/ui/Table";
import { SearchInput } from "@/components/ui/SearchInput";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { Avatar } from "@/components/ui/Avatar";
import { OverseasRequestModal } from "../OverseasRequestModal";
import { toast } from "@/components/common/ToastMessage";

import { cn } from "@/lib/utils";

export interface OverseasRequestsTabProps {
  requests?: CollegeOverseasRequest[];
  className?: string;
  statusFilter?: string;
  onRequestsChange?: (requests: CollegeOverseasRequest[]) => void;
}



export const OVERSEAS_STATUS_CONFIG: Record<CollegeOverseasRequest["status"], { bg: string; text: string; border: string; dot: string }> = {
  "Pending Review": {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  "Documents Verified": {
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
    dot: "bg-sky-500",
  },
  "Visa In Process": {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    dot: "bg-purple-500",
  },
  Approved: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  Rejected: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    dot: "bg-rose-500",
  },
};

const ALL_STATUS_TABS: ("All" | CollegeOverseasRequest["status"])[] = [
  "All",
  "Pending Review",
  "Documents Verified",
  "Visa In Process",
  "Approved",
  "Rejected",
];

export const OverseasRequestsTab: React.FC<OverseasRequestsTabProps> = ({

  className,
  statusFilter,

}) => {
  const { data: requestList, saveList: saveRequests, loading, error, reload } = useApiCollection(overseasRequests);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [internalStatus, setInternalStatus] = useState<string>("All");

  // Keep internalStatus in sync with statusFilter prop if provided
  useEffect(() => {
    if (statusFilter !== undefined) {
      const normalized = statusFilter.trim().toLowerCase();
      if (normalized === "all") {
        setInternalStatus("All");
      } else {
        const matched = ALL_STATUS_TABS.find((tab) => tab.toLowerCase() === normalized);
        setInternalStatus(matched || "All");
      }
    }
  }, [statusFilter]);

  // Active status resolved
  const activeStatus = internalStatus;

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Reset page when search or status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeStatus]);

  // Copy Link State
  const [hasCopiedLink, setHasCopiedLink] = useState(false);

  // View Modal State
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CollegeOverseasRequest | null>(null);

  // Handler to copy public overseas application link
  const handleCopyLink = async () => {
    const link = import.meta.env.VITE_PUBLIC_APPLICATION_URL;
    if (!link) { toast.error("The public overseas application URL has not been configured."); return; }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = link;
        textarea.style.position = "fixed";
        textarea.style.left = "-999999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setHasCopiedLink(true);
      toast.success("Overseas application link copied to clipboard!");
      setTimeout(() => setHasCopiedLink(false), 2500);
    } catch {
      toast.error("Failed to copy link to clipboard.");
    }
  };

  // Open View Modal
  const handleOpenViewModal = useCallback((request: CollegeOverseasRequest) => {
    setSelectedRequest(request);
    setIsViewModalOpen(true);
  }, []);

  // Update status from modal
  const handleUpdateStatus = useCallback(
    async (requestId: string, newStatus: CollegeOverseasRequest["status"]) => {
      const updated = requestList.map((req) => (req.id === requestId ? { ...req, status: newStatus } : req));
      if (!await saveRequests(updated)) return false;
      setSelectedRequest((prev) => (prev && prev.id === requestId ? { ...prev, status: newStatus } : prev));
    },
    [requestList, saveRequests],
  );

  // Filter requests based on query and activeStatus
  const filteredRequests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return requestList.filter((req) => {
      const matchesSearch =
        !q ||
        req.applicantName.toLowerCase().includes(q) ||
        req.requestedCourse.toLowerCase().includes(q) ||
        req.email.toLowerCase().includes(q) ||
        req.requestId.toLowerCase().includes(q) ||
        req.country.toLowerCase().includes(q) ||
        req.passportNo.toLowerCase().includes(q);

      const matchesStatus = activeStatus === "All" || req.status === activeStatus;

      return matchesSearch && matchesStatus;
    });
  }, [requestList, searchQuery, activeStatus]);

  // Paginated records
  const totalItems = filteredRequests.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRequests.slice(start, start + pageSize);
  }, [filteredRequests, currentPage, pageSize]);

  // Define Table Columns matching user request:
  // # | Applicant Name | Course Applied | Email | Date | Status | Action(view)
  const columns: ColumnDef<CollegeOverseasRequest>[] = useMemo(
    () => [
      {
        key: "index",
        header: "#",
        width: 64,
        minWidth: 54,
        maxWidth: 80,
        resizable: false,
        className: "font-mono text-xs font-semibold text-text-muted select-none",
        cell: (_row, idx) => {
          const itemNum = (currentPage - 1) * pageSize + idx + 1;
          return <span className="text-text-muted">#{itemNum}</span>;
        },
      },
      {
        key: "applicantName",
        header: "Applicant Name",
        width: 250,
        minWidth: 200,
        resizable: true,
        cell: (req) => (
          <div className="flex items-center gap-3">
            <Avatar
              src={req.avatar}
              name={req.applicantName}
              size="md"
              className="shrink-0 ring-1 ring-brand-border"
            />
            <div className="min-w-0">
              <p className="truncate font-bold text-text-primary transition-colors hover:text-burgundy-primary">{req.applicantName}</p>
              <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                <span>•</span>
                <span className="truncate">{req.country}</span>
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "courseApplied",
        header: "Course Applied",
        width: 280,
        minWidth: 200,
        resizable: true,
        cell: (req) => (
          <div className="min-w-0">
            <p
              className="truncate font-semibold text-text-primary"
              title={req.requestedCourse}
            >
              {req.requestedCourse}
            </p>
            <p className="text-[11px] text-text-muted">{req.requestedIntake}</p>
          </div>
        ),
      },
      {
        key: "email",
        header: "Email",
        width: 230,
        minWidth: 170,
        resizable: true,
        cell: (req) => (
          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
            <Mail className="h-3.5 w-3.5 shrink-0 text-text-muted" />
            <a
              href={`mailto:${req.email}`}
              onClick={(e) => e.stopPropagation()}
              className="truncate transition-colors hover:text-burgundy-primary hover:underline"
              title={req.email}
            >
              {req.email}
            </a>
          </div>
        ),
      },
      {
        key: "date",
        header: "Date",
        width: 140,
        minWidth: 115,
        resizable: true,
        cell: (req) => (
          <div className="flex items-center gap-1.5 whitespace-nowrap text-xs text-text-secondary">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-text-muted" />
            <span>{req.submissionDate}</span>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        width: 180,
        minWidth: 140,
        resizable: true,
        cell: (req) => {
          const style = OVERSEAS_STATUS_CONFIG[req.status] || OVERSEAS_STATUS_CONFIG["Pending Review"];
          return (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors",
                style.bg,
                style.text,
                style.border,
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
              <span>{req.status}</span>
            </span>
          );
        },
      },
      {
        key: "action",
        header: "Action",
        width: 110,
        minWidth: 90,
        resizable: false,
        headerClassName: "text-right",
        className: "text-right",
        cell: (req) => (
          <div className="flex items-center justify-start">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenViewModal(req);
              }}
              className="shadow-2xs group inline-flex items-center gap-1.5 rounded-lg border border-burgundy-primary/20 bg-burgundy-primary/10 px-2.5 py-1 text-xs font-semibold text-burgundy-primary transition-all duration-150 hover:bg-burgundy-primary hover:text-white active:scale-95"
              title={`View application details for ${req.applicantName}`}
              aria-label={`View application details for ${req.applicantName}`}
            >
              <Eye className="h-3.5 w-3.5 transition-transform duration-150 group-hover:scale-110" />
              <span>View</span>
            </button>
          </div>
        ),
      },
    ],
    [currentPage, pageSize, handleOpenViewModal],
  );

  const hasActiveFilters = Boolean(searchQuery.trim() || activeStatus !== "All");

  if (loading || error) return <AsyncStateView isLoading={loading} error={error} onRetry={() => void reload()}>{null}</AsyncStateView>;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Top Search & Action Toolbar */}
      <div className="flex flex-col gap-3.5 rounded-2xl border border-brand-border bg-white p-3.5 shadow-card sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          {/* Search Box */}
          <div className="w-full flex-1 sm:max-w-md">
            <SearchInput
              label="Search Overseas Requests"
              labelIcon={Search}
              placeholder="Search applicant name, course, email, country, passport..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>

          {/* Action Buttons: Copy Link */}
          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className={cn(
                "shadow-xs gap-1.5 rounded-xl text-xs font-semibold transition-all",
                hasCopiedLink ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "hover:border-burgundy-primary hover:text-burgundy-primary",
              )}
              title="Copy public overseas application link to clipboard"
            >
              {hasCopiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Link Copied</span>
                </>
              ) : (
                <>
                  <Link2 className="h-3.5 w-3.5 text-burgundy-primary" />
                  <span>Copy Link</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Filter status strip if active filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-brand-border/60 pt-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-text-muted">Active filters:</span>
              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1 rounded-lg border border-burgundy-primary/25 bg-burgundy-primary/10 px-2 py-0.5 text-[11px] font-semibold text-burgundy-primary">
                  <span>Query: "{searchQuery}"</span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="hover:text-brand-red"
                    title="Remove search query"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {activeStatus !== "All" && (
                <span className="inline-flex items-center gap-1 rounded-lg border border-burgundy-primary/25 bg-burgundy-primary/10 px-2 py-0.5 text-[11px] font-semibold text-burgundy-primary">
                  <span>Status: {activeStatus}</span>
                  <button
                    type="button"
                    onClick={() => setInternalStatus("All")}
                    className="hover:text-brand-red"
                    title="Clear status filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>

            <span className="text-[11px] font-medium text-text-muted">
              Found <strong className="text-text-primary">{filteredRequests.length}</strong> matching applicant
              {filteredRequests.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Main DataTable from @/components/ui/Table */}
      <DataTable
        columns={columns}
        data={paginatedRequests}
        keyExtractor={(item) => item.id}
        layout="fixed"
        density="normal"
        storageKey="ams_college_overseas_requests_table_widths"
        showResizeGuide={true}
        guideStorageKey="ams_overseas_requests_table_resize_guide_dismissed"
        onRowClick={(item) => handleOpenViewModal(item)}
        emptyMessage={hasActiveFilters ? "No overseas applicant requests match your search criteria." : "No overseas applicant requests available."}
      />

      {/* Pagination Controls */}
      {filteredRequests.length > 0 && (
        <div className="rounded-2xl border border-brand-border bg-white p-3.5 shadow-card">
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
            pageSizeOptions={[8, 12, 20]}
            showTotal={true}
            showPageSize={true}
          />
        </div>
      )}

      {/* View Applicant Dossier Modal */}
      <OverseasRequestModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};

export default OverseasRequestsTab;
