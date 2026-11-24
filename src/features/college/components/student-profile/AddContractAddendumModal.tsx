import { useApiCollection } from "@/hooks/useApiCollection";
import { intakes } from "@/services/ams";
import React, { useState } from "react";
import { Plus, CalendarRange } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FilterSelect } from "@/components/ui/FilterSelect";

export interface AddContractAddendumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (intakePeriod: string) => void | boolean | Promise<void | boolean>;
  studentName: string;
  defaultIntake?: string;
}

export const AddContractAddendumModal: React.FC<AddContractAddendumModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  studentName,
  defaultIntake = "",
}) => {
  const { data: intakeList } = useApiCollection(intakes);
  const INTAKE_OPTIONS = intakeList.map(i => ({ label: i.name, value: i.id }));
  const [intakePeriod, setIntakePeriod] = useState(defaultIntake);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await onAdd(intakePeriod) === false) return;
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
