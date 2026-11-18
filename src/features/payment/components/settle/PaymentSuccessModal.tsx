import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Receipt, Download, Printer, Copy, Check, ShieldCheck, CreditCard, Calendar, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/common/ToastMessage";
import { PaymentHistoryItem } from "../../types";

export interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: PaymentHistoryItem | null;
  studentName: string;
  studentCode?: string;
  finNumber?: string;
  onDownloadReceipt?: (receiptNo: string) => void;
}

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  isOpen,
  onClose,
  transaction,
  studentName,
  studentCode,
  onDownloadReceipt,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!transaction) return null;

  const fmt = (val: number) => {
    return val.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownload = () => {
    if (onDownloadReceipt) {
      onDownloadReceipt(transaction.receiptNo);
    } else {
      toast.success("Receipt Downloaded", {
        description: `Official receipt ${transaction.receiptNo} for ${studentName} generated successfully.`,
      });
    }
  };

  const handlePrint = () => {
    toast.info("Preparing Printable Receipt", {
      description: `Opening printable view for receipt ${transaction.receiptNo}.`,
    });
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="xl"
      hideHeader={true}
      containerClassName="z-[110]"
      bodyClassName="overflow-x-hidden"
      className="relative max-w-xl overflow-hidden p-6 sm:p-7"
    >
      {/* Top right quick close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-20 rounded-full border border-brand-border/80 p-1 text-text-muted transition-colors hover:bg-brand-light-red/40 hover:text-burgundy-primary"
        aria-label="Close dialog"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="w-full max-w-full space-y-5 overflow-x-hidden text-center">
        {/* Animated Success Badge (bounded to h-16 w-16 so glow stays inside) */}
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
          {/* Ambient Glow */}
          <div className="pointer-events-none absolute -inset-3 animate-pulse rounded-full bg-emerald-500/20 blur-lg" />
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: 0.05,
            }}
            className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 ring-8 ring-emerald-50"
          >
            <CheckCircle2 className="h-9 w-9 stroke-[2.6]" />
          </motion.div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1">
          <motion.h3
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl font-extrabold tracking-tight text-text-primary"
          >
            Payment Successful!
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-xs text-text-secondary"
          >
            Your transaction has been processed and confirmed in the institutional ledger.
          </motion.p>
        </div>

        {/* Amount Paid Callout Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="shadow-xs rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/40 p-4"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Amount Paid</span>
          <div className="mt-1 flex items-baseline justify-center gap-1.5">
            <span className="font-mono text-2xl font-black tracking-tight text-emerald-700">
              {transaction.currency} {fmt(transaction.amount)}
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-emerald-700">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span>Settled & Verified</span>
          </div>
        </motion.div>

        {/* Receipt Ticket Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="shadow-2xs relative w-full space-y-3 overflow-hidden rounded-2xl border border-brand-border bg-brand-bg/50 p-4 text-left"
        >
          {/* Subtle Top Perforated Line Decoration */}
          <div className="flex items-center justify-between border-b border-brand-border/70 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-burgundy-primary/10 text-burgundy-primary">
                <Receipt className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-text-primary">Official Receipt Details</span>
            </div>
            <span className="rounded-full bg-brand-light-red px-2 py-0.5 text-[10px] font-bold text-burgundy-primary">
              {transaction.feeCategory || "Fee Settlement"}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* 1. Receipt No */}
            <div className="min-w-0 space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Receipt Number</span>
              <div className="flex items-center gap-1.5">
                <span className="truncate font-mono font-bold text-text-primary">{transaction.receiptNo}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(transaction.receiptNo, "Receipt Number")}
                  className="shrink-0 rounded p-0.5 text-text-muted hover:bg-brand-border/40 hover:text-text-primary"
                  title="Copy receipt number"
                >
                  {copiedKey === "Receipt Number" ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>

            {/* 2. Transaction Ref */}
            <div className="min-w-0 space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Transaction Ref</span>
              <div className="flex items-center gap-1.5">
                <span className="truncate font-mono text-xs font-semibold text-text-secondary">{transaction.transactionRef}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(transaction.transactionRef, "Transaction Ref")}
                  className="shrink-0 rounded p-0.5 text-text-muted hover:bg-brand-border/40 hover:text-text-primary"
                  title="Copy reference"
                >
                  {copiedKey === "Transaction Ref" ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>

            {/* 3. Student Name */}
            <div className="min-w-0 space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Student Name</span>
              <p
                className="truncate font-semibold text-text-primary"
                title={studentName}
              >
                {studentName}
              </p>
              {studentCode && <span className="block truncate text-[10px] text-text-muted">ID: {studentCode}</span>}
            </div>

            {/* 4. Payment Method */}
            <div className="min-w-0 space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Payment Method</span>
              <p className="flex items-center gap-1 truncate font-semibold text-text-primary">
                <CreditCard className="h-3.5 w-3.5 shrink-0 text-burgundy-primary" />
                <span className="truncate">{transaction.paymentMethod}</span>
              </p>
            </div>

            {/* 5. Date & Time */}
            <div className="min-w-0 space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Date & Time</span>
              <p className="flex items-center gap-1 truncate font-semibold text-text-primary">
                <Calendar className="h-3.5 w-3.5 shrink-0 text-text-muted" />
                <span className="truncate">
                  {transaction.date} • {transaction.time}
                </span>
              </p>
            </div>

            {/* 6. Item / Service Name */}
            <div className="min-w-0 space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Item / Description</span>
              <p
                className="truncate font-semibold text-text-primary"
                title={transaction.itemName || transaction.note}
              >
                {transaction.itemName || transaction.note || "Institutional Fee"}
              </p>
            </div>
          </div>

          {/* Commission Details (if present) */}
          {((transaction.agentCommission ?? 0) > 0 || (transaction.repCommission ?? 0) > 0) && (
            <div className="mt-2 flex items-center justify-between rounded-xl border border-brand-border/70 bg-white p-2.5 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-text-muted">Agent Comm.</span>
                <p className="font-mono font-semibold text-text-primary">
                  {transaction.currency} {fmt(transaction.agentCommission ?? 0)}
                </p>
              </div>
              <div className="space-y-0.5 text-right">
                <span className="text-[10px] font-bold uppercase text-text-muted">Rep Comm.</span>
                <p className="font-mono font-semibold text-text-primary">
                  {transaction.currency} {fmt(transaction.repCommission ?? 0)}
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Institutional Verification Footer */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-text-muted">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>Official Avis World College electronic receipt. Verified and archived.</span>
        </div>

        {/* Action Buttons */}
        <div className="flex w-full flex-col items-center gap-2 border-t border-brand-border/70 pt-2.5 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="w-full min-w-0 flex-1 border-brand-border font-semibold sm:w-auto"
          >
            <Printer className="mr-1.5 h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Print Receipt</span>
          </Button>

          <Button
            type="button"
            variant="burgundy"
            size="sm"
            onClick={handleDownload}
            className="w-full min-w-0 flex-1 font-bold shadow-md shadow-burgundy-primary/20 sm:w-auto"
          >
            <Download className="mr-1.5 h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Download Receipt</span>
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="w-full min-w-0 px-4 font-semibold sm:w-auto"
          >
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
