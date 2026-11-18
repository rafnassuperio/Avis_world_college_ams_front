import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, RotateCcw, ArrowRight, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { toast } from "@/components/common/ToastMessage";
import { cn } from "@/lib/utils";

export interface OfflineBannerProps {
  className?: string;
  allowDismiss?: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  className,
  allowDismiss = true,
}) => {
  const { isOnline, isChecking, checkConnection } = useNetworkStatus();
  const [dismissed, setDismissed] = React.useState(false);

  // If connection is restored, reset dismissed state for the next time network drops
  React.useEffect(() => {
    if (isOnline) {
      setDismissed(false);
    }
  }, [isOnline]);

  if (isOnline || dismissed) {
    return null;
  }

  const handleRetry = async () => {
    const isNowOnline = await checkConnection();
    if (isNowOnline) {
      toast.success("Back Online", {
        description: "Your network connection has been restored.",
      });
    } else {
      toast.warning("Still Offline", {
        description: "Unable to reach the network. Please check your connection.",
      });
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={cn(
          "sticky top-0 z-50 w-full border-b border-brand-red/30 bg-palette-midnight text-white shadow-md",
          className,
        )}
      >
        <div className="mx-auto flex max-w-[1896px] items-center justify-between gap-3 px-4 py-2 sm:px-6 sm:py-2.5">
          {/* Left: Offline Status & Message */}
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-red/20 text-brand-light-red">
              <WifiOff className="h-4 w-4 text-palette-5" />
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 text-xs">
              <span className="font-semibold text-[#F1DDE0]">You are currently offline.</span>
              <span className="hidden text-palette-5/80 sm:inline">•</span>
              <span className="truncate text-palette-5/90">
                Some features may be limited until connection is restored.
              </span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-shrink-0 items-center gap-2">
            {/* Retry Button */}
            <button
              type="button"
              onClick={handleRetry}
              disabled={isChecking}
              className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-white/10 px-3 py-1 text-xs font-medium text-white transition-colors duration-150 hover:bg-white/20 active:scale-95 disabled:pointer-events-none disabled:opacity-60"
            >
              <RotateCcw
                className={cn(
                  "mr-1.5 h-3.5 w-3.5",
                  isChecking && "animate-spin",
                )}
              />
              <span>{isChecking ? "Checking..." : "Retry"}</span>
            </button>

            {/* View Diagnostics Page */}
            <Link
              to="/offline"
              className="hidden sm:inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-palette-5 transition-colors hover:text-white"
            >
              <span>Offline Guide</span>
              <ArrowRight className="h-3 w-3" />
            </Link>

            {/* Dismiss Banner Button */}
            {allowDismiss && (
              <button
                type="button"
                onClick={() => setDismissed(true)}
                title="Dismiss banner"
                className="flex h-6 w-6 items-center justify-center rounded-md text-palette-5/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OfflineBanner;

