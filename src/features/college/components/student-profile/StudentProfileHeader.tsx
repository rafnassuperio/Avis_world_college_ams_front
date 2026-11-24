import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Edit3,
  Trash2,
  Check,
  Copy,
  CalendarCheck,
  CalendarX,
  TrendingUp,
  Mail,
  Phone,
  GraduationCap,
  ZoomIn,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CollegeStudent } from "../../types";
import { STUDENT_STATUS_CONFIG } from "../tabs/StudentsTab";
import { FilterSelect, FilterSelectOption } from "@/components/ui/FilterSelect";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/common/ToastMessage";
import { cn } from "@/lib/utils";

export interface StudentProfileHeaderProps {
  student: CollegeStudent;
  onStatusChange: (newStatus: "approved" | "enrolled" | "rejected" | "reported" | string) => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onAvatarChange?: (newUrl: string) => void;
}

const STATUS_FILTER_OPTIONS: FilterSelectOption[] = [
  {
    value: "Enrolled",
    label: "Enrolled",
    badgeDot: "bg-emerald-500",
    subLabel: "Active & attending classes",
  },
  {
    value: "Approved",
    label: "Approved",
    badgeDot: "bg-sky-500",
    subLabel: "Admission granted, pending intake",
  },
  {
    value: "Reported",
    label: "Reported",
    badgeDot: "bg-purple-500",
    subLabel: "Reported to ICA / regulatory",
  },
  {
    value: "Rejected",
    label: "Rejected",
    badgeDot: "bg-rose-500",
    subLabel: "Admission or pass declined",
  },
];

