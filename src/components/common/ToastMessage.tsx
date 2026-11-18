import React, { useEffect, useState, useSyncExternalStore, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// ==========================================
// Types & Definitions
// ==========================================

export type ToastType = "success" | "warning" | "error" | "info" | "brand";

export type ToastPosition = "top-right" | "top-center" | "top-left" | "bottom-right" | "bottom-center" | "bottom-left";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: React.ReactNode;
  description?: React.ReactNode;
  duration?: number;
  onClose?: () => void;
  showCloseButton?: boolean;
}

export interface ToastOptions {
  id?: string;
  duration?: number;
  description?: React.ReactNode;
  showCloseButton?: boolean;
  onClose?: () => void;
}

// ==========================================
// Avis World College Brand Palette Specs (from globals.css)
// ==========================================

interface ToastTypeConfig {
  bg: string;
  border: string;
  textColor: string;
  closeColor: string;
  shadow: string;
  renderIcon: () => React.ReactNode;
}

const TOAST_CONFIGS: Record<ToastType, ToastTypeConfig> = {
  // Success: Uses Avis Theme --success (#16a34a) & --success-light (#ebf9f1)
  success: {
    bg: "var(--toast-success-bg, #ebf9f1)",
    border: "var(--toast-success-border, #16a34a)",
    textColor: "var(--toast-success-text, #14532d)",
    closeColor: "var(--toast-success-border, #16a34a)",
    shadow: "0 4px 20px -2px rgba(22, 163, 74, 0.16)",
    renderIcon: () => (
      <svg
        className="h-4 w-4 flex-shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="10.5"
          fill="#16A34A"
        />
        <path
          d="M7.75 12.25L10.5 15L16.25 9.25"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },

  // Warning: Warm amber harmonized with the Avis rich wine tones
  warning: {
    bg: "var(--toast-warning-bg, #fff8eb)",
    border: "var(--toast-warning-border, #d97706)",
    textColor: "var(--toast-warning-text, #92400e)",
    closeColor: "var(--toast-warning-border, #d97706)",
    shadow: "0 4px 20px -2px rgba(217, 119, 6, 0.16)",
    renderIcon: () => (
      <svg
        className="h-4 w-4 flex-shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M10.268 3.84c.77-1.333 2.694-1.333 3.464 0l8.038 13.922c.77 1.333-.192 3.002-1.732 3.002H3.962c-1.54 0-2.502-1.669-1.732-3.002L10.268 3.84z"
          fill="#D97706"
        />
        <path
          d="M12 9v4.5"
          stroke="#FFFFFF"
          strokeWidth="2.1"
          strokeLinecap="round"
        />
        <circle
          cx="12"
          cy="16.5"
          r="1.1"
          fill="#FFFFFF"
        />
      </svg>
    ),
  },

  // Error: Uses Avis Theme --brand-red (#A64C61) & --burgundy-primary (#702B40)
  error: {
    bg: "var(--toast-error-bg, #fcedf0)",
    border: "var(--toast-error-border, #a64c61)",
    textColor: "var(--toast-error-text, #702b40)",
    closeColor: "var(--toast-error-border, #a64c61)",
    shadow: "0 4px 20px -2px rgba(166, 76, 97, 0.18)",
    renderIcon: () => (
      <svg
        className="h-4 w-4 flex-shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="10.5"
          fill="#A64C61"
        />
        <path
          d="M9 9L15 15M15 9L9 15"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },

  // Info: Uses Avis Signature Rich Burgundy (#702B40) & Dark Wine (#421B29)
  info: {
    bg: "var(--toast-info-bg, #fcf5f7)",
    border: "var(--toast-info-border, #702b40)",
    textColor: "var(--toast-info-text, #421b29)",
    closeColor: "var(--toast-info-border, #702b40)",
    shadow: "0 4px 20px -2px rgba(112, 43, 64, 0.18)",
    renderIcon: () => (
      <svg
        className="h-4 w-4 flex-shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="10.5"
          fill="#702B40"
        />
        <path
          d="M12 8v5"
          stroke="#FFFFFF"
          strokeWidth="2.1"
          strokeLinecap="round"
        />
        <circle
          cx="12"
          cy="16"
          r="1.1"
          fill="#FFFFFF"
        />
      </svg>
    ),
  },

  // Brand: Pure Avis College Burgundy & Berry Rose Accent
  brand: {
    bg: "var(--toast-brand-bg, #fcf5f7)",
    border: "var(--toast-brand-border, #702b40)",
    textColor: "var(--toast-brand-text, #421b29)",
    closeColor: "var(--toast-brand-border, #702b40)",
    shadow: "0 4px 20px -2px rgba(112, 43, 64, 0.18)",
    renderIcon: () => (
      <svg
        className="h-4 w-4 flex-shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="10.5"
          fill="#702B40"
        />
        <path
          d="M12 6.5l1.6 3.6 3.9.4-2.9 2.6.8 3.9-3.4-2-3.4 2 .8-3.9-2.9-2.6 3.9-.4z"
          fill="#FFFFFF"
        />
      </svg>
    ),
  },
};

// ==========================================
// Global Toast State Management
// ==========================================

let toastSubscribers: Array<() => void> = [];
let activeToasts: ToastItem[] = [];

const notifySubscribers = () => {
  toastSubscribers.forEach((subscriber) => subscriber());
};

const toastStore = {
  subscribe(callback: () => void) {
    toastSubscribers.push(callback);
    return () => {
      toastSubscribers = toastSubscribers.filter((sub) => sub !== callback);
    };
  },
  getSnapshot() {
    return activeToasts;
  },
  add(item: ToastItem) {
    const exists = activeToasts.some((t) => t.id === item.id);
    if (exists) {
      activeToasts = activeToasts.map((t) => (t.id === item.id ? item : t));
    } else {
      activeToasts = [...activeToasts, item];
    }
    notifySubscribers();
  },
  remove(id: string) {
    const item = activeToasts.find((t) => t.id === id);
    if (item?.onClose) {
      item.onClose();
    }
    activeToasts = activeToasts.filter((t) => t.id !== id);
    notifySubscribers();
  },
  clear() {
    activeToasts.forEach((item) => {
      if (item.onClose) item.onClose();
    });
    activeToasts = [];
    notifySubscribers();
  },
};

let toastCounter = 0;
const generateId = () => `toast_${Date.now()}_${++toastCounter}`;

export const toast = {
  show(type: ToastType, message: React.ReactNode, options?: ToastOptions): string {
    const id = options?.id || generateId();
    toastStore.add({
      id,
      type,
      message,
      description: options?.description,
      duration: options?.duration ?? 3000,
      showCloseButton: options?.showCloseButton ?? true,
      onClose: options?.onClose,
    });
    return id;
  },
  success(message: React.ReactNode, options?: ToastOptions): string {
    return toast.show("success", message, options);
  },
  warning(message: React.ReactNode, options?: ToastOptions): string {
    return toast.show("warning", message, options);
  },
  error(message: React.ReactNode, options?: ToastOptions): string {
    return toast.show("error", message, options);
  },
  info(message: React.ReactNode, options?: ToastOptions): string {
    return toast.show("info", message, options);
  },
  brand(message: React.ReactNode, options?: ToastOptions): string {
    return toast.show("brand", message, options);
  },
  dismiss(id: string) {
    toastStore.remove(id);
  },
  clear() {
    toastStore.clear();
  },
};

export const useToast = () => {
  const toasts = useSyncExternalStore(toastStore.subscribe, toastStore.getSnapshot, toastStore.getSnapshot);

  return {
    toasts,
    toast,
    dismiss: toast.dismiss,
    clear: toast.clear,
  };
};

// ==========================================
// Individual Toast Message Component
// ==========================================

export interface ToastMessageProps {
  id?: string;
  type?: ToastType;
  message: React.ReactNode;
  description?: React.ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
  className?: string;
  duration?: number;
  customIcon?: React.ReactNode;
}

export const ToastMessage: React.FC<ToastMessageProps> = ({
  id,
  type = "info",
  message,
  description,
  onClose,
  showCloseButton = true,
  className,
  duration,
  customIcon,
}) => {
  const config = TOAST_CONFIGS[type] || TOAST_CONFIGS.info;
  const [isPaused, setIsPaused] = useState(false);
  const hasDescription = Boolean(description);

  // Auto-dismiss countdown when duration is specified
  useEffect(() => {
    if (!duration || duration <= 0 || !onClose || isPaused) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose, isPaused]);

  return (
    <div
      role="status"
      aria-live="polite"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        backgroundColor: config.bg,
        borderColor: config.border,
        boxShadow: config.shadow,
      }}
      className={cn(
        "relative flex w-full max-w-[470px] select-none border-[1.5px] transition-shadow duration-200",
        hasDescription
          ? "items-start gap-2.5 rounded-[20px] px-4 py-2.5"
          : "min-h-[40px] items-center gap-2.5 rounded-full px-4 py-1.5",
        className,
      )}
    >
      {/* Leading Icon Badge */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 450, damping: 22, delay: 0.04 }}
        className={cn(
          "flex flex-shrink-0 items-center justify-center",
          hasDescription && "mt-0.5",
        )}
      >
        {customIcon ?? config.renderIcon()}
      </motion.div>

      {/* Message & Optional Description */}
      <motion.div
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.24, delay: 0.06 }}
        className="min-w-0 flex-1"
      >
        <div
          style={{ color: config.textColor }}
          className="text-[13px] font-semibold leading-5 tracking-[-0.01em]"
        >
          {message}
        </div>
        {description && (
          <div
            style={{ color: config.textColor }}
            className="mt-0.5 text-xs leading-relaxed opacity-85"
          >
            {description}
          </div>
        )}
      </motion.div>

      {/* Trailing Close Button */}
      {showCloseButton && (
        <motion.button
          type="button"
          whileHover={{ scale: 1.15, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 450, damping: 20 }}
          onClick={(e) => {
            e.stopPropagation();
            if (onClose) {
              onClose();
            } else if (id) {
              toast.dismiss(id);
            }
          }}
          aria-label="Dismiss notification"
          className={cn(
            "ml-auto flex h-6 w-6 flex-shrink-0 items-center justify-center",
            "rounded-full transition-colors duration-150 ease-out",
            "hover:bg-black/5 focus:outline-none",
            hasDescription ? "self-start -mt-0.5 -mr-1" : "-mr-1",
          )}
        >
          <X
            className="h-3.5 w-3.5"
            style={{ color: config.closeColor }}
            strokeWidth={2.4}
          />
        </motion.button>
      )}
    </div>
  );
};

