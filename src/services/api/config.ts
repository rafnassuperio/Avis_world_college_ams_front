/** Backend origin only; endpoint paths include /api, /sms-api or /lms-api. */
export const BACKEND_ORIGIN = (import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:5000")
  .replace(/\/+$/, "").replace(/\/api$/, "");

export function apiUrl(path: string): string {
  return `${BACKEND_ORIGIN}/${path.replace(/^\/+/, "")}`;
}

export function assetUrl(value?: string, directory = ""): string {
  if (!value) return "";
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  return apiUrl(value.startsWith("/") ? value : `${directory}/${value}`);
}
