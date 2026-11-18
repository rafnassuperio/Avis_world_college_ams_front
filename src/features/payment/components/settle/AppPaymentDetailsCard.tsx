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
  Calendar,
  HelpCircle,
  Scale,
} from "lucide-react";
import { FilterSelect, FilterSelectOption } from "@/components/ui/FilterSelect";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface AppPaymentDetailsCardProps {
  paymentMethod: string;
  onPaymentMethodChange: (val: string) => void;
  oneTimeSettlement: string;
  onOneTimeSettlementChange: (val: string) => void;
  paymentDate: string;
  onPaymentDateChange: (val: string) => void;
  receiptNo: string;
  onReceiptNoChange: (val: string) => void;
  paymentAmount: string;
  onPaymentAmountChange: (val: string) => void;
  remainingBalance?: number;
  outstandingAmount?: number;
  amountError?: string;
  currency?: string;
  onApplyOneTimeSettlement: () => void;
  onApplyPresetAmount: (val: number, label: string) => void;
  onCancel: () => void;
  onResetAppFee: () => void;
  onSettleAppFee: () => void;
  className?: string;
}

export const AppPaymentDetailsCard: React.FC<AppPaymentDetailsCardProps> = ({
  paymentMethod,
  onPaymentMethodChange,
  oneTimeSettlement,
  onOneTimeSettlementChange,
  paymentDate,
  onPaymentDateChange,
  receiptNo,
  onReceiptNoChange,
  paymentAmount,
  onPaymentAmountChange,
  remainingBalance = 0.0,
  outstandingAmount = 0.0,
  amountError,
  currency = "SGD",
  onApplyOneTimeSettlement,
  onApplyPresetAmount,
  onCancel,
  onResetAppFee,
  onSettleAppFee,
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
      transition={{ duration: 0.25, delay: 0.05 }}
      className={cn(
        "relative flex flex-col justify-between overflow-hidden rounded-2xl border border-brand-border bg-white p-5 shadow-card transition-all duration-200 hover:shadow-card-hover",
        className,
      )}
    >
      {/* Ambient Brand Glow */}
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
              <p className="text-[11px] text-text-muted">Record application fee payment transaction</p>
            </div>
          </div>
          <span className="rounded-full border border-success/30 bg-success-light px-2.5 py-0.5 text-[11px] font-bold text-success">
            Active Form
          </span>
        </div>

        {/* Fields in exact order requested by user: */}
        {/* 1. Payment Method */}
        {/* 2. One Time Settlement */}
        {/* 3. Payment Date */}
        {/* 4. Receipt No (Optional) */}
        {/* 5. Payment Amount */}
        {/* 6. Remaining Balance */}
        <div className="space-y-3">
          {/* 1. Payment Method */}
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

          {/* 2. One Time Settlement */}
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
                Set Full ({currency} {fmt(outstandingAmount)})
              </button>
            </div>
            <Input
              prefix={<span className="font-mono text-xs font-bold text-text-muted">{currency}</span>}
              value={oneTimeSettlement}
              onChange={(e) => onOneTimeSettlementChange(e.target.value)}
              placeholder="0.00"
              isMono
              size="sm"
            />
          </div>

          {/* 3. Payment Date */}
          <Input
            label="Payment Date"
            labelIcon={Calendar}
            type="date"
            value={paymentDate}
            onChange={(e) => onPaymentDateChange(e.target.value)}
            size="sm"
            required
          />

          {/* 4. Receipt No (Optional) */}
          <Input
            label="Receipt No (Optional)"
            labelIcon={Receipt}
            placeholder="e.g. REC-APP-7701 (Leave empty for auto-generated)"
            value={receiptNo}
            onChange={(e) => onReceiptNoChange(e.target.value)}
            size="sm"
          />

          {/* 5. Payment Amount */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                Payment Amount <span className="text-brand-red">*</span>
              </label>
              <span className="text-[10px] text-text-muted">Currency: {currency}</span>
            </div>
            <Input
              prefix={<span className="font-mono text-xs font-bold text-burgundy-primary">{currency}</span>}
              value={paymentAmount}
              onChange={(e) => onPaymentAmountChange(e.target.value)}
              error={amountError}
              placeholder="0.00"
              isMono
              size="sm"
              required
            />
            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => onApplyPresetAmount(0, "Nil")}
                className="rounded-lg border border-brand-border bg-brand-bg px-2 py-0.5 font-mono text-[10px] font-semibold text-text-secondary hover:border-burgundy-primary/40 hover:text-burgundy-primary"
              >
                SGD 0.00 (Nil)
              </button>
              <button
                type="button"
                onClick={() => onApplyPresetAmount(109, "Standard App Fee")}
                className="rounded-lg border border-brand-border bg-brand-bg px-2 py-0.5 font-mono text-[10px] font-semibold text-text-secondary hover:border-burgundy-primary/40 hover:text-burgundy-primary"
              >
                SGD 109.00 (Standard)
              </button>
              <button
                type="button"
                onClick={() => onApplyPresetAmount(218, "Registration & App Fee")}
                className="rounded-lg border border-brand-border bg-brand-bg px-2 py-0.5 font-mono text-[10px] font-semibold text-text-secondary hover:border-burgundy-primary/40 hover:text-burgundy-primary"
              >
                SGD 218.00 (Full Reg)
              </button>
            </div>
          </div>

          {/* 6. Remaining Balance */}
          <div className="rounded-xl border border-brand-border/80 bg-brand-bg/50 p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                <Scale className="h-3.5 w-3.5 text-burgundy-primary" />
                Remaining Balance
              </span>
              <span className="text-[10px] text-text-muted">Post-settlement balance</span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-xs text-text-muted">Estimated balance:</span>
              <span className="font-mono text-base font-extrabold text-burgundy-primary">
                {currency} {fmt(remainingBalance)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons: Cancel and Reset Application Fee */}
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

          {/* Button 2: Reset Application Fee */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResetAppFee}
            className="flex-1 font-semibold text-burgundy-primary border-burgundy-primary/30 hover:bg-burgundy-primary/5 hover:border-burgundy-primary"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Reset Application Fee
          </Button>
        </div>

        {/* Settle Application Fee Primary Confirmation Action */}
        <Button
          type="button"
          variant="burgundy"
          size="sm"
          onClick={onSettleAppFee}
          className="w-full font-bold shadow-md shadow-burgundy-primary/20"
        >
          <CheckCircle2 className="mr-1.5 h-4 w-4" />
          Settle Application Fee • {currency} {paymentAmount || "0.00"}
        </Button>
      </div>
    </motion.div>
  );
};