export const StudentProfileHeader: React.FC<StudentProfileHeaderProps> = ({ student, onStatusChange, onEditClick, onDeleteClick }) => {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

  useEffect(() => {
    if (!isZoomModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsZoomModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isZoomModalOpen]);

  const rawStatus = student.status || "—";
  const normalizedStatus = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();
  const statusStyle = STUDENT_STATUS_CONFIG[normalizedStatus] || STUDENT_STATUS_CONFIG.Enrolled;

  const handleCopyId = () => {
    if (!student.studentId) return;
    navigator.clipboard.writeText(student.studentId);
    setCopiedId(true);
    toast.success("Student ID copied to clipboard");
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    const mail = student.email || "—";
    navigator.clipboard.writeText(mail);
    setCopiedEmail(true);
    toast.success("Email copied to clipboard");
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPhone = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = student.singaporePhone || student.phone || "—";
    navigator.clipboard.writeText(phone);
    setCopiedPhone(true);
    toast.success("Phone number copied to clipboard");
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  return (
    <>
      <div className="relative z-20 overflow-hidden rounded-2xl border border-brand-border bg-white shadow-card">
        {/* Decorative Top Campus Banner */}
        <div className="relative h-20 w-full overflow-hidden bg-gradient-to-r from-palette-midnight via-burgundy-primary to-brand-red sm:h-20"></div>

        {/* Main Profile Info Row */}
        <div className="px-5 pb-5 pt-0 sm:px-6 sm:pb-6">
          <div className="relative z-20 -mt-12 flex flex-col justify-between gap-5 sm:-mt-14 lg:flex-row lg:items-end">
            {/* Left: Avatar & Identification */}
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
              {/* Avatar Container with Click to Zoom */}
              <div className="group relative shrink-0">
                <button
                  type="button"
                  onClick={() => setIsZoomModalOpen(true)}
                  title="Click to zoom student photo"
                  className="group/avatar relative block h-24 w-24 overflow-hidden rounded-2xl border-4 border-white bg-brand-bg shadow-md ring-1 ring-brand-border transition-all duration-300 hover:ring-2 hover:ring-burgundy-primary/50 focus:outline-none focus:ring-2 focus:ring-burgundy-primary sm:h-28 sm:w-28"
                >
                  {student.avatar ? (
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover/avatar:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-burgundy-primary/10 text-2xl font-bold text-burgundy-primary">
                      {student.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  {/* Hover Overlay with Zoom Icon */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 backdrop-blur-[1.5px] transition-opacity duration-200 group-hover/avatar:opacity-100">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-burgundy-primary shadow-md">
                      <ZoomIn className="h-4 w-4" />
                    </div>
                  </div>
                </button>
              </div>

              {/* Title, Badges & Interactive Contact Chips */}
              <div className="space-y-1.5 pt-1">
                {/* Student Name & Status */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl font-bold tracking-tight text-text-primary sm:text-xl sm:text-white">{student.name}</h1>
                  {/* <h1 className="text-md font-bold tracking-tight text-text-primary sm:text-md sm:text-white">{student.country}</h1> */}

                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider",
                      statusStyle.bg,
                      statusStyle.border,
                      statusStyle.text,
                    )}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    <span>{normalizedStatus}</span>
                  </span>
                </div>

                {/* Student ID badge with 1-click copy & Course details */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="group inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-brand-bg px-2.5 py-1 font-mono text-xs font-bold text-text-primary transition-all hover:border-burgundy-primary/40 hover:bg-brand-light-red/30"
                    title="Click to copy Student ID"
                  >
                    <span className="text-[11px] font-normal text-text-muted">ID:</span>
                    <span>{student.studentId}</span>
                    {copiedId ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-text-muted transition-colors group-hover:text-burgundy-primary" />
                    )}
                  </button>

                  <span className="text-text-muted">•</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-text-primary">
                    <GraduationCap className="h-3.5 w-3.5 text-burgundy-primary" />
                    <span>{student.course}</span>
                  </span>

                  <span className="text-text-muted">•</span>
                  <span className="rounded-md border border-brand-border bg-brand-bg px-2 py-0.5 font-mono text-[11px] font-semibold text-text-muted">
                    Intake: {student.intakeName || student.intake}
                  </span>
                </div>

                {/* Contact Endpoints (Email, Phone) */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
                  {/* Email chip */}
                  <div className="group inline-flex items-center gap-1.5 rounded-lg border border-brand-border/80 bg-white px-2 py-0.5 text-text-secondary hover:border-burgundy-primary/30">
                    <Mail className="h-3 w-3 text-burgundy-primary" />
                    <a
                      href={`mailto:${student.email || "—"}`}
                      className="font-mono text-[11px] text-text-secondary hover:text-burgundy-primary hover:underline"
                    >
                      {student.email || "—"}
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      title="Copy email"
                      className="rounded p-0.5 text-text-muted hover:text-burgundy-primary"
                    >
                      {copiedEmail ? <Check className="h-2.5 w-2.5 text-emerald-600" /> : <Copy className="h-2.5 w-2.5" />}
                    </button>
                  </div>

                  {/* Phone chip */}
                  <div className="group inline-flex items-center gap-1.5 rounded-lg border border-brand-border/80 bg-white px-2 py-0.5 text-text-secondary hover:border-burgundy-primary/30">
                    <Phone className="h-3 w-3 text-emerald-600" />
                    <a
                      href={`tel:${student.singaporePhone || student.phone || "—"}`}
                      className="font-mono text-[11px] text-text-secondary hover:text-burgundy-primary"
                    >
                      {student.singaporePhone || student.phone || "—"}
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyPhone}
                      title="Copy phone"
                      className="rounded p-0.5 text-text-muted hover:text-burgundy-primary"
                    >
                      {copiedPhone ? <Check className="h-2.5 w-2.5 text-emerald-600" /> : <Copy className="h-2.5 w-2.5" />}
                    </button>
                  </div>

                  {/* Enrolled & Last Edited Timestamps */}
                  <span className="hidden text-brand-border sm:inline">•</span>
                  <div className="inline-flex items-center gap-1 text-[11px] text-text-muted">
                    <Calendar className="h-3 w-3 text-emerald-600" />
                    <span>Enrolled: {student.enrolledAt ? student.enrolledAt.split(" at ")[0] : "Aug 3, 2026"}</span>
                  </div>
                  <span className="hidden text-brand-border sm:inline">•</span>
                  <div className="inline-flex items-center gap-1 text-[11px] text-text-muted">
                    <Clock className="h-3 w-3 text-amber-600" />
                    <span>Updated: {student.editedAt ? student.editedAt.split(" at ")[0] : "Nov 9, 2026"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Action Buttons (Status, Print, Edit, Delete) */}
            <div className="relative z-30 flex flex-wrap items-center gap-2 self-start lg:self-end">
              {/* Status Change Selector using FilterSelect */}
              <div className="relative z-30 w-36 sm:w-40">
                <FilterSelect
                  value={normalizedStatus}
                  options={STATUS_FILTER_OPTIONS}
                  onChange={(newVal) => onStatusChange(newVal)}
                  size="sm"
                  align="right"
                  usePortal={true}
                  buttonClassName={cn(
                    "h-8.5 rounded-xl font-bold border transition-all shadow-2xs hover:shadow-xs",
                    statusStyle.bg,
                    statusStyle.border,
                    statusStyle.text,
                  )}
                />
              </div>

              {/* Edit Student Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={onEditClick}
                className="h-8.5 shadow-2xs rounded-xl border-brand-border bg-white px-3 text-xs font-semibold text-text-primary transition-all hover:border-burgundy-primary/40 hover:bg-brand-bg hover:text-burgundy-primary"
              >
                <Edit3 className="mr-1.5 h-3.5 w-3.5 text-burgundy-primary" />
                Edit Profile
              </Button>

              {/* Delete Student Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={onDeleteClick}
                className="h-8.5 shadow-2xs rounded-xl border-rose-200 bg-rose-50/50 px-3 text-xs font-semibold text-rose-700 transition-all hover:border-rose-300 hover:bg-rose-100 hover:text-rose-800"
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5 text-rose-600" />
                Delete
              </Button>
            </div>
          </div>

          {/* 3 Metric Cards: Attendance, Leave, Performance */}
          <div className="relative z-10 mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* 1. Attendance */}
            <div className="shadow-2xs hover:shadow-xs group relative overflow-hidden rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/50 via-white to-white px-3.5 py-2.5 transition-all hover:border-emerald-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Attendance</span>
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <CalendarCheck className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-mono text-xl font-bold tracking-tight text-emerald-950 sm:text-2xl">{student.attendanceCount || "—"}</span>
                <span className="text-[11px] font-medium text-emerald-700">Recorded attendance</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-emerald-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, parseFloat(String(student.attendanceCount || 0)) || 0)}%` }}
                />
              </div>
            </div>

            {/* 2. Leave */}
            <div className="shadow-2xs hover:shadow-xs group relative overflow-hidden rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50/50 via-white to-white px-3.5 py-2.5 transition-all hover:border-amber-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Leave Record</span>
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                  <CalendarX className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-mono text-xl font-bold tracking-tight text-amber-950 sm:text-2xl">{student.leaveCount || "—"}</span>
                <span className="text-[11px] font-medium text-amber-700">2 Approved · 1 Pending</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-amber-100">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all duration-500"
                  style={{ width: "0%" }}
                />
              </div>
            </div>

            {/* 3. Performance */}
            <div className="shadow-2xs hover:shadow-xs group relative overflow-hidden rounded-xl border border-burgundy-primary/20 bg-gradient-to-br from-brand-light-red/25 via-white to-white px-3.5 py-2.5 transition-all hover:border-burgundy-primary/30">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-burgundy-primary">Academic Standing</span>
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-burgundy-primary/10 text-burgundy-primary">
                  <TrendingUp className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-mono text-xl font-bold tracking-tight text-palette-midnight sm:text-2xl">
                  {student.performanceCount || "—"}
                </span>
                <span className="text-[11px] font-medium text-brand-red">Published grade</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-brand-light-red/50">
                <div
                  className="h-full rounded-full bg-burgundy-primary transition-all duration-500"
                  style={{ width: "0%" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Student Image Zoom Lightbox Modal */}
      <AnimatePresence>
        {isZoomModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsZoomModalOpen(false)}
              className="fixed inset-0 bg-black/80"
            />

            {/* Modal Dialog Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-10 flex max-h-[90vh] max-w-2xl flex-col items-center overflow-hidden rounded-3xl border border-white/15 bg-palette-midnight/95 p-4 shadow-2xl backdrop-blur-xl sm:p-6"
            >
              {/* Top Controls: Title & Close Button */}
              <div className="flex w-full items-center justify-between pb-3 text-white">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-burgundy-primary/30 text-white">
                    <ZoomIn className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold tracking-tight text-white">{student.name}</h3>
                    <p className="font-mono text-[11px] text-white/60">{student.studentId}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsZoomModalOpen(false)}
                    className="rounded-xl border border-white/10 bg-white/10 p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                    title="Close preview"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Zoomed Image Container */}
              <div className="relative flex max-h-[72vh] w-full items-center justify-center overflow-hidden rounded-2xl bg-black/40 p-2">
                {student.avatar ? (
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="max-h-[68vh] w-auto max-w-full rounded-xl object-contain shadow-lg ring-1 ring-white/10"
                  />
                ) : (
                  <div className="flex h-64 w-64 items-center justify-center rounded-2xl bg-burgundy-primary/20 text-6xl font-bold text-burgundy-primary">
                    {student.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
