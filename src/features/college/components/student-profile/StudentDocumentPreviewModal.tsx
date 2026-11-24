import React, { useRef } from "react";
import { Printer, ShieldCheck, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CollegeStudent } from "../../types";

export interface StudentDocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: CollegeStudent;
  documentTitle: string;
  documentType: "contract" | "cloo" | "loo" | "advisory" | "custom";
  generatedDate?: string;
  intakePeriod?: string;
}

export const StudentDocumentPreviewModal: React.FC<StudentDocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  student,
  documentTitle,
  documentType,
  generatedDate = "",
  intakePeriod,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (val: number | string | undefined): string => {
    if (val === undefined || val === null || val === "") return "—";
    const num = typeof val === "number" ? val : parseFloat(val);
    if (isNaN(num)) return String(val);
    return new Intl.NumberFormat("en-SG", {
      style: "currency",
      currency: "SGD",
      minimumFractionDigits: 2,
    }).format(num);
  };

  const totalFeesDisplay = formatCurrency(student.totalFees);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={documentTitle}
      subtitle={`Official institutional copy for ${student.name} (${student.studentId})`}
      headerIcon={
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-burgundy-primary/20 bg-burgundy-primary/10 text-burgundy-primary">
          <FileText className="h-5 w-5" />
        </div>
      }
      maxWidth="3xl"
    >
      <div className="space-y-4 pt-1">
        {/* Top Action Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-border bg-brand-bg/50 px-4 py-2.5 print:hidden">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-text-secondary">
              Status: <span className="font-semibold text-emerald-700">Official Generated Copy</span> • Date: {generatedDate}
            </span>
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

        {/* Printable Document Paper Sheet */}
        <div
          ref={contentRef}
          className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-800 shadow-sm print:border-none print:p-0 print:shadow-none"
        >
          {/* Header with Avis College Logo / Letterhead */}
          <div className="border-b-2 border-burgundy-primary pb-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-burgundy-primary text-white font-black text-sm">
                    AWC
                  </div>
                  <div>
                    <h1 className="text-lg font-black tracking-tight text-burgundy-primary">
                      AVIS WORLD COLLEGE PTE. LTD.
                    </h1>
                    <p className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">
                      CPE Reg No / UEN: 201812345Z • Period of Registration: 14 July 2024 to 13 July 2028
                    </p>
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-slate-600">
                  100 Jalan Sultan, #03-12 Sultan Plaza, Singapore 199001 • Tel: +65 6291 2345 • www.avisworld.edu.sg
                </div>
              </div>

              <div className="text-right">
                <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>EduTrust Certified</span>
                </div>
                <div className="mt-1 font-mono text-[10px] text-slate-400">
                  Ref: AWC/DOC/{student.studentId || "—"}
                </div>
              </div>
            </div>
          </div>

          {/* Document Title Banner */}
          <div className="my-5 text-center">
            <h2 className="text-base font-bold uppercase tracking-wider text-slate-900">
              {documentTitle}
            </h2>
            <div className="mt-1 flex items-center justify-center gap-4 text-xs text-slate-500">
              <span>Date of Issue: <strong>{generatedDate}</strong></span>
              <span>•</span>
              <span>Student ID: <strong className="font-mono">{student.studentId}</strong></span>
            </div>
          </div>

          {/* Student Dossier Summary Grid */}
          <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
              Candidate Information
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Full Name</span>
                <span className="font-bold text-slate-800">{student.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Passport / NRIC</span>
                <span className="font-semibold text-slate-800">{student.passportNo || student.passportOrNric || "—"}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Nationality</span>
                <span className="font-semibold text-slate-800">{student.nationality || "—"}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Date of Birth</span>
                <span className="font-semibold text-slate-800">{student.dateOfBirth || "—"}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500 block text-[10px] uppercase">Course Enrolled</span>
                <span className="font-bold text-slate-800">{student.course}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Intake</span>
                <span className="font-semibold text-slate-800">{intakePeriod || student.intake || "—"}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Study Mode</span>
                <span className="font-semibold text-slate-800">{student.studyMode || "—"}</span>
              </div>
            </div>
          </div>

          {/* Document-Specific Content Clauses */}
          {documentType === "contract" && (
            <div className="space-y-4 text-xs leading-relaxed text-slate-700">
              <div>
                <h3 className="font-bold text-slate-900 uppercase text-[11px] mb-1">
                  1. COURSE INFORMATION & COMMENCEMENT
                </h3>
                <p>
                  Avis World College Pte Ltd undertakes to provide the Course known as{" "}
                  <strong>{student.course}</strong> to the Student commencing on{" "}
                  <strong>{student.commencementDate || student.joinedDate || "—"}</strong> and scheduled to conclude on{" "}
                  <strong>{student.completionDate || "—"}</strong>.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 uppercase text-[11px] mb-1">
                  2. FEES BREAKDOWN & FEE PROTECTION SCHEME (FPS)
                </h3>
                <p>
                  The total course fee payable by the Student is <strong>{totalFeesDisplay}</strong> (inclusive of prevailing Goods and Services Tax where applicable). 
                  In compliance with EduTrust standards and CPE statutory guidelines, all course fees are protected under the Fee Protection Scheme (FPS) administered by Lonpac Insurance Bhd.
                </p>
                <div className="mt-2 rounded-lg border border-slate-200 bg-white p-3 font-mono text-[11px]">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Course Tuition Fee:</span>
                    <span className="font-semibold">$2,200.00</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>FPS Insurance & Admin Fee:</span>
                    <span className="font-semibold">$150.00</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Medical Insurance Coverage:</span>
                    <span className="font-semibold">$80.00</span>
                  </div>
                  <div className="flex justify-between py-1 font-bold text-slate-900">
                    <span>Total Amount Payable:</span>
                    <span className="text-burgundy-primary">{totalFeesDisplay}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 uppercase text-[11px] mb-1">
                  3. REFUND POLICY & COOLING-OFF PERIOD
                </h3>
                <p>
                  A standard cooling-off period of seven (7) working days applies from the date of signing. 
                  During this period, the Student may submit written notice of withdrawal to receive maximum refund according to Schedule D of the Standard PEI-Student Contract.
                </p>
              </div>
            </div>
          )}

          {documentType === "cloo" && (
            <div className="space-y-4 text-xs leading-relaxed text-slate-700">
              <p>
                Dear <strong>{student.name}</strong>,
              </p>
              <p>
                We are pleased to issue this <strong>Conditional Letter of Offer (CLOO)</strong> for admission into{" "}
                <strong>{student.course}</strong> at Avis World College Pte Ltd for the <strong>{student.intake || "—"}</strong> intake.
              </p>
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5">
                <div className="flex items-center gap-2 font-bold text-amber-800 text-[11px] uppercase mb-1.5">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span>Conditions Required for Final Acceptance:</span>
                </div>
                <ol className="list-decimal pl-5 space-y-1 text-amber-900 text-[11px]">
                  <li>Submission of verified copies of highest academic transcripts and English proficiency score.</li>
                  <li>Receipt of ICA Student Pass In-Principle Approval (IPA) letter for international applicants.</li>
                  <li>Execution of Standard PEI-Student Contract and settlement of initial enrollment deposit.</li>
                </ol>
              </div>
              <p>
                This conditional offer is valid for fourteen (14) calendar days from the date of issuance. Please fulfill the above conditions to secure your matriculation.
              </p>
            </div>
          )}

          {documentType === "loo" && (
            <div className="space-y-4 text-xs leading-relaxed text-slate-700">
              <p>
                Dear <strong>{student.name}</strong>,
              </p>
              <p>
                Avis World College is delighted to offer you admission into the <strong>{student.course}</strong> commencing on{" "}
                <strong>{student.commencementDate || student.joinedDate || "—"}</strong>.
              </p>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <h4 className="font-bold text-slate-900 text-[11px] uppercase mb-2">Offer Highlights:</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-700">
                  <li>Programme: <strong>{student.course}</strong> ({student.courseCode || "—"})</li>
                  <li>Enrollment Classification: <strong>{student.studentType || "—"} Student</strong></li>
                  <li>Intake Schedule: <strong>{student.intake || "—"}</strong></li>
                  <li>Total Fee Assessment: <strong>{totalFeesDisplay}</strong></li>
                </ul>
              </div>
              <div className="border-t border-slate-200 pt-3">
                <h4 className="font-bold text-slate-900 text-[11px] uppercase mb-1">Acceptance Undertaking:</h4>
                <p className="italic text-slate-600">
                  "I hereby accept the unconditional offer of admission to Avis World College and agree to abide by all institution regulations, attendance mandates, and codes of conduct."
                </p>
              </div>
            </div>
          )}

          {documentType === "advisory" && (
            <div className="space-y-4 text-xs leading-relaxed text-slate-700">
              <div className="rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-center font-bold text-slate-900 uppercase text-[11px]">
                FORM 12: ADVISORY NOTE TO STUDENTS (PRIVATE EDUCATION ACT SINGAPORE)
              </div>
              <p>
                This note aims to help you make an informed decision on whether to enrol for the course of study. 
                You are advised to read every clause carefully and raise any questions before signing the PEI-Student Contract.
              </p>
              <div className="space-y-2 border border-slate-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>1. Verified that the course is registered with the Committee for Private Education (CPE).</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>2. Noted the total fees payable, installment schedules, and refund policy provisions.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>3. Acknowledged protection under mandatory Fee Protection Scheme (FPS Insurance).</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>4. Received and reviewed a complete duplicate copy of the Standard PEI-Student Contract.</span>
                </div>
              </div>
            </div>
          )}

          {documentType === "custom" && (
            <div className="space-y-4 text-xs leading-relaxed text-slate-700">
              <p>
                This official institutional addendum document pertains to the student dossier of <strong>{student.name}</strong> (Student ID: {student.studentId}).
              </p>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-medium text-slate-800">
                  Document Title: <strong>{documentTitle}</strong>
                </p>
                <p className="mt-1 text-slate-600">
                  Recorded in the institutional repository under official student records for course: {student.course}.
                </p>
              </div>
            </div>
          )}

          {/* Institutional Signatures & Stamp */}
          <div className="mt-8 border-t border-slate-200 pt-6">
            <div className="grid grid-cols-2 gap-8 text-xs">
              <div>
                <div className="h-12 border-b border-dashed border-slate-400 flex items-end pb-1 font-serif text-sm font-semibold text-slate-800">
                  {student.name}
                </div>
                <div className="mt-1.5 text-[11px] text-slate-600">
                  <span className="font-bold text-slate-800">Student Signature</span>
                  <div className="text-[10px] text-slate-400">Date: {generatedDate}</div>
                </div>
              </div>

              <div className="relative">
                <div className="h-12 border-b border-dashed border-slate-400 flex items-end pb-1 font-serif text-sm font-semibold text-burgundy-primary">
                  Dr. Richard Tan (Registrar)
                </div>
                {/* Simulated Institutional Seal */}
                <div className="absolute right-2 -top-3 flex h-14 w-14 items-center justify-center rounded-full border-2 border-burgundy-primary/40 bg-burgundy-primary/5 text-center text-[7px] font-bold uppercase tracking-tight text-burgundy-primary rotate-12 pointer-events-none">
                  Avis College<br/>Official<br/>Seal
                </div>
                <div className="mt-1.5 text-[11px] text-slate-600">
                  <span className="font-bold text-slate-800">Avis World College Registrar</span>
                  <div className="text-[10px] text-slate-400">Authorized Official Seal & Endorsement</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
