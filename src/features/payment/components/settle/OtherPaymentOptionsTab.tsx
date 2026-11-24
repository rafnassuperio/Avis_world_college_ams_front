import { apiClient } from "@/services/api/apiClient";
import { apiMessage } from "@/services/ams";
import React, { useState, useMemo, useEffect } from "react";
import { StudentDetailsCard } from "./StudentDetailsCard";
import { OutstandingFeesCard, OutstandingFeeItem } from "./OutstandingFeesCard";
import { OtherPaymentDetailsCard } from "./OtherPaymentDetailsCard";
import { OtherPaymentSettlementLedger } from "./OtherPaymentSettlementLedger";
import { PaymentSuccessModal } from "./PaymentSuccessModal";
import { settlePaymentRecord } from "../../utils/paymentStorage";
import { PaymentRecord, PaymentHistoryItem } from "../../types";
import { toast } from "@/components/common/ToastMessage";

export interface OtherPaymentOptionsTabProps {
  record: PaymentRecord;
  onUpdate?: () => void;
}

export const OtherPaymentOptionsTab: React.FC<OtherPaymentOptionsTabProps> = ({ record, onUpdate }) => {
  // Helper for today's ISO date string (YYYY-MM-DD)
  const getTodayIso = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // ----------------------------------------------------
  // Initial Outstanding Fee Items
  // ----------------------------------------------------
  const [outstandingItems, setOutstandingItems] = useState<OutstandingFeeItem[]>((record.otherPayments || []).filter(f => f.status !== "paid").map(f => ({ id: f._id, name: f.name, amount: f.amount, dateAdded: "", feeNote: "" })));

  // Selected fee item IDs to pay now
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // Calculate sum of selected items
  const selectedTotalAmount = useMemo(() => {
    return outstandingItems.filter((item) => selectedItemIds.includes(item.id)).reduce((sum, item) => sum + item.amount, 0);
  }, [outstandingItems, selectedItemIds]);

  // ----------------------------------------------------
  // Form State for Payment Details
  // ----------------------------------------------------
  const [receiptNo, setReceiptNo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentDate, setPaymentDate] = useState(getTodayIso);
  const [totalAmountToPay, setTotalAmountToPay] = useState(selectedTotalAmount.toFixed(2));
  const [amountError, setAmountError] = useState("");

  // Payment Success Modal State
  const [successTransaction, setSuccessTransaction] = useState<PaymentHistoryItem | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Sync Total Amount to Pay when selected items change
  useEffect(() => {
    setTotalAmountToPay(selectedTotalAmount.toFixed(2));
    if (amountError) setAmountError("");
  }, [selectedTotalAmount]);

  // Historical settled ancillary payments
  const otherHistory = useMemo(() => {
    return (record.history || []).filter(
      (h) =>
        (h.status === "Successful" || h.status === "Settled") &&
        (h.feeCategory === "Other Payment" ||
          h.feeCategory === "Ancillary Fee" ||
          (!h.note?.toLowerCase().includes("course") &&
            !h.note?.toLowerCase().includes("tuition") &&
            !h.note?.toLowerCase().includes("application") &&
            h.feeCategory !== "Course Fee" &&
            h.feeCategory !== "Application Fee")),
    );
  }, [record.history]);

  const fmt = (val: number) => {
    return val.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // ----------------------------------------------------
  // Outstanding Fee Handlers
  // ----------------------------------------------------
  const handleToggleSelectItem = (id: string) => {
    setSelectedItemIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleSelectAll = () => {
    setSelectedItemIds(outstandingItems.map((item) => item.id));
  };

  const handleClearSelection = () => {
    setSelectedItemIds([]);
  };

  const handleAddNewFee = async (name: string, amount: number, _note?: string) => {
    try {
      await apiClient.post("/api/admin/add-payment-option", { studentId: record.student.id, paymentId: record.id, OtherPaymentOption: [{ value: name, fee: amount }] });
      onUpdate?.(); toast.success("Fee added.");
    } catch (error) { toast.error("Unable to add fee", { description: apiMessage(error) }); return false; }
  };
  const handleRemoveFee = async (id: string) => {
    try { await apiClient.delete(`/api/admin/payments/${record.id}/other-payments/${id}`); setOutstandingItems(items => items.filter(i => i.id !== id)); setSelectedItemIds(ids => ids.filter(value => value !== id)); onUpdate?.(); }
    catch (error) { toast.error("Unable to remove fee", { description: apiMessage(error) }); }
  };

  // ----------------------------------------------------
  // Payment Details Handlers
  // ----------------------------------------------------
  const handleCancel = () => {
    setReceiptNo("");
    setPaymentMethod("Cash");
    setPaymentDate(getTodayIso());
    setSelectedItemIds([]);
    setAmountError("");
    toast.info("Payment Form Reset", {
      description: "Payment details have been restored to initial selections.",
    });
  };

  const handleProcessPayment = async () => {
    const numAmount = parseFloat(totalAmountToPay.replace(/,/g, ""));
    if (isNaN(numAmount) || numAmount <= 0) {
      setAmountError("Please select at least one fee or enter a valid amount greater than SGD 0");
      toast.error("Invalid Amount", {
        description: "Please specify a valid payment amount.",
      });
      return;
    }
    if (!selectedItemIds.length || Math.abs(numAmount - selectedTotalAmount) > 0.005) { setAmountError("Pay the full amount of the selected fees. Partial ancillary payments are not supported by this workflow."); return; }
    setAmountError("");

    // Identify selected items names for transaction note
    const selectedItems = outstandingItems.filter((i) => selectedItemIds.includes(i.id));
    const itemsSummary = selectedItems.length > 0 ? selectedItems.map((i) => i.name).join(", ") : "Ancillary Fee Settlement";

    const res = await settlePaymentRecord(record.id, {
      amount: numAmount,
      paymentMethod: paymentMethod as PaymentHistoryItem["paymentMethod"],
      receiptNo: receiptNo.trim() || undefined,
      feeCategory: "Other Payment",
      otherPaymentIds: selectedItemIds,
      itemName: itemsSummary.length > 60 ? `${itemsSummary.slice(0, 57)}...` : itemsSummary,
      note: `Ancillary fees settled (${paymentMethod}) on ${paymentDate}: ${itemsSummary}`,
      paymentDate,
    });

    if (res.success && res.transaction) {
      // Remove paid items from outstanding items
      setOutstandingItems((prev) => prev.filter((item) => !selectedItemIds.includes(item.id)));
      setSelectedItemIds([]);
      setReceiptNo("");

      // Open Payment Successful Confirmation Modal!
      setSuccessTransaction(res.transaction);
      setIsSuccessModalOpen(true);

      toast.success("Payment Processed Successfully", {
        description: `Receipt ${res.transaction.receiptNo} of SGD ${fmt(numAmount)} generated!`,
      });

      onUpdate?.();
    } else {
      toast.error("Payment Failed", {
        description: "Could not process fee settlement. Please try again.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Student Identification Details Card */}
      <StudentDetailsCard record={record} />

      {/* 2. Two-Column Core Layout (Outstanding Fees | Payment Details) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Column 1: Outstanding Fees Card */}
        <OutstandingFeesCard
          items={outstandingItems}
          selectedItemIds={selectedItemIds}
          onToggleSelectItem={handleToggleSelectItem}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
          onAddNewFee={handleAddNewFee}
          onRemoveFee={handleRemoveFee}
          currency={record.currency || "SGD"}
        />

        {/* Column 2: Payment Details Card */}
        <OtherPaymentDetailsCard
          receiptNo={receiptNo}
          onReceiptNoChange={setReceiptNo}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          paymentDate={paymentDate}
          onPaymentDateChange={setPaymentDate}
          totalAmountToPay={totalAmountToPay}
          onTotalAmountToPayChange={setTotalAmountToPay}
          amountError={amountError}
          currency={record.currency || "SGD"}
          selectedCount={selectedItemIds.length}
          onCancel={handleCancel}
          onProcessPayment={handleProcessPayment}
        />
      </div>

      {/* 3. Historical Ancillary Payments Settlement Ledger */}
      <OtherPaymentSettlementLedger
        history={otherHistory}
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

export default OtherPaymentOptionsTab;
