import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Plus, ChevronDown, ChevronUp, Trash2, CheckSquare, Square, Tag, AlertCircle } from "lucide-react";
import { FilterSelect, FilterSelectOption } from "@/components/ui/FilterSelect";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface FeeTypeItem {
  label: string;
  fee: number | string;
}

const feeTypes: FeeTypeItem[] = [
  { label: "Late Payment Fees", fee: "1% Per Week" },
  { label: "Airport Pickup", fee: 218.0 },
  {
    label: "Student’s Pass Medical Check-up (Payable to Medical Clinic)",
    fee: 60.0,
  },
  { label: "ICA Student Pass Issuance (On Renewal)", fee: 98.1 },
  { label: "ICA Processing Fee (On Renewal)", fee: 49.05 },
  { label: "Admin Fee for Student Pass Renewal", fee: 109.0 },
  { label: "Assessment Appeal Fee (per module)", fee: 109.0 },
  { label: "Re-Assessment Fees (1st attempt per module)", fee: 109.0 },
  { label: "Re-Assessment Fees (2nd attempt per module)", fee: 218.0 },
  { label: "Re-Module Fees (Non WSQ Modules)", fee: 872.0 },
  {
    label: "Re-Module Fees (WSQ Modules), if applicable",
    fee: "Prevailing individual module fees (refer to the official website)",
  },
  { label: "Make-up Lesson per 4 hours session", fee: 109.0 },
  { label: "Deferment Fee", fee: 109.0 },
  { label: "Kitchen Tool Kit", fee: 54.5 },
  { label: "Chef Jacket only (per piece) - Additional", fee: 32.7 },
  { label: "Chef Apron (per piece) - Additional", fee: 32.7 },
  { label: "Chef Hat (per piece) - Additional", fee: 32.7 },
  { label: "Course Book (per module) - Additional", fee: 32.7 },
  { label: "Request Letter & Certifying Letter / Statement", fee: 54.5 },
  {
    label: "Certified True Copy Request of Diploma Certificate / Transcript",
    fee: 54.5,
  },
  {
    label: "Re-issuance Request of Diploma Certificate / Transcript",
    fee: 54.5,
  },
  { label: "Postage fee for certificate delivery", fee: "50.00 to 200.00" },
];

export interface OutstandingFeeItem {
  id: string;
  name: string;
  amount: number;
  dateAdded: string;
  feeNote?: string;
}

export interface OutstandingFeesCardProps {
  items: OutstandingFeeItem[];
  selectedItemIds: string[];
  onToggleSelectItem: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onAddNewFee: (name: string, amount: number, note?: string) => void;
  onRemoveFee: (id: string) => void;
  currency?: string;
  className?: string;
}

