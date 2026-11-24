import { apiClient as api } from "./api/apiClient";
import { rowsOf, idOf, type Row } from "./ams";
import type { PaymentHistoryItem, PaymentRecord } from "@/features/payment/types";
import { toast } from "@/components/common/ToastMessage";
import { apiMessage } from "./ams";
const paymentWrites = new Set<string>();
export function beginPaymentWrite(id: string): boolean {
  if (paymentWrites.has(id)) return false;
  paymentWrites.add(id); return true;
}
export function endPaymentWrite(id: string) { paymentWrites.delete(id); }

export function mapTransaction(r: Row): PaymentHistoryItem {
  return { id: idOf(r), transactionRef: r.transactionId || "", receiptNo: r.receiptNo || "", date: r.date || "", time: "",
    amount: Number(r.amountPaid ?? r.paidAmount ?? 0), currency: r.currency || "", paymentMethod: r.paymentMethod || "",
    status: r.status === "pending" ? "Pending" : "Settled",
    repCommission: Number(r.splittedCommissionRep || 0), agentCommission: Number(r.splittedCommissionAgent || 0),
    feeCategory: r.feeType === "application" ? "Application Fee" : r.feeType === "other" ? "Other Payment" : "Course Fee", itemName: r.paymentName || "" };
}
export function mapPayment(r: Row, history: Row[] = []): PaymentRecord {
  return { agentId: idOf(r.agentId), repId: idOf(r.repId), adminCommission: Number(r.adminCommission || 0), id: idOf(r), no: r.transactionId || "", date: r.date || "", collegeName: r.collegeName || "",
    student: { id: idOf(r.studentId), name: r.studentName || "", studentCode: r.studentCode || "", email: r.email || "",
      course: r.courseName || "", courseCode: r.courseCode || "", finNumber: r.finNumber || "", nationality: r.country || "" },
    totalFee: Number(r.totalFees || 0), amountToCollege: Number(r.college || 0), repCommission: Number(r.repCommission || 0), agentCommission: Number(r.agentCommission || 0),
    currency: r.currency || "", status: r.status === "paid" ? "Paid" : "Pending", cardStatus: r.status === "paid" ? "Settled" : "Pending",
    history: history.filter(h => idOf(h.paymentId) === idOf(r)).map(mapTransaction),
    outstandingAmount: Number(r.outstandingAmount ?? r.totalFees ?? 0), applicationFees: Number(r.applicationFees || 0),
    feeBreakdown: r.feeBreakdown || {}, otherPayments: r.otherPayments || [], installmentTracking: r.installmentTracking || [],
  };
}
export async function getPayments(): Promise<PaymentRecord[]> {
  const history = rowsOf(await api.get("/api/admin/payments/payment-history"));
  const result: Row[] = [];
  let page = 1, pages = 1;
  do {
    const response = await api.get<Row>("/api/admin/payments/get-all-payments", { params: { page, limit: 100 } });
    result.push(...rowsOf(response)); pages = response.pagination?.totalPages || 1; page++;
  } while (page <= pages);
  return result.map(r => mapPayment(r, history));
}
export interface PaymentPageQuery {
  page: number; limit: number; search?: string; status?: string; courseName?: string;
  minAmount?: string; maxAmount?: string; sortBy?: string; sortOrder?: string;
}
export async function getPaymentPage(query: PaymentPageQuery, signal?: AbortSignal, cacheTimeMs = 10000) {
  const response = await api.get<Row>("/api/admin/payments/get-all-payments", { params: { ...query }, signal, deduplicate: true, cacheTimeMs });
  return { records: rowsOf(response).map(r => mapPayment(r)), total: Number(response.pagination?.totalRecords || 0) };
}
export async function getPaymentCourses(signal?: AbortSignal): Promise<string[]> {
  return api.get<string[]>("/api/admin/payments/table-options", {signal, deduplicate: true});
}
export interface TransactionQuery { page: number; limit: number; search?: string; method?: string; status?: string }
export interface PaymentTransaction extends PaymentHistoryItem {
  paymentId: string; studentId: string; studentName: string; studentCode: string; studentEmail: string;
  collegeName: string; course: string; rowNumber: number; repCommission: number; agentCommission: number;
}
export async function getTransactionPage(query: TransactionQuery, signal?: AbortSignal) {
  const response = await api.get<Row>("/api/admin/payments/transactions", { params: { ...query }, signal, deduplicate: true });
  const records: PaymentTransaction[] = rowsOf(response).map((r, index) => {
    const timestamp = new Date(r.paymentDate || r.date);
    return { ...mapTransaction(r), status: r.transactionStatus || "Pending", paymentId: idOf(r.paymentId), studentId: idOf(r.studentId),
      studentName: r.studentName || "", studentCode: r.studentCode || "", studentEmail: r.studentEmail || "", collegeName: r.collegeName || "", course: r.courseName || "",
      rowNumber: (query.page - 1) * query.limit + index + 1, repCommission: Number(r.splittedCommissionRep || 0), agentCommission: Number(r.splittedCommissionAgent || 0),
      date: Number.isNaN(timestamp.getTime()) ? "" : timestamp.toLocaleDateString("en-GB"), time: Number.isNaN(timestamp.getTime()) ? "" : timestamp.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    };
  });
  return { records, total: Number(response.pagination?.totalRecords || 0) };
}
export const getTransactionMethods = (signal?: AbortSignal) => api.get<string[]>("/api/admin/payments/transactions/options", {signal, deduplicate: true});
export async function getPaymentLedger(record: PaymentRecord): Promise<PaymentRecord> {
  const history = rowsOf(await api.get("/api/admin/payments/payment-history", { params: { paymentId: record.id } }));
  return { ...record, history: history.map(mapTransaction) };
}
export async function exportPayments(query: PaymentPageQuery) {
  const records: PaymentRecord[] = [];
  for (let page = 1; ; page++) {
    const result = await getPaymentPage({ ...query, page, limit: 100 }, undefined, 0);
    records.push(...result.records);
    if (records.length >= result.total || !result.records.length) break;
  }
  const cell = (value: unknown) => '"' + String(value ?? "").replace(/^[=+@-]/, "'$&").replace(/"/g, '""') + '"';
  const csv = [["Date", "Student", "Course", "Total fee", "Currency", "Status"], ...records.map(r => [r.date, r.student.name, r.student.course, r.totalFee, r.currency, r.status])]
    .map(row => row.map(cell).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a"); link.href = url; link.download = "AMS-payments.csv"; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return records.length;
}
export async function getPayment(id: string): Promise<PaymentRecord> {
  const [row, history] = await Promise.all([
    api.get<Row>(`/api/admin/payments/get-single-payment/${encodeURIComponent(id)}`),
    api.get<Row[]>("/api/admin/payments/payment-history", { params: { paymentId: id } }),
  ]);
  return mapPayment(row, history);
}
export async function resetPayment(id: string): Promise<void> {
  if (!beginPaymentWrite(id)) throw new Error("A payment operation is already in progress. Please wait.");
  try {
    await api.put(`/api/admin/payments/reset-payment/${encodeURIComponent(id)}`);
    window.dispatchEvent(new Event("ams_payment_records_updated"));
  } finally { endPaymentWrite(id); }
}

export async function downloadPaymentReceipt(logId: string) {
  try {
    const blob = await api.get<Blob>(`/api/admin/payments/receipts/${encodeURIComponent(logId)}/pdf`, { responseType: "blob" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = `Receipt-${logId}.pdf`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) { toast.error("Unable to download receipt", { description: apiMessage(error) }); }
}

export function downloadPaymentStatement(record: PaymentRecord) {
  const cell = (v: unknown) => '"' + String(v ?? "").replace(/^[=+@-]/, "'$&").replace(/"/g, '""') + '"';
  const csv = [["Receipt", "Date", "Student", "Fee type", "Amount", "Currency", "Payment method"],
    ...record.history.map(h => [h.receiptNo, h.date, record.student.name, h.feeCategory, h.amount, h.currency, h.paymentMethod])].map(row => row.map(cell).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a"); link.href = url; link.download = `Statement-${record.id}.csv`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
