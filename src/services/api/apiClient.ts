import { ApiError } from "./apiError";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "@/components/common/ToastMessage";

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  skipAuth?: boolean;
  skipCsrf?: boolean;
  deduplicate?: boolean;
  params?: Record<string, string | number | boolean | undefined | null>;
}

// In-flight active request map for GET query deduplication
const inFlightRequests = new Map<string, Promise<unknown>>();

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
async function executeRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const {
    timeoutMs = 15000,
    skipAuth = false,
    skipCsrf = false,
    deduplicate = false,
    params,
    headers: customHeaders,
    ...fetchOptions
  } = options;

  const resolvedUrl = buildUrlWithParams(endpoint, params);
  const method = (fetchOptions.method || "GET").toUpperCase();

  // Deduplicate identical in-flight GET requests
  const deduplicationKey = `${method}:${resolvedUrl}`;
  if (method === "GET" && deduplicate && inFlightRequests.has(deduplicationKey)) {
    return inFlightRequests.get(deduplicationKey) as Promise<T>;
  }

  // Setup abort controller for timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

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
    const token = useAuthStore.getState().sessionToken;
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
      });

      clearTimeout(timeoutId);

      // Handle HTTP error responses
      if (!response.ok) {
        let errorData: unknown;
        try {
          errorData = await response.json();
        } catch {
          errorData = await response.text();
        }

        // Automatic 401 Unauthorized handling: session expiry
        if (response.status === 401) {
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
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        return (await response.json()) as T;
      }

      return (await response.text()) as unknown as T;
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      if (err instanceof ApiError) {
        throw err;
      }

      // Handle fetch timeout (AbortError)
      if (err instanceof DOMException && err.name === "AbortError") {
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
      if (method === "GET" && deduplicate) {
        inFlightRequests.delete(deduplicationKey);
      }
    }
  })();

  if (method === "GET" && deduplicate) {
    inFlightRequests.set(deduplicationKey, executionPromise);
  }

  return executionPromise;
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
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(url: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return executeRequest<T>(url, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    });
  },

  patch<T>(url: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return executeRequest<T>(url, {
      ...options,
      method: "PATCH",
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(url: string, options?: RequestOptions): Promise<T> {
    return executeRequest<T>(url, { ...options, method: "DELETE" });
  },
};

export default apiClient;
