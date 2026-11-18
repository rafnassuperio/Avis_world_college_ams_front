import React, { useState, useEffect } from "react";
import { SlidersHorizontal, Check } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/common/ToastMessage";

export interface ChangeSplitModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAgentShare: number;
  initialRepShare: number;
  onApplySplit: (agentShare: number, repShare: number, syncWithPaymentDetails: boolean) => void;
}

export const ChangeSplitModal: React.FC<ChangeSplitModalProps> = ({
  isOpen,
  onClose,
  initialAgentShare,
  initialRepShare,
  onApplySplit,
}) => {
  const [modalAgentShare, setModalAgentShare] = useState(initialAgentShare.toFixed(2));
  const [modalRepShare, setModalRepShare] = useState(initialRepShare.toFixed(2));
  const [syncWithPaymentDetails, setSyncWithPaymentDetails] = useState(true);

  // Sync state whenever modal opens with fresh values
  useEffect(() => {
    if (isOpen) {
      setModalAgentShare(initialAgentShare.toFixed(2));
      setModalRepShare(initialRepShare.toFixed(2));
    }
  }, [isOpen, initialAgentShare, initialRepShare]);

  const fmt = (val: number) => {
    return val.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const currentAgent = parseFloat(modalAgentShare.replace(/,/g, "")) || 0;
  const currentRep = parseFloat(modalRepShare.replace(/,/g, "")) || 0;
  const currentCombinedTotal = currentAgent + currentRep;

  const handleApplyPresetSplit = (agentPct: number, total: number = 1880.0) => {
    const calculatedAgent = (total * agentPct) / 100;
    const calculatedRep = total - calculatedAgent;
    setModalAgentShare(calculatedAgent.toFixed(2));
    setModalRepShare(calculatedRep.toFixed(2));
  };

  const handleSave = () => {
    if (currentAgent < 0 || currentRep < 0) {
      toast.error("Invalid Split Amount", {
        description: "Commission shares cannot be negative numbers.",
      });
      return;
    }

    onApplySplit(currentAgent, currentRep, syncWithPaymentDetails);
    onClose();
  };

  const agentPercentage = currentCombinedTotal > 0 ? (currentAgent / currentCombinedTotal) * 100 : 50;
  const repPercentage = currentCombinedTotal > 0 ? (currentRep / currentCombinedTotal) * 100 : 50;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Commission Split"
      subtitle="Configure commission distribution between Agent and Representative"
      headerIcon={<SlidersHorizontal className="h-5 w-5 text-burgundy-primary" />}
      maxWidth="md"
      footer={
        <div className="flex w-full items-center justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="burgundy"
            size="sm"
            onClick={handleSave}
            className="gap-1.5 font-bold shadow-sm"
          >
            <Check className="h-4 w-4" />
            Apply Split
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Top Total Pool Banner */}
        <div className="rounded-xl border border-brand-border bg-brand-bg/60 p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Total Commission Pool</span>
              <p className="mt-0.5 text-xs text-text-secondary">Allocated across recruitment stakeholders</p>
            </div>
            <div className="text-right">
              <span className="font-mono text-base font-extrabold text-burgundy-primary">
                SGD {fmt(currentCombinedTotal)}
              </span>
              <span className="block text-[10px] text-text-muted">Combined Pool</span>
            </div>
          </div>
        </div>

        {/* Quick Preset Buttons */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
            Quick Split Presets
          </label>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleApplyPresetSplit(50)}
              className="flex items-center justify-between rounded-xl border border-brand-border bg-white p-2.5 text-left transition-all hover:border-burgundy-primary/40 hover:bg-brand-bg"
            >
              <div>
                <span className="block font-bold text-text-primary">50% / 50%</span>
                <span className="text-[10px] text-text-muted">Equal Split</span>
              </div>
              <span className="font-mono text-[11px] font-bold text-burgundy-primary">SGD 940.00 ea</span>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPresetSplit(60)}
              className="flex items-center justify-between rounded-xl border border-brand-border bg-white p-2.5 text-left transition-all hover:border-burgundy-primary/40 hover:bg-brand-bg"
            >
              <div>
                <span className="block font-bold text-text-primary">60% / 40%</span>
                <span className="text-[10px] text-text-muted">Agent Priority</span>
              </div>
              <span className="font-mono text-[11px] font-bold text-text-secondary">1,128 / 752</span>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPresetSplit(70)}
              className="flex items-center justify-between rounded-xl border border-brand-border bg-white p-2.5 text-left transition-all hover:border-burgundy-primary/40 hover:bg-brand-bg"
            >
              <div>
                <span className="block font-bold text-text-primary">70% / 30%</span>
                <span className="text-[10px] text-text-muted">Standard Tier</span>
              </div>
              <span className="font-mono text-[11px] font-bold text-text-secondary">1,316 / 564</span>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPresetSplit(80)}
              className="flex items-center justify-between rounded-xl border border-brand-border bg-white p-2.5 text-left transition-all hover:border-burgundy-primary/40 hover:bg-brand-bg"
            >
              <div>
                <span className="block font-bold text-text-primary">80% / 20%</span>
                <span className="text-[10px] text-text-muted">Agency Direct</span>
              </div>
              <span className="font-mono text-[11px] font-bold text-text-secondary">1,504 / 376</span>
            </button>
          </div>
        </div>

        {/* Interactive Share Inputs */}
        <div className="grid grid-cols-2 gap-3">
          {/* Agent Share Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                Agent Share
              </label>
              <span className="font-mono text-[10px] font-bold text-burgundy-primary">
                {agentPercentage.toFixed(0)}%
              </span>
            </div>
            <Input
              prefix={<span className="font-mono text-xs font-bold text-text-muted">SGD</span>}
              value={modalAgentShare}
              onChange={(e) => setModalAgentShare(e.target.value)}
              placeholder="940.00"
              isMono
              size="sm"
            />
          </div>

          {/* Rep Share Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                Rep Share
              </label>
              <span className="font-mono text-[10px] font-bold text-brand-red">
                {repPercentage.toFixed(0)}%
              </span>
            </div>
            <Input
              prefix={<span className="font-mono text-xs font-bold text-text-muted">SGD</span>}
              value={modalRepShare}
              onChange={(e) => setModalRepShare(e.target.value)}
              placeholder="940.00"
              isMono
              size="sm"
            />
          </div>
        </div>

        {/* Live Preview Ratio Bar */}
        <div className="space-y-1.5 rounded-xl border border-brand-border/80 bg-brand-bg/40 p-3">
          <div className="flex items-center justify-between text-[11px] font-semibold text-text-secondary">
            <span>Split Preview</span>
            <span className="font-mono font-bold text-burgundy-primary">
              SGD {fmt(currentCombinedTotal)}
            </span>
          </div>
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-brand-border/60">
            <div
              style={{ width: `${agentPercentage}%` }}
              className="bg-burgundy-primary transition-all duration-200"
            />
            <div
              style={{ width: `${repPercentage}%` }}
              className="bg-[#a64c61] transition-all duration-200"
            />
          </div>
          <div className="flex justify-between font-medium text-[10px] text-text-muted">
            <span>Agent: SGD {fmt(currentAgent)}</span>
            <span>Rep: SGD {fmt(currentRep)}</span>
          </div>
        </div>

        {/* Checkbox to sync with Payment Details */}
        <label className="flex cursor-pointer select-none items-center gap-2 text-[11px] text-text-secondary">
          <input
            type="checkbox"
            checked={syncWithPaymentDetails}
            onChange={(e) => setSyncWithPaymentDetails(e.target.checked)}
            className="h-4 w-4 rounded border-brand-border text-burgundy-primary focus:ring-burgundy-primary/30"
          />
          <span>Update Payment Details commission inputs with this split</span>
        </label>
      </div>
    </Modal>
  );
};

