import React from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Receipt,
  Banknote,
  Building2,
  Zap,
  Globe,
  FileText,
  RotateCcw,
  X,
  CheckCircle2,
  BadgePercent,
  HelpCircle,
} from "lucide-react";
import { FilterSelect, FilterSelectOption } from "@/components/ui/FilterSelect";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface PaymentDetailsCardProps {
  receiptNo: string;
  onReceiptNoChange: (val: string) => void;
  paymentMethod: string;
  onPaymentMethodChange: (val: string) => void;
  paymentDate: string;
  onPaymentDateChange: (val: string) => void;
  oneTimeSettlement: string;
  onOneTimeSettlementChange: (val: string) => void;
  paymentAmount: string;
  onPaymentAmountChange: (val: string) => void;
  amountError?: string;
  agentComm: string;
  onAgentCommChange: (val: string) => void;
  repComm: string;
  onRepCommChange: (val: string) => void;
  totalCourseFee?: number;
  totalAmountAfterComm?: number;
  totalFeeRequested?: number;
  onApplyOneTimeSettlement: () => void;
  onApplyPresetAmount: (val: number, label: string) => void;
  onCancel: () => void;
  onResetCourseFee: () => void;
  onSettleCourseFee: () => void;
  className?: string;
}

export const PaymentDetailsCard: React.FC<PaymentDetailsCardProps> = ({
  receiptNo,
  onReceiptNoChange,
  paymentMethod,
  onPaymentMethodChange,
  paymentDate,
  onPaymentDateChange,
  oneTimeSettlement,
  onOneTimeSettlementChange,
  paymentAmount,
  onPaymentAmountChange,
  amountError,
  agentComm,
  onAgentCommChange,
  repComm,
  onRepCommChange,
  totalCourseFee = 2343.5,
  totalAmountAfterComm = 681.5,
  totalFeeRequested = 2561.5,
  onApplyOneTimeSettlement,
  onApplyPresetAmount,
  onCancel,
  onResetCourseFee,
  onSettleCourseFee,
  className,
}) => {
  const paymentMethodOptions: FilterSelectOption[] = [
    { label: "Cash", value: "Cash", icon: Banknote },
    { label: "Bank Transfer", value: "Bank Transfer", icon: Building2 },
    { label: "PayNow", value: "PayNow", icon: Zap },
    { label: "Telegraphic Transfer", value: "Telegraphic Transfer", icon: Globe },
    { label: "Cheque", value: "Cheque", icon: FileText },
    { label: "Others", value: "Others", icon: HelpCircle },
  ];

  const fmt = (val: number) => {
    return val.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.1 }}
      className={cn(
        "relative flex flex-col justify-between overflow-hidden rounded-2xl border border-brand-border bg-white p-5 shadow-card transition-all duration-200 hover:shadow-card-hover",
        className,
      )}
    >
      {/* Subtle Accent Glow */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-burgundy-primary/5 blur-2xl" />

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-border/70 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-burgundy-primary/10 text-burgundy-primary">
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">Payment Details</h3>
              <p className="text-[11px] text-text-muted">Record course fee settlement transaction</p>
            </div>
          </div>
          <span className="rounded-full border border-success/30 bg-success-light px-2.5 py-0.5 text-[11px] font-bold text-success">
            Active Form
          </span>
        </div>

        {/* Form Fields Requested */}
        <div className="space-y-3">
          {/* 1. Receipt No (Optional) */}
          <Input
            label="Receipt No (Optional)"
            labelIcon={Receipt}
            placeholder="e.g. REC-7701 (Leave empty for auto-generated)"
            value={receiptNo}
            onChange={(e) => onReceiptNoChange(e.target.value)}
            size="sm"
          />

          {/* 2. Payment Method (Select option) */}
          <FilterSelect
            label="Payment Method"
            icon={CreditCard}
            value={paymentMethod}
            options={paymentMethodOptions}
            onChange={(val) => onPaymentMethodChange(val)}
            placeholder="Select payment method"
            size="sm"
            required
          />

          {/* 3. Payment Date */}
          <Input
            label="Payment Date"
            type="date"
            value={paymentDate}
            onChange={(e) => onPaymentDateChange(e.target.value)}
            size="sm"
            required
          />

          {/* 4. One Time Settlement - SGD 0.00 */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                One Time Settlement
              </label>
              <button
                type="button"
                onClick={onApplyOneTimeSettlement}
                className="text-[10px] font-bold text-burgundy-primary hover:underline"
              >
                Set Full (SGD {fmt(totalCourseFee)})
              </button>
            </div>
            <Input
              prefix={<span className="font-mono text-xs font-bold text-text-muted">SGD</span>}
              value={oneTimeSettlement}
              onChange={(e) => onOneTimeSettlementChange(e.target.value)}
              placeholder="0.00"
              isMono
              size="sm"
            />
          </div>

          {/* 5. Payment Amount - SGD */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                Payment Amount <span className="text-brand-red">*</span>
              </label>
              <span className="text-[10px] text-text-muted">Currency: SGD</span>
            </div>
            <Input
              prefix={<span className="font-mono text-xs font-bold text-burgundy-primary">SGD</span>}
              value={paymentAmount}
              onChange={(e) => onPaymentAmountChange(e.target.value)}
              error={amountError}
              placeholder="2343.50"
              isMono
              size="sm"
              required
            />
            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => onApplyPresetAmount(totalCourseFee, "Total Course Fee")}
                className="rounded-lg border border-brand-border bg-brand-bg px-2 py-0.5 font-mono text-[10px] font-semibold text-text-secondary hover:border-burgundy-primary/40 hover:text-burgundy-primary"
              >
                Course Fee ({fmt(totalCourseFee)})
              </button>
              <button
                type="button"
                onClick={() => onApplyPresetAmount(totalAmountAfterComm, "Net After Comm")}
                className="rounded-lg border border-brand-border bg-brand-bg px-2 py-0.5 font-mono text-[10px] font-semibold text-text-secondary hover:border-burgundy-primary/40 hover:text-burgundy-primary"
              >
                After Comm ({fmt(totalAmountAfterComm)})
              </button>
              <button
                type="button"
                onClick={() => onApplyPresetAmount(totalFeeRequested, "Total Fee")}
                className="rounded-lg border border-brand-border bg-brand-bg px-2 py-0.5 font-mono text-[10px] font-semibold text-text-secondary hover:border-burgundy-primary/40 hover:text-burgundy-primary"
              >
                Total Fee ({fmt(totalFeeRequested)})
              </button>
            </div>
          </div>

          {/* 6. Commission Details */}
          <div className="rounded-xl border border-brand-border/80 bg-brand-bg/40 p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                <BadgePercent className="h-3.5 w-3.5 text-burgundy-primary" />
                Commission Details
              </span>
              <span className="text-[10px] text-text-muted">Recorded with payment</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {/* Agent Comm. */}
              <Input
                label="Agent Comm."
                prefix={<span className="font-mono text-xs font-bold text-text-muted">SGD</span>}
                value={agentComm}
                onChange={(e) => onAgentCommChange(e.target.value)}
                placeholder="0.00"
                isMono
                size="sm"
              />
              {/* Rep Comm. */}
              <Input
                label="Rep Comm."
                prefix={<span className="font-mono text-xs font-bold text-text-muted">SGD</span>}
                value={repComm}
                onChange={(e) => onRepCommChange(e.target.value)}
                placeholder="0.00"
                isMono
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons: Cancel, Reset Course Fee, and Settle Course Fee */}
      <div className="mt-5 space-y-2 border-t border-brand-border/70 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Button 1: Cancel */}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onCancel}
            className="flex-1 font-semibold"
          >
            <X className="mr-1.5 h-3.5 w-3.5" />
            Cancel
          </Button>

          {/* Button 2: Reset Course Fee */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResetCourseFee}
            className="flex-1 font-semibold text-burgundy-primary border-burgundy-primary/30 hover:bg-burgundy-primary/5 hover:border-burgundy-primary"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Reset Course Fee
          </Button>
        </div>

        {/* Settle Course Fee Primary Confirmation Button */}
        <Button
          type="button"
          variant="burgundy"
          size="sm"
          onClick={onSettleCourseFee}
          className="w-full font-bold shadow-md shadow-burgundy-primary/20"
        >
          <CheckCircle2 className="mr-1.5 h-4 w-4" />
          Settle Course Fee • SGD {paymentAmount || "0.00"}
        </Button>
      </div>
    </motion.div>
  );
};

