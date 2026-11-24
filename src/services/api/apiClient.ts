import {cachedQuery, invalidateApiCache, resetApiSession} from "./queryCache";
import { apiUrl } from "./config";
import { ApiError } from "./apiError";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "@/components/common/ToastMessage";

export interface RequestOptions extends RequestInit {
  responseType?: "json" | "blob";
  timeoutMs?: number;
  skipAuth?: boolean;
  skipCsrf?: boolean;
  deduplicate?: boolean;
  cacheTimeMs?: number;
  params?: Record<string, string | number | boolean | undefined | null>;
}



/**
 * Extracts CSRF token from meta tags or cookies for state-changing requests (POST, PUT, PATCH, DELETE).
 */
function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;

  // 1. Meta tag inspection
  const metaTag = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
  if (metaTag?.content) return metaTag.content;

  // 2. Cookie inspection
  const match = document.cookie.match(/(?:^|;\s*)(?:csrf_token|XSRF-TOKEN)=([^;]+)/i);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Normalizes query parameters into a URL string.
 */
function buildUrlWithParams(baseUrl: string, params?: Record<string, string | number | boolean | undefined | null>): string {
  if (!params || Object.keys(params).length === 0) return baseUrl;

  const url = new URL(baseUrl, typeof window !== "undefined" ? window.location.origin : "http://localhost");
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  }
  return baseUrl.startsWith("http") ? url.toString() : `${url.pathname}${url.search}`;
}

/**
 * Core HTTP Request Execution Engine
 */
async function sendRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const {
    timeoutMs = 15000,
    responseType = "json",
    skipAuth = false,
    skipCsrf = false,
    deduplicate: _deduplicate,
    cacheTimeMs: _cacheTimeMs,
    signal: callerSignal,
    params,
    headers: customHeaders,
    ...fetchOptions
  } = options;

  const resolvedUrl = buildUrlWithParams(/^https?:\/\//.test(endpoint) ? endpoint : apiUrl(endpoint), params);
  const method = (fetchOptions.method || "GET").toUpperCase();

  // Deduplicate identical in-flight GET requests
  const requestToken = skipAuth ? null : useAuthStore.getState().sessionToken;
  const controller = new AbortController();
  let timedOut = false;
  const cancel = () => controller.abort();
  if (callerSignal?.aborted) throw new DOMException("Request cancelled", "AbortError");
  callerSignal?.addEventListener("abort", cancel, {once: true});
  const timeoutId = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);

  // Compile secure default headers
  const headers = new Headers(customHeaders);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  if (!headers.has("Content-Type") && fetchOptions.body && !(fetchOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Attach client request correlation ID
  headers.set("X-Request-ID", "req_" + Math.random().toString(36).substring(2, 10));

  // Attach CSRF protection token for mutating HTTP verbs
  if (!skipCsrf && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers.set("X-CSRF-Token", csrfToken);
    }
  }

  // Attach Bearer token from secure Auth Store
  if (!skipAuth) {
    const token = requestToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const executionPromise = (async () => {
    try {
      const response = await fetch(resolvedUrl, {
        ...fetchOptions,
        method,
        headers,
        signal: controller.signal,
        credentials: "include",
      });

      // Handle HTTP error responses
      if (!response.ok) {
        let errorData: unknown;
        try {
          const errorText = await response.text();
          try { errorData = JSON.parse(errorText); } catch { errorData = errorText; }
        } catch {
          errorData = null;
        }

        // Automatic 401 Unauthorized handling: session expiry
        if (response.status === 401 && !skipAuth && useAuthStore.getState().sessionToken === requestToken) {
          useAuthStore.getState().logout();
          toast.error("Session Expired", {
            description: "Your administrative session has timed out. Please sign in again.",
          });
        }

        throw new ApiError(`HTTP Request failed with status ${response.status}`, {
          status: response.status,
          statusText: response.statusText,
          data: errorData,
          url: resolvedUrl,
        });
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return null as unknown as T;
      }

      // Parse JSON response
      if (responseType === "blob") return await response.blob() as T;
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const payload = await response.json();
        if (payload && typeof payload === "object" && payload.success === false) throw new ApiError("The server rejected the operation", { status: 422, data: payload, url: resolvedUrl });
        return payload as T;
      }

      return (await response.text()) as unknown as T;
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      if (err instanceof ApiError) {
        throw err;
      }

      if (callerSignal?.aborted && !timedOut) throw new DOMException("Request cancelled", "AbortError");
      // A timeout remains a visible failure; ordinary cancellation is silent.
      if (timedOut) {
        throw new ApiError("Request timeout exceeded", {
          status: 408,
          statusText: "Request Timeout",
          isTimeout: true,
          url: resolvedUrl,
        });
      }

      // Handle offline or network failure
      const isOffline = typeof navigator !== "undefined" && !navigator.onLine;
      throw new ApiError(isOffline ? "Client is offline" : "Network error encountered", {
        status: 0,
        statusText: "Network Error",
        isNetworkError: true,
        url: resolvedUrl,
      });
    } finally {
      clearTimeout(timeoutId);
      callerSignal?.removeEventListener("abort", cancel);
    }
  })();

  return executionPromise;
}

async function executeRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = useAuthStore.getState().sessionToken;
  resetApiSession(token);
  const method = (options.method || "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    invalidateApiCache();
    try { const result = await sendRequest<T>(endpoint, options); invalidateApiCache(true); return result; }
    catch (error) { invalidateApiCache(); throw error; }
  }
  // Cache only opted-in JSON reads; downloads, auth and custom-header reads stay fresh.
  if (method === "GET" && token && options.deduplicate && !options.skipAuth && !options.headers && options.responseType !== "blob") {
    const url = new URL(buildUrlWithParams(/^https?:\/\//.test(endpoint) ? endpoint : apiUrl(endpoint), options.params));
    url.searchParams.sort();
    const expiry = useAuthStore.getState().sessionExpiry;
    const ttl = Math.min(options.cacheTimeMs ?? 10000, expiry ? Math.max(0, expiry - Date.now()) : 30000);
    const key = token + ":" + url.toString() + ":" + ttl + ":" + (options.timeoutMs ?? 15000);
    return cachedQuery(key, signal => sendRequest<T>(endpoint, {...options, signal}), {signal: options.signal, ttl});
  }
  return sendRequest<T>(endpoint, options);
}

/**
 * Universal Typed API Client with Security Hardening, In-Flight Deduplication,
 * and Status-Aware Error Management.
 */
export const apiClient = {
  get<T>(url: string, options?: RequestOptions): Promise<T> {
    return executeRequest<T>(url, { ...options, method: "GET" });
  },

  post<T>(url: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return executeRequest<T>(url, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(url: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return executeRequest<T>(url, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  patch<T>(url: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return executeRequest<T>(url, {
      ...options,
      method: "PATCH",
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(url: string, options?: RequestOptions): Promise<T> {
    return executeRequest<T>(url, { ...options, method: "DELETE" });
  },
};

export default apiClient;
