/**
 * Network Connectivity Utilities for Avis Management System (AMS)
 * Provides reliable online/offline detection, active internet probes,
 * network telemetry, and cross-browser connection metrics.
 */

export interface NetworkConnectionMetrics {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

export interface NetworkStatusSnapshot {
  isOnline: boolean;
  metrics: NetworkConnectionMetrics;
  lastChecked: Date;
}

/**
 * Checks if the browser is currently reporting an active connection.
 */
export function isBrowserOnline(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return true;
  }
  return navigator.onLine;
}

/**
 * Actively probes internet connectivity with a lightweight cache-busting request.
 * Useful to distinguish between local-network-only (e.g. captive portal or broken router)
 * and genuine WAN connectivity.
 *
 * @param timeoutMs Timeout in milliseconds (default 3000ms)
 */
export async function checkInternetConnectivity(timeoutMs = 3000): Promise<boolean> {
  if (!isBrowserOnline()) {
    return false;
  }

  // Active ping to a local asset or root with cache-busting timestamp
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const probeUrl = `${window.location.origin}/favicon.ico?_probe=${Date.now()}`;
    const response = await fetch(probeUrl, {
      method: "HEAD",
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timer);
    return response.ok || response.status === 404 || response.status === 304;
  } catch (error) {
    clearTimeout(timer);
    // If local fetch timed out or network error thrown
    if (error instanceof Error && error.name === "AbortError") {
      return false;
    }
    // As a fallback, check navigator.onLine
    return navigator.onLine;
  }
}

/**
 * Extracts available network quality indicators (Network Information API)
 */
export function getNetworkMetrics(): NetworkConnectionMetrics {
  if (typeof navigator === "undefined") return {};

  const nav = navigator as Navigator & {
    connection?: {
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
      saveData?: boolean;
    };
    mozConnection?: unknown;
    webkitConnection?: unknown;
  };

  const conn = nav.connection;
  if (!conn) return {};

  return {
    effectiveType: conn.effectiveType || "unknown",
    downlink: conn.downlink,
    rtt: conn.rtt,
    saveData: conn.saveData,
  };
}

/**
 * Global subscriber for network status changes.
 */
export function subscribeToNetworkStatus(callback: (isOnline: boolean) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}

let monitoringInitialized = false;

/**
 * Initializes global network telemetry and logging.
 * Called in main.tsx or App root.
 */
export function initNetworkMonitoring(): () => void {
  if (monitoringInitialized || typeof window === "undefined") {
    return () => {};
  }
  monitoringInitialized = true;

  const handleOnline = () => {
    if (import.meta.env.DEV) {
      console.info("[Network]: Connection restored. Browser is online.");
    }
    window.dispatchEvent(new CustomEvent("ams:network:online"));
  };

  const handleOffline = () => {
    if (import.meta.env.DEV) {
      console.warn("[Network]: Connection lost. Operating in offline mode.");
    }
    window.dispatchEvent(new CustomEvent("ams:network:offline"));
  };

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
    monitoringInitialized = false;
  };
}
