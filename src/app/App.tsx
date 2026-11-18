import React, { useEffect, useRef } from "react";
import { AppRouter } from "./router";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { OfflineFallback } from "@/components/common/OfflineFallback";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { toast } from "@/components/common/ToastMessage";
import { PWAInstallModal } from "@/components/common/PWAInstallModal";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useAppStore } from "@/store/useAppStore";

export const App: React.FC = () => {
  const { isOnline, wasOffline } = useNetworkStatus();
  const { isInstallable, isInstalled, isDismissed } = usePWAInstall();
  const openPWAInstall = useAppStore((state) => state.openPWAInstall);
  const hasPromptedRef = useRef(false);

  // Automatic toast notification when device reconnects to internet
  useEffect(() => {
    if (isOnline && wasOffline) {
      toast.success("Connection Restored", {
        description: "You are back online. All features have resumed.",
      });
    }
  }, [isOnline, wasOffline]);

  // Polite, delayed PWA installation suggestion for eligible visitors (runs once)
  useEffect(() => {
    if (!isInstalled && isInstallable && !isDismissed && !hasPromptedRef.current) {
      const timer = setTimeout(() => {
        if (!hasPromptedRef.current) {
          hasPromptedRef.current = true;
          openPWAInstall();
        }
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isInstalled, isInstallable, isDismissed, openPWAInstall]);

  // Listen for PWA service worker background updates
  useEffect(() => {
    const handleUpdate = () => {
      toast.info("Update Ready", {
        description: "A new version of Avis AMS is available. Refresh to apply updates.",
        duration: 8000,
      });
    };

    window.addEventListener("ams-pwa-update-available", handleUpdate);
    return () => window.removeEventListener("ams-pwa-update-available", handleUpdate);
  }, []);

  return (
    <ErrorBoundary
      fallback={(error, reset) => {
        const isOffline =
          !navigator.onLine || /networkerror|failed to fetch|dynamically imported module|chunkloaderror|net::err_/i.test(error.message || "");

        if (isOffline) {
          return (
            <OfflineFallback
              fullScreen
              onRetry={reset}
            />
          );
        }
        return undefined;
      }}
    >
      <AppRouter />
      <PWAInstallModal />
    </ErrorBoundary>
  );
};

export default App;
