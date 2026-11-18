import React from "react";
import { motion } from "framer-motion";
import { CreditCard, CheckCircle2, Download, FileText, ShieldCheck, Receipt } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/common/ToastMessage";
import { PaymentRecord } from "../types";
import { cn } from "@/lib/utils";

export interface PaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: PaymentRecord | null;
}

export const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({ isOpen, onClose, record }) => {
  if (!record) return null;

  const totalPaid = record.history.filter((h) => h.status === "Successful" || h.status === "Settled").reduce((acc, curr) => acc + curr.amount, 0);

  const balance = Math.max(0, record.totalFee - totalPaid);

  const handleDownloadStatement = () => {
    toast.success("Statement Exported", {
      description: `Full payment ledger statement for ${record.student.name} has been generated.`,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Payment History & Ledger"
      subtitle={`${record.student.name} • ${record.student.studentCode} • Ref: ${record.id}`}
      headerIcon={<Receipt className="h-5 w-5" />}
      maxWidth="5xl"
      showFullScreenToggle={true}
      containerClassName="z-[100]"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Audited institutional fee ledger record</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              variant="burgundy"
              size="sm"
              onClick={handleDownloadStatement}
              className="gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Statement</span>
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Student & College Banner Card */}
        <div className="relative overflow-hidden rounded-2xl border border-brand-border bg-gradient-to-r from-brand-bg via-white to-brand-bg p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-burgundy-primary text-sm font-extrabold text-white shadow-sm ring-2 ring-burgundy-primary/20">
                {record.student.studentCode.slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-text-primary">{record.student.name}</h4>
                  <span className="rounded-full bg-brand-light-red px-2 py-0.5 text-[10px] font-bold text-burgundy-primary">
                    {record.student.studentCode}
                  </span>
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                  <span>•</span>
                  <span>{record.student.course}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
              <span
                className={cn(
                  "shadow-xs inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold",
                  record.status === "Paid" ? "bg-[#00a854] text-white" : "bg-amber-100 text-amber-800",
                )}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {record.status}
              </span>
              <span className="text-[11px] font-medium text-text-muted">Record Date: {record.date}</span>
            </div>
          </div>
        </div>

        {/* 4 Financial Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          <div className="shadow-2xs rounded-xl border border-brand-border bg-white p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Total Course Fee</span>
            <p className="mt-1 text-base font-extrabold text-text-primary">
              {record.currency} {record.totalFee.toLocaleString()}
            </p>
            <span className="text-[10px] text-text-muted">Gross institutional tuition</span>
          </div>

          <div className="shadow-2xs rounded-xl border border-brand-border bg-white p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Rep Commission</span>
            <p className="mt-1 text-base font-extrabold text-burgundy-primary">
              {record.currency} {record.repCommission.toLocaleString()}
            </p>
            <span className="text-[10px] text-text-muted">Representative allocation</span>
          </div>

          <div className="shadow-2xs rounded-xl border border-brand-border bg-white p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Agent Commission</span>
            <p className="mt-1 text-base font-extrabold text-brand-red">
              {record.currency} {record.agentCommission.toLocaleString()}
            </p>
            <span className="text-[10px] text-text-muted">Direct agent commission</span>
          </div>
        </div>

        {/* Card Settlement & Balance Bar */}
        <div className="flex flex-col gap-2 rounded-xl border border-brand-border/80 bg-brand-bg/60 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-burgundy-primary" />
            <span className="font-semibold text-text-primary">Card Gateway Status:</span>
            <span
              className={cn(
                "rounded-md px-2 py-0.5 text-xs font-bold",
                record.cardStatus === "Settled" ? "bg-[#00a854] text-white" : "bg-slate-600 text-white",
              )}
            >
              {record.cardStatus}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-text-secondary">
              Total Paid:{" "}
              <strong className="font-bold text-text-primary">
                {record.currency} {totalPaid.toLocaleString()}
              </strong>
            </span>
            <span>•</span>
            <span className="text-text-secondary">
              Outstanding Balance:{" "}
              <strong className={cn("font-bold", balance > 0 ? "text-brand-red" : "text-emerald-600")}>
                {record.currency} {balance.toLocaleString()}
              </strong>
            </span>
          </div>
        </div>

        {/* Payment History Transactions Table */}
        <div className="shadow-2xs rounded-2xl border border-brand-border bg-white">
          <div className="flex items-center justify-between border-b border-brand-border/80 px-4 py-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-burgundy-primary" />
              <h5 className="font-bold text-text-primary">Payment Transactions Timeline</h5>
              <span className="rounded-full bg-brand-bg px-2 py-0.5 text-[10px] font-semibold text-text-secondary">
                {record.history.length} records
              </span>
            </div>
            <span className="text-[11px] font-medium text-text-muted">Real-time gateway audits</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-brand-border bg-brand-bg/70 text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                <tr>
                  <th className="px-3 py-2.5 text-center">No</th>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-3 py-2.5 text-right">Total Fee</th>
                  <th className="px-3 py-2.5 text-center">Status</th>
                  <th className="px-3 py-2.5 text-right">Rep Commission</th>
                  <th className="px-3 py-2.5 text-right">Agent Commission</th>
                  <th className="px-4 py-2.5 text-center">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {record.history.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-text-muted"
                    >
                      No payment transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  record.history.map((item, index) => {
                    const repComm = item.repCommission !== undefined ? item.repCommission : record.history.length === 1 ? record.repCommission : 0;
                    const agentComm =
                      item.agentCommission !== undefined ? item.agentCommission : record.history.length === 1 ? record.agentCommission : 0;

                    return (
                      <tr
                        key={item.id}
                        className="transition-colors hover:bg-brand-bg/50"
                      >
                        <td className="whitespace-nowrap px-3 py-3 text-center font-mono text-sm font-extrabold text-text-primary">
                          {String(index + 1).padStart(2, "0")}
                        </td>
                        <td className="px-4 py-3 text-text-secondary">
                          <div className="flex flex-col">
                            <span className="font-semibold text-text-primary">{item.date}</span>
                            <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                              <span>{item.time}</span>
                              <span>•</span>
                              <span className="font-mono text-burgundy-primary/80">{item.receiptNo}</span>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right font-mono text-sm font-extrabold text-text-primary">
                          {record.currency} {item.amount.toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-center">
                          <span
                            className={cn(
                              "shadow-2xs inline-flex items-center justify-center rounded-md px-2.5 py-1 text-xs font-bold text-white",
                              item.status === "Successful" || item.status === "Settled" ? "bg-[#00a854]" : "bg-amber-500",
                            )}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-center font-mono font-bold text-burgundy-primary">
                          {record.currency} {repComm.toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-center font-mono font-bold text-brand-red">
                          {record.currency} {agentComm.toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-center">
                          <div className="flex flex-col items-center justify-center gap-1.5 py-0.5">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.97 }}
                              type="button"
                              onClick={() => {
                                toast.success("Course Fee Receipt", {
                                  description: `Course fee receipt downloaded for ${record.student.name} (${item.receiptNo}).`,
                                });
                              }}
                              className="shadow-2xs hover:shadow-xs inline-flex w-full max-w-[155px] items-center justify-center rounded-lg bg-gradient-to-r from-brand-red to-burgundy-primary px-3 py-1.5 text-[11px] font-bold text-white transition-all hover:brightness-110 active:scale-95"
                              title="Download Course Fee Receipt"
                            >
                              Course Fee Receipt
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.97 }}
                              type="button"
                              onClick={() => {
                                toast.success("Application Fee Receipt", {
                                  description: `Application fee receipt downloaded for ${record.student.name} (${item.receiptNo}).`,
                                });
                              }}
                              className="shadow-2xs hover:shadow-xs inline-flex w-full max-w-[155px] items-center justify-center rounded-lg bg-burgundy-dark px-3 py-1.5 text-[11px] font-bold text-white transition-all hover:bg-palette-midnight active:scale-95"
                              title="Download Application Fee Receipt"
                            >
                              Application Fee Receipt
                            </motion.button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {record.notes && (
          <div className="rounded-xl border border-brand-border bg-brand-bg/40 p-3 text-xs text-text-secondary">
            <strong className="font-bold text-text-primary">Notes: </strong>
            {record.notes}
          </div>
        )}
      </div>
    </Modal>
  );
};
