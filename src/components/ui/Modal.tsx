import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Maximize2, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { smoothEase } from "@/components/animations/transitions";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerIcon?: React.ReactNode;
  headerActions?: React.ReactNode;
  customHeader?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";
  className?: string;
  bodyClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
  backdropClassName?: string;
  containerClassName?: string;
  fullScreen?: boolean;
  showFullScreenToggle?: boolean;
  onFullScreenChange?: (isFullScreen: boolean) => void;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  hideCloseButton?: boolean;
  hideHeader?: boolean;
  topAccentBar?: boolean;
  doubleClickHeaderToToggleFullScreen?: boolean;
  usePortal?: boolean;
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.24, ease: smoothEase },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.18, ease: smoothEase },
  },
};

const modalVariants = {
  hidden: (isFullScreen: boolean) => ({
    opacity: 0,
    scale: isFullScreen ? 0.985 : 0.95,
    y: isFullScreen ? 8 : 16,
  }),
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 340,
      damping: 28,
      mass: 0.8,
    },
  },
  exit: (isFullScreen: boolean) => ({
    opacity: 0,
    scale: isFullScreen ? 0.985 : 0.96,
    y: isFullScreen ? 6 : 12,
    transition: {
      duration: 0.18,
      ease: smoothEase,
    },
  }),
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  headerIcon,
  headerActions,
  customHeader,
  footer,
  children,
  maxWidth = "lg",
  className,
  bodyClassName,
  headerClassName,
  footerClassName,
  backdropClassName,
  containerClassName,
  fullScreen = false,
  showFullScreenToggle,
  onFullScreenChange,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  hideCloseButton = false,
  hideHeader = false,
  topAccentBar = true,
  doubleClickHeaderToToggleFullScreen = true,
  usePortal = true,
}) => {
  const [isFullScreen, setIsFullScreen] = useState(fullScreen);

  // Synchronize internal fullscreen state when modal opens or fullScreen prop changes
  useEffect(() => {
    if (isOpen) {
      setIsFullScreen(fullScreen);
    }
  }, [isOpen, fullScreen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && closeOnEscape) {
        onClose();
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
  }, [isOpen, onClose, closeOnEscape]);

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    full: "max-w-full",
  };

  const canToggleFullScreen = showFullScreenToggle !== undefined ? showFullScreenToggle : fullScreen;

  const handleToggleFullScreen = useCallback(() => {
    setIsFullScreen((prev) => {
      const next = !prev;
      onFullScreenChange?.(next);
      return next;
    });
  }, [onFullScreenChange]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && closeOnBackdropClick && !isFullScreen) {
      onClose();
    }
  };

  const modalElement = (
    <AnimatePresence>
      {isOpen && (
        <div
          onClick={handleBackdropClick}
          className={cn(
            "fixed inset-0 z-[100] flex items-center justify-center transition-all",
            isFullScreen ? "overflow-hidden p-0" : "overflow-y-auto p-3.5 sm:p-6",
            containerClassName,
          )}
        >
          {/* Backdrop with smooth blur and rich tint */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={closeOnBackdropClick && !isFullScreen ? onClose : undefined}
            className={cn("fixed inset-0 bg-black/70", isFullScreen && "bg-black/75 backdrop-blur-md", backdropClassName)}
          />

          {/* Modal Card with hardware-accelerated spring entrance & smooth morphing */}
          <motion.div
            custom={isFullScreen}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
            transition={{
              layout: {
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 0.8,
              },
            }}
            className={cn(
              "relative z-10 w-full overflow-hidden bg-white shadow-[0_20px_50px_-12px_rgba(29,16,21,0.22),0_0_0_1px_rgba(112,43,64,0.06)]",
              isFullScreen
                ? "fixed inset-0 flex h-[100dvh] w-screen max-w-none flex-col rounded-none border-0 p-5 shadow-none sm:p-6 lg:p-7"
                : cn("flex max-h-[90vh] flex-col rounded-2xl border border-brand-border/80 p-5 sm:p-6", maxWidthClasses[maxWidth]),
              className,
              isFullScreen && "fixed inset-0 h-[100dvh] w-screen max-w-none rounded-none border-0",
            )}
          >
            {/* Top decorative accent gradient line */}
            {topAccentBar && (
              <div className="pointer-events-none absolute inset-x-0 top-0 h-[2.5px] bg-gradient-to-r from-transparent via-burgundy-primary/60 to-transparent" />
            )}

            {/* Header */}
            {!hideHeader &&
              (customHeader ? (
                <div className={cn("shrink-0", isFullScreen && "mx-auto w-full max-w-7xl", headerClassName)}>{customHeader}</div>
              ) : (
                <div
                  onDoubleClick={canToggleFullScreen && doubleClickHeaderToToggleFullScreen ? handleToggleFullScreen : undefined}
                  className={cn(
                    "flex shrink-0 select-none items-start justify-between border-b border-brand-border/80 pb-4",
                    isFullScreen && "mx-auto w-full max-w-7xl",
                    canToggleFullScreen && doubleClickHeaderToToggleFullScreen && "cursor-default",
                    headerClassName,
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3 pr-3">
                    {headerIcon && (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-burgundy-primary/10 text-burgundy-primary shadow-sm ring-1 ring-burgundy-primary/15">
                        {headerIcon}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {typeof title === "string" ? <h3 className="text-[17px] font-bold tracking-tight text-text-primary">{title}</h3> : title}

                        {isFullScreen && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-1.5 rounded-full bg-burgundy-primary/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-burgundy-primary ring-1 ring-burgundy-primary/20"
                          >
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-burgundy-primary" />
                            Full Screen
                          </motion.span>
                        )}
                      </div>

                      {subtitle &&
                        (typeof subtitle === "string" ? (
                          <p className="mt-0.5 line-clamp-2 text-xs text-text-secondary sm:line-clamp-none">{subtitle}</p>
                        ) : (
                          subtitle
                        ))}
                    </div>
                  </div>

                  {/* Header actions: Custom actions + Fullscreen toggle + Close button */}
                  <div className="flex shrink-0 items-center gap-1.5 pl-2">
                    {headerActions}

                    {canToggleFullScreen && (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleToggleFullScreen}
                        className="rounded-full border border-brand-border/80 p-2 text-text-secondary transition-colors hover:bg-brand-bg hover:text-burgundy-primary focus:outline-none focus:ring-2 focus:ring-burgundy-primary/20"
                        aria-label={isFullScreen ? "Exit full screen" : "Enter full screen"}
                        title={isFullScreen ? "Exit full screen mode (Restore)" : "Expand to full screen mode"}
                      >
                        {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                      </motion.button>
                    )}

                    {!hideCloseButton && (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onClose}
                        className="rounded-full border border-brand-border/80 p-1 text-text-secondary transition-colors hover:bg-brand-red/10 hover:text-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/20"
                        aria-label="Close dialog"
                        title="Close dialog (Esc)"
                      >
                        <X className="h-4.5 w-4.5" />
                      </motion.button>
                    )}
                  </div>
                </div>
              ))}

            {/* Body */}
            <div
              className={cn(
                !hideHeader && "mt-4",
                isFullScreen ? "flex min-h-0 flex-1 flex-col overflow-hidden" : "min-h-0 flex-1 overflow-y-auto overflow-x-hidden",
                bodyClassName,
              )}
            >
              {children}
            </div>

            {/* Optional Footer */}
            {footer && (
              <div
                className={cn("mt-4 shrink-0 border-t border-brand-border/80 pt-3.5", isFullScreen && "mx-auto w-full max-w-7xl", footerClassName)}
              >
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (usePortal && typeof document !== "undefined") {
    return createPortal(modalElement, document.body);
  }

  return modalElement;
};
