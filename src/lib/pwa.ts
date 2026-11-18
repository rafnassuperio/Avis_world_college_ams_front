/**
 * Avis World College - PWA Utility & Registration Service
 */

export type PlatformType = "ios" | "android" | "windows" | "macos" | "linux" | "other";
export type BrowserType = "safari" | "chrome" | "edge" | "firefox" | "samsung" | "other";

/**
 * Detects whether the web app is running in standalone (installed PWA) display mode.
 */
export function isPWAInstalled(): boolean {
  if (typeof window === "undefined") return false;

  const isStandaloneMatch = window.matchMedia("(display-mode: standalone)").matches;
  const isIosStandalone = (navigator as unknown as { standalone?: boolean }).standalone === true;
  const isAndroidApp = document.referrer.startsWith("android-app://");

  return isStandaloneMatch || isIosStandalone || isAndroidApp;
}

/**
 * Detects user OS platform.
 */
export function getPlatform(): PlatformType {
  if (typeof window === "undefined" || typeof navigator === "undefined") return "other";

  const userAgent = navigator.userAgent || navigator.vendor || "";
  const platform = (navigator as unknown as { userAgentData?: { platform?: string } }).userAgentData?.platform || navigator.platform || "";

  if (/iPad|iPhone|iPod/.test(userAgent) || (platform === "MacIntel" && navigator.maxTouchPoints > 1)) {
    return "ios";
  }
  if (/android/i.test(userAgent)) {
    return "android";
  }
  if (/Win/i.test(platform) || /windows/i.test(userAgent)) {
    return "windows";
  }
  if (/Mac/i.test(platform) || /macintosh/i.test(userAgent)) {
    return "macos";
  }
  if (/Linux/i.test(platform) || /linux/i.test(userAgent)) {
    return "linux";
  }

  return "other";
}

/**
 * Detects user browser engine/name.
 */
export function getBrowser(): BrowserType {
  if (typeof window === "undefined" || typeof navigator === "undefined") return "other";

  const ua = navigator.userAgent;

  if (/SamsungBrowser/i.test(ua)) return "samsung";
  if (/Edg/i.test(ua)) return "edge";
  if (/Chrome|CriOS/i.test(ua)) return "chrome";
  if (/Firefox|FxiOS/i.test(ua)) return "firefox";
  if (/Safari/i.test(ua) && !/Chrome|CriOS/i.test(ua)) return "safari";

  return "other";
}

/**
 * Safely registers the Service Worker for PWA functionality.
 */
export async function registerPWA(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

    registration.addEventListener("updatefound", () => {
      const installingWorker = registration.installing;
      if (!installingWorker) return;

      installingWorker.addEventListener("statechange", () => {
        if (installingWorker.state === "installed") {
          if (navigator.serviceWorker.controller) {
            window.dispatchEvent(new CustomEvent("ams-pwa-update-available"));
          }
        }
      });
    });

    return registration;
  } catch (error) {
    // Non-blocking in dev or unsupported contexts
    console.debug("[PWA] Service Worker registration skipped or failed:", error);
    return null;
  }
}
