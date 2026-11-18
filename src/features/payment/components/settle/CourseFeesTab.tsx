import React, { useState, useMemo } from "react";
import { StudentDetailsCard } from "./StudentDetailsCard";
import { FeeSummaryCard } from "./FeeSummaryCard";
import { CommissionFeeSummaryCard } from "./CommissionFeeSummaryCard";
import { PaymentDetailsCard } from "./PaymentDetailsCard";
import { ChangeSplitModal } from "./ChangeSplitModal";
import { CourseFeeSettlementLedger } from "./CourseFeeSettlementLedger";
import { PaymentSuccessModal } from "./PaymentSuccessModal";
import { settlePaymentRecord, resetPaymentRecord } from "../../utils/paymentStorage";
import { PaymentRecord, PaymentHistoryItem } from "../../types";
import { toast } from "@/components/common/ToastMessage";

export interface CourseFeesTabProps {
  record: PaymentRecord;
  onUpdate?: () => void;
}

export const CourseFeesTab: React.FC<CourseFeesTabProps> = ({ record, onUpdate }) => {
  // Helper for today's ISO date string (YYYY-MM-DD)
  const getTodayIso = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // ----------------------------------------------------
  // Fee Breakdown Constants (Requested DHM Structure)
  // ----------------------------------------------------
  const tuitionFee = 2000.0;
  const feeProtection = 150.0;
  const amountExclGst = 2150.0; // 2000 + 150
  const gstRatePercent = 9;
  const gstAmount = 193.5; // 9% of 2150
  const totalCourseFee = 2343.5; // 2150 + 193.5
  const totalAmountAfterComm = 681.5;
  const totalFeeRequested = 2561.5; // 2343.5 + 218 (Admin/App fee incl. GST)
  const adminAppFee = 218.0;

  // ----------------------------------------------------
  // Form State for Payment Details
  // ----------------------------------------------------
  const [receiptNo, setReceiptNo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentDate, setPaymentDate] = useState(getTodayIso);
  const [oneTimeSettlement, setOneTimeSettlement] = useState("0.00");
  const [paymentAmount, setPaymentAmount] = useState(totalCourseFee.toFixed(2));
  const [agentComm, setAgentComm] = useState("0.00");
  const [repComm, setRepComm] = useState("0.00");
  const [amountError, setAmountError] = useState("");

  // Payment Success Modal State
  const [successTransaction, setSuccessTransaction] = useState<PaymentHistoryItem | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // ----------------------------------------------------
  // Commission Split State (Requested: Agent SGD 940, Rep SGD 940, Total SGD 1,880)
  // ----------------------------------------------------
  const [agentShare, setAgentShare] = useState<number>(940.0);
  const [repShare, setRepShare] = useState<number>(940.0);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);

  // Course Fee settlements from student history
  const courseHistory = useMemo(() => {
    return (record.history || []).filter(
      (h) =>
        (h.status === "Successful" || h.status === "Settled") &&
        (!h.feeCategory ||
          h.feeCategory === "Course Fee" ||
          (!h.note?.toLowerCase().includes("application") && !h.note?.toLowerCase().includes("seat"))),
    );
  }, [record.history]);

  const totalCoursePaid = useMemo(() => {
    return courseHistory.reduce((sum, h) => sum + h.amount, 0);
  }, [courseHistory]);

  const currentOutstandingCourseFee = Math.max(0, totalCourseFee - totalCoursePaid);
  const isSettled = currentOutstandingCourseFee === 0 && courseHistory.length > 0;

  const fmt = (val: number) => {
    return val.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // ----------------------------------------------------
  // Action Handlers
  // ----------------------------------------------------

  // 1. Cancel Form
  const handleCancel = () => {
    setReceiptNo("");
    setPaymentMethod("Cash");
    setPaymentDate(getTodayIso());
    setOneTimeSettlement("0.00");
    setPaymentAmount(totalCourseFee.toFixed(2));
    setAgentComm("0.00");
    setRepComm("0.00");
    setAmountError("");
    toast.info("Payment Changes Cancelled", {
      description: "Payment details form has been restored to default values.",
    });
  };

  // 2. Reset Course Fee
  const handleResetCourseFee = () => {
    resetPaymentRecord(record.id);
    setReceiptNo("");
    setPaymentMethod("Cash");
    setPaymentDate(getTodayIso());
    setOneTimeSettlement("0.00");
    setPaymentAmount(totalCourseFee.toFixed(2));
    setAgentComm("0.00");
    setRepComm("0.00");
    setAmountError("");
    setAgentShare(940.0);
    setRepShare(940.0);

    toast.warning("Course Fee Reset", {
      description: `Course fee for ${record.student.name} has been reset to Pending status.`,
    });

    onUpdate?.();
  };

  // 3. Settle Course Fee
  const handleSettleCourseFee = () => {
    const numAmount = parseFloat(paymentAmount.replace(/,/g, ""));
    if (isNaN(numAmount) || numAmount <= 0) {
      setAmountError("Please enter a valid payment amount greater than SGD 0");
      toast.error("Invalid Amount", {
        description: "Please specify a valid payment amount.",
      });
      return;
    }
    setAmountError("");

    const parsedAgentComm = parseFloat(agentComm.replace(/,/g, "")) || 0;
    const parsedRepComm = parseFloat(repComm.replace(/,/g, "")) || 0;

    const res = settlePaymentRecord(record.id, {
      amount: numAmount,
      paymentMethod: paymentMethod as PaymentHistoryItem["paymentMethod"],
      receiptNo: receiptNo.trim() || undefined,
      feeCategory: "Course Fee",
      itemName: "Diploma in Hospitality Management (DHM) Course Fee",
      note: `Course fee settlement (${paymentMethod}) on ${paymentDate}`,
      agentCommission: parsedAgentComm,
      repCommission: parsedRepComm,
    });

    if (res.success && res.transaction) {
      // Trigger Payment Successful Modal!
      setSuccessTransaction(res.transaction);
      setIsSuccessModalOpen(true);

      toast.success("Course Fee Settled", {
        description: `Receipt ${res.transaction.receiptNo} of SGD ${fmt(numAmount)} generated successfully!`,
      });
      setReceiptNo("");
      onUpdate?.();
    } else {
      toast.error("Settlement Failed", {
        description: "Could not record payment settlement. Please try again.",
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

  // 5. One Time Settlement Full Apply
  const handleApplyOneTimeSettlement = () => {
    setOneTimeSettlement(totalCourseFee.toFixed(2));
    setPaymentAmount(totalCourseFee.toFixed(2));
    toast.success("One-Time Full Settlement Applied", {
      description: `Settlement set to SGD ${fmt(totalCourseFee)}.`,
    });
  };

  // 6. Commission Split Save from Modal
  const handleApplySplit = (newAgentShare: number, newRepShare: number, syncWithPaymentDetails: boolean) => {
    setAgentShare(newAgentShare);
    setRepShare(newRepShare);

    if (syncWithPaymentDetails) {
      setAgentComm(newAgentShare.toFixed(2));
      setRepComm(newRepShare.toFixed(2));
    }

    toast.success("Commission Split Updated", {
      description: `Agent: SGD ${fmt(newAgentShare)} • Rep: SGD ${fmt(newRepShare)} (Total: SGD ${fmt(newAgentShare + newRepShare)})`,
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Student Details Identification Card */}
      <StudentDetailsCard record={record} />

      {/* 2. Three Column Responsive Core Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Column 1: Fee Summary Card */}
        <FeeSummaryCard
          totalFee={totalFeeRequested}
          outstandingAmount={isSettled ? 0 : totalFeeRequested}
          isSettled={isSettled}
          courseCode="DHM"
          courseName="Diploma in Hospitality Mgt."
          tuitionFee={tuitionFee}
          feeProtection={feeProtection}
          amountExclGst={amountExclGst}
          gstAmount={gstAmount}
          gstRatePercent={gstRatePercent}
          totalCourseFee={totalCourseFee}
          totalAmountAfterComm={totalAmountAfterComm}
          adminAppFee={adminAppFee}
        />

        {/* Column 2: Commission Fee Summary Card */}
        <CommissionFeeSummaryCard
          agentShare={agentShare}
          repShare={repShare}
          totalCourseFee={totalCourseFee}
          totalAmountAfterComm={totalAmountAfterComm}
          tierLabel="Tier 1"
          onOpenChangeSplitModal={() => setIsSplitModalOpen(true)}
        />

        {/* Column 3: Payment Details Card */}
        <PaymentDetailsCard
          receiptNo={receiptNo}
          onReceiptNoChange={setReceiptNo}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          paymentDate={paymentDate}
          onPaymentDateChange={setPaymentDate}
          oneTimeSettlement={oneTimeSettlement}
          onOneTimeSettlementChange={setOneTimeSettlement}
          paymentAmount={paymentAmount}
          onPaymentAmountChange={(val) => {
            setPaymentAmount(val);
            if (amountError) setAmountError("");
          }}
          amountError={amountError}
          agentComm={agentComm}
          onAgentCommChange={setAgentComm}
          repComm={repComm}
          onRepCommChange={setRepComm}
          totalCourseFee={totalCourseFee}
          totalAmountAfterComm={totalAmountAfterComm}
          totalFeeRequested={totalFeeRequested}
          onApplyOneTimeSettlement={handleApplyOneTimeSettlement}
          onApplyPresetAmount={handleApplyPresetAmount}
          onCancel={handleCancel}
          onResetCourseFee={handleResetCourseFee}
          onSettleCourseFee={handleSettleCourseFee}
        />
      </div>

      {/* 3. Course Fee Settlement History Ledger */}
      <CourseFeeSettlementLedger
        history={courseHistory}
        studentName={record.student.name}
      />

      {/* 4. Interactive Change Split Modal */}
      <ChangeSplitModal
        isOpen={isSplitModalOpen}
        onClose={() => setIsSplitModalOpen(false)}
        initialAgentShare={agentShare}
        initialRepShare={repShare}
        onApplySplit={handleApplySplit}
      />

      {/* 5. Payment Successful Confirmation Modal */}
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

export default CourseFeesTab;