// ==========================================
// Toaster Container Component (Stack Deck & Directional Animations)
// ==========================================

const POSITION_CLASSES: Record<ToastPosition, string> = {
  "top-right": "top-6 right-6 items-end",
  "top-center": "top-6 left-1/2 -translate-x-1/2 items-center",
  "top-left": "top-6 left-6 items-start",
  "bottom-right": "bottom-6 right-6 items-end",
  "bottom-center": "bottom-6 left-1/2 -translate-x-1/2 items-center",
  "bottom-left": "bottom-6 left-6 items-start",
};

export interface ToasterProps {
  position?: ToastPosition;
  className?: string;
  stacked?: boolean;
  expandOnHover?: boolean;
  maxVisible?: number;
}

export const Toaster: React.FC<ToasterProps> = ({ position = "top-right", className, stacked = true, expandOnHover = true, maxVisible = 3 }) => {
  const { toasts, dismiss } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [isManuallyExpanded, setIsManuallyExpanded] = useState(false);

  const isExpanded = (expandOnHover && isHovered) || isManuallyExpanded;
  const isRight = position.includes("right");
  const isLeft = position.includes("left");
  const isTop = position.includes("top");
  const direction = isTop ? 1 : -1;

  // Most recent notification at the top/front of the stack
  const reversedToasts = [...toasts].reverse();

  const handleDismiss = useCallback(
    (id: string) => {
      dismiss(id);
    },
    [dismiss],
  );

  if (toasts.length === 0) {
    return null;
  }

  // Fallback linear list if stacked mode is explicitly disabled
  if (!stacked) {
    return (
      <div
        aria-live="polite"
        className={cn(
          "pointer-events-none fixed z-[9999] flex max-w-[92vw] flex-col gap-3.5 sm:max-w-[560px]",
          POSITION_CLASSES[position],
          className,
        )}
      >
        <AnimatePresence
          mode="popLayout"
          initial={false}
        >
          {toasts.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: isRight ? 90 : isLeft ? -90 : 0, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: isRight ? 110 : -110, scale: 0.88 }}
              transition={{ type: "spring", stiffness: 360, damping: 24, mass: 0.8 }}
              className="pointer-events-auto w-full"
            >
              <ToastMessage
                id={item.id}
                type={item.type}
                message={item.message}
                description={item.description}
                duration={item.duration}
                showCloseButton={item.showCloseButton}
                onClose={() => handleDismiss(item.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  // Compact Stack Constants (Decreased gap & faster transition)
  const hasMultiLineToast = reversedToasts.some((t) => Boolean(t.description));
  const baseCardHeight = hasMultiLineToast ? 64 : 44;
  const EXPANDED_GAP = 6; // Decreased gap between the two toasts
  const STEP_EXPANDED = baseCardHeight + EXPANDED_GAP;
  const STEP_COLLAPSED = 6; // Tight, compact 6px stack peek

  const totalCount = reversedToasts.length;
  const collapsedHeight = baseCardHeight + Math.min(totalCount - 1, 2) * STEP_COLLAPSED;
  const expandedHeight = totalCount * STEP_EXPANDED + (totalCount > 1 ? 32 : 0);

  return (
    <div
      aria-live="polite"
      className={cn("pointer-events-none fixed z-[9999] flex w-full max-w-[92vw] sm:max-w-[440px]", POSITION_CLASSES[position], className)}
    >
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          height: `${isExpanded ? expandedHeight : collapsedHeight}px`,
          transition: "height 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className="pointer-events-auto relative w-full select-none"
      >
        {/* Counter & Expand / Collapse Pill Badge */}
        {totalCount > 1 && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.8, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsManuallyExpanded((prev) => !prev);
            }}
            title={isExpanded ? "Collapse notifications" : "Expand all notifications"}
            className={cn(
              "absolute z-[120] flex items-center gap-1.5 rounded-full border border-brand-border bg-white/95 px-2.5 py-0.5",
              "text-[10.5px] font-semibold text-burgundy-primary shadow-[0_2px_8px_rgba(66,27,41,0.08)] backdrop-blur-md",
              "pointer-events-auto cursor-pointer transition-all duration-150 hover:scale-105 hover:bg-brand-bg active:scale-95",
              isTop ? "-top-3 right-4" : "-bottom-3 right-4",
            )}
          >
            <span className="flex h-1.5 w-1.5 rounded-full bg-burgundy-primary" />
            <span>{isExpanded ? "Collapse" : `+${totalCount - 1} more`}</span>
          </motion.button>
        )}

        {/* Stack of Animated Cards */}
        <AnimatePresence
          mode="popLayout"
          initial={false}
        >
          {reversedToasts.map((item, index) => {
            const isFrontCard = index === 0;
            const isVisibleInStack = index < maxVisible;

            // Tight, compact coordinates for Stack vs Expanded
            const yCollapsed = index * STEP_COLLAPSED * direction;
            const yExpanded = index * STEP_EXPANDED * direction;
            const scaleCollapsed = Math.max(0.92, 1 - index * 0.035);
            const opacityCollapsed = isVisibleInStack ? Math.max(0.45, 1 - index * 0.2) : 0;

            return (
              <motion.div
                key={item.id}
                layout
                initial={{
                  opacity: 0,
                  x: isRight ? 80 : isLeft ? -80 : 0,
                  y: isTop ? -20 : 20,
                  scale: 0.94,
                  filter: "blur(3px)",
                }}
                animate={{
                  opacity: isExpanded ? 1 : opacityCollapsed,
                  x: 0,
                  y: isExpanded ? yExpanded : yCollapsed,
                  scale: isExpanded ? 1 : scaleCollapsed,
                  filter: "blur(0px)",
                }}
                exit={{
                  opacity: 0,
                  x: isRight ? 95 : isLeft ? -95 : 0,
                  scale: 0.88,
                  filter: "blur(3px)",
                  transition: {
                    duration: 0.18,
                    ease: [0.36, 0, 0.66, -0.56],
                  },
                }}
                transition={{
                  type: "spring",
                  stiffness: 480,
                  damping: 28,
                  mass: 0.65,
                  filter: { duration: 0.2, ease: "easeOut" },
                  layout: {
                    type: "spring",
                    stiffness: 480,
                    damping: 30,
                  },
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={{
                  left: isRight ? 0.08 : 0.8,
                  right: isRight ? 0.8 : 0.08,
                }}
                onDragEnd={(_e, info) => {
                  const threshold = 60;
                  const velocityThreshold = 240;
                  if (isRight) {
                    if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
                      handleDismiss(item.id);
                    }
                  } else if (isLeft) {
                    if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
                      handleDismiss(item.id);
                    }
                  } else {
                    if (Math.abs(info.offset.x) > threshold || Math.abs(info.velocity.x) > velocityThreshold) {
                      handleDismiss(item.id);
                    }
                  }
                }}
                style={{
                  position: "absolute",
                  top: isTop ? 0 : undefined,
                  bottom: !isTop ? 0 : undefined,
                  left: 0,
                  right: 0,
                  zIndex: 100 - index,
                  pointerEvents: isExpanded || isFrontCard ? "auto" : "none",
                }}
                className={cn("w-full cursor-grab active:cursor-grabbing", !isExpanded && !isFrontCard && "cursor-pointer")}
                onClick={() => {
                  if (!isExpanded && !isFrontCard) {
                    setIsManuallyExpanded(true);
                  }
                }}
              >
                <ToastMessage
                  id={item.id}
                  type={item.type}
                  message={item.message}
                  description={item.description}
                  duration={isExpanded ? 0 : item.duration}
                  showCloseButton={item.showCloseButton}
                  onClose={() => handleDismiss(item.id)}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Clear All Button when Expanded */}
        {isExpanded && totalCount > 1 && (
          <motion.div
            initial={{ opacity: 0, y: isTop ? 6 : -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              top: isTop ? `${totalCount * STEP_EXPANDED + 4}px` : undefined,
              bottom: !isTop ? `${totalCount * STEP_EXPANDED + 4}px` : undefined,
              left: 0,
              right: 0,
              zIndex: 110,
            }}
            className="pointer-events-auto flex justify-center"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toast.clear();
              }}
              className={cn(
                "flex items-center gap-1 rounded-full border border-brand-border bg-white/95 px-2.5 py-0.5",
                "text-[11px] font-semibold text-burgundy-primary shadow-sm backdrop-blur-md",
                "cursor-pointer transition-all duration-150 hover:bg-brand-light-red/30 hover:text-brand-red active:scale-95",
              )}
            >
              <span>Clear all ({totalCount})</span>
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Toaster;
