import { apiClient } from "./api/apiClient";
import { dataUrlToBlob } from "./api/dataUrl";
import { assetUrl } from "./api/config";
import type { Row } from "./ams";
import type { UserProfile } from "@/types";
export function profileOf(admin: Row): UserProfile {
  return { name: admin.name || "", email: admin.email || "", role: admin.type || "", avatarUrl: assetUrl(admin.logo_name, "/uploads"),
    phone: admin.phone || "", city: admin.address?.city || "", state: admin.address?.state || "", country: admin.address?.country || "",
    department: admin.department || "", bio: admin.bio || "", status: admin.status || "", college: "", amsVersion: "1.0.0", joinedDate: admin.createdAt || "" };
}
export const getProfile = (id: string) => apiClient.get<{ admin: Row }>(`/api/admin/avis-profile/${id}`, { deduplicate: true });
export async function saveProfile(id: string, value: Partial<UserProfile> & { currentPassword?: string }) {
  let body: Row | FormData = value;
  if (value.avatarUrl?.startsWith("data:")) {
    const blob = dataUrlToBlob(value.avatarUrl);
    const form = new FormData();
    for (const [key, v] of Object.entries(value)) if (v != null && key !== "avatarUrl") form.append(key, String(v));
    form.append("logo", blob, "profile.png"); body = form;
  }
  return apiClient.patch<{ admin: Row }>(`/api/admin/avis-profile/${id}`, body);
}
export const permissionResources: Record<string, string> = {
  dashboard: "dashboard", "report-dashboard": "reportDashboard", "student-management": "studentManagement", "module-exemption": "moduleExemption",
  "student-document-statics": "studentDocumentStatics", "college-report": "collegeReport", "agent-rep-report": "agentRepReport",
  "student-document-management": "studentDocumentManagement", "course-management": "courseManagement", "course-fee-type-management": "courseFeeTypeManagement",
  "bulk-upload-option": "bulkUploadOPtion", "payment-option": "PaymentOPtion", "category-management": "categoryManagement", "college-management": "collegeManagement",
  "agent-management": "agentManagement", "commission-management": "commissionManagement", "representative-management": "representativeManagement", "intake-management": "intakeManagement",
};
export const permissionActions: Record<string, Record<string, string>> = {
  dashboard: { view: "view" }, reportDashboard: { view: "view" }, studentDocumentStatics: { view: "view" }, collegeReport: { view: "view" }, agentRepReport: { view: "view" },
  studentManagement: { add: "add", edit: "update", update: "status", delete: "delete" },
  moduleExemption: { view: "view", add: "add", edit: "update", delete: "delete" },
  studentDocumentManagement: { add: "addContract", edit: "update", delete: "deleteContract" },
  courseManagement: { add: "add", edit: "update", delete: "delete" }, courseFeeTypeManagement: { add: "add", edit: "update" },
  bulkUploadOPtion: { view: "available" }, PaymentOPtion: { view: "available" }, collegeManagement: { edit: "edit" },
  categoryManagement: { add: "add", edit: "update", delete: "delete" }, intakeManagement: { add: "add", edit: "update", delete: "delete" },
  agentManagement: { view: "view", add: "add", edit: "update", update: "editCommission", delete: "delete" },
  representativeManagement: { view: "view", add: "add", edit: "update", update: "editCommission", delete: "delete" },
  commissionManagement: { view: "view", edit: "agentCommission", update: "representativeCommission" },
};
