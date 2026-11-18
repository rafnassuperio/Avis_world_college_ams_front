import React, { useState } from "react";
import { DollarSign } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { sanitizeInput } from "@/lib/security";
import { toast } from "@/components/common/ToastMessage";
import { CourseFeeBreakdown } from "../types";

export interface AddFeeTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddScheme: (scheme: CourseFeeBreakdown) => void;
}

export const AddFeeTypeModal: React.FC<AddFeeTypeModalProps> = ({ isOpen, onClose, onAddScheme }) => {
  const [feeName, setFeeName] = useState("");
  const [schemeCode, setSchemeCode] = useState("");
  const [tuitionFee, setTuitionFee] = useState<number | string>(1900);
  const [medicalInsurance, setMedicalInsurance] = useState<number | string>(0);
  const [resourceFee, setResourceFee] = useState<number | string>(100);
  const [assessmentFee, setAssessmentFee] = useState<number | string>(100);
  const [feeProtection, setFeeProtection] = useState<number | string>(0);
  const [uniformFee, setUniformFee] = useState<number | string>(150);
  const [adminFee, setAdminFee] = useState<number | string>(0);

  const resetForm = () => {
    setFeeName("");
    setSchemeCode("");
    setTuitionFee(1900);
    setMedicalInsurance(0);
    setResourceFee(100);
    setAssessmentFee(100);
    setFeeProtection(0);
    setUniformFee(150);
    setAdminFee(0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeName.trim() || !schemeCode.trim()) {
      toast.error("Please enter a Fee Name and Scheme Code.");
      return;
    }

    const newScheme: CourseFeeBreakdown = {
      id: `fee-${Date.now()}`,
      name: sanitizeInput(feeName.trim()),
      schemeCode: sanitizeInput(schemeCode.trim().toUpperCase()),
      tuitionFee: Number(tuitionFee) || 0,
      medicalInsurance: Number(medicalInsurance) || 0,
      resourceFee: Number(resourceFee) || 0,
      assessmentFee: Number(assessmentFee) || 0,
      feeProtection: Number(feeProtection) || 0,
      uniformFee: Number(uniformFee) || 0,
      adminFee: Number(adminFee) || 0,
      gstRate: 0.09,
      currency: "SGD",
    };

    onAddScheme(newScheme);
    resetForm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Fee Type Scheme"
      subtitle="Create a new tuition fee breakdown scheme for this course"
      headerIcon={<DollarSign className="h-5 w-5 text-burgundy-primary" />}
      maxWidth="lg"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-primary">
              Fee Type Name <span className="text-brand-red">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. DCBI, International Scholar"
              value={feeName}
              onChange={(e) => setFeeName(e.target.value)}
              className="w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-xs text-text-primary transition-all focus:border-burgundy-primary focus:outline-none focus:ring-1 focus:ring-burgundy-primary"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-text-primary">
              Scheme Code <span className="text-brand-red">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. DCBI, SCH-2026"
              value={schemeCode}
              onChange={(e) => setSchemeCode(e.target.value.toUpperCase())}
              className="w-full rounded-xl border border-brand-border bg-white px-3 py-2 font-mono text-xs uppercase text-text-primary transition-all focus:border-burgundy-primary focus:outline-none focus:ring-1 focus:ring-burgundy-primary"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-text-primary">Tuition Fee (SGD)</label>
            <div className="relative flex items-center">
              <span className="pointer-events-none absolute left-3 font-mono text-[11px] font-bold text-text-muted">SGD</span>
              <input
                type="number"
                min={0}
                value={tuitionFee}
                onChange={(e) => setTuitionFee(e.target.value)}
                className="w-full rounded-xl border border-brand-border bg-white py-2 pl-12 pr-3 text-right font-mono text-xs text-text-primary transition-all focus:border-burgundy-primary focus:outline-none focus:ring-1 focus:ring-burgundy-primary"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-text-primary">Medical Insurance (SGD)</label>
            <div className="relative flex items-center">
              <span className="pointer-events-none absolute left-3 font-mono text-[11px] font-bold text-text-muted">SGD</span>
              <input
                type="number"
                min={0}
                value={medicalInsurance}
                onChange={(e) => setMedicalInsurance(e.target.value)}
                className="w-full rounded-xl border border-brand-border bg-white py-2 pl-12 pr-3 text-right font-mono text-xs text-text-primary transition-all focus:border-burgundy-primary focus:outline-none focus:ring-1 focus:ring-burgundy-primary"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-text-primary">Resource Fee (SGD)</label>
            <div className="relative flex items-center">
              <span className="pointer-events-none absolute left-3 font-mono text-[11px] font-bold text-text-muted">SGD</span>
              <input
                type="number"
                min={0}
                value={resourceFee}
                onChange={(e) => setResourceFee(e.target.value)}
                className="w-full rounded-xl border border-brand-border bg-white py-2 pl-12 pr-3 text-right font-mono text-xs text-text-primary transition-all focus:border-burgundy-primary focus:outline-none focus:ring-1 focus:ring-burgundy-primary"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-text-primary">Assessment Fee (SGD)</label>
            <div className="relative flex items-center">
              <span className="pointer-events-none absolute left-3 font-mono text-[11px] font-bold text-text-muted">SGD</span>
              <input
                type="number"
                min={0}
                value={assessmentFee}
                onChange={(e) => setAssessmentFee(e.target.value)}
                className="w-full rounded-xl border border-brand-border bg-white py-2 pl-12 pr-3 text-right font-mono text-xs text-text-primary transition-all focus:border-burgundy-primary focus:outline-none focus:ring-1 focus:ring-burgundy-primary"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-text-primary">Fee Protection (SGD)</label>
            <div className="relative flex items-center">
              <span className="pointer-events-none absolute left-3 font-mono text-[11px] font-bold text-text-muted">SGD</span>
              <input
                type="number"
                min={0}
                value={feeProtection}
                onChange={(e) => setFeeProtection(e.target.value)}
                className="w-full rounded-xl border border-brand-border bg-white py-2 pl-12 pr-3 text-right font-mono text-xs text-text-primary transition-all focus:border-burgundy-primary focus:outline-none focus:ring-1 focus:ring-burgundy-primary"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-text-primary">Uniform Fee (SGD)</label>
            <div className="relative flex items-center">
              <span className="pointer-events-none absolute left-3 font-mono text-[11px] font-bold text-text-muted">SGD</span>
              <input
                type="number"
                min={0}
                value={uniformFee}
                onChange={(e) => setUniformFee(e.target.value)}
                className="w-full rounded-xl border border-brand-border bg-white py-2 pl-12 pr-3 text-right font-mono text-xs text-text-primary transition-all focus:border-burgundy-primary focus:outline-none focus:ring-1 focus:ring-burgundy-primary"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-text-primary">Admin Fee (SGD)</label>
            <div className="relative flex items-center">
              <span className="pointer-events-none absolute left-3 font-mono text-[11px] font-bold text-text-muted">SGD</span>
              <input
                type="number"
                min={0}
                value={adminFee}
                onChange={(e) => setAdminFee(e.target.value)}
                className="w-full rounded-xl border border-brand-border bg-white py-2 pl-12 pr-3 text-right font-mono text-xs text-text-primary transition-all focus:border-burgundy-primary focus:outline-none focus:ring-1 focus:ring-burgundy-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-brand-border pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            className="rounded-xl border-brand-border text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="burgundy"
            size="sm"
            className="rounded-xl text-xs font-semibold"
          >
            Save Fee Scheme
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddFeeTypeModal;
