import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Home, ArrowLeft, WifiOff, Activity, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { OfflineIllustration } from "./OfflineIllustration";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { toast } from "@/components/common/ToastMessage";
import { cn } from "@/lib/utils";

export interface OfflineFallbackProps {
  /**
   * Custom callback triggered when user requests reconnection retry.
   * If not provided, it actively tests connectivity and reloads/updates state.
   */
  onRetry?: () => void;
  /**
   * Whether to render with full-screen height (e.g. for standalone page or root fallback)
   */
  fullScreen?: boolean;
  /**
   * Custom title heading
   */
  title?: string;
  /**
   * Custom subtitle description
   */
  description?: string;
  /**
   * Whether to display the Return to Dashboard button
   */
  showHomeButton?: boolean;
  /**
   * Whether to display the Go Back button
   */
  showBackButton?: boolean;
  /**
   * Optional custom CSS class name
   */
  className?: string;
}

export const OfflineFallback: React.FC<OfflineFallbackProps> = ({
  onRetry,
  fullScreen = false,
  title = "You're Offline",
  description = "It looks like you've lost your internet connection. Please check your network cables or Wi-Fi settings.",
  showHomeButton = true,
  showBackButton = false,
  className,
}) => {
  const navigate = useNavigate();
  const { isOnline, isChecking, metrics, lastOnlineAt, checkConnection } = useNetworkStatus();
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const handleRetry = async () => {
    const isNowOnline = await checkConnection();
    if (isNowOnline) {
      toast.success("Connection Restored", {
        description: "You're back online! Synchronizing latest data...",
      });
      if (onRetry) {
        onRetry();
      } else {
        window.location.reload();
      }
    } else {
      toast.warning("Still Offline", {
        description: "Could not establish an active internet connection. Please verify your connection.",
      });
    }
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const formatLastOnline = (date: Date | null) => {
    if (!date) return "Unknown";
    try {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return "Unknown";
    }
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "flex w-full items-center justify-center p-4 sm:p-6 md:p-8",
        fullScreen ? "min-h-screen bg-brand-bg" : "min-h-[calc(100vh-140px)]",
        className,
      )}
    >
      <div className="flex w-full max-w-[1200px] flex-col items-center">
        {/* Main Card styled with Avis World College Brand Palette */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative w-full overflow-hidden rounded-[28px] border border-brand-border bg-brand-card p-6 shadow-sm sm:p-8 md:p-10"
        >
          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-8 md:gap-10">
            {/* Left: Custom Avis Offline SVG Illustration */}
            <div className="flex flex-shrink-0 items-center justify-center">
              <OfflineIllustration animate={!isOnline || isChecking} />
            </div>

            {/* Vertical Divider in Brand Burgundy Gradient */}
            <div
              className="hidden h-[58px] w-[3.5px] flex-shrink-0 rounded-full bg-gradient-to-b from-burgundy-primary to-brand-red opacity-90 sm:block md:h-[64px]"
              aria-hidden="true"
            />

            {/* Right: Typography & Action Controls */}
            <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
              {/* Status Badge */}
              <span className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-brand-red/20 bg-brand-light-red/60 px-3 py-0.5 text-[11px] font-semibold tracking-wide text-burgundy-primary">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-red" />
                {isOnline ? "Network Connected" : "Connection Status: Offline"}
              </span>

              <h1 className="text-3xl font-normal tracking-tight text-text-primary sm:text-4xl">{title}</h1>

              <p className="mt-1 max-w-lg text-sm font-light italic text-text-secondary sm:mt-1.5 sm:text-base">
                {description}
              </p>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                {/* Try Again / Check Connection */}
                <button
                  type="button"
                  onClick={handleRetry}
                  disabled={isChecking}
                  className="group inline-flex cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-brand-red to-burgundy-primary px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-brand-red/20 transition-all duration-200 hover:shadow-lg hover:shadow-brand-red/30 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red/40 focus-visible:ring-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-70 sm:text-sm"
                >
                  <RotateCcw
                    className={cn(
                      "mr-2 h-4 w-4 transition-transform duration-300",
                      isChecking ? "animate-spin" : "group-hover:-rotate-45",
                    )}
                  />
                  {isChecking ? "Checking Connection..." : "Try Again"}
                </button>

                {/* Optional Go Back Button */}
                {showBackButton && (
                  <button
                    type="button"
                    onClick={handleGoBack}
                    className="group inline-flex cursor-pointer items-center justify-center rounded-xl border border-brand-border bg-white/80 px-5 py-2.5 text-xs font-medium text-text-primary shadow-sm transition-all duration-200 hover:border-burgundy-primary/40 hover:bg-brand-light-red/30 hover:text-burgundy-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-primary/30 focus-visible:ring-offset-2 active:scale-95 sm:text-sm"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
                    Go Back
                  </button>
                )}

                {/* Return to Dashboard */}
                {showHomeButton && (
                  <Link
                    to="/"
                    className="group inline-flex cursor-pointer items-center justify-center rounded-xl border border-brand-border bg-white/80 px-5 py-2.5 text-xs font-medium text-text-primary shadow-sm transition-all duration-200 hover:border-burgundy-primary/40 hover:bg-brand-light-red/30 hover:text-burgundy-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-primary/30 focus-visible:ring-offset-2 active:scale-95 sm:text-sm"
                  >
                    <Home className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                    Return to Dashboard
                  </Link>
                )}

                {/* Toggle Diagnostics */}
                <button
                  type="button"
                  onClick={() => setShowDiagnostics((prev) => !prev)}
                  className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-brand-border px-3.5 py-2.5 text-xs font-medium text-text-muted transition-all duration-200 hover:border-burgundy-primary/40 hover:text-burgundy-primary focus:outline-none sm:text-sm"
                  title="View network status diagnostics"
                >
                  <Activity className="mr-1.5 h-3.5 w-3.5" />
                  <span>Diagnostics</span>
                  {showDiagnostics ? (
                    <ChevronUp className="ml-1 h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="ml-1 h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Collapsible Network Diagnostics & Troubleshooting Section */}
        <AnimatePresence>
          {showDiagnostics && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="mt-4 w-full overflow-hidden rounded-2xl border border-brand-border bg-brand-card p-5 shadow-sm text-left"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                {/* Diagnostics Metrics */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <WifiOff className="h-4 w-4 text-brand-red" />
                    <h3 className="text-sm font-semibold text-text-primary">Connection Diagnostics</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-xs sm:grid-cols-4">
                    <div className="rounded-xl border border-brand-border bg-brand-bg/70 p-2.5">
                      <span className="text-[11px] text-text-muted">Network State</span>
                      <p className={cn("mt-0.5 font-semibold", isOnline ? "text-success" : "text-brand-red")}>
                        {isOnline ? "Online" : "Disconnected"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-brand-border bg-brand-bg/70 p-2.5">
                      <span className="text-[11px] text-text-muted">Connection Type</span>
                      <p className="mt-0.5 font-medium uppercase text-text-primary">
                        {metrics.effectiveType || "N/A"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-brand-border bg-brand-bg/70 p-2.5">
                      <span className="text-[11px] text-text-muted">Latency (RTT)</span>
                      <p className="mt-0.5 font-medium text-text-primary">
                        {metrics.rtt ? `${metrics.rtt} ms` : "No Signal"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-brand-border bg-brand-bg/70 p-2.5">
                      <span className="text-[11px] text-text-muted">Last Active</span>
                      <p className="mt-0.5 font-medium text-text-primary">
                        {formatLastOnline(lastOnlineAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Troubleshooting Checklist */}
                <div className="flex-1 rounded-xl border border-brand-light-red/80 bg-brand-light-red/20 p-3.5 md:max-w-md">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-burgundy-primary">
                    <AlertTriangle className="h-3.5 w-3.5 text-brand-red" />
                    <span>Quick Troubleshooting Steps:</span>
                  </div>
                  <ul className="mt-2 space-y-1.5 text-xs text-text-secondary">
                    <li className="flex items-start gap-1.5">
                      <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-burgundy-primary" />
                      <span>Ensure your Wi-Fi or router connection is turned on and active.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-burgundy-primary" />
                      <span>Verify that Airplane Mode is turned off on your device.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-burgundy-primary" />
                      <span>If using ethernet, confirm the cable is securely plugged in.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OfflineFallback;
