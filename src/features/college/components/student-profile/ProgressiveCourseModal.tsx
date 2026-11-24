import React, { useState } from "react";
import { GraduationCap, Check } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FilterSelect, FilterSelectOption } from "@/components/ui/FilterSelect";

export interface ProgressiveCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCourseType?: string;
  studentName: string;
  onSave: (newCourseType: string) => void | boolean | Promise<void | boolean>;
}

const COURSE_TYPE_OPTIONS: FilterSelectOption[] = [
  {
    label: "Certificate",
    value: "Certificate",
    subLabel: "Foundation / Certificate Level",
    badgeDot: "bg-emerald-500",
  },
  {
    label: "Diploma",
    value: "Diploma",
    subLabel: "Level 1 • Diploma Level",
    badgeDot: "bg-blue-500",
  },
  {
    label: "Higher Diploma",
    value: "Higher Diploma",
    subLabel: "Level 2 • Advanced / Higher Diploma Level",
    badgeDot: "bg-burgundy-primary",
  },
  {
    label: "Post Graduation",
    value: "Post Graduation",
    subLabel: "Level 3 • Postgraduate / Master's Level",
    badgeDot: "bg-palette-dark-wine",
  },
];

export const ProgressiveCourseModal: React.FC<ProgressiveCourseModalProps> = ({
  isOpen,
  onClose,
  currentCourseType = "Higher Diploma",
  studentName,
  onSave,
}) => {
  const [selectedCourseType, setSelectedCourseType] = useState(currentCourseType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await onSave(selectedCourseType) === false) return;
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Progressive Course Upgrade"
      subtitle={`Update academic course type for ${studentName}`}
      headerIcon={
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-burgundy-primary/20 bg-burgundy-primary/10 text-burgundy-primary">
          <GraduationCap className="h-5 w-5" />
        </div>
      }
      maxWidth="md"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-4 pt-1"
      >
        {/* Course Type Select */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-text-primary">
            Course Type <span className="text-brand-red">*</span>
          </label>
          <FilterSelect
            label="Select Course Type"
            icon={GraduationCap}
            value={selectedCourseType}
            options={COURSE_TYPE_OPTIONS}
            onChange={setSelectedCourseType}
            searchable={false}
            placeholder="Select Course Type..."
            size="md"
            className="w-full"
            buttonClassName="w-full justify-between rounded-xl border-brand-border bg-white hover:bg-brand-bg/50 text-text-primary"
            usePortal={true}
          />
        </div>

        {/* Informational Guidance Box */}
        <div className="rounded-xl border border-brand-border/60 bg-brand-bg/70 p-3 text-[11px] leading-relaxed text-text-secondary">
          <span className="font-semibold text-text-primary">Note: </span>
          Setting the progressive course type updates the candidate&apos;s curriculum level and progressive credential records.
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="burgundy"
            size="sm"
            className="gap-1.5 bg-burgundy-hover text-xs font-semibold text-white shadow-md shadow-burgundy-hover/20 hover:bg-burgundy-light"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Update Course Type</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
