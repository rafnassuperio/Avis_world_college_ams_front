import React, { useRef } from "react";
import { Printer, GraduationCap, Shield, DollarSign, User } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CollegeStudent } from "../../types";

export interface PrintStudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: CollegeStudent;
}

export const PrintStudentProfileModal: React.FC<PrintStudentProfileModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (val: number | string | undefined): string => {
    if (val === undefined || val === null || val === "") return "$0.00";
    const num = typeof val === "number" ? val : parseFloat(val);
    if (isNaN(num)) return String(val);
    return new Intl.NumberFormat("en-SG", {
      style: "currency",
      currency: "SGD",
      minimumFractionDigits: 2,
    }).format(num);
  };

  const totalFeesNum =
    typeof student.totalFees === "number" ? student.totalFees : parseFloat(String(student.totalFees || 2583.3)) || 2583.3;
  const amountPaidNum =
    typeof student.amountPaid === "number" ? student.amountPaid : parseFloat(String(student.amountPaid || 0)) || 0;
  const pendingAmountNum =
    typeof student.pendingAmount === "number" ? student.pendingAmount : parseFloat(String(student.pendingAmount || 2583.3)) || 2583.3;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Student Profile Docket"
      subtitle={`Print or export official student profile sheet for ${student.name}`}
      headerIcon={
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-burgundy-primary/20 bg-burgundy-primary/10 text-burgundy-primary">
          <Printer className="h-5 w-5" />
        </div>
      }
      maxWidth="2xl"
    >
      <div className="space-y-4 pt-1">
        {/* Print Toolbar Action Bar */}
        <div className="flex items-center justify-between rounded-xl border border-brand-border bg-brand-bg/50 px-4 py-2.5 print:hidden">
          <div className="text-xs text-text-secondary">
            Use this view to print an official profile sheet or save as PDF.
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 rounded-xl text-xs font-semibold"
            >
              Close
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handlePrint}
              className="h-8 gap-1.5 rounded-xl bg-burgundy-primary px-4 text-xs font-semibold text-white hover:bg-burgundy-dark"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save PDF</span>
            </Button>
          </div>
        </div>

        {/* The Printable Sheet Preview */}
        <div
          ref={printAreaRef}
          className="rounded-2xl border border-brand-border bg-white p-6 shadow-sm print:m-0 print:border-none print:p-0 print:shadow-none"
        >
          {/* Institutional Header */}
          <div className="flex items-start justify-between border-b-2 border-burgundy-primary pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-bold tracking-wider text-burgundy-primary sm:text-xl">
                  AVIS WORLD COLLEGE
                </span>
                <span className="rounded bg-burgundy-primary/10 px-2 py-0.5 text-[10px] font-bold text-burgundy-primary">
                  OFFICIAL DOCKET
                </span>
              </div>
              <p className="text-[11px] text-text-muted">Academic Management & Student Registry System</p>
              <p className="mt-1 font-mono text-[10px] text-text-muted">
                DOCKET ID: {student.studentId} • DATE: {new Date().toLocaleDateString("en-SG", { dateStyle: "long" })}
              </p>
            </div>

            {/* Student Photo in print */}
            <div className="flex h-18 w-18 shrink-0 overflow-hidden rounded-xl border-2 border-brand-border bg-brand-bg">
              {student.avatar ? (
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-burgundy-primary/10 text-xl font-bold text-burgundy-primary">
                  {student.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Student Hero Header Banner */}
          <div className="mt-4 rounded-xl border border-brand-border bg-brand-bg/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h1 className="text-xl font-bold text-text-primary">{student.name}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                  <span className="font-mono font-bold text-burgundy-primary">ID: {student.studentId}</span>
                  <span>•</span>
                  <span>{student.course} ({student.courseCode || "HDIT"})</span>
                  <span>•</span>
                  <span>Intake: {student.intakeName || student.intake}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-bold uppercase text-emerald-800">
                  {student.status || "Enrolled"}
                </span>
                <div className="mt-1 text-[10px] text-text-muted">Type: {student.studentType || "International"}</div>
              </div>
            </div>
          </div>

          {/* Grid of Student Details */}
          <div className="mt-5 grid grid-cols-2 gap-4 text-xs">
            {/* Section 1: Academic & Course Information */}
            <div className="rounded-xl border border-brand-border p-3.5">
              <div className="mb-2.5 flex items-center gap-1.5 font-bold uppercase tracking-wider text-burgundy-primary">
                <GraduationCap className="h-3.5 w-3.5" />
                <span>Academic Information</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between border-b border-brand-border/40 py-1">
                  <span className="text-text-muted">College:</span>
                  <span className="font-semibold text-text-primary">{student.college || "Acetek College"}</span>
                </div>
                <div className="flex justify-between border-b border-brand-border/40 py-1">
                  <span className="text-text-muted">Course:</span>
                  <span className="font-semibold text-text-primary">{student.course}</span>
                </div>
                <div className="flex justify-between border-b border-brand-border/40 py-1">
                  <span className="text-text-muted">Intake Cohort:</span>
                  <span className="font-mono font-semibold text-text-primary">{student.intakeName || student.intake}</span>
                </div>
                <div className="flex justify-between border-b border-brand-border/40 py-1">
                  <span className="text-text-muted">Class:</span>
                  <span className="font-semibold text-text-primary">{student.class || "N/A"}</span>
                </div>
                <div className="flex justify-between border-b border-brand-border/40 py-1">
                  <span className="text-text-muted">Qualification:</span>
                  <span className="font-semibold text-text-primary">{student.highestQualification || "N/A"}</span>
                </div>
                <div className="flex justify-between border-b border-brand-border/40 py-1">
                  <span className="text-text-muted">Commencement:</span>
                  <span className="font-mono font-semibold text-text-primary">{student.commencementDate || "N/A"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-text-muted">Completion Date:</span>
                  <span className="font-mono font-semibold text-text-primary">{student.completionDate || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Section 2: Personal & Identity Information */}
            <div className="rounded-xl border border-brand-border p-3.5">
              <div className="mb-2.5 flex items-center gap-1.5 font-bold uppercase tracking-wider text-burgundy-primary">
                <User className="h-3.5 w-3.5" />
                <span>Identification & Personal</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between border-b border-brand-border/40 py-1">
                  <span className="text-text-muted">Passport No:</span>
                  <span className="font-mono font-semibold text-text-primary">{student.passportNo || student.passportOrNric || "N/A"}</span>
                </div>
                <div className="flex justify-between border-b border-brand-border/40 py-1">
                  <span className="text-text-muted">FIN No / Pass:</span>
                  <span className="font-mono font-semibold text-text-primary">{student.finNumber || "N/A"}</span>
                </div>
                <div className="flex justify-between border-b border-brand-border/40 py-1">
                  <span className="text-text-muted">Date of Birth:</span>
                  <span className="font-mono font-semibold text-text-primary">{student.dateOfBirth || "N/A"}</span>
                </div>
                <div className="flex justify-between border-b border-brand-border/40 py-1">
                  <span className="text-text-muted">Gender:</span>
                  <span className="font-semibold text-text-primary">{student.gender || "N/A"}</span>
                </div>
                <div className="flex justify-between border-b border-brand-border/40 py-1">
                  <span className="text-text-muted">Nationality:</span>
                  <span className="font-semibold text-text-primary">{student.nationality || "N/A"} ({student.country || "India"})</span>
                </div>
                <div className="flex justify-between border-b border-brand-border/40 py-1">
                  <span className="text-text-muted">Phone:</span>
                  <span className="font-mono font-semibold text-text-primary">{student.singaporePhone || student.phone || "N/A"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-text-muted">Email:</span>
                  <span className="font-semibold text-text-primary">{student.email || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Section 3: Payment & Settlement Summary */}
            <div className="rounded-xl border border-brand-border p-3.5">
              <div className="mb-2.5 flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-700">
                <DollarSign className="h-3.5 w-3.5" />
                <span>Financial & Fee Settlement</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between border-b border-brand-border/40 py-1">
                  <span className="text-text-muted">Total Course Fees:</span>
                  <span className="font-mono font-bold text-text-primary">{formatCurrency(totalFeesNum)}</span>
                </div>
                <div className="flex justify-between border-b border-brand-border/40 py-1">
                  <span className="text-text-muted">Amount Paid:</span>
                  <span className="font-mono font-bold text-emerald-700">{formatCurrency(amountPaidNum)}</span>
                </div>
                <div className="flex justify-between border-b border-brand-border/40 py-1">
                  <span className="text-text-muted">Pending Balance:</span>
                  <span className="font-mono font-bold text-rose-700">{formatCurrency(pendingAmountNum)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-text-muted">Payment Status:</span>
                  <span className="font-bold uppercase text-amber-700">{student.paymentStatus || "pending"}</span>
                </div>
              </div>
            </div>

            {/* Section 4: Emergency & Representative Contacts */}
            <div className="rounded-xl border border-brand-border p-3.5">
              <div className="mb-2.5 flex items-center gap-1.5 font-bold uppercase tracking-wider text-burgundy-primary">
                <Shield className="h-3.5 w-3.5" />
                <span>Guardian & Representatives</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between border-b border-brand-border/40 py-1">
                  <span className="text-text-muted">Guardian Name:</span>
                  <span className="font-semibold text-text-primary">{student.guardianName || "N/A"}</span>
                </div>
                <div className="flex justify-between border-b border-brand-border/40 py-1">
                  <span className="text-text-muted">Guardian NRIC:</span>
                  <span className="font-mono font-semibold text-text-primary">{student.guardianNric || "N/A"}</span>
                </div>
                <div className="flex justify-between border-b border-brand-border/40 py-1">
                  <span className="text-text-muted">Representative:</span>
                  <span className="font-semibold text-text-primary">{student.representative || "NONE"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-text-muted">Authorized Agent:</span>
                  <span className="font-semibold text-text-primary">{student.agent || "TEMP AGENT"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Verification & Signature Block */}
          <div className="mt-8 flex items-end justify-between border-t border-brand-border/60 pt-6 text-[11px] text-text-muted">
            <div>
              <p>Generated by Avis AMS Academic Registry System</p>
              <p className="mt-0.5">Enrolled: {student.enrolledAt || "August 3, 2026"} • Last Updated: {student.editedAt || "November 9, 2026"}</p>
            </div>
            <div className="w-48 text-center">
              <div className="border-b border-dashed border-text-muted/60 pb-8" />
              <p className="mt-1 font-semibold text-text-secondary">Authorized Registrar</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
