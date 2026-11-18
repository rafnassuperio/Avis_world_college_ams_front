import { safeStorage } from "@/lib/security";
import { initialPaymentRecords } from "../data/mockPaymentData";
import { PaymentRecord, PaymentHistoryItem } from "../types";

export const PAYMENT_STORAGE_KEY = "ams_payment_records";

/**
 * Retrieve current payment records from local storage with fallback to mock data
 */
export const getPaymentRecords = (): PaymentRecord[] => {
  const loaded = safeStorage.getItem<PaymentRecord[]>(PAYMENT_STORAGE_KEY, initialPaymentRecords);
  return loaded.map((rec) => {
    if (rec.id === "PAY-001" && (rec.student.name === "Emma Watson" || !rec.student.finNumber)) {
      return {
        ...rec,
        student: {
          ...rec.student,
          name: "Vishnu Krishnakumar",
          studentCode: "VK-1021",
          email: "vishnu.k@avisworld.edu",
          course: "Diploma In Business (information Technology)",
          courseCode: "DBIT-26",
          finNumber: "M0292335U22",
          nationality: "Indian",
          tenureDate: "12 Dec 2025",
        },
      };
    }
    return rec;
  });
};

/**
 * Persist payment records to local storage and notify listeners
 */
export const savePaymentRecords = (records: PaymentRecord[]): void => {
  safeStorage.setItem(PAYMENT_STORAGE_KEY, records);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("ams_payment_records_updated", { detail: records }));
  }
};

/**
 * Find a payment record by either Payment ID (e.g. PAY-001), Student Code (e.g. EW-1021), or Student ID (e.g. STU-1021)
 */
export const getPaymentRecordById = (idOrCode?: string): PaymentRecord | undefined => {
  if (!idOrCode) return undefined;
  const records = getPaymentRecords();
  const search = idOrCode.trim().toLowerCase();

  return records.find(
    (r) =>
      r.id.toLowerCase() === search ||
      r.student.studentCode.toLowerCase() === search ||
      r.student.id.toLowerCase() === search,
  );
};

export interface SettlePaymentPayload {
  amount: number;
  paymentMethod: PaymentHistoryItem["paymentMethod"];
  cardType?: PaymentHistoryItem["cardType"];
  cardNumberMasked?: string;
  note?: string;
  collectedBy?: string;
  repCommission?: number;
  agentCommission?: number;
  receiptNo?: string;
  transactionRef?: string;
  feeCategory?: "Course Fee" | "Application Fee" | "Other Payment" | string;
  itemName?: string;
}

/**
 * Record a payment settlement on a given record
 */
export const settlePaymentRecord = (
  paymentId: string,
  payload: SettlePaymentPayload,
): { success: boolean; record?: PaymentRecord; transaction?: PaymentHistoryItem } => {
  const records = getPaymentRecords();
  const index = records.findIndex(
    (r) =>
      r.id.toLowerCase() === paymentId.toLowerCase() ||
      r.student.studentCode.toLowerCase() === paymentId.toLowerCase() ||
      r.student.id.toLowerCase() === paymentId.toLowerCase(),
  );

  if (index === -1) {
    return { success: false };
  }

  const target = records[index];
  const now = new Date();
  const dateFormatted = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const timeFormatted = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  const randomRefNum = Math.floor(100 + Math.random() * 900);
  const randomRecNum = Math.floor(7000 + Math.random() * 2000);
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");

  const newTx: PaymentHistoryItem = {
    id: `TXN-${Date.now().toString().slice(-6)}`,
    transactionRef: payload.transactionRef || `TXN-${dateStr}-${randomRefNum}`,
    receiptNo: payload.receiptNo || `REC-${randomRecNum}`,
    date: dateFormatted,
    time: timeFormatted,
    amount: payload.amount,
    currency: target.currency,
    paymentMethod: payload.paymentMethod,
    cardType: payload.cardType,
    cardNumberMasked: payload.cardNumberMasked,
    status: "Successful",
    collectedBy: payload.collectedBy || "Finance Office (Central)",
    note: payload.note || "Fee payment settlement processed",
    repCommission: payload.repCommission ?? target.repCommission,
    agentCommission: payload.agentCommission ?? target.agentCommission,
    feeCategory: payload.feeCategory || "Course Fee",
    itemName: payload.itemName,
  };

  const updatedHistory = [newTx, ...target.history];
  const totalCoursePaid = updatedHistory
    .filter((h) => (h.status === "Successful" || h.status === "Settled") && (h.feeCategory === "Course Fee" || !h.feeCategory || !h.feeCategory.includes("Application")))
    .reduce((sum, h) => sum + h.amount, 0);

  const isFullySettled = totalCoursePaid >= target.totalFee;

  const updatedRecord: PaymentRecord = {
    ...target,
    status: isFullySettled ? "Paid" : "Pending",
    cardStatus: "Settled",
    repCommission: payload.repCommission ?? target.repCommission,
    agentCommission: payload.agentCommission ?? target.agentCommission,
    history: updatedHistory,
  };

  records[index] = updatedRecord;
  savePaymentRecords(records);

  return { success: true, record: updatedRecord, transaction: newTx };
};

/**
 * Reset a payment record back to Pending
 */
export const resetPaymentRecord = (paymentId: string): PaymentRecord | undefined => {
  const records = getPaymentRecords();
  const index = records.findIndex(
    (r) =>
      r.id.toLowerCase() === paymentId.toLowerCase() ||
      r.student.studentCode.toLowerCase() === paymentId.toLowerCase() ||
      r.student.id.toLowerCase() === paymentId.toLowerCase(),
  );

  if (index === -1) return undefined;

  const updatedRecord: PaymentRecord = {
    ...records[index],
    status: "Pending",
    cardStatus: "Pending",
  };

  records[index] = updatedRecord;
  savePaymentRecords(records);
  return updatedRecord;
};

