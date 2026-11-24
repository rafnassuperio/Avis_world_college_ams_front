import React from "react";
import { motion } from "framer-motion";
import { Receipt, AlertCircle, CheckCircle2, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { downloadPaymentReceipt } from "@/services/payments";
import { PaymentHistoryItem } from "../../types";
import { cn } from "@/lib/utils";

export interface OtherPaymentSettlementLedgerProps {
  history: PaymentHistoryItem[];
  studentName: string;
  className?: string;
}

export const OtherPaymentSettlementLedger: React.FC<OtherPaymentSettlementLedgerProps> = ({
  history,
  studentName: _studentName,
  className,
}) => {
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
      className={cn("rounded-2xl border border-brand-border bg-white p-5 shadow-card", className)}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-brand-border/70 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-burgundy-primary/10 text-burgundy-primary">
            <Receipt className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-primary">Ancillary Fees Settlement Ledger</h4>
            <p className="text-[11px] text-text-muted">Recorded receipts & transaction logs for other student charges</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-brand-border bg-brand-bg px-2.5 py-0.5 text-xs font-semibold text-text-secondary">
            {history.length} {history.length === 1 ? "Record" : "Records"}
          </span>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light-red text-burgundy-primary">
            <AlertCircle className="h-6 w-6" />
          </div>
          <p className="mt-2 text-xs font-bold text-text-primary">No Ancillary Payments Yet</p>
          <p className="max-w-sm text-[11px] text-text-muted">
            Select outstanding fees above and process payment to generate official receipts.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-brand-border/80 bg-brand-bg/60 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                <th className="py-2.5 pl-3 pr-2">Receipt No</th>
                <th className="px-2 py-2.5">Date & Time</th>
                <th className="px-2 py-2.5">Method</th>
                <th className="px-2 py-2.5">Item / Service</th>
                <th className="px-2 py-2.5">Amount</th>
                <th className="px-2 py-2.5">Status</th>
                <th className="py-2.5 pl-2 pr-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60">
              {history.map((item) => (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-brand-bg/40"
                >
                  <td className="py-3 pl-3 pr-2 font-mono font-bold text-text-primary">
                    {item.receiptNo}
                  </td>
                  <td className="px-2 py-3 text-text-secondary">
                    <div>{item.date}</div>
                    <div className="text-[10px] text-text-muted">{item.time}</div>
                  </td>
                  <td className="px-2 py-3">
                    <span className="inline-flex items-center gap-1 font-medium text-text-primary">
                      {item.paymentMethod}
                    </span>
                  </td>
                  <td className="px-2 py-3">
                    <span className="font-semibold text-text-primary">
                      {item.itemName || item.note || "Ancillary Fee Payment"}
                    </span>
                  </td>
                  <td className="px-2 py-3 font-mono font-bold text-text-primary">
                    {item.currency} {fmt(item.amount)}
                  </td>
                  <td className="px-2 py-3">
                    <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success-light px-2 py-0.5 text-[10px] font-bold text-success">
                      <CheckCircle2 className="h-3 w-3" />
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 pl-2 pr-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { void downloadPaymentReceipt(item.id); }}
                      className="h-7 px-2 text-xs text-burgundy-primary hover:bg-brand-light-red/50"
                      title="Download Receipt"
                    >
                      <Download className="mr-1 h-3.5 w-3.5" />
                      Receipt
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

