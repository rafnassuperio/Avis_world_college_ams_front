import { useEffect } from "react";
import { useApiQuery } from "./useApiQuery";
import { apiClient } from "@/services/api/apiClient";
import { useAuthStore } from "@/store/useAuthStore";
import { useAppStore } from "@/store/useAppStore";
import type { Row } from "@/services/ams";
import type { RecentActivity } from "@/types";

export function useServerActivity() {
  const adminId = useAuthStore(s => s.adminId);
  const isSuper = useAuthStore(s => s.user.role === "super-admin");
  const query = useApiQuery(async () => {
    if (!adminId) return [];
    const response = await apiClient.get<Row>(isSuper ? "/api/admin/activities/all-admin/activities" : `/api/admin/activities/${adminId}`, { params: { limit: 100 }, deduplicate: true });
    const rows: Row[] = response.activities || response.data?.activities || [];
    return rows.map((r): RecentActivity => ({ id: r._id, title: r.action || "", detail: typeof r.details === "string" ? r.details : "", type: r.category === "payment-management" ? "fee" : r.category === "content" ? "program" : "system",
      timestamp: r.timestamp || r.createdAt || "", timeAgo: r.timestamp || r.createdAt || "", iconName: "ShieldCheck", performedBy: r.adminName || "", status: r.status === "error" ? "flagged" : "completed" }));
  }, [adminId, isSuper]);
  useEffect(() => { if (query.data) useAppStore.setState({ activities: query.data }); }, [query.data]);
  useEffect(() => {
    const refresh = () => { void query.reload(); };
    window.addEventListener("ams-data-updated", refresh);
    window.addEventListener("ams_payment_records_updated", refresh);
    window.addEventListener("ams-refresh-activities", refresh);
    return () => { window.removeEventListener("ams-data-updated", refresh); window.removeEventListener("ams_payment_records_updated", refresh); window.removeEventListener("ams-refresh-activities", refresh); };
  }, [query.reload]);
  return query;
}

export function useServerNotifications() {
  const adminId = useAuthStore(s => s.adminId);
  const query = useApiQuery(async () => {
    if (!adminId) return [];
    const result = await apiClient.get<{ data: Row[] }>(`/lms-api/notifications/${adminId}`, { deduplicate: true });
    return result.data.map(r => ({ id: r._id, title: r.title || "", description: r.message || "", timestamp: r.createdAt || "", isRead: Boolean(r.isRead), type: "system" as const }));
  }, [adminId]);
  useEffect(() => { if (query.data) useAppStore.setState({ notifications: query.data }); }, [query.data]);
  return query;
}
