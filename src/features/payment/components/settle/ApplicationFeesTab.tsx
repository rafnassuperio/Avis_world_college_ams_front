import React, { useState, useMemo } from "react";
import { StudentDetailsCard } from "./StudentDetailsCard";
import { AppFeeSummaryCard } from "./AppFeeSummaryCard";
import { AppPaymentDetailsCard } from "./AppPaymentDetailsCard";
import { AppFeeSettlementLedger } from "./AppFeeSettlementLedger";
import { PaymentSuccessModal } from "./PaymentSuccessModal";
import { settlePaymentRecord, resetPaymentRecord } from "../../utils/paymentStorage";
import { PaymentRecord, PaymentHistoryItem } from "../../types";
import { toast } from "@/components/common/ToastMessage";

export interface ApplicationFeesTabProps {
  record: PaymentRecord;
  onUpdate?: () => void;
}

export const ApplicationFeesTab: React.FC<ApplicationFeesTabProps> = ({ record, onUpdate }) => {
  // Helper for today's ISO date string (YYYY-MM-DD)
  const getTodayIso = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // ----------------------------------------------------
  // Fee Summary Values (Requested: Total Fee - SGD 0.00, Outstanding Amount - SGD 0.00)
  // ----------------------------------------------------
  const totalFee = 0.0;
  const outstandingAmount = 0.0;
  const isSettled = true;

  // ----------------------------------------------------
  // Form State for Payment Details
  // ----------------------------------------------------
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [oneTimeSettlement, setOneTimeSettlement] = useState("0.00");
  const [paymentDate, setPaymentDate] = useState(getTodayIso);
  const [receiptNo, setReceiptNo] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("0.00");
  const [amountError, setAmountError] = useState("");

  // Payment Success Modal State
  const [successTransaction, setSuccessTransaction] = useState<PaymentHistoryItem | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Application Fee settlements from student history
  const appHistory = useMemo(() => {
    return (record.history || []).filter(
      (h) =>
        (h.status === "Successful" || h.status === "Settled") &&
        (h.feeCategory === "Application Fee" ||
          h.note?.toLowerCase().includes("application") ||
          h.note?.toLowerCase().includes("seat") ||
          h.itemName?.toLowerCase().includes("application")),
    );
  }, [record.history]);

  // Dynamic Remaining Balance calculation: Math.max(0, outstanding - paymentAmount)
  const parsedPaymentAmount = parseFloat(paymentAmount.replace(/,/g, "")) || 0;
  const remainingBalance = Math.max(0, outstandingAmount - parsedPaymentAmount);

  const fmt = (val: number) => {
    return val.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // ----------------------------------------------------
  // Action Handlers
  // ----------------------------------------------------

  // 1. Cancel Handler: clears inputs back to defaults
  const handleCancel = () => {
    setPaymentMethod("Cash");
    setOneTimeSettlement("0.00");
    setPaymentDate(getTodayIso());
    setReceiptNo("");
    setPaymentAmount("0.00");
    setAmountError("");

    toast.info("Application Fee Changes Cancelled", {
      description: "Payment details form has been restored to default values.",
    });
  };

  // 2. Reset Application Fee Handler
  const handleResetAppFee = () => {
    resetPaymentRecord(record.id);
    setPaymentMethod("Cash");
    setOneTimeSettlement("0.00");
    setPaymentDate(getTodayIso());
    setReceiptNo("");
    setPaymentAmount("0.00");
    setAmountError("");

    toast.warning("Application Fee Reset", {
      description: `Application fee status for ${record.student.name} has been reset.`,
    });

    onUpdate?.();
  };

  // 3. Settle Application Fee Handler
  const handleSettleAppFee = () => {
    const numAmount = parseFloat(paymentAmount.replace(/,/g, ""));
    if (isNaN(numAmount) || numAmount < 0) {
      setAmountError("Please enter a valid payment amount");
      toast.error("Invalid Amount", {
        description: "Please specify a valid payment amount.",
      });
      return;
    }
    setAmountError("");

    const res = settlePaymentRecord(record.id, {
      amount: numAmount,
      paymentMethod: paymentMethod as PaymentHistoryItem["paymentMethod"],
      receiptNo: receiptNo.trim() || undefined,
      feeCategory: "Application Fee",
      itemName: "Student Application Processing & Registration Fee",
      note: `Application fee payment (${paymentMethod}) recorded on ${paymentDate}`,
    });

    if (res.success && res.transaction) {
      // Open Payment Successful Confirmation Modal!
      setSuccessTransaction(res.transaction);
      setIsSuccessModalOpen(true);

      toast.success("Application Fee Settled", {
        description: `Receipt ${res.transaction.receiptNo} of SGD ${fmt(numAmount)} generated successfully!`,
      });
      setReceiptNo("");
      onUpdate?.();
    } else {
      toast.error("Settlement Failed", {
        description: "Could not record application payment settlement. Please try again.",
      });
    }
  };

  // 4. Quick Presets
  const handleApplyPresetAmount = (val: number, label: string) => {
    setPaymentAmount(val.toFixed(2));
    setAmountError("");
    toast.info(`Amount set to ${label}`, {
      description: `SGD ${fmt(val)} loaded into payment amount.`,
    });
  };

  // 5. One Time Settlement
  const handleApplyOneTimeSettlement = () => {
    setOneTimeSettlement(outstandingAmount.toFixed(2));
    setPaymentAmount(outstandingAmount.toFixed(2));
    toast.success("One-Time Settlement Loaded", {
      description: `Amount set to SGD ${fmt(outstandingAmount)}.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Student Identification Details Card */}
      <StudentDetailsCard record={record} />

      {/* 2. Two-Column Core Layout (Fee Summary | Payment Details) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Column 1: Fee Summary */}
        <AppFeeSummaryCard
          totalFee={totalFee}
          outstandingAmount={outstandingAmount}
          isSettled={isSettled}
          currency={record.currency || "SGD"}
        />

        {/* Column 2: Payment Details */}
        <AppPaymentDetailsCard
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          oneTimeSettlement={oneTimeSettlement}
          onOneTimeSettlementChange={setOneTimeSettlement}
          paymentDate={paymentDate}
          onPaymentDateChange={setPaymentDate}
          receiptNo={receiptNo}
          onReceiptNoChange={setReceiptNo}
          paymentAmount={paymentAmount}
          onPaymentAmountChange={(val) => {
            setPaymentAmount(val);
            if (amountError) setAmountError("");
          }}
          remainingBalance={remainingBalance}
          outstandingAmount={outstandingAmount}
          amountError={amountError}
          currency={record.currency || "SGD"}
          onApplyOneTimeSettlement={handleApplyOneTimeSettlement}
          onApplyPresetAmount={handleApplyPresetAmount}
          onCancel={handleCancel}
          onResetAppFee={handleResetAppFee}
          onSettleAppFee={handleSettleAppFee}
        />
      </div>

      {/* 3. Application Fee Settlement History Ledger */}
      <AppFeeSettlementLedger
        history={appHistory}
        studentName={record.student.name}
      />

      {/* 4. Payment Successful Confirmation Modal */}
      {isSuccessModalOpen && (
        <PaymentSuccessModal
          isOpen={isSuccessModalOpen}
          onClose={() => setIsSuccessModalOpen(false)}
          transaction={successTransaction}
          studentName={record.student.name}
          studentCode={record.student.studentCode}
          finNumber={record.student.finNumber}
        />
      )}
    </div>
  );
};

export default ApplicationFeesTab;
