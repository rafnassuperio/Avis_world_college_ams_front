import React, { useState, useRef } from "react";
import {
  FileText,
  Printer,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Clock,
  MapPin,
  User,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { IntakeTimetable, CollegeIntake } from "../types";

export interface TimetablePdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  timetable: IntakeTimetable | null;
  intake?: CollegeIntake | null;
}

export const TimetablePdfModal: React.FC<TimetablePdfModalProps> = ({
  isOpen,
  onClose,
  timetable,
  intake,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const printableRef = useRef<HTMLDivElement>(null);

  if (!timetable) return null;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 10, 140));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 10, 70));
  const handleResetZoom = () => setZoomLevel(100);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    // Generate clean print / save dialog
    window.print();
  };

  const intakeName = timetable.intakeName || intake?.intakeName || intake?.name || "Academic Cohort";
  const academicYear = timetable.academicYear || intake?.year || "AY 2025-2026";
  const term = timetable.term || (intake?.term ? intake.term : "Semester 1");

  // Default sessions if not specified on timetable
  const sessions = timetable.sessions && timetable.sessions.length > 0
    ? timetable.sessions
    : [
        {
          day: "Monday",
          startTime: "09:00 AM",
          endTime: "10:45 AM",
          moduleCode: `${timetable.courseCode}-101`,
          moduleName: `Foundations of ${timetable.courseTitle}`,
          lecturer: timetable.lecturerLead,
          venue: timetable.room,
          type: "Lecture",
        },
        {
          day: "Monday",
          startTime: "11:00 AM",
          endTime: "01:00 PM",
          moduleCode: `${timetable.courseCode}-102L`,
          moduleName: "Practical Applications & Laboratory Lab",
          lecturer: "Eng. Ronald Smith",
          venue: timetable.room,
          type: "Lab",
        },
        {
          day: "Wednesday",
          startTime: "09:30 AM",
          endTime: "12:30 PM",
          moduleCode: `${timetable.courseCode}-205`,
          moduleName: "Advanced Methods & Industry Case Studies",
          lecturer: timetable.lecturerLead,
          venue: "Lecture Theatre 2",
          type: "Workshop",
        },
        {
          day: "Thursday",
          startTime: "02:00 PM",
          endTime: "04:30 PM",
          moduleCode: `${timetable.courseCode}-301`,
          moduleName: "Research Seminar & Group Project",
          lecturer: "Dr. Sarah Jenkins",
          venue: "Seminar Room 104",
          type: "Tutorial",
        },
        {
          day: "Friday",
          startTime: "10:00 AM",
          endTime: "01:00 PM",
          moduleCode: `${timetable.courseCode}-310L`,
          moduleName: "Capstone Technical Studio & Review",
          lecturer: timetable.lecturerLead,
          venue: timetable.room,
          type: "Lab",
        },
      ];

  const typeBadgeStyles: Record<string, string> = {
    Lecture: "bg-burgundy-primary/10 text-burgundy-primary border-burgundy-primary/20",
    Lab: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Workshop: "bg-sky-50 text-sky-700 border-sky-200",
    Tutorial: "bg-amber-50 text-amber-700 border-amber-200",
  };

  const headerActions = (
    <div className="flex items-center gap-1.5">
      {/* Zoom controls */}
      <div className="hidden items-center gap-1 rounded-xl border border-brand-border bg-brand-bg/70 px-2 py-1 sm:flex">
        <button
          type="button"
          onClick={handleZoomOut}
          disabled={zoomLevel <= 70}
          className="rounded p-1 text-text-muted hover:bg-white hover:text-text-primary disabled:opacity-40"
          title="Zoom out"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>
        <span className="min-w-[40px] text-center font-mono text-[11px] font-semibold text-text-secondary">
          {zoomLevel}%
        </span>
        <button
          type="button"
          onClick={handleZoomIn}
          disabled={zoomLevel >= 140}
          className="rounded p-1 text-text-muted hover:bg-white hover:text-text-primary disabled:opacity-40"
          title="Zoom in"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
        {zoomLevel !== 100 && (
          <button
            type="button"
            onClick={handleResetZoom}
            className="ml-1 rounded p-1 text-text-muted hover:bg-white hover:text-burgundy-primary"
            title="Reset Zoom"
          >
            <RotateCw className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Print */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handlePrint}
        className="h-8 gap-1.5 rounded-xl border-brand-border px-2.5 text-xs text-text-secondary hover:text-text-primary"
        title="Print Course Timetable PDF"
      >
        <Printer className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Print</span>
      </Button>

      {/* Download */}
      <Button
        type="button"
        variant="burgundy"
        size="sm"
        onClick={handleDownloadPdf}
        className="h-8 gap-1.5 rounded-xl px-2.5 text-xs font-semibold shadow-xs"
        title="Download Official Timetable PDF"
      >
        <Download className="h-3.5 w-3.5" />
        <span>Download PDF</span>
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-text-primary sm:text-lg">
            Course Timetable PDF
          </span>
          <span className="rounded-md border border-burgundy-primary/20 bg-burgundy-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-burgundy-primary">
            {timetable.classCode}
          </span>
        </div>
      }
      subtitle={`Official Schedule • ${timetable.courseTitle} • ${intakeName}`}
      headerIcon={<FileText className="h-5 w-5 text-burgundy-primary" />}
      headerActions={headerActions}
      maxWidth="5xl"
      bodyClassName="bg-slate-100/70 p-3 sm:p-6 overflow-y-auto"
      className="max-h-[92vh]"
    >
      {/* Zoom container */}
      <div
        className="mx-auto transition-transform duration-200"
        style={{
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: "top center",
          maxWidth: "920px",
        }}
      >
        {/* PDF Paper Sheet */}
        <div
          ref={printableRef}
          className="relative mx-auto rounded-xl border border-slate-200 bg-white p-6 shadow-2xl print:m-0 print:border-none print:p-0 print:shadow-none sm:p-10"
        >
          {/* Top Decorative Border */}
          <div className="absolute inset-x-0 top-0 h-2 rounded-t-xl bg-gradient-to-r from-burgundy-sidebar via-burgundy-primary to-burgundy-hover" />

          {/* Document Header */}
          <div className="flex flex-col border-b border-brand-border/80 pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-burgundy-primary text-white shadow-md shadow-burgundy-primary/20">
                <GraduationCap className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-text-primary sm:text-2xl">
                  AVIS WORLD COLLEGE
                </h1>
                <p className="text-xs font-semibold uppercase tracking-wider text-burgundy-primary">
                  Faculty of Academic Affairs & Registry
                </p>
                <p className="mt-0.5 text-[11px] text-text-muted">
                  Official Academic Program Timetable • Accredited Curriculum
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-brand-border/80 bg-brand-bg/50 p-3 text-right sm:mt-0">
              <p className="font-mono text-xs font-bold text-burgundy-primary">
                DOC-REF: AWC-{timetable.classCode}
              </p>
              <p className="text-[11px] font-medium text-text-muted">
                Academic Year: <strong className="text-text-primary">{academicYear}</strong>
              </p>
              <p className="text-[11px] font-medium text-text-muted">
                Term: <strong className="text-text-primary">{term}</strong>
              </p>
            </div>
          </div>

          {/* Timetable Metadata Overview Grid */}
          <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl border border-brand-border/70 bg-brand-bg/30 p-4 sm:grid-cols-4">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                Class Code
              </span>
              <p className="mt-0.5 font-mono text-sm font-bold text-burgundy-primary">
                {timetable.classCode}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                Course Pathway
              </span>
              <p className="mt-0.5 truncate text-xs font-bold text-text-primary" title={timetable.courseTitle}>
                {timetable.courseTitle}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                Assigned Venue / Room
              </span>
              <p className="mt-0.5 flex items-center gap-1 text-xs font-bold text-text-primary">
                <MapPin className="h-3 w-3 text-burgundy-primary" />
                {timetable.room}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                Lecturer Lead
              </span>
              <p className="mt-0.5 flex items-center gap-1 text-xs font-bold text-text-primary">
                <User className="h-3 w-3 text-burgundy-primary" />
                {timetable.lecturerLead}
              </p>
            </div>
          </div>

          {/* Schedule Highlights Bar */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-burgundy-primary/20 bg-burgundy-primary/5 px-4 py-2 text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-burgundy-primary">
              <Clock className="h-3.5 w-3.5" />
              Schedule: <strong>{timetable.scheduleDays}</strong> • <strong>{timetable.scheduleTime}</strong>
            </span>
            <span className="font-medium text-text-muted">
              Cohort Intake: <strong className="text-text-primary">{intakeName}</strong>
            </span>
          </div>

          {/* Detailed Timetable Table */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                Weekly Class & Lecture Schedule
              </h3>
              <span className="text-[11px] text-text-muted">
                {sessions.length} Scheduled Sessions / Week
              </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-brand-border">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-brand-border bg-brand-bg/80 text-[11px] font-bold text-text-secondary">
                    <th className="py-2.5 pl-3.5 pr-2">Day</th>
                    <th className="py-2.5 px-3">Time Slot</th>
                    <th className="py-2.5 px-3">Module Code & Title</th>
                    <th className="py-2.5 px-3 text-center">Type</th>
                    <th className="py-2.5 px-3">Room / Venue</th>
                    <th className="py-2.5 pr-3.5 pl-2">Faculty Lecturer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {sessions.map((sess, idx) => {
                    const typeClass = typeBadgeStyles[sess.type] || typeBadgeStyles.Lecture;
                    return (
                      <tr key={idx} className="transition-colors hover:bg-brand-bg/30">
                        <td className="py-2.5 pl-3.5 pr-2 font-bold text-text-primary">
                          {sess.day}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] font-medium text-text-muted whitespace-nowrap">
                          {sess.startTime} - {sess.endTime}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex flex-col">
                            <span className="font-semibold text-text-primary">{sess.moduleName}</span>
                            <span className="font-mono text-[10px] text-burgundy-primary">{sess.moduleCode}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold ${typeClass}`}>
                            {sess.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-text-secondary">
                          {sess.venue}
                        </td>
                        <td className="py-2.5 pr-3.5 pl-2 font-medium text-text-primary whitespace-nowrap">
                          {sess.lecturer}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Key Milestone Dates Bar (from Intake) */}
          {intake && (
            <div className="mt-6 rounded-xl border border-brand-border/70 bg-brand-bg/40 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Cohort Milestone & Examination Calendar
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-center text-xs sm:grid-cols-4">
                <div className="rounded-lg border border-brand-border bg-white p-2">
                  <span className="block text-[10px] text-text-muted">Intake Start Date</span>
                  <span className="font-bold text-text-primary">
                    {intake.intakeDate || intake.commenceDate || "—"}
                  </span>
                </div>
                <div className="rounded-lg border border-brand-border bg-white p-2">
                  <span className="block text-[10px] text-text-muted">Completion Date</span>
                  <span className="font-bold text-text-primary">
                    {intake.completionDate || "—"}
                  </span>
                </div>
                <div className="rounded-lg border border-brand-border bg-white p-2">
                  <span className="block text-[10px] text-text-muted">Final Exam Results</span>
                  <span className="font-bold text-burgundy-primary">
                    {intake.finalExamResultDate || "—"}
                  </span>
                </div>
                <div className="rounded-lg border border-brand-border bg-white p-2">
                  <span className="block text-[10px] text-text-muted">Conferment Date</span>
                  <span className="font-bold text-emerald-700">
                    {intake.confermentDate || "—"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Academic Regulations & Attendance Notice */}
          <div className="mt-5 rounded-xl border border-amber-200/80 bg-amber-50/50 p-3 text-[11px] text-amber-900">
            <p className="font-bold">Academic Registry Regulations & Attendance Notice:</p>
            <ul className="mt-1 list-inside list-disc space-y-0.5 text-[10px] text-amber-800">
              <li>A minimum of 80% physical or verified hybrid attendance is compulsory for examination eligibility.</li>
              <li>Students arriving later than 15 minutes past commencement will be recorded as late/absent.</li>
              <li>Any schedule swap or room change must be requested through the Academic Registry at least 48 hours in advance.</li>
            </ul>
          </div>

          {/* Official Signatures & Seal Block */}
          <div className="mt-8 flex flex-col items-center justify-between gap-6 border-t border-brand-border/80 pt-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-burgundy-primary/40 bg-burgundy-primary/5 text-burgundy-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="text-[11px]">
                <p className="font-bold uppercase tracking-wider text-text-primary">
                  Official Verification Seal
                </p>
                <p className="text-[10px] text-text-muted">Avis World College Registry • Certified Genuine</p>
              </div>
            </div>

            <div className="flex items-center gap-8 text-center text-xs">
              <div className="border-t border-text-muted/60 pt-1">
                <p className="font-script text-sm font-semibold italic text-text-primary">
                  Dr. Ronald Vance
                </p>
                <p className="text-[10px] text-text-muted">Dean of Academic Affairs</p>
              </div>
              <div className="border-t border-text-muted/60 pt-1">
                <p className="font-script text-sm font-semibold italic text-text-primary">
                  Prof. Ananya Sen
                </p>
                <p className="text-[10px] text-text-muted">Registrar & Examinations</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TimetablePdfModal;
