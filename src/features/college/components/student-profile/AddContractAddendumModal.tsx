import React, { useState } from "react";
import { Plus, CalendarRange } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FilterSelect, FilterSelectOption } from "@/components/ui/FilterSelect";

export interface AddContractAddendumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (intakePeriod: string) => void;
  studentName: string;
  defaultIntake?: string;
}

const INTAKE_OPTIONS: FilterSelectOption[] = [
  {
    label: "Spring 2026 Cohort (Jan - Jun 2026)",
    value: "Spring 2026",
    badgeDot: "bg-emerald-500",
    subLabel: "Commences 15 Jan 2026",
  },
  {
    label: "Summer 2026 Intensive (May - Aug 2026)",
    value: "Summer 2026",
    badgeDot: "bg-amber-500",
    subLabel: "Commences 11 May 2026",
  },
  {
    label: "Fall 2026 Cohort (Sep 2026 - Jan 2027)",
    value: "Fall 2026",
    badgeDot: "bg-burgundy-primary",
    subLabel: "Commences 08 Sep 2026",
  },
  {
    label: "Winter 2025 Cohort (Oct 2025 - Feb 2026)",
    value: "Winter 2025",
    badgeDot: "bg-brand-red",
    subLabel: "Ongoing Batch",
  },
  {
    label: "Spring 2025 Cohort",
    value: "Spring 2025",
    badgeDot: "bg-palette-dark-wine",
    subLabel: "Archived Cohort",
  },
  {
    label: "Fall 2025 Cohort",
    value: "Fall 2025",
    badgeDot: "bg-palette-dark-wine",
    subLabel: "Archived Cohort",
  },
];

export const AddContractAddendumModal: React.FC<AddContractAddendumModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  studentName,
  defaultIntake = "Fall 2026",
}) => {
  const [intakePeriod, setIntakePeriod] = useState(defaultIntake);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(intakePeriod);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Student Contract"
      subtitle={`Select Intake Period for ${studentName}`}
      headerIcon={
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-burgundy-primary/20 bg-burgundy-primary/10 text-burgundy-primary">
          <CalendarRange className="h-5 w-5" />
        </div>
      }
      maxWidth="md"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-4 pt-1"
      >
        {/* Intake Period FilterSelect */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-text-primary">
            Intake Period <span className="text-brand-red">*</span>
          </label>
          <FilterSelect
            label="Select Intake Period"
            icon={CalendarRange}
            value={intakePeriod}
            options={INTAKE_OPTIONS}
            onChange={setIntakePeriod}
            searchable={true}
            searchPlaceholder="Search intake cohort..."
            placeholder="Choose Intake Period..."
            size="md"
            className="w-full"
            buttonClassName="w-full justify-between rounded-xl border-brand-border bg-white hover:bg-brand-bg/50 text-text-primary"
            usePortal={true}
          />
        </div>

        {/* Note banner */}
        <div className="rounded-xl border border-brand-border/60 bg-brand-bg/70 p-3 text-[11px] leading-relaxed text-text-secondary">
          <span className="font-semibold text-text-primary">Note: </span>
          The Student Contract will be issued for <strong className="text-text-primary">{intakePeriod}</strong> with official verification and viewing
          options.
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            className="gap-1.5 bg-burgundy-hover text-xs font-semibold text-white shadow-md shadow-burgundy-hover/20 hover:bg-burgundy-light"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Contract</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
