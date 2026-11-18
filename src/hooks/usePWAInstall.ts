import { useCallback, useSyncExternalStore } from 'react';
import { isPWAInstalled, getPlatform, getBrowser, PlatformType, BrowserType } from '@/lib/pwa';
import { toast } from '@/components/common/ToastMessage';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface InstallSnapshot {
  hasPrompt: boolean;
  isInstalled: boolean;
  isDismissed: boolean;
}

const STORAGE_KEY_DISMISSED = 'ams_pwa_dismissed_until';
const STORAGE_KEY_PERMANENT = 'ams_pwa_dismissed_permanently';

function getIsDismissedFromStorage(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const permanent = localStorage.getItem(STORAGE_KEY_PERMANENT);
    if (permanent === 'true') return true;

    const dismissedUntil = localStorage.getItem(STORAGE_KEY_DISMISSED);
    if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
      return true;
    }
  } catch {
    // Ignore storage restrictions
  }
  return false;
}

// Module-level static platform & browser detection (does not change during session)
const detectedPlatform: PlatformType = typeof window !== 'undefined' ? getPlatform() : 'other';
const detectedBrowser: BrowserType = typeof window !== 'undefined' ? getBrowser() : 'other';

// Module-level state to capture beforeinstallprompt even before component mounts
let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;
let globalIsInstalled: boolean = typeof window !== 'undefined' ? isPWAInstalled() : false;
let globalIsDismissed: boolean = getIsDismissedFromStorage();

// Immutable cached snapshot to prevent React useSyncExternalStore infinite loop
let cachedSnapshot: InstallSnapshot = {
  hasPrompt: !!deferredInstallPrompt,
  isInstalled: globalIsInstalled,
  isDismissed: globalIsDismissed,
};

const SERVER_SNAPSHOT: InstallSnapshot = {
  hasPrompt: false,
  isInstalled: false,
  isDismissed: false,
};

const subscribers = new Set<() => void>();

function updateSnapshot() {
  const newHasPrompt = !!deferredInstallPrompt;
  const newIsInstalled = globalIsInstalled;
  const newIsDismissed = globalIsDismissed;

  if (
    cachedSnapshot.hasPrompt !== newHasPrompt ||
    cachedSnapshot.isInstalled !== newIsInstalled ||
    cachedSnapshot.isDismissed !== newIsDismissed
  ) {
    cachedSnapshot = {
      hasPrompt: newHasPrompt,
      isInstalled: newIsInstalled,
      isDismissed: newIsDismissed,
    };
  }
}

function notifySubscribers() {
  updateSnapshot();
  subscribers.forEach((callback) => callback());
}

if (typeof window !== 'undefined') {
  // Capture the native install prompt
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferredInstallPrompt = e as BeforeInstallPromptEvent;
    notifySubscribers();
  });

  // Listen for successful installation
  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    globalIsInstalled = true;
    notifySubscribers();

    toast.success('Avis AMS Installed!', {
      description: 'You can now launch the institutional management system directly from your home screen or applications.',
      duration: 6000,
    });
  });

  // Watch display-mode changes (e.g. user opens standalone window)
  try {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', (e) => {
      globalIsInstalled = e.matches;
      notifySubscribers();
    });
  } catch {
    // Unsupported in older browsers
  }
}

function subscribeToInstallStore(callback: () => void) {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

function getInstallSnapshot(): InstallSnapshot {
  return cachedSnapshot;
}

function getServerSnapshot(): InstallSnapshot {
  return SERVER_SNAPSHOT;
}

export interface UsePWAInstallReturn {
  isInstallable: boolean;
  canPromptDirectly: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isDismissed: boolean;
  platform: PlatformType;
  browser: BrowserType;
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'manual_instructions'>;
  dismissPrompt: (permanent?: boolean) => void;
  resetDismissal: () => void;
}

export function usePWAInstall(): UsePWAInstallReturn {
  const storeState = useSyncExternalStore(
    subscribeToInstallStore,
    getInstallSnapshot,
    getServerSnapshot
  );

  const isIOS = detectedPlatform === 'ios';
  const isInstalled = storeState.isInstalled;
  const canPromptDirectly = storeState.hasPrompt && !isInstalled;
  const isInstallable = !isInstalled && (canPromptDirectly || isIOS || detectedPlatform === 'macos' || detectedPlatform === 'windows');
  const isDismissed = storeState.isDismissed;

  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'manual_instructions'> => {
    if (deferredInstallPrompt) {
      try {
        await deferredInstallPrompt.prompt();
        const choiceResult = await deferredInstallPrompt.userChoice;

        if (choiceResult.outcome === 'accepted') {
          deferredInstallPrompt = null;
          notifySubscribers();
          return 'accepted';
        } else {
          return 'dismissed';
        }
      } catch (err) {
        console.error('[PWA] Prompt error:', err);
        return 'dismissed';
      }
    }

    // Manual guidance for iOS or browsers without direct prompt
    return 'manual_instructions';
  }, []);

  const dismissPrompt = useCallback((permanent = false) => {
    try {
      if (permanent) {
        localStorage.setItem(STORAGE_KEY_PERMANENT, 'true');
      } else {
        // Snooze for 7 days
        const snoozeDate = Date.now() + 7 * 24 * 60 * 60 * 1000;
        localStorage.setItem(STORAGE_KEY_DISMISSED, snoozeDate.toString());
      }
    } catch {
      // ignore
    }
    globalIsDismissed = true;
    notifySubscribers();
  }, []);

  const resetDismissal = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY_PERMANENT);
      localStorage.removeItem(STORAGE_KEY_DISMISSED);
    } catch {
      // ignore
    }
    globalIsDismissed = false;
    notifySubscribers();
  }, []);

  return {
    isInstallable,
    canPromptDirectly,
    isInstalled,
    isIOS,
    isDismissed,
    platform: detectedPlatform,
    browser: detectedBrowser,
    promptInstall,
    dismissPrompt,
    resetDismissal,
  };
}

export default usePWAInstall;
