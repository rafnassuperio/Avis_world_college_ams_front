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
  Calendar,
  X,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { FilterSelect, FilterSelectOption } from "@/components/ui/FilterSelect";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface OtherPaymentDetailsCardProps {
  receiptNo: string;
  onReceiptNoChange: (val: string) => void;
  paymentMethod: string;
  onPaymentMethodChange: (val: string) => void;
  paymentDate: string;
  onPaymentDateChange: (val: string) => void;
  totalAmountToPay: string;
  onTotalAmountToPayChange: (val: string) => void;
  amountError?: string;
  currency?: string;
  selectedCount?: number;
  onCancel: () => void;
  onProcessPayment: () => void;
  className?: string;
}

export const OtherPaymentDetailsCard: React.FC<OtherPaymentDetailsCardProps> = ({
  receiptNo,
  onReceiptNoChange,
  paymentMethod,
  onPaymentMethodChange,
  paymentDate,
  onPaymentDateChange,
  totalAmountToPay,
  onTotalAmountToPayChange,
  amountError,
  currency = "SGD",
  selectedCount = 0,
  onCancel,
  onProcessPayment,
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
      {/* Ambient Brand Accent Glow */}
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
              <p className="text-[11px] text-text-muted">Record ancillary fee settlement transaction</p>
            </div>
          </div>
          <span className="rounded-full border border-success/30 bg-success-light px-2.5 py-0.5 text-[11px] font-bold text-success">
            Active Form
          </span>
        </div>

        {/* Fields in exact requested order: */}
        {/* 1. Receipt No (Optional) */}
        {/* 2. Payment Method */}
        {/* 3. Payment Date */}
        {/* 4. Total Amount to Pay SGD */}
        <div className="space-y-3.5">
          {/* 1. Receipt No (Optional) */}
          <Input
            label="Receipt No (Optional)"
            labelIcon={Receipt}
            placeholder="e.g. REC-OTH-8801 (Leave empty for auto-generated)"
            value={receiptNo}
            onChange={(e) => onReceiptNoChange(e.target.value)}
            size="sm"
          />

          {/* 2. Payment Method */}
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
            labelIcon={Calendar}
            type="date"
            value={paymentDate}
            onChange={(e) => onPaymentDateChange(e.target.value)}
            size="sm"
            required
          />

          {/* 4. Total Amount to Pay SGD */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                Total Amount to Pay <span className="text-brand-red">*</span>
              </label>
              <span className="text-[10px] text-text-muted">Currency: {currency}</span>
            </div>
            <Input
              prefix={<span className="font-mono text-xs font-bold text-burgundy-primary">{currency}</span>}
              value={totalAmountToPay}
              onChange={(e) => onTotalAmountToPayChange(e.target.value)}
              error={amountError}
              placeholder="0.00"
              isMono
              size="sm"
              required
            />
            {selectedCount > 0 && (
              <p className="text-[10px] font-medium text-text-muted">
                Auto-calculated from {selectedCount} selected fee {selectedCount === 1 ? "item" : "items"}.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Two Buttons: Cancel and Process Payment (Requested by user) */}
      <div className="mt-5 space-y-2 border-t border-brand-border/70 pt-4">
        <div className="flex flex-wrap items-center gap-2.5">
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

          {/* Button 2: Process Payment */}
          <Button
            type="button"
            variant="burgundy"
            size="sm"
            onClick={onProcessPayment}
            className="flex-1 font-bold shadow-md shadow-burgundy-primary/20"
          >
            <CheckCircle2 className="mr-1.5 h-4 w-4" />
            Process Payment
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

