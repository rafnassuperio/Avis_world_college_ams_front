import React, { useState, useEffect } from "react";
import { CalendarRange, Calendar, Clock, GraduationCap, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FilterSelect, FilterSelectOption } from "@/components/ui/FilterSelect";
import { CollegeIntake, IntakeStatus } from "../types";
import { sanitizeInput } from "@/lib/security";

export interface IntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (intake: CollegeIntake) => void | boolean | Promise<void | boolean>;
  intake?: CollegeIntake | null;
}

export const INTAKE_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const INTAKE_NAME_SUGGESTIONS = [
  "Spring 2026 Cohort",
  "Summer 2026 Intensive",
  "Fall 2026 Cohort",
  "Winter 2025 Cohort",
  "Spring 2027 Cohort",
  "Autumn 2026 Cohort",
];

export const INTAKE_STATUS_OPTIONS: FilterSelectOption[] = [
  {
    label: "ongoing",
    value: "ongoing",
    badgeDot: "bg-emerald-500",
    subLabel: "Active cohort currently in session",
  },
  {
    label: "incoming",
    value: "incoming",
    badgeDot: "bg-sky-500",
    subLabel: "Upcoming cohort accepting enrollments",
  },
  {
    label: "closed",
    value: "closed",
    badgeDot: "bg-slate-400",
    subLabel: "Completed or archived intake cycle",
  },
];

