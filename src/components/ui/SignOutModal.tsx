import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { LogOut, X, ShieldAlert, ShieldCheck, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { currentUser as defaultUser } from "@/data/mockData";
import { UserProfile } from "@/types";
import { ROUTES } from "@/app/routes";
import { toast } from "@/components/common/ToastMessage";
import { cn } from "@/lib/utils";

export interface SignOutModalProps {
  /**
   * Explicit open state. If omitted, the modal will automatically bind to
   * `activeModal === "sign-out" || activeModal === "logout"` in the global app store.
   */
  isOpen?: boolean;
  /**
   * Callback fired when closing the modal without signing out.
   */
  onClose?: () => void;
  /**
   * Optional custom logout execution logic.
   * If omitted, performs standard safe logout: triggers confirmation toast,
   * closes modal, and redirects to root route.
   */
  onConfirm?: () => void | Promise<void>;
  /**
   * Profile of the user currently signing out.
   * Defaults to the global `adminProfile` or system `currentUser`.
   */
  user?: UserProfile;
  /**
   * External loading state indicator.
   */
  isLoading?: boolean;
  /**
   * Modal main title heading.
   */
  title?: string;
  /**
   * Modal descriptive subtitle.
   */
  description?: string;
  /**
   * Primary confirmation button label.
   */
  confirmText?: string;
  /**
   * Secondary cancellation button label.
   */
  cancelText?: string;
}

/**
 * SignOutModal - Institutional Sign-Out Confirmation Modal
 *
 * Designed exclusively for Avis World College AMS.
 * Features a floating elevated logout emblem badge, current administrator identity preview,
 * session security advisory callout, optional local workspace cache clearing toggle,
 * and high-contrast dual action buttons matching the burgundy/brand-red design system.
 */
export const SignOutModal: React.FC<SignOutModalProps> = ({
  isOpen: propsIsOpen,
  onClose: propsOnClose,
  onConfirm: propsOnConfirm,
  user: propsUser,
  isLoading: propsIsLoading = false,
  title = "Sign Out of Avis AMS?",
  description = "You are about to sign out of your institutional administrator account. Please verify that all pending records, forms, and transactions are saved.",
  confirmText = "Yes, Sign Out",
  cancelText = "Stay Signed In",
}) => {
  const navigate = useNavigate();
  const activeModal = useAppStore((state) => state.activeModal);
  const modalData = useAppStore((state) => state.modalData);
  const adminProfile = useAppStore((state) => state.adminProfile);
  const closeModal = useAppStore((state) => state.closeModal);

  const isControlled = propsIsOpen !== undefined;
  const isStoreActive =
    activeModal === "sign-out" || activeModal === "logout" || (activeModal === "settings" && modalData?.tab === "logout");

  const isOpen = isControlled ? propsIsOpen : isStoreActive;
  const activeUser: UserProfile = propsUser || adminProfile || defaultUser;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clearDeviceCache, setClearDeviceCache] = useState(false);

  const isBusy = propsIsLoading || isSubmitting;

  const handleClose = () => {
    if (isBusy) return;
    if (propsOnClose) {
      propsOnClose();
    }
    if (!isControlled && isStoreActive) {
      closeModal();
    }
  };

  // Keyboard navigation & body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isBusy) {
        handleClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isBusy]);

  const handleConfirmSignOut = async () => {
    try {
      setIsSubmitting(true);

      if (propsOnConfirm) {
        await propsOnConfirm();
      } else {
        // Invalidate active auth session
        useAuthStore.getState().logout();

        // Standard safe sign out sequence
        if (clearDeviceCache) {
          try {
            sessionStorage.clear();
          } catch {
            // Ignore storage restrictions
          }
        }

        // Display confirmation feedback toast
        toast.info("Signed Out Successfully", {
          description: `Administrator session for ${activeUser.name} has been safely terminated.`,
        });

        // Navigate to login route
        navigate(ROUTES.LOGIN);
      }

      handleClose();
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Sign Out Encountered an Issue", {
        description: "Please try again or close your browser tab.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="signout-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6"
        >
          {/* Backdrop with frosted dark blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/70"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 12 }}
            transition={{ type: "spring", damping: 26, stiffness: 360 }}
            className="relative z-10 w-full max-w-md rounded-[30px] border border-brand-border/70 bg-white px-6 pb-6 pt-12 text-center shadow-2xl shadow-burgundy/15 sm:px-7 sm:pb-7 sm:pt-14"
          >
            {/* Top Close Button */}
            <button
              type="button"
              disabled={isBusy}
              onClick={handleClose}
              className="absolute right-4 top-4 rounded-full p-2 text-text-muted transition-colors hover:bg-brand-bg hover:text-text-primary disabled:opacity-40"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Floating Top Circular Emblem Badge */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 sm:-top-11">
              <div className="relative">
                {/* Subtle Ambient Pulse Ring */}
                <div className="absolute -inset-1 rounded-full bg-brand-red/20 blur-sm" />

                {/* Primary Emblem Container */}
                <div className="sm:h-22 sm:w-22 relative flex h-20 w-20 items-center justify-center rounded-full border-[5px] border-white bg-gradient-to-br from-brand-light-red via-[#FFF6F7] to-[#FCE8EB] shadow-xl shadow-brand-red/15 sm:border-[6px]">
                  <LogOut className="h-8 w-8 stroke-[2.2] text-brand-red transition-transform duration-300 sm:h-9 sm:w-9" />
                </div>
              </div>
            </div>

            {/* Modal Heading */}
            <h3
              id="signout-modal-title"
              className="text-lg font-bold tracking-tight text-text-primary sm:text-xl"
            >
              {title}
            </h3>

            {/* Modal Description */}
            <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-text-secondary sm:text-[13px]">{description}</p>

            {/* Current Active User Profile Snapshot Card */}
            <div className="mt-5 rounded-2xl border border-brand-border/80 bg-brand-bg/60 p-3.5 text-left sm:p-4">
              <div className="flex items-center gap-3">
                {/* Avatar with Online Glow Indicator */}
                <div className="relative flex-shrink-0">
                  <img
                    src={activeUser.avatarUrl || "/avis-emblem.png"}
                    alt={activeUser.name}
                    className="shadow-xs h-11 w-11 rounded-full border-2 border-white object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/avis-emblem.png";
                    }}
                  />
                  <span className="absolute bottom-0 right-0 flex h-3 w-3">
                    <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                  </span>
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-xs font-bold text-text-primary sm:text-sm">{activeUser.name}</span>
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-burgundy-primary/10 px-2 py-0.5 text-[9.5px] font-bold text-burgundy-primary">
                      <ShieldCheck className="h-3 w-3" />
                      Super Admin
                    </span>
                  </div>
                  <p className="truncate text-[11px] text-text-muted">{activeUser.email}</p>
                  <p className="truncate text-[10.5px] font-medium text-text-secondary">
                    {activeUser.college || "Avis World College"} • Central Admin
                  </p>
                </div>
              </div>
            </div>

            {/* Session Advisory Notice */}
            <div className="mt-3.5 flex items-start gap-2.5 rounded-xl border border-amber-200/70 bg-amber-50/60 p-3 text-left">
              <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-amber-900">Active Session Termination</p>
                <p className="mt-0.5 text-[10.5px] leading-relaxed text-amber-800/80">
                  Your authenticated session token will be revoked. You will need to enter your administrative credentials to log back in.
                </p>
              </div>
            </div>

            {/* Optional Device Cache Reset Checkbox */}
            <div className="mt-3.5 flex items-center justify-between rounded-xl px-1 py-0.5 text-left">
              <label
                htmlFor="clear-device-cache"
                className="flex cursor-pointer items-center gap-2 text-[11px] font-medium text-text-secondary hover:text-text-primary"
              >
                <input
                  id="clear-device-cache"
                  type="checkbox"
                  checked={clearDeviceCache}
                  onChange={(e) => setClearDeviceCache(e.target.checked)}
                  disabled={isBusy}
                  className="h-3.5 w-3.5 rounded border-brand-border text-brand-red accent-brand-red focus:ring-brand-red/30"
                />
                <span>Clear temporary session cache on this browser</span>
              </label>
            </div>

            {/* Action Buttons: Stacked Full-Width Pills */}
            <div className="mt-5 flex flex-col gap-2.5">
              <button
                type="button"
                disabled={isBusy}
                onClick={handleConfirmSignOut}
                className={cn(
                  "group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl px-5 py-3 text-xs font-bold text-white transition-all duration-200 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm",
                  "hover:from-brand-dark-red bg-gradient-to-r from-brand-red via-[#BE2143] to-burgundy-primary shadow-lg shadow-brand-red/20 hover:to-burgundy-hover hover:shadow-brand-red/30",
                )}
              >
                {/* Subtle Ambient Sheen sweep on button hover */}
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />

                {isBusy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing Out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                    <span>{confirmText}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isBusy}
                onClick={handleClose}
                className="w-full rounded-2xl border border-brand-border/80 bg-white py-2.5 text-xs font-semibold text-text-secondary transition-all hover:bg-brand-bg hover:text-text-primary active:scale-[0.985] disabled:opacity-50 sm:text-sm"
              >
                {cancelText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default SignOutModal;
