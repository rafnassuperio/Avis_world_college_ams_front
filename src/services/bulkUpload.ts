import { apiClient } from "./api/apiClient";
import type { Row } from "./ams";
import type { CollegeStudent } from "@/features/college/types";
const uploads = new WeakMap<File, Row[]>();
export async function parseUpload(file: File): Promise<CollegeStudent[]> {
  const body = new FormData(); body.append("file", file);
  const response = await apiClient.post<{ data: Row[] }>("/api/admin/bulk-upload/preview", body, { timeoutMs: 60000 });
  uploads.set(file, response.data);
  return response.data.map((r, index) => ({ id: String(index), studentId: r["STUDENT ID"] || "", name: r["FULL NAME"] || r.FULLNAME || "", email: r.EMAIL || r["EMAIL ADDRESS"] || "",
    phone: r["CONTACT NO"] || r["CONTACT NO. +91"] || "", course: r["COURSE CODE"] || "", courseCode: r["COURSE CODE"] || "", avatar: "", category: "", intake: r["INTAKE NAME"] || "",
    status: r.STATUS || "", nationality: r.COUNTRY || "", joinedDate: r["ENROLLMENT DATE"] || "", studentType: r["STUDENT TYPE"] === "Domestic" ? "Local" : r["STUDENT TYPE"] }));
}
export async function importUpload(file: File) {
  const data = uploads.get(file);
  if (!data?.length) throw new Error("Parse and review the selected file before importing.");
  const result = await apiClient.post<{ uploadId: string; errors: Row[] }>("/api/admin/bulk-upload/student-data", { data }, { timeoutMs: 120000 });
  window.dispatchEvent(new CustomEvent("ams-data-updated", { detail: "students" }));
  uploads.delete(file);
  return { count: data.length, errors: result.errors || [] };
}
export function downloadStudentTemplate(_entity?: string) {
  const headers = ["FULL NAME", "EMAIL", "CONTACT NO", "STUDENT TYPE", "SALUTATION", "DATE OF BIRTH", "ID TYPE", "PASSPORT", "NRIC", "FIN NUMBER", "COURSE CODE", "PAYMENT SCHEME", "COURSE TYPE", "REPRESENTATIVE", "AGENTS", "INTAKE NAME", "INTAKE", "INTAKE DATE", "ENROLLMENT DATE", "COMPLETION DATE", "FINAL EXAM RESULT DATE", "CONFERMENT DATE", "PAYMENT TYPE", "TENURE", "TENURE DATE", "DISCOUNT", "ADDRESS", "COUNTRY"];
  const url = URL.createObjectURL(new Blob([headers.join(",") + "\n"], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a"); link.href = url; link.download = "Students_Bulk_Upload_Template.csv"; link.click(); URL.revokeObjectURL(url);
}