/** Convert standard date or ISO to YYYY-MM-DD for input[type="date"] */
const toDateInputValue = (dateStr?: string): string => {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/** Normalize legacy status strings to ongoing / incoming / closed */
export const normalizeIntakeStatus = (status?: string): IntakeStatus => {
  if (!status) return "incoming";
  const s = status.toLowerCase();
  if (s === "open" || s === "closing soon" || s === "ongoing" || s === "active") return "ongoing";
  if (s === "upcoming" || s === "incoming" || s === "future") return "incoming";
  if (s === "closed" || s === "completed" || s === "archived") return "closed";
  return (status as IntakeStatus) || "ongoing";
};

export const IntakeModal: React.FC<IntakeModalProps> = ({ isOpen, onClose, onSave, intake }) => {
  const isEditing = Boolean(intake);

  // Form States:
  // 1. Intake Month
  const [intakeMonth, setIntakeMonth] = useState<string>("");
  // 2. Intake Names
  const [intakeName, setIntakeName] = useState("");
  // 3. Intake Date
  const [intakeDate, setIntakeDate] = useState("");
  // 4. Completion Date
  const [completionDate, setCompletionDate] = useState("");
  // 5. Final Exam Result Date
  const [finalExamResultDate, setFinalExamResultDate] = useState("");
  // 6. Conferment Date
  const [confermentDate, setConfermentDate] = useState("");
  // 7. Year
  const [year, setYear] = useState("");
  // 8. Status
  const [status, setStatus] = useState<string>("ongoing");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form if editing or reset
  useEffect(() => {
    if (isOpen) {
      if (intake) {
        setIntakeMonth(intake.intakeMonth || "");
        setIntakeName(intake.intakeName || intake.name || "");
        setIntakeDate(toDateInputValue(intake.intakeDate || intake.commenceDate));
        setCompletionDate(toDateInputValue(intake.completionDate));
        setFinalExamResultDate(toDateInputValue(intake.finalExamResultDate));
        setConfermentDate(toDateInputValue(intake.confermentDate));
        setYear(String(intake.year || (intake.academicYear ? String(intake.academicYear).replace(/\D/g, "").slice(0, 4) : "")));
        setStatus(normalizeIntakeStatus(intake.status));
      } else {
        setIntakeMonth("January");
        setIntakeName("");
        setIntakeDate("");
        setCompletionDate("");
        setFinalExamResultDate("");
        setConfermentDate("");
        setYear(new Date().getFullYear().toString());
        setStatus("ongoing");
      }
      setErrors({});
    }
  }, [isOpen, intake]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!intakeMonth.trim()) {
      errs.intakeMonth = "Please select an intake month";
    }
    if (!intakeName.trim()) {
      errs.intakeName = "Intake Name is required";
    }
    if (!intakeDate.trim()) {
      errs.intakeDate = "Intake Date is required";
    }
    if (!completionDate.trim()) {
      errs.completionDate = "Completion Date is required";
    }
    if (!finalExamResultDate.trim()) {
      errs.finalExamResultDate = "Final Exam Result Date is required";
    }
    if (!confermentDate.trim()) {
      errs.confermentDate = "Conferment Date is required";
    }
    if (!year.trim()) {
      errs.year = "Year is required";
    } else if (isNaN(Number(year)) || Number(year) < 2000 || Number(year) > 2100) {
      errs.year = "Please enter a valid 4-digit year";
    }
    if (!status.trim()) {
      errs.status = "Please select a status";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const sanitizedName = sanitizeInput(intakeName.trim());
      const sanitizedMonth = sanitizeInput(intakeMonth.trim());
      const sanitizedYear = sanitizeInput(year.trim());

      const intakeData: CollegeIntake = {
        id: intake ? intake.id : `int-${Date.now()}`,
        name: sanitizedName,
        intakeName: sanitizedName,
        intakeMonth: sanitizedMonth,
        intakeDate: intakeDate,
        completionDate: completionDate,
        finalExamResultDate: finalExamResultDate,
        confermentDate: confermentDate,
        year: sanitizedYear,
        status: status as IntakeStatus,
        // Preserve optional fields if editing
        term: intake?.term || `${sanitizedMonth.slice(0, 3)} ${sanitizedYear}`,
        academicYear: intake?.academicYear || `AY ${sanitizedYear}-${Number(sanitizedYear) + 1}`,
        deadline: intake?.deadline,
        orientationDate: intake?.orientationDate,
        commenceDate: intakeDate,
        targetEnrollment: intake?.targetEnrollment || 250,
        currentEnrollment: intake?.currentEnrollment || 0,
        activeCoursesCount: intake?.activeCoursesCount ?? 0,
      };

      if (await onSave(intakeData) === false) return;
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const monthOptions: FilterSelectOption[] = INTAKE_MONTHS.map((m) => ({
    label: m,
    value: m,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Intake" : "Add Intake"}
      subtitle={
        isEditing
          ? "Update academic intake calendar dates, target cohort and execution status."
          : "Create a new academic intake schedule with key milestone and graduation dates."
      }
      headerIcon={<CalendarRange className="h-5 w-5 text-burgundy-primary" />}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* 1. Intake Month */}
          <div>
            <FilterSelect
              label="Intake Month"
              icon={Calendar}
              required
              value={intakeMonth}
              defaultValue=""
              placeholder="Select Month"
              searchable
              searchPlaceholder="Search month..."
              options={monthOptions}
              onChange={(val) => {
                setIntakeMonth(val);
                if (errors.intakeMonth) setErrors((prev) => ({ ...prev, intakeMonth: "" }));
              }}
              hasError={Boolean(errors.intakeMonth)}
              buttonClassName="bg-white border-brand-border py-2 px-3 text-xs rounded-xl"
            />
            {errors.intakeMonth && <p className="mt-1 text-[11px] font-medium text-brand-red">{errors.intakeMonth}</p>}
          </div>

          {/* 7. Year */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-primary">
              Year <span className="text-brand-red">*</span>
            </label>
            <div className="relative">
              <Clock className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-text-muted" />
              <input
                type="number"
                min="2000"
                max="2100"
                required
                placeholder="e.g. 2026"
                value={year}
                onChange={(e) => {
                  setYear(e.target.value);
                  if (errors.year) setErrors((prev) => ({ ...prev, year: "" }));
                }}
                className={`w-full rounded-xl border ${
                  errors.year ? "border-brand-red ring-1 ring-brand-red" : "border-brand-border"
                } bg-white py-2 pl-9 pr-3 text-xs text-text-primary transition-all placeholder:text-text-muted focus:border-burgundy-primary focus:outline-none focus:ring-1 focus:ring-burgundy-primary`}
              />
            </div>
            {errors.year && <p className="mt-1 text-[11px] font-medium text-brand-red">{errors.year}</p>}
          </div>

          {/* 2. Intake Names */}
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-text-primary">
              Intake Names <span className="text-brand-red">*</span>
            </label>
            <div className="relative">
              <GraduationCap className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-text-muted" />
              <input
                type="text"
                required
                placeholder="e.g. Spring 2026 Cohort"
                value={intakeName}
                onChange={(e) => {
                  setIntakeName(e.target.value);
                  if (errors.intakeName) setErrors((prev) => ({ ...prev, intakeName: "" }));
                }}
                className={`w-full rounded-xl border ${
                  errors.intakeName ? "border-brand-red ring-1 ring-brand-red" : "border-brand-border"
                } bg-white py-2 pl-9 pr-3 text-xs text-text-primary transition-all placeholder:text-text-muted focus:border-burgundy-primary focus:outline-none focus:ring-1 focus:ring-burgundy-primary`}
              />
            </div>
            {errors.intakeName && <p className="mt-1 text-[11px] font-medium text-brand-red">{errors.intakeName}</p>}

            {/* Quick Suggestions */}
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-text-muted">Suggestions:</span>
              {INTAKE_NAME_SUGGESTIONS.slice(0, 4).map((sugg) => (
                <button
                  key={sugg}
                  type="button"
                  onClick={() => {
                    setIntakeName(sugg);
                    if (errors.intakeName) setErrors((prev) => ({ ...prev, intakeName: "" }));
                  }}
                  className="rounded-md border border-brand-border bg-brand-bg/60 px-1.5 py-0.5 text-[10px] font-medium text-text-secondary transition-colors hover:border-burgundy-primary/40 hover:bg-burgundy-primary/10 hover:text-burgundy-primary"
                >
                  {sugg}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Intake Date */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-primary">
              Intake Date <span className="text-brand-red">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={intakeDate}
                onChange={(e) => {
                  setIntakeDate(e.target.value);
                  if (errors.intakeDate) setErrors((prev) => ({ ...prev, intakeDate: "" }));
                  // Auto fill year if empty
                  if (!year && e.target.value) {
                    const parsedYear = new Date(e.target.value).getFullYear();
                    if (!isNaN(parsedYear)) setYear(parsedYear.toString());
                  }
                }}
                className={`w-full rounded-xl border ${
                  errors.intakeDate ? "border-brand-red ring-1 ring-brand-red" : "border-brand-border"
                } bg-white px-3 py-2 text-xs text-text-primary transition-all focus:border-burgundy-primary focus:outline-none focus:ring-1 focus:ring-burgundy-primary`}
              />
            </div>
            {errors.intakeDate && <p className="mt-1 text-[11px] font-medium text-brand-red">{errors.intakeDate}</p>}
          </div>

          {/* 4. Completion Date */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-primary">
              Completion Date <span className="text-brand-red">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={completionDate}
                onChange={(e) => {
                  setCompletionDate(e.target.value);
                  if (errors.completionDate) setErrors((prev) => ({ ...prev, completionDate: "" }));
                }}
                className={`w-full rounded-xl border ${
                  errors.completionDate ? "border-brand-red ring-1 ring-brand-red" : "border-brand-border"
                } bg-white px-3 py-2 text-xs text-text-primary transition-all focus:border-burgundy-primary focus:outline-none focus:ring-1 focus:ring-burgundy-primary`}
              />
            </div>
            {errors.completionDate && <p className="mt-1 text-[11px] font-medium text-brand-red">{errors.completionDate}</p>}
          </div>

          {/* 5. Final Exam Result Date */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-primary">
              Final Exam Result Date <span className="text-brand-red">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={finalExamResultDate}
                onChange={(e) => {
                  setFinalExamResultDate(e.target.value);
                  if (errors.finalExamResultDate) setErrors((prev) => ({ ...prev, finalExamResultDate: "" }));
                }}
                className={`w-full rounded-xl border ${
                  errors.finalExamResultDate ? "border-brand-red ring-1 ring-brand-red" : "border-brand-border"
                } bg-white px-3 py-2 text-xs text-text-primary transition-all focus:border-burgundy-primary focus:outline-none focus:ring-1 focus:ring-burgundy-primary`}
              />
            </div>
            {errors.finalExamResultDate && (
              <p className="mt-1 text-[11px] font-medium text-brand-red">{errors.finalExamResultDate}</p>
            )}
          </div>

          {/* 6. Conferment Date */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-primary">
              Conferment Date <span className="text-brand-red">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={confermentDate}
                onChange={(e) => {
                  setConfermentDate(e.target.value);
                  if (errors.confermentDate) setErrors((prev) => ({ ...prev, confermentDate: "" }));
                }}
                className={`w-full rounded-xl border ${
                  errors.confermentDate ? "border-brand-red ring-1 ring-brand-red" : "border-brand-border"
                } bg-white px-3 py-2 text-xs text-text-primary transition-all focus:border-burgundy-primary focus:outline-none focus:ring-1 focus:ring-burgundy-primary`}
              />
            </div>
            {errors.confermentDate && <p className="mt-1 text-[11px] font-medium text-brand-red">{errors.confermentDate}</p>}
          </div>

          {/* 8. Status (select: ongoing, incoming, closed) */}
          <div className="sm:col-span-2">
            <FilterSelect
              label="Status"
              icon={CheckCircle2}
              required
              value={status}
              defaultValue="ongoing"
              options={INTAKE_STATUS_OPTIONS}
              onChange={(val) => {
                setStatus(val);
                if (errors.status) setErrors((prev) => ({ ...prev, status: "" }));
              }}
              hasError={Boolean(errors.status)}
              buttonClassName="bg-white border-brand-border py-2 px-3 text-xs rounded-xl"
            />
            {errors.status && <p className="mt-1 text-[11px] font-medium text-brand-red">{errors.status}</p>}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 border-t border-brand-border pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-xl border-brand-border text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="burgundy"
            size="sm"
            disabled={isSubmitting}
            className="rounded-xl text-xs font-semibold"
          >
            {isEditing ? "Save Changes" : "Add Intake"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default IntakeModal;
