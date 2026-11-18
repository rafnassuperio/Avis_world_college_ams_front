import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import {
  checkInternetConnectivity,
  getNetworkMetrics,
  NetworkConnectionMetrics,
} from "@/lib/network";

export interface NetworkStatus {
  isOnline: boolean;
  isChecking: boolean;
  wasOffline: boolean;
  metrics: NetworkConnectionMetrics;
  lastOnlineAt: Date | null;
  checkConnection: () => Promise<boolean>;
}

// Global store for network state to share single listener across components
let globalOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
let wasEverOffline = false;
let lastOnlineTime: Date | null = typeof navigator !== "undefined" && navigator.onLine ? new Date() : null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    globalOnline = true;
    lastOnlineTime = new Date();
    notify();
  });

  window.addEventListener("offline", () => {
    globalOnline = false;
    wasEverOffline = true;
    notify();
  });
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot() {
  return globalOnline;
}

export function useNetworkStatus(): NetworkStatus {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot, () => true);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<NetworkConnectionMetrics>(() => getNetworkMetrics());

  // Update metrics when online/offline changes
  useEffect(() => {
    setMetrics(getNetworkMetrics());
  }, [isOnline]);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    setIsChecking(true);
    try {
      const activeStatus = await checkInternetConnectivity(2500);
      globalOnline = activeStatus;
      if (activeStatus) {
        lastOnlineTime = new Date();
      } else {
        wasEverOffline = true;
      }
      setMetrics(getNetworkMetrics());
      notify();
      return activeStatus;
    } catch {
      globalOnline = false;
      wasEverOffline = true;
      notify();
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  return {
    isOnline,
    isChecking,
    wasOffline: wasEverOffline,
    metrics,
    lastOnlineAt: lastOnlineTime,
    checkConnection,
  };
}

export default useNetworkStatus;
