import React, { useState, useMemo } from "react";
import { AdminAuditLog } from "../types";
import { useServerActivity } from "@/hooks/useServerActivity";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/common/ToastMessage";
import {
  FileText,
  Search,
  Download,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const ProfileAuditLogsTab: React.FC = () => {
  const { data } = useServerActivity();
  const adminAuditLogsData: AdminAuditLog[] = (data || []).map(a => ({ id: a.id, action: a.title, category: "system", timestamp: a.timestamp || "", ipAddress: "", location: "", status: a.status === "flagged" ? "warning" : "success", detail: a.detail }));
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredLogs = useMemo(() => {
    return adminAuditLogsData.filter((log) => {
      const matchesCategory = selectedCategory === "all" || log.category === selectedCategory;
      const matchesSearch =
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.detail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.ipAddress.includes(searchQuery);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory, data]);

  const handleExport = () => {
    const headers = ["Action", "Category", "Timestamp", "IP Address", "Location", "Detail"];
    const rows = filteredLogs.map((log) => [
      `"${log.action}"`,
      `"${log.category}"`,
      `"${log.timestamp}"`,
      `"${log.ipAddress}"`,
      `"${log.location}"`,
      `"${log.detail}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `avis_admin_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Audit Log Exported", {
      description: "Admin activity records downloaded as CSV.",
    });
  };

  const getStatusIcon = (status: AdminAuditLog["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-amber-600" />;
      default:
        return <Info className="h-4 w-4 text-sky-600" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl sm:rounded-[24px] border border-brand-border/80 bg-white p-4 sm:p-5 shadow-xs">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit actions, IP, or details..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-brand-border bg-brand-bg/50 text-xs text-text-primary placeholder:text-text-muted focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-red/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {["all", "settings", "settlement", "finance", "student", "auth"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-150 whitespace-nowrap",
                  selectedCategory === cat
                    ? "bg-burgundy-primary text-white shadow-xs"
                    : "bg-brand-bg/80 text-text-secondary hover:text-text-primary border border-brand-border/70"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="rounded-xl text-xs font-semibold hover:bg-brand-bg flex-shrink-0"
          >
            <Download className="h-3.5 w-3.5 mr-1 text-brand-red" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
        </div>
      </div>

      {/* 2. Audit Trail List */}
      <div className="rounded-2xl sm:rounded-[24px] border border-brand-border/80 bg-white p-5 sm:p-6 shadow-xs">
        <div className="pb-4 mb-4 border-b border-brand-border/70 flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-text-primary">Admin System Activity Log</h3>
            <p className="text-xs text-text-muted">Tamper-evident institutional audit records</p>
          </div>
          <span className="text-xs font-semibold text-text-muted">
            Showing {filteredLogs.length} events
          </span>
        </div>

        <div className="space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <FileText className="h-10 w-10 mx-auto text-text-muted/40 mb-2" />
              <p className="text-sm font-semibold">No audit logs matching search</p>
              <p className="text-xs text-text-muted">Try clearing your filters</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-brand-border/70 bg-brand-bg/40 p-4 transition-colors hover:bg-brand-bg/80"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-brand-border shadow-2xs flex-shrink-0">
                    {getStatusIcon(log.status)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-text-primary">{log.action}</h4>
                      <span className="rounded bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-burgundy-primary border border-brand-border/60">
                        {log.category}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-text-secondary leading-relaxed">{log.detail}</p>
                  </div>
                </div>

                <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between text-xs text-text-muted flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-brand-border/60">
                  <span className="font-semibold text-text-primary">{log.timestamp}</span>
                  <span className="text-[11px] text-text-muted mt-0.5">
                    {log.location} • {log.ipAddress}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