export const OutstandingFeesCard: React.FC<OutstandingFeesCardProps> = ({
  items,
  selectedItemIds,
  onToggleSelectItem,
  onSelectAll,
  onClearSelection,
  onAddNewFee,
  onRemoveFee,
  currency = "SGD",
  className,
}) => {
  // Collapse state for Add New Fee
  const [isAddCollapseOpen, setIsAddCollapseOpen] = useState(false);
  const [addMode, setAddMode] = useState<"preset" | "custom">("preset");

  // Form states for Preset mode
  const [selectedPresetLabel, setSelectedPresetLabel] = useState<string>(feeTypes[1].label); // Airport Pickup default
  const [presetAmountInput, setPresetAmountInput] = useState<string>("218.00");

  // Form states for Custom mode
  const [customFeeName, setCustomFeeName] = useState<string>("");
  const [customFeeAmount, setCustomFeeAmount] = useState<string>("");
  const [formError, setFormError] = useState<string>("");

  const fmt = (val: number) => {
    return val.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Convert feeTypes to FilterSelectOption list
  const feeTypeOptions: FilterSelectOption[] = feeTypes.map((ft) => ({
    label: `${ft.label} (${typeof ft.fee === "number" ? `SGD ${ft.fee.toFixed(2)}` : ft.fee})`,
    value: ft.label,
    subLabel: typeof ft.fee === "number" ? `Fixed fee: SGD ${ft.fee.toFixed(2)}` : `Rate: ${ft.fee}`,
  }));

  // Handle preset dropdown change
  const handlePresetSelect = (label: string) => {
    setSelectedPresetLabel(label);
    const found = feeTypes.find((f) => f.label === label);
    if (found) {
      if (typeof found.fee === "number") {
        setPresetAmountInput(found.fee.toFixed(2));
      } else {
        // Suggested starting number or extract first digit
        const match = found.fee.match(/\d+(\.\d+)?/);
        setPresetAmountInput(match ? match[0] : "50.00");
      }
    }
  };

  // Save new fee
  const handleSaveFee = () => {
    setFormError("");
    if (addMode === "preset") {
      const parsedAmount = parseFloat(presetAmountInput.replace(/,/g, ""));
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setFormError("Please enter a valid amount greater than SGD 0");
        return;
      }
      const found = feeTypes.find((f) => f.label === selectedPresetLabel);
      const note = found && typeof found.fee === "string" ? found.fee : undefined;
      onAddNewFee(selectedPresetLabel, parsedAmount, note);
      setIsAddCollapseOpen(false);
    } else {
      if (!customFeeName.trim()) {
        setFormError("Please enter a fee type / name");
        return;
      }
      const parsedAmount = parseFloat(customFeeAmount.replace(/,/g, ""));
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setFormError("Please enter a valid amount greater than SGD 0");
        return;
      }
      onAddNewFee(customFeeName.trim(), parsedAmount);
      setCustomFeeName("");
      setCustomFeeAmount("");
      setIsAddCollapseOpen(false);
    }
  };

  const totalOutstanding = items.reduce((sum, item) => sum + item.amount, 0);
  const totalSelected = items.filter((item) => selectedItemIds.includes(item.id)).reduce((sum, item) => sum + item.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "relative flex flex-col justify-between overflow-hidden rounded-2xl border border-brand-border bg-white p-5 shadow-card transition-all duration-200 hover:shadow-card-hover",
        className,
      )}
    >
      {/* Ambient Brand Accent Glow */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-burgundy-primary/5 blur-2xl" />

      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-border/70 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-burgundy-primary/10 text-burgundy-primary">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">Outstanding Fees</h3>
              <p className="text-[11px] text-text-muted">Ancillary student services, renewals & materials</p>
            </div>
          </div>
          <span className="rounded-full border border-burgundy-primary/20 bg-burgundy-primary/5 px-2.5 py-0.5 text-[11px] font-bold text-burgundy-primary">
            {items.length} {items.length === 1 ? "Item" : "Items"} Due
          </span>
        </div>

        {/* Collapsible: Add New Fee Section */}
        <div className="shadow-2xs overflow-hidden rounded-xl border border-burgundy-primary/30 bg-gradient-to-br from-brand-bg/40 via-white to-brand-light-red/20">
          {/* Collapse Trigger Button */}
          <button
            type="button"
            onClick={() => setIsAddCollapseOpen(!isAddCollapseOpen)}
            className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-brand-light-red/30 focus:outline-none"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-burgundy-primary/10 text-burgundy-primary">
                <Plus className="h-3.5 w-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-text-primary">Add New Fee</span>
                <span className="ml-2 text-[10px] text-text-muted">Select from catalog or enter custom fee</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-burgundy-primary">
              <span className="text-[11px] font-bold">{isAddCollapseOpen ? "Close" : "Expand"}</span>
              {isAddCollapseOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </button>

          {/* Collapsible Content */}
          <AnimatePresence>
            {isAddCollapseOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-3 border-t border-brand-border/70 bg-white p-3.5"
              >
                {/* Mode Selector Tabs: Preset Catalog vs Custom */}
                <div className="flex items-center gap-1 rounded-xl border border-brand-border bg-brand-bg/70 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAddMode("preset");
                      setFormError("");
                    }}
                    className={cn(
                      "flex-1 rounded-lg py-1 text-center text-xs font-bold transition-all",
                      addMode === "preset" ? "shadow-2xs bg-white text-burgundy-primary" : "text-text-muted hover:text-text-primary",
                    )}
                  >
                    Select Fee Type(s)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddMode("custom");
                      setFormError("");
                    }}
                    className={cn(
                      "flex-1 rounded-lg py-1 text-center text-xs font-bold transition-all",
                      addMode === "custom" ? "shadow-2xs bg-white text-burgundy-primary" : "text-text-muted hover:text-text-primary",
                    )}
                  >
                    Add New (Custom)
                  </button>
                </div>

                {/* Form Body */}
                {addMode === "preset" ? (
                  /* Option 1: Select Fee Type(s) from provided feeTypes list */
                  <div className="space-y-3">
                    <FilterSelect
                      label="Select Fee Type(s)"
                      icon={Tag}
                      value={selectedPresetLabel}
                      options={feeTypeOptions}
                      onChange={handlePresetSelect}
                      searchable={true}
                      searchPlaceholder="Search fee types..."
                      size="sm"
                      required
                    />

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                          Fee Amount ({currency}) <span className="text-brand-red">*</span>
                        </label>
                        <span className="text-[10px] text-text-muted">Standard rate applied</span>
                      </div>
                      <Input
                        prefix={<span className="font-mono text-xs font-bold text-text-muted">{currency}</span>}
                        value={presetAmountInput}
                        onChange={(e) => setPresetAmountInput(e.target.value)}
                        placeholder="0.00"
                        isMono
                        size="sm"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  /* Option 2: Add New type text and amount number and save */
                  <div className="space-y-3">
                    <Input
                      label="Fee Type / Name"
                      icon={Tag}
                      value={customFeeName}
                      onChange={(e) => setCustomFeeName(e.target.value)}
                      placeholder="e.g. Locker Rental or Uniform Tailoring"
                      size="sm"
                      required
                    />

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                          Amount ({currency}) <span className="text-brand-red">*</span>
                        </label>
                        <span className="text-[10px] text-text-muted">Enter charge amount</span>
                      </div>
                      <Input
                        prefix={<span className="font-mono text-xs font-bold text-text-muted">{currency}</span>}
                        value={customFeeAmount}
                        onChange={(e) => setCustomFeeAmount(e.target.value)}
                        placeholder="e.g. 50.00"
                        isMono
                        size="sm"
                        required
                      />
                    </div>
                  </div>
                )}

                {formError && (
                  <p className="flex items-center gap-1 text-[11px] font-semibold text-brand-red">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {formError}
                  </p>
                )}

                {/* Save Button */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsAddCollapseOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="burgundy"
                    size="sm"
                    onClick={handleSaveFee}
                    className="gap-1.5 font-bold"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Save Fee
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Outstanding Fees Item List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold uppercase tracking-wider text-text-secondary">Fee Items Due</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onSelectAll}
                className="text-[10px] font-bold text-burgundy-primary hover:underline"
              >
                Select All
              </button>
              <span className="text-brand-border">|</span>
              <button
                type="button"
                onClick={onClearSelection}
                className="text-[10px] font-bold text-text-muted hover:text-text-primary"
              >
                Clear
              </button>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-brand-border/80 bg-brand-bg/40 p-6 text-center">
              <Layers className="mx-auto h-6 w-6 text-text-muted" />
              <p className="mt-1 text-xs font-bold text-text-primary">No Outstanding Ancillary Fees</p>
              <p className="text-[10px] text-text-muted">
                Use &quot;Add New Fee&quot; above to bill course materials, administrative fees, or renewals.
              </p>
            </div>
          ) : (
            <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
              {items.map((item) => {
                const isSelected = selectedItemIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => onToggleSelectItem(item.id)}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 transition-all",
                      isSelected
                        ? "shadow-2xs border-burgundy-primary/40 bg-burgundy-primary/5"
                        : "border-brand-border/70 bg-white hover:border-brand-border hover:bg-brand-bg/40",
                    )}
                  >
                    <div className="flex min-w-0 items-start gap-2.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSelectItem(item.id);
                        }}
                        className="mt-0.5 text-burgundy-primary"
                      >
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4 fill-burgundy-primary/10 text-burgundy-primary" />
                        ) : (
                          <Square className="h-4 w-4 text-text-muted" />
                        )}
                      </button>
                      <div className="min-w-0">
                        <p
                          className="truncate text-xs font-bold text-text-primary"
                          title={item.name}
                        >
                          {item.name}
                        </p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[10px] text-text-muted">
                          <span>Added: {item.dateAdded}</span>
                          {item.feeNote && (
                            <span className="py-0.2 rounded border border-brand-border bg-brand-bg px-1.5 text-[9px] font-semibold text-text-secondary">
                              {item.feeNote}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-burgundy-primary">
                        {currency} {fmt(item.amount)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveFee(item.id);
                        }}
                        className="rounded-lg p-1 text-text-muted transition-colors hover:bg-brand-light-red/60 hover:text-brand-red"
                        title="Remove fee"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Outstanding Total Summary Box */}
        <div className="space-y-1.5 rounded-xl border border-brand-border/80 bg-brand-bg/60 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-text-secondary">Selected to Pay ({selectedItemIds.length} items):</span>
            <span className="font-mono text-sm font-extrabold text-burgundy-primary">
              {currency} {fmt(totalSelected)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-brand-border/60 pt-1 text-[11px] text-text-muted">
            <span>Total Outstanding Fees:</span>
            <span className="font-mono font-bold text-text-secondary">
              {currency} {fmt(totalOutstanding)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-4 border-t border-brand-border/60 pt-2 text-[10px] text-text-muted">
        Select the fees you wish to settle now. The total will automatically populate the payment amount.
      </div>
    </motion.div>
  );
};
