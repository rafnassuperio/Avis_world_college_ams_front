import React, { useState } from "react";
import { User, CreditCard, Globe, GraduationCap, Calendar, ShieldCheck, CheckCircle2, Copy, Check } from "lucide-react";
import { PaymentRecord } from "../../types";
import { toast } from "@/components/common/ToastMessage";

export interface StudentDetailsCardProps {
  record?: PaymentRecord;
  className?: string;
}

export const StudentDetailsCard: React.FC<StudentDetailsCardProps> = ({ record, className = "" }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const studentName = record?.student.name || "—";
  const finNumber = record?.student.finNumber || "—";
  const nationality = record?.student.nationality || "—";
  const course = record?.student.course || "—";
  const tenureDate = record?.student.tenureDate || "—";

  // Monogram initials
  const initials = studentName
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === label ? null : prev));
    }, 2000);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-brand-border bg-white p-4 shadow-card transition-all duration-200 hover:shadow-card-hover sm:p-5 ${className}`}
    >
      {/* Ambient Brand Accent Glows */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-brand-light-red/40 via-burgundy-primary/10 to-transparent blur-2xl" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-brand-light-red/25 blur-2xl" />

      {/* Top Meta Bar */}
      <div className="relative z-10 mb-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-brand-border/70 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-burgundy-primary/10 text-burgundy-primary">
            <ShieldCheck className="h-4 w-4 text-burgundy-primary" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">Student Identification</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success-light px-2.5 py-0.5 text-[11px] font-bold text-success">
            <CheckCircle2 className="h-3 w-3 stroke-[2.5] text-success" />
            Verified Student Pass Holder
          </span>
        </div>
      </div>

      {/* Grid of 5 Requested Card Details: Student, FIN Number, Nationality, Course, Tenure Date */}
      <div className="relative z-10 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {/* 1. Student */}
        <div className="shadow-2xs hover:shadow-xs group relative flex items-start gap-3 rounded-xl border border-brand-border/70 bg-brand-bg/40 p-3 transition-all duration-200 hover:border-burgundy-primary/30 hover:bg-white">
          <div className="shadow-xs flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-burgundy-dark to-burgundy-primary font-mono text-xs font-black text-white ring-2 ring-brand-light-red">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
              <User className="h-3 w-3 text-burgundy-primary" />
              Student
            </span>
            <p
              className="mt-0.5 truncate text-[10px] font-bold text-text-primary"
              title={studentName}
            >
              {studentName}
            </p>
          </div>
        </div>

        {/* 2. FIN Number */}
        <div className="shadow-2xs hover:shadow-xs group relative flex items-start gap-3 rounded-xl border border-brand-border/70 bg-brand-bg/40 p-3 transition-all duration-200 hover:border-burgundy-primary/30 hover:bg-white">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-burgundy-primary/15 bg-burgundy-primary/10 text-burgundy-primary">
            <CreditCard className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">FIN Number</span>
              <button
                type="button"
                onClick={() => handleCopy(finNumber, "FIN Number")}
                title="Copy FIN Number"
                className="rounded p-0.5 text-text-muted opacity-60 transition-all hover:bg-brand-light-red/40 hover:text-burgundy-primary hover:opacity-100 group-hover:opacity-100"
              >
                {copiedKey === "FIN Number" ? <Check className="h-3 w-3 stroke-[2.5] text-success" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
            <p className="mt-0.5 font-mono text-[10px] font-black tracking-wide text-burgundy-primary">{finNumber}</p>
          </div>
        </div>

        {/* 3. Nationality */}
        <div className="shadow-2xs hover:shadow-xs group relative flex items-start gap-3 rounded-xl border border-brand-border/70 bg-brand-bg/40 p-3 transition-all duration-200 hover:border-burgundy-primary/30 hover:bg-white">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-brand-red/20 bg-brand-light-red/60 text-brand-red">
            <Globe className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">Nationality</span>
            <p
              className="mt-0.5 truncate text-[10px] font-bold text-text-primary"
              title={nationality}
            >
              {nationality}
            </p>
          </div>
        </div>

        {/* 4. Course */}
        <div className="shadow-2xs hover:shadow-xs group relative flex items-start gap-3 rounded-xl border border-brand-border/70 bg-brand-bg/40 p-3 transition-all duration-200 hover:border-burgundy-primary/30 hover:bg-white">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-burgundy-dark/15 bg-burgundy-dark/10 text-burgundy-dark">
            <GraduationCap className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">Course</span>
            <p
              className="mt-0.5 truncate text-[10px] font-bold text-text-primary"
              title={course}
            >
              {course}
            </p>
          </div>
        </div>

        {/* 5. Tenure Date */}
        <div className="shadow-2xs hover:shadow-xs group relative flex items-start gap-3 rounded-xl border border-brand-border/70 bg-brand-bg/40 p-3 transition-all duration-200 hover:border-burgundy-primary/30 hover:bg-white">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-palette-5/30 bg-palette-5/15 text-burgundy-primary">
            <Calendar className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">Tenure Date</span>
            <p
              className="mt-0.5 truncate text-[10px] font-bold text-text-primary"
              title={tenureDate}
            >
              {tenureDate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsCard;
