import {apiClient} from "./api/apiClient";
import type {SearchItem} from "@/components/ui/SearchModal";
export interface HeaderSummary {admins: number; activeAdmins: number; agents: number; representatives: number; partners: number}
export interface HeaderSearch {items: SearchItem[]; counts: {Students: number; Courses: number; Staff: number; Partners: number}}
export const getHeaderSearch = (search: string, signal?: AbortSignal) => apiClient.get<HeaderSearch>("/api/admin/dashboard/header-search", {params: {search, limit: 15}, signal, deduplicate: true});
export const getHeaderSummary = (signal?: AbortSignal) => apiClient.get<HeaderSummary>("/api/admin/dashboard/header-summary", {signal, deduplicate: true});
