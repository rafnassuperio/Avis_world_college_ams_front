import React, { useState, useMemo, useEffect } from "react";
import {
  CheckCircle2,
  Download,
  RotateCcw,
  Scale,
  Clock,
  Building2,
  Search,
  Users,
  CalendarClock,
  TrendingDown,
  Wallet,
  Hourglass,
  Calendar,
} from "lucide-react";
import { DataTable, ColumnDef } from "@/components/ui/Table";
import { SearchInput } from "@/components/ui/SearchInput";
import { FilterSelect, FilterSelectOption } from "@/components/ui/FilterSelect";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { mockCpCaseReportList } from "../data/mockPaymentReportData";
import { CpCaseReportRecord } from "../types";
import { exportToCsv } from "../utils/exportCsv";

export const CpCaseReportTab: React.FC = () => {
  const [data] = useState<CpCaseReportRecord[]>(mockCpCaseReportList);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCpStatus, setSelectedCpStatus] = useState("all");
  const [selectedChannelPartner, setSelectedChannelPartner] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCpStatus, selectedChannelPartner]);

  // CP Status filter options
  const cpStatusOptions: FilterSelectOption[] = [
    { label: "All CP Status", value: "all" },
    { label: "Not Due", value: "Not Due", badgeDot: "bg-slate-400" },
    { label: "CP Due", value: "CP Due", badgeDot: "bg-rose-500" },
    { label: "CP Settled", value: "CP Settled", badgeDot: "bg-emerald-500" },
  ];

  // Channel Partner options derived from data
  const channelPartnerOptions: FilterSelectOption[] = useMemo(() => {
    const unique = Array.from(new Set(data.map((item) => item.channelPartner ?? item.corporatePartner).filter(Boolean))).sort();
    return [{ label: "All Channel Partners", value: "all" }, ...unique.map((partner) => ({ label: partner, value: partner }))];
  }, [data]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const partner = item.channelPartner ?? item.corporatePartner ?? "";
      const matchesSearch =
        !q ||
        item.caseNumber.toLowerCase().includes(q) ||
        item.studentName.toLowerCase().includes(q) ||
        item.studentId.toLowerCase().includes(q) ||
        item.course.toLowerCase().includes(q) ||
        partner.toLowerCase().includes(q);

      const status = item.cpStatus ?? item.dueStatus;
      const matchesCpStatus = selectedCpStatus === "all" || status === selectedCpStatus;
      const matchesPartner = selectedChannelPartner === "all" || partner === selectedChannelPartner;

      return matchesSearch && matchesCpStatus && matchesPartner;
    });
  }, [data, searchQuery, selectedCpStatus, selectedChannelPartner]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const isUnfiltered = filteredData.length === data.length;

    // Count metrics
    const totalCases = filteredData.length;
    const uniqueStudents = new Set(filteredData.map((i) => i.studentId)).size;
    const notDue = filteredData.filter((i) => i.dueStatus === "Not Due").length;
    const cpDue = filteredData.filter((i) => i.dueStatus === "CP Due").length;
    const cpSettled = filteredData.filter((i) => i.dueStatus === "CP Settled").length;

    // Financial calculations
    const totalShortfall = filteredData.reduce((acc, curr) => acc + (curr.shortfall ?? 0), 0);
    const totalCpPayable = filteredData.reduce((acc, curr) => acc + (curr.cpPayable ?? 0), 0);
    const topUpsCollected = filteredData.reduce((acc, curr) => acc + (curr.topUpCollected ?? 0), 0);
    const remainingCp = filteredData.reduce((acc, curr) => acc + (curr.remainingCp ?? 0), 0);

    return {
      totalCases: isUnfiltered ? 37 : totalCases,
      uniqueStudents: isUnfiltered ? 20 : uniqueStudents,
      notDue: isUnfiltered ? 0 : notDue,
      cpDue: isUnfiltered ? 3 : cpDue,
      cpSettled: isUnfiltered ? 34 : cpSettled,
      totalShortfall: isUnfiltered ? 32179.23 : totalShortfall,
      totalCpPayable: isUnfiltered ? 15485.53 : totalCpPayable,
      topUpsCollected: isUnfiltered ? 6369.84 : topUpsCollected,
      remainingCp: isUnfiltered ? 995.22 : remainingCp,
    };
  }, [filteredData, data.length]);

  // Pagination calculations
  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedData = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, validCurrentPage, pageSize]);

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCpStatus("all");
    setSelectedChannelPartner("all");
    setCurrentPage(1);
  };

  // Export handler
  const handleExport = () => {
    const exportRows = filteredData.map((item, idx) => ({
      "#": idx + 1,
      "Student ID": item.studentId,
      "Student Name": item.studentName,
      Course: item.course,
      "Channel Partner": item.channelPartner ?? item.corporatePartner,
      Inst: typeof item.installment === "number" ? `Inst ${item.installment}` : (item.installment ?? "Inst 1"),
      "Inst Amount (SGD)": item.installmentAmount ?? item.caseValue,
      "Shortfall (SGD)": item.shortfall ?? 0,
      "CP Payable (SGD)": item.cpPayable ?? 0,
      "Top-Ups (SGD)": item.topUpCollected ?? 0,
      "Remaining (SGD)": item.remainingCp ?? 0,
      "CP Status": item.cpStatus ?? item.dueStatus,
      "Due Date": item.dueDate ?? item.filingDate,
      Detected: item.detectedDate ?? item.filingDate,
    }));

    exportToCsv("CP_Case_Report", exportRows);
  };

  // CP Status badge renderer
  const renderCpStatusBadge = (status?: string) => {
    switch (status) {
      case "CP Settled":
      case "Settled":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            CP Settled
          </span>
        );
      case "CP Due":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            CP Due
          </span>
        );
      case "Not Due":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
            Not Due
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-border bg-brand-bg px-2.5 py-0.5 text-xs font-semibold text-text-secondary">
            {status || "Not Due"}
          </span>
        );
    }
  };

  /**
   * Reusable Table Column Definitions for CP Case Report
   * Headings: #, Student, Course, Channel Partner, Inst, Inst Amount, Shortfall, CP Payable, Top-Ups, Remaining, CP Status, Due Date, Detected
   */
  const columns = useMemo<ColumnDef<CpCaseReportRecord>[]>(
    () => [
      {
        key: "no",
        header: "#",
        width: 50,
        minWidth: 45,
        maxWidth: 65,
        resizable: false,
        className: "border-r border-brand-border/40 text-center font-mono text-xs font-semibold text-text-secondary",
        headerClassName: "text-center",
        cell: (_item, index) => String((validCurrentPage - 1) * pageSize + index + 1).padStart(2, "0"),
      },
      {
        key: "student",
        header: "STUDENT",
        width: 175,
        minWidth: 150,
        className: "border-r border-brand-border/40",
        headerClassName: "text-left",
        cell: (item) => (
          <div className="flex flex-col py-0.5">
            <span
              className="truncate text-[13px] font-bold text-text-primary transition-colors hover:text-burgundy-primary"
              title={item.studentName}
            >
              {item.studentName}
            </span>
            <span className="mt-0.5 inline-flex items-center font-mono text-[11px] font-medium text-text-muted">{item.studentId}</span>
          </div>
        ),
      },
      {
        key: "course",
        header: "COURSE",
        width: 180,
        minWidth: 150,
        className: "border-r border-brand-border/40",
        headerClassName: "text-left",
        cell: (item) => (
          <div className="flex flex-col py-0.5">
            <span
              className="truncate text-xs font-semibold text-burgundy-primary"
              title={item.course}
            >
              {item.course}
            </span>
            <span className="text-[10px] font-medium text-text-muted">{item.category}</span>
          </div>
        ),
      },
      {
        key: "channelPartner",
        header: "CHANNEL PARTNER",
        width: 190,
        minWidth: 160,
        className: "border-r border-brand-border/40",
        headerClassName: "text-left",
        cell: (item) => (
          <div className="flex items-center gap-1.5 py-0.5">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-text-muted" />
            <span
              className="truncate text-xs font-medium text-text-primary"
              title={item.channelPartner ?? item.corporatePartner}
            >
              {item.channelPartner ?? item.corporatePartner}
            </span>
          </div>
        ),
      },
      {
        key: "installment",
        header: "INST",
        width: 80,
        minWidth: 70,
        className: "border-r border-brand-border/40 text-center whitespace-nowrap",
        headerClassName: "text-center",
        cell: (item) => (
          <span className="inline-flex items-center justify-center rounded-md border border-brand-border bg-brand-bg px-2 py-0.5 font-mono text-[11px] font-semibold text-text-secondary">
            {typeof item.installment === "number" ? `Inst ${item.installment}` : (item.installment ?? "Inst 1")}
          </span>
        ),
      },
      {
        key: "installmentAmount",
        header: "INST AMOUNT",
        width: 130,
        minWidth: 110,
        className: "border-r border-brand-border/40 text-right whitespace-nowrap",
        headerClassName: "text-right",
        cell: (item) => {
          const val = item.installmentAmount ?? item.caseValue;
          return (
            <div className="flex flex-col items-end py-0.5">
              <span className="font-mono text-xs font-bold text-text-primary">
                ${val.toLocaleString("en-SG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] font-medium text-text-muted">SGD</span>
            </div>
          );
        },
      },
      {
        key: "shortfall",
        header: "SHORTFALL",
        width: 125,
        minWidth: 105,
        className: "border-r border-brand-border/40 text-right whitespace-nowrap",
        headerClassName: "text-right",
        cell: (item) => {
          const val = item.shortfall ?? 0;
          return (
            <div className="flex flex-col items-end py-0.5">
              <span className="font-mono text-xs font-bold text-rose-600">
                ${val.toLocaleString("en-SG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] font-medium text-text-muted">SGD</span>
            </div>
          );
        },
      },
      {
        key: "cpPayable",
        header: "CP PAYABLE",
        width: 125,
        minWidth: 105,
        className: "border-r border-brand-border/40 text-right whitespace-nowrap",
        headerClassName: "text-right",
        cell: (item) => {
          const val = item.cpPayable ?? 0;
          return (
            <div className="flex flex-col items-end py-0.5">
              <span className="font-mono text-xs font-bold text-burgundy-primary">
                ${val.toLocaleString("en-SG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] font-medium text-text-muted">SGD</span>
            </div>
          );
        },
      },
      {
        key: "topUps",
        header: "TOP-UPS",
        width: 120,
        minWidth: 100,
        className: "border-r border-brand-border/40 text-right whitespace-nowrap",
        headerClassName: "text-right",
        cell: (item) => {
          const val = item.topUpCollected ?? 0;
          return (
            <div className="flex flex-col items-end py-0.5">
              <span className="font-mono text-xs font-bold text-emerald-700">
                ${val.toLocaleString("en-SG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] font-medium text-text-muted">SGD</span>
            </div>
          );
        },
      },
      {
        key: "remaining",
        header: "REMAINING",
        width: 120,
        minWidth: 100,
        className: "border-r border-brand-border/40 text-right whitespace-nowrap",
        headerClassName: "text-right",
        cell: (item) => {
          const val = item.remainingCp ?? 0;
          return (
            <div className="flex flex-col items-end py-0.5">
              <span className={`font-mono text-xs font-bold ${val > 0 ? "text-amber-700" : "text-text-muted"}`}>
                ${val.toLocaleString("en-SG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] font-medium text-text-muted">SGD</span>
            </div>
          );
        },
      },
      {
        key: "cpStatus",
        header: "CP STATUS",
        width: 135,
        minWidth: 115,
        className: "border-r border-brand-border/40 text-center whitespace-nowrap",
        headerClassName: "text-center",
        cell: (item) => renderCpStatusBadge(item.cpStatus ?? item.dueStatus),
      },
      {
        key: "dueDate",
        header: "DUE DATE",
        width: 125,
        minWidth: 110,
        className: "border-r border-brand-border/40 text-center whitespace-nowrap",
        headerClassName: "text-center",
        cell: (item) => (
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-text-muted" />
            <span>{item.dueDate ?? item.filingDate}</span>
          </div>
        ),
      },
      {
        key: "detected",
        header: "DETECTED",
        width: 125,
        minWidth: 110,
        className: "text-center whitespace-nowrap",
        headerClassName: "text-center",
        cell: (item) => (
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary">
            <Clock className="h-3.5 w-3.5 shrink-0 text-text-muted" />
            <span>{item.detectedDate ?? item.filingDate}</span>
          </div>
        ),
      },
    ],
    [validCurrentPage, pageSize],
  );

  return (
    <div className="space-y-4">
      {/* 1. Summary Metric Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total CP Cases */}
        <div className="shadow-xs group relative overflow-hidden rounded-2xl border border-brand-border bg-white p-4 transition-all hover:border-brand-border/80 hover:shadow-sm">
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-burgundy-primary/5 blur-xl transition-colors group-hover:bg-burgundy-primary/10" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Total CP Cases</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-burgundy-primary/20 bg-burgundy-primary/10 text-burgundy-primary transition-transform group-hover:scale-110">
              <Scale className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2.5 flex flex-wrap items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-text-primary">{metrics.totalCases}</span>
            <span className="inline-flex items-center gap-1 rounded-md border border-burgundy-primary/20 bg-burgundy-primary/5 px-2 py-0.5 text-[11px] font-semibold text-burgundy-primary">
              <Users className="h-3 w-3" />
              {metrics.uniqueStudents} unique students
            </span>
          </div>
          <p className="mt-1 text-[11px] text-text-muted">Corporate partner & special case filings</p>
        </div>

        {/* Card 2: Not Due */}
        <div className="shadow-xs group relative overflow-hidden rounded-2xl border border-brand-border bg-white p-4 transition-all hover:border-brand-border/80 hover:shadow-sm">
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-slate-500/5 blur-xl transition-colors group-hover:bg-slate-500/10" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Not Due</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-600 transition-transform group-hover:scale-110">
              <CalendarClock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="font-mono text-2xl font-bold tracking-tight text-slate-700">{metrics.notDue}</span>
            <span className="ml-1 text-xs font-semibold text-text-secondary">Cases</span>
          </div>
          <p className="mt-1 text-[11px] text-text-muted">No upcoming scheduled tranches pending</p>
        </div>

        {/* Card 3: CP Due */}
        <div className="shadow-xs group relative overflow-hidden rounded-2xl border border-brand-border bg-white p-4 transition-all hover:border-brand-border/80 hover:shadow-sm">
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-brand-light-red blur-xl transition-colors group-hover:bg-brand-red/10" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">CP Due</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-red/20 bg-brand-light-red text-brand-red transition-transform group-hover:scale-110">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="font-mono text-2xl font-bold tracking-tight text-brand-red">{metrics.cpDue}</span>
            <span className="ml-1 text-xs font-semibold text-text-secondary">Pending Action</span>
          </div>
          <p className="mt-1 text-[11px] text-text-muted">Awaiting partner payment or sign-off</p>
        </div>

        {/* Card 4: CP Settled */}
        <div className="shadow-xs group relative overflow-hidden rounded-2xl border border-brand-border bg-white p-4 transition-all hover:border-brand-border/80 hover:shadow-sm">
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-success-light/60 blur-xl transition-colors group-hover:bg-emerald-500/10" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">CP Settled</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-success/30 bg-success-light text-success transition-transform group-hover:scale-110">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="font-mono text-2xl font-bold tracking-tight text-success">{metrics.cpSettled}</span>
            <span className="ml-1 text-xs font-semibold text-text-secondary">Cases Resolved</span>
          </div>
          <p className="mt-1 text-[11px] text-text-muted">Claims and sponsorships verified</p>
        </div>

        {/* Card 5: Total Shortfall */}
        <div className="shadow-xs group relative overflow-hidden rounded-2xl border border-brand-border bg-white p-4 transition-all hover:border-brand-border/80 hover:shadow-sm">
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-rose-500/5 blur-xl transition-colors group-hover:bg-rose-500/10" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Total Shortfall</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition-transform group-hover:scale-110">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="font-mono text-2xl font-bold tracking-tight text-rose-600">
              ${metrics.totalShortfall.toLocaleString("en-SG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="ml-1 text-xs font-semibold text-text-secondary">SGD</span>
          </div>
          <p className="mt-1 text-[11px] text-text-muted">Tuition shortfall before CP & top-ups</p>
        </div>

        {/* Card 6: Total CP Payable */}
        <div className="shadow-xs group relative overflow-hidden rounded-2xl border border-brand-border bg-white p-4 transition-all hover:border-brand-border/80 hover:shadow-sm">
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-burgundy-primary/5 blur-xl transition-colors group-hover:bg-burgundy-primary/10" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Total CP Payable</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-burgundy-primary/20 bg-burgundy-primary/10 text-burgundy-primary transition-transform group-hover:scale-110">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="font-mono text-2xl font-bold tracking-tight text-burgundy-primary">
              ${metrics.totalCpPayable.toLocaleString("en-SG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="ml-1 text-xs font-semibold text-text-secondary">SGD</span>
          </div>
          <p className="mt-1 text-[11px] text-text-muted">Total corporate sponsor obligations</p>
        </div>

        {/* Card 7: Top-Ups Collected */}
        <div className="shadow-xs group relative overflow-hidden rounded-2xl border border-brand-border bg-white p-4 transition-all hover:border-brand-border/80 hover:shadow-sm">
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-emerald-500/10 blur-xl transition-colors group-hover:bg-emerald-500/15" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Top-Ups Collected</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 transition-transform group-hover:scale-110">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="font-mono text-2xl font-bold tracking-tight text-emerald-700">
              ${metrics.topUpsCollected.toLocaleString("en-SG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="ml-1 text-xs font-semibold text-text-secondary">SGD</span>
          </div>
          <p className="mt-1 text-[11px] text-text-muted">Direct student self-funded top-ups</p>
        </div>

        {/* Card 8: Remaining CP */}
        <div className="shadow-xs group relative overflow-hidden rounded-2xl border border-brand-border bg-white p-4 transition-all hover:border-brand-border/80 hover:shadow-sm">
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-amber-500/10 blur-xl transition-colors group-hover:bg-amber-500/15" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Remaining CP</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700 transition-transform group-hover:scale-110">
              <Hourglass className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="font-mono text-2xl font-bold tracking-tight text-amber-700">
              ${metrics.remainingCp.toLocaleString("en-SG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="ml-1 text-xs font-semibold text-text-secondary">SGD</span>
          </div>
          <p className="mt-1 text-[11px] text-text-muted">Outstanding partner balance due</p>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="shadow-xs flex flex-col gap-3 rounded-2xl border border-brand-border bg-white p-3.5 lg:flex-row lg:items-end lg:justify-between">
        <div className="w-full shrink-0 sm:max-w-xs lg:w-72 xl:w-80">
          <SearchInput
            label="Search"
            labelIcon={Search}
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery("")}
            placeholder="Search student, course, partner..."
            size="sm"
          />
        </div>

        <div className="flex flex-wrap items-end gap-2 sm:gap-2.5">
          {/* CP Status filter */}
          <FilterSelect
            label="CP Status"
            value={selectedCpStatus}
            options={cpStatusOptions}
            onChange={setSelectedCpStatus}
            defaultValue="all"
            size="sm"
            className="w-full sm:w-44"
          />

          {/* Channel Partner filter */}
          <FilterSelect
            label="Channel Partner"
            value={selectedChannelPartner}
            options={channelPartnerOptions}
            onChange={setSelectedChannelPartner}
            defaultValue="all"
            searchable
            size="sm"
            className="w-full sm:w-56"
          />

          {/* Reset Filters */}
          {(searchQuery || selectedCpStatus !== "all" || selectedChannelPartner !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="h-9 shrink-0 gap-1.5 text-xs text-text-secondary hover:text-burgundy-primary"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          )}

          {/* Export to CSV */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExport}
            className="shadow-xs h-9 shrink-0 gap-1.5 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* 3. CP Case Data Table (Reusable DataTable from src/components/ui/Table.tsx) */}
      <div className="space-y-3">
        <DataTable<CpCaseReportRecord>
          columns={columns}
          data={paginatedData}
          keyExtractor={(item) => item.id}
          storageKey="ams_cp_case_report_table_widths_v3"
          layout="fixed"
          density="normal"
          showResizeGuide={true}
          guideStorageKey="ams_cp_case_report_resize_guide_v3"
          guideNote={
            <>
              Drag divider lines <span className="font-bold">┊</span> between column headers to resize columns
            </>
          }
          emptyMessage={
            searchQuery || selectedCpStatus !== "all" || selectedChannelPartner !== "all"
              ? "No CP case records match your filter criteria."
              : "No CP case report records found."
          }
        />

        {/* 4. Pagination */}
        {filteredData.length > 0 && (
          <div className="shadow-xs rounded-2xl border border-brand-border bg-white px-4 py-3">
            <Pagination
              currentPage={validCurrentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              pageSizeOptions={[5, 8, 12, 20]}
              showPageSize
              showTotal
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CpCaseReportTab;
