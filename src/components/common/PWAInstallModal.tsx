import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Zap,
  WifiOff,
  ShieldCheck,
  Share,
  PlusSquare,
  CheckCircle2,
  X,
  MonitorSmartphone,
  Laptop,
  Smartphone,
  Sparkles,
  Layers,
  ArrowRight,
} from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useAppStore } from "@/store/useAppStore";
import { assets } from "@/assets/assets";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export interface PWAInstallModalProps {
  /**
   * Optional manual override for open state. If not provided,
   * it connects to `useAppStore().isPWAInstallOpen`.
   */
  isOpen?: boolean;
  onClose?: () => void;
}

type TabType = "desktop" | "ios" | "android";

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen: propsIsOpen, onClose: propsOnClose }) => {
  const isPWAInstallOpen = useAppStore((state) => state.isPWAInstallOpen);
  const closePWAInstall = useAppStore((state) => state.closePWAInstall);
  const activeModal = useAppStore((state) => state.activeModal);
  const closeModal = useAppStore((state) => state.closeModal);
  const { canPromptDirectly, isInstalled, isIOS, platform, browser, promptInstall, dismissPrompt } = usePWAInstall();

  // Auto-detect default tab based on user's device
  const defaultTab: TabType = isIOS ? "ios" : platform === "android" ? "android" : "desktop";

  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  const [isInstalling, setIsInstalling] = useState(false);

  // Controlled by props or Zustand store
  const isOpen = propsIsOpen !== undefined ? propsIsOpen : isPWAInstallOpen || activeModal === "pwa-install";

  const handleClose = (e?: React.MouseEvent | React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    dismissPrompt(false);

    if (propsOnClose) {
      propsOnClose();
    }
    closePWAInstall();
    closeModal();
  };

  // Listen for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleInstallClick = async () => {
    if (canPromptDirectly) {
      setIsInstalling(true);
      try {
        const result = await promptInstall();
        if (result === "accepted") {
          handleClose();
        }
      } finally {
        setIsInstalling(false);
      }
    }
  };

  const features = [
    {
      icon: Zap,
      title: "Zero-Latency Launch",
      description: "Direct desktop/home screen launch without browser tabs or address bars.",
    },
    {
      icon: WifiOff,
      title: "Offline Intelligence",
      description: "Browse cached academic records, schedules, and directory without internet.",
    },
    {
      icon: Layers,
      title: "Native OS Workspace",
      description: "Dedicated standalone window with multi-tasking and keyboard shortcuts.",
    },
    {
      icon: ShieldCheck,
      title: "Encrypted Session",
      description: "Institutional end-to-end telemetry and automated security synchronization.",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-install-title"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-5"
        >
          {/* Frosted Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/70"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", damping: 28, stiffness: 360 }}
            className={cn(
              "relative z-10 w-full max-w-[580px] overflow-hidden rounded-[28px] bg-white text-text-primary",
              "border border-brand-border/90 shadow-[0_24px_64px_-12px_rgba(29,16,21,0.35)]",
            )}
          >
            {/* Top Luxury Banner with Avis World College Brand Palette */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#2a0e19] via-[#421b29] to-[#702b40] px-6 pb-6 pt-7 text-white">
              {/* Ambient Radiant Glow Circles */}
              <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-brand-red/25 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-14 -left-14 h-48 w-48 rounded-full bg-brand-light-red/15 blur-2xl" />

              {/* Close Button with Smooth Hover */}
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close installation dialog"
                className="group absolute right-4 top-4 z-30 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/80 transition-all hover:bg-white/20 hover:text-white focus:outline-none"
              >
                <X className="pointer-events-none h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
              </button>

              {/* Header Crest & Typography */}
              <div className="relative flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  {/* Glowing Emblem Pedestal */}
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white p-2.5 shadow-xl shadow-black/25 ring-4 ring-white/15">
                    <img
                      src={assets.avisLogo}
                      alt="Avis World College Crest"
                      className="h-full w-full object-contain"
                    />
                    {/* Live Institutional Pulse Badge */}
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                      <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
                    </span>
                  </div>
                </div>

                <div className="min-w-0 flex-1 pr-6">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/90 backdrop-blur-sm">
                    <Sparkles className="h-3 w-3 text-amber-300" />
                    <span>Official Desktop & Mobile PWA</span>
                  </div>
                  <h2
                    id="pwa-install-title"
                    className="font-cinzel mt-1 text-xl font-bold leading-tight tracking-tight text-white sm:text-xl"
                  >
                    Install Avis AMS
                  </h2>
                  <p className="mt-0.5 line-clamp-1 text-xs text-white/80">Admission Management System • Avis World College</p>
                </div>
              </div>

              {/* Device Tabs Selector */}
              {!isInstalled && (
                <div className="mt-5 flex items-center gap-1.5 rounded-xl bg-black/25 p-1 backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => setActiveTab("desktop")}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all duration-200",
                      activeTab === "desktop" ? "bg-white text-burgundy-primary shadow-sm" : "text-white/70 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    <Laptop className="h-3.5 w-3.5" />
                    <span>Desktop</span>
                    {platform === "windows" || platform === "macos" ? (
                      <span className="py-0.2 rounded-full bg-emerald-500/20 px-1.5 text-[9px] font-bold text-emerald-300">Current</span>
                    ) : null}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("ios")}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all duration-200",
                      activeTab === "ios" ? "bg-white text-burgundy-primary shadow-sm" : "text-white/70 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                    <span>iOS (Safari)</span>
                    {isIOS && <span className="py-0.2 rounded-full bg-emerald-500/20 px-1.5 text-[9px] font-bold text-emerald-300">Current</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("android")}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all duration-200",
                      activeTab === "android" ? "bg-white text-burgundy-primary shadow-sm" : "text-white/70 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    <MonitorSmartphone className="h-3.5 w-3.5" />
                    <span>Android / Other</span>
                    {platform === "android" && (
                      <span className="py-0.2 rounded-full bg-emerald-500/20 px-1.5 text-[9px] font-bold text-emerald-300">Current</span>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Modal Body Content */}
            <div className="space-y-4 p-5 sm:p-6">
              {isInstalled ? (
                /* Already Installed Banner */
                <div className="rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50 to-emerald-50/30 p-5 text-center">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="font-cinzel text-base font-bold text-emerald-950">Avis AMS is Installed</h3>
                  <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-emerald-800">
                    You are currently running the official Avis World College system. You can launch it directly from your applications menu, dock, or
                    home screen.
                  </p>
                </div>
              ) : (
                <>
                  {/* Tab Panels */}
                  <div className="overflow-hidden">
                    {/* 1. Desktop Tab */}
                    {activeTab === "desktop" && (
                      <motion.div
                        key="tab-desktop"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-3"
                      >
                        {/* Mini Desktop App Window Preview */}
                        <div className="rounded-2xl border border-brand-border bg-brand-bg/60 p-3.5">
                          <div className="mb-2 flex items-center justify-between border-b border-brand-border/60 pb-2">
                            <div className="flex items-center gap-1.5">
                              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                              <span className="ml-2 text-[11px] font-bold text-text-primary">Avis AMS • Standalone Application</span>
                            </div>
                            <span className="rounded bg-brand-light-red/80 px-1.5 py-0.5 text-[9px] font-bold text-brand-red">No Browser Tabs</span>
                          </div>

                          <div className="flex items-center gap-3 py-1">
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-burgundy-primary text-white shadow-sm">
                              <Download className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-text-primary">
                                {canPromptDirectly
                                  ? "Instant One-Click Installation Available"
                                  : browser === "chrome" || browser === "edge"
                                    ? "Install directly via Browser Address Bar"
                                    : "Pin to Dock or Taskbar"}
                              </p>
                              <p className="text-[11px] leading-snug text-text-secondary">
                                {canPromptDirectly
                                  ? "Click the button below to register Avis AMS in your Windows/Mac application menu."
                                  : "Click the install icon (⊕) in the URL bar or select 'Install Avis AMS' in settings."}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* 2. iOS Tab */}
                    {activeTab === "ios" && (
                      <motion.div
                        key="tab-ios"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="rounded-2xl border border-brand-border bg-brand-bg/60 p-4"
                      >
                        <p className="mb-3 flex items-center gap-2 text-xs font-bold text-text-primary">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-burgundy-primary text-[10px] font-bold text-white">
                            iOS
                          </span>
                          3-Step iPhone & iPad Setup:
                        </p>

                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                          <div className="flex items-start gap-2 rounded-xl border border-brand-border/60 bg-white p-2.5 shadow-sm">
                            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-light-red text-[11px] font-bold text-brand-red">
                              1
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-text-primary">Tap Share</p>
                              <p className="mt-0.5 text-[11px] leading-tight text-text-secondary">
                                Tap <Share className="inline h-3 w-3 text-brand-red" /> at bottom bar.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 rounded-xl border border-brand-border/60 bg-white p-2.5 shadow-sm">
                            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-light-red text-[11px] font-bold text-brand-red">
                              2
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-text-primary">Home Screen</p>
                              <p className="mt-0.5 text-[11px] leading-tight text-text-secondary">
                                Tap <PlusSquare className="inline h-3 w-3 text-brand-red" /> Add to Home Screen.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 rounded-xl border border-brand-border/60 bg-white p-2.5 shadow-sm">
                            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-light-red text-[11px] font-bold text-brand-red">
                              3
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-text-primary">Confirm Add</p>
                              <p className="mt-0.5 text-[11px] leading-tight text-text-secondary">
                                Tap <span className="font-semibold text-text-primary">&quot;Add&quot;</span> in top right.
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* 3. Android Tab */}
                    {activeTab === "android" && (
                      <motion.div
                        key="tab-android"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="rounded-2xl border border-brand-border bg-brand-bg/60 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shadow-sm">
                            <MonitorSmartphone className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-text-primary">
                              {canPromptDirectly ? "Direct Android APK / PWA Trigger Ready" : "Install via Chrome / Samsung Internet"}
                            </p>
                            <p className="mt-0.5 text-[11px] leading-snug text-text-secondary">
                              {canPromptDirectly
                                ? "Tap 'Install Now' below to add Avis AMS directly to your phone drawer."
                                : "Open browser menu (⋮) and select 'Install App' or 'Add to Home screen'."}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* 4 Crisp Feature Badges */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {features.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={idx}
                          className="group relative flex items-start gap-2.5 rounded-2xl border border-brand-border/80 bg-brand-bg/40 p-2.5 transition-all duration-200 hover:border-brand-accent/40 hover:bg-white hover:shadow-sm"
                        >
                          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl bg-brand-light-red/70 text-brand-red transition-transform duration-200 group-hover:scale-110">
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="line-clamp-1 text-[11px] font-bold leading-snug text-text-primary">{item.title}</h4>
                            <p className="mt-0.5 line-clamp-2 text-[10px] leading-tight text-text-secondary">{item.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Action Buttons & Bottom Controls */}
              <div className="space-y-3 pt-2">
                {isInstalled ? (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleClose}
                    className="h-10 w-full justify-center bg-gradient-to-r from-burgundy-primary to-brand-red text-xs font-bold shadow-md sm:text-sm"
                  >
                    Done
                  </Button>
                ) : canPromptDirectly ? (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleInstallClick}
                      disabled={isInstalling}
                      className={cn(
                        "group relative h-10 flex-1 justify-center gap-2 overflow-hidden py-2 text-xs font-bold sm:text-sm",
                        "bg-gradient-to-r from-burgundy-primary via-[#5a1e2f] to-brand-red text-white",
                        "shadow-md shadow-burgundy-primary/25 hover:shadow-burgundy-primary/40",
                      )}
                    >
                      {/* Ambient Sheen Sweep on Button */}
                      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />

                      {isInstalling ? (
                        <>
                          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Installing Application...</span>
                        </>
                      ) : (
                        <>
                          <Download className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" />
                          <span>Install Avis AMS Now</span>
                        </>
                      )}
                    </Button>

                    <Button
                      variant="secondary"
                      size="md"
                      onClick={handleClose}
                      className="h-10 justify-center py-2 text-xs text-text-secondary hover:text-text-primary sm:w-24 sm:text-sm"
                    >
                      Later
                    </Button>
                  </div>
                ) : activeTab === "ios" ? (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleClose}
                    className="h-10 w-full justify-center gap-2 bg-gradient-to-r from-burgundy-primary to-brand-red text-xs font-bold shadow-md sm:text-sm"
                  >
                    <span>Understood, Continue to AMS</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleClose}
                      className="h-10 flex-1 justify-center bg-gradient-to-r from-burgundy-primary to-brand-red text-xs font-bold shadow-md sm:text-sm"
                    >
                      Got It, I Will Install Later
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PWAInstallModal;
