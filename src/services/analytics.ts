import { useApiQuery } from "@/hooks/useApiQuery";
import { apiClient } from "./api/apiClient";
import type { PendingPaymentCard } from "@/types";
import type { IntakeDocumentCountItem } from "@/features/reports/types";
export interface MonthSummary { month: string; students: number; local: number; international: number; sales: number; tuition: number; application: number }
export interface Overview {
  totals: { students: number; agents: number; representatives: number; agentApplications: number; courses: number; local: number; international: number; categories: number; newStudents: number; overseas: number };
  currency: string;
  studentPrograms: Array<{ month: string; students: number }>;
  monthly: MonthSummary[];
  byProgram: Array<{ period: string; tuition: number; application: number }>;
  paymentStatus: Array<{ name: string; students: number; amount: number }>;
  documentCounts: IntakeDocumentCountItem[];
  pending: PendingPaymentCard[];
}
export const useAnalytics = (intake?: string) => useApiQuery(() => apiClient.get<Overview>("/api/admin/dashboard/overview", { deduplicate: true, params: { intake } }), [intake]);
export function monthsForFilter(rows: MonthSummary[], filter: string) {
  const now = new Date();
  const current = now.toISOString().slice(0, 7);
  if (filter === "All Time") return rows;
  if (filter === "This Month") return rows.filter(r => r.month === current);
  if (filter === "Last Month") { now.setMonth(now.getMonth() - 1); return rows.filter(r => r.month === now.toISOString().slice(0, 7)); }
  if (filter.includes("Year")) { const year = String(now.getFullYear() - (filter.includes("Last") ? 1 : 0)); return rows.filter(r => r.month.startsWith(year)); }
  const count = filter.includes("Quarter") || filter.includes("3") ? 3 : filter.includes("12") ? 12 : 6;
  now.setMonth(now.getMonth() - count + 1);
  const from = now.toISOString().slice(0, 7);
  return rows.filter(r => r.month >= from && r.month <= current);
}
