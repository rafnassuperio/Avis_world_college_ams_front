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
  const [outstandingItems, setOutstandingItems] = useState<OutstandingFeeItem[]>([
    {
      id: "FEE-01",
      name: "Airport Pickup",
      amount: 218.0,
      dateAdded: "12 Oct 2026",
      feeNote: "Standard Airport Pickup Service",
    },
    {
      id: "FEE-02",
      name: "Kitchen Tool Kit",
      amount: 54.5,
      dateAdded: "14 Oct 2026",
      feeNote: "Culinary practical tool set",
    },
    {
      id: "FEE-03",
      name: "Admin Fee for Student Pass Renewal",
      amount: 109.0,
      dateAdded: "15 Oct 2026",
      feeNote: "Annual renewal processing",
    },
  ]);

  // Selected fee item IDs to pay now
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>(["FEE-01", "FEE-02"]);

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

  const handleAddNewFee = (name: string, amount: number, note?: string) => {
    const newItem: OutstandingFeeItem = {
      id: `FEE-${Date.now().toString().slice(-4)}`,
      name,
      amount,
      dateAdded: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      feeNote: note,
    };
    setOutstandingItems((prev) => [newItem, ...prev]);
    setSelectedItemIds((prev) => [...prev, newItem.id]);
    toast.success("Fee Added", {
      description: `${name} (SGD ${fmt(amount)}) added to outstanding fees.`,
    });
  };

  const handleRemoveFee = (id: string) => {
    const target = outstandingItems.find((item) => item.id === id);
    setOutstandingItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedItemIds((prev) => prev.filter((itemId) => itemId !== id));
    toast.info("Fee Removed", {
      description: target ? `${target.name} removed from outstanding fees.` : "Fee removed.",
    });
  };

  // ----------------------------------------------------
  // Payment Details Handlers
  // ----------------------------------------------------
  const handleCancel = () => {
    setReceiptNo("");
    setPaymentMethod("Cash");
    setPaymentDate(getTodayIso());
    setSelectedItemIds(["FEE-01", "FEE-02"]);
    setAmountError("");
    toast.info("Payment Form Reset", {
      description: "Payment details have been restored to initial selections.",
    });
  };

  const handleProcessPayment = () => {
    const numAmount = parseFloat(totalAmountToPay.replace(/,/g, ""));
    if (isNaN(numAmount) || numAmount <= 0) {
      setAmountError("Please select at least one fee or enter a valid amount greater than SGD 0");
      toast.error("Invalid Amount", {
        description: "Please specify a valid payment amount.",
      });
      return;
    }
    setAmountError("");

    // Identify selected items names for transaction note
    const selectedItems = outstandingItems.filter((i) => selectedItemIds.includes(i.id));
    const itemsSummary = selectedItems.length > 0 ? selectedItems.map((i) => i.name).join(", ") : "Ancillary Fee Settlement";

    const res = settlePaymentRecord(record.id, {
      amount: numAmount,
      paymentMethod: paymentMethod as PaymentHistoryItem["paymentMethod"],
      receiptNo: receiptNo.trim() || undefined,
      feeCategory: "Other Payment",
      itemName: itemsSummary.length > 60 ? `${itemsSummary.slice(0, 57)}...` : itemsSummary,
      note: `Ancillary fees settled (${paymentMethod}) on ${paymentDate}: ${itemsSummary}`,
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
