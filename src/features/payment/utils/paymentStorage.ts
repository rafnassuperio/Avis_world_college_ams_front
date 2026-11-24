import { apiClient } from "@/services/api/apiClient";
import { apiMessage } from "@/services/ams";
import { getPayment, resetPayment, beginPaymentWrite, endPaymentWrite } from "@/services/payments";
import { toast } from "@/components/common/ToastMessage";
import { PaymentHistoryItem, PaymentRecord } from "../types";

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
  feeCategory?: string;
  itemName?: string;
  paymentDate?: string;
  otherPaymentIds?: string[];
}
export async function settlePaymentRecord(paymentId: string, payload: SettlePaymentPayload): Promise<{ success: boolean; record?: PaymentRecord; transaction?: PaymentHistoryItem }> {
  if (!beginPaymentWrite(paymentId)) {
    toast.info("A payment operation is already in progress. Please wait.");
    return { success: false };
  }
  try {
    if (!Number.isFinite(payload.amount) || payload.amount <= 0) throw new Error("Enter a payment amount greater than zero.");
    const feeType = payload.feeCategory === "Application Fee" ? "application" : payload.feeCategory === "Other Payment" ? "other" : "course";
    await apiClient.patch("/api/admin/payments/settle-payments", {
      _id: paymentId, paidAmount: payload.amount, paymentMethod: payload.paymentMethod,
      paymentDate: payload.paymentDate || new Date().toISOString().slice(0, 10),
      applicationPaymentDate: payload.paymentDate, feeType,
      applicationFees: feeType === "application" ? payload.amount : undefined,
      receiptNo: payload.receiptNo, paymentName: payload.itemName,
      otherPaymentOptions: payload.otherPaymentIds?.map(id => ({ id })),
    });
    window.dispatchEvent(new Event("ams_payment_records_updated"));
    // Receipt and transaction identifiers come from persisted server records.
    try {
      const record = await getPayment(paymentId);
      const transaction = record.history.find(h => h.feeCategory === payload.feeCategory && (!payload.receiptNo || h.receiptNo === payload.receiptNo));
      return { success: true, record, transaction };
    } catch {
      toast.info("Payment saved", { description: "The server accepted the payment. Refresh the ledger to retrieve its receipt." });
      return { success: true };
    }
  } catch (error) {
    toast.error("Settlement failed", { description: apiMessage(error) });
    return { success: false };
  } finally { endPaymentWrite(paymentId); }
}
export async function resetPaymentRecord(paymentId: string): Promise<boolean> {
  try { await resetPayment(paymentId); return true; }
  catch (error) { toast.error("Unable to reset payment", { description: apiMessage(error) }); return false; }
}
