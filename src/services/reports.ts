import { useApiQuery } from "@/hooks/useApiQuery";
import { apiClient } from "./api/apiClient";
import type { Row } from "./ams";
import type { AgentRepReportRecord, CpCaseReportRecord, PaymentReportRecord } from "@/features/paymentReport/types";
import type { StudentApplicationItem } from "@/features/partners/types";
export interface CpMetrics {totalCases: number; uniqueStudents: number; notDue: number; cpDue: number; cpSettled: number; totalShortfall: number; totalCpPayable: number; topUpsCollected: number; remainingCp: number}
export async function getCpReport(params: Record<string, string | number | undefined>, signal?: AbortSignal, cacheTimeMs = 10000) {
  const response = await apiClient.get<Row>("/api/admin/payments/reports/cp-cases", {params, deduplicate: true, signal, cacheTimeMs});
  const rows: CpCaseReportRecord[] = (response.cases || []).map((r: Row) => ({
    id: String(r.paymentId) + "-" + r.installmentNo, caseNumber: "", filingDate: r.cpDetectedAt || "", studentId: r.studentId || "", studentName: r.studentName || "",
    course: r.courseName || "", corporatePartner: r.agentName || "", category: "Corporate Sponsorship", caseValue: r.cpPayable || 0, settledValue: r.topUpTotal || 0,
    priority: "Medium", status: r.cpStatus === "CP Settled" ? "Settled" : "Under Review", caseOfficer: "", remarks: "",
    shortfall: r.shortfall, cpPayable: r.cpPayable, topUpCollected: r.topUpTotal, remainingCp: r.remainingShortfall,
    cpStatus: r.cpStatus === "Due" ? "CP Due" : r.cpStatus, dueStatus: r.cpStatus === "Due" ? "CP Due" : r.cpStatus,
    channelPartner: r.agentName, installment: r.installmentNo, installmentAmount: r.installmentAmount, dueDate: r.dueDate, detectedDate: r.cpDetectedAt,
  }));
  const stats = response.stats || {};
  const metrics: CpMetrics = {totalCases: stats.totalCPCases || 0, uniqueStudents: stats.uniqueStudents || 0, notDue: stats.notDue || 0, cpDue: stats.due || 0, cpSettled: stats.settled || 0,
    totalShortfall: stats.totalShortfall || 0, totalCpPayable: stats.totalCPPayable || 0, topUpsCollected: stats.totalTopUpCollected || 0, remainingCp: stats.totalRemainingShortfall || 0};
  return {rows, metrics, total: Number(response.pagination?.totalRecords || 0), totalPages: Number(response.pagination?.totalPages || 1)};
}
export const useCpOptions = () => useApiQuery(signal => apiClient.get<{partners: string[]}>("/api/admin/payments/reports/cp-cases", {params: {optionsOnly: "true"}, deduplicate: true, signal}));
// A complete filtered download is fetched only after the user requests Export.
export async function getCpExport(params: Record<string, string | number | undefined>) {
  const rows: CpCaseReportRecord[] = [];
  for (let page = 1, pages = 1; page <= pages; page++) {
    const result = await getCpReport({...params, page, limit: 100}, undefined, 0);
    rows.push(...result.rows); pages = result.totalPages;
  }
  return rows;
}

export interface FinanceSummary { paymentCount: number; agentCount: number; repCount: number; totalCommissionPool: number; pendingClearance: number; currency: string }
export interface FinanceMetrics { totalPayload: number; totalYield: number; totalAncillary: number; totalApplication: number; paidCount: number; totalCount: number }
export interface FinancePage<T> { data: T[]; total: number; page: number; limit: number }
export interface FinanceLedgerPage extends FinancePage<PaymentReportRecord> { metrics: FinanceMetrics; programs: Array<{course: string; code: string; totalStudents: number; amountGross: number}> }
export type FinancePartner = AgentRepReportRecord & { applicationCount: number; activeApplications: number };
export const getFinanceLedger = (params: Record<string, string | number | undefined>, signal?: AbortSignal) => apiClient.get<FinanceLedgerPage>("/api/admin/reports/finance/ledger", { params, deduplicate: true, signal });
export const getFinancePartners = (params: Record<string, string | number | undefined>, signal?: AbortSignal) => apiClient.get<FinancePage<FinancePartner>>("/api/admin/reports/finance/partners", { params, deduplicate: true, signal });
export const getFinancePartner = (type: string, partnerId: string, signal?: AbortSignal) => apiClient.get<{partner: FinancePartner | null}>("/api/admin/reports/finance/partners/detail", {params: {type, partnerId}, deduplicate: true, signal});
export const getPartnerApplications = (params: Record<string, string | number | undefined>, signal?: AbortSignal) => apiClient.get<FinancePage<StudentApplicationItem>>("/api/admin/reports/finance/partners/applications", {params, deduplicate: true, signal});
export const useFinanceSummary = () => useApiQuery(signal => apiClient.get<FinanceSummary>("/api/admin/reports/finance/summary", {deduplicate: true, signal}));
export const useFinanceOptions = () => useApiQuery(signal => apiClient.get<{courses: string[]; methods: string[]}>("/api/admin/reports/finance/ledger/options", {deduplicate: true, signal}));
export const useCpReportCount = () => useApiQuery(async signal => {
 const response = await apiClient.get<Row>("/api/admin/payments/reports/cp-cases", {params: {page: 1, limit: 1}, deduplicate: true, signal});
 return Number(response.pagination?.totalRecords || 0);
});
