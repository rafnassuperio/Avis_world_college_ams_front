import React, { useEffect, useRef, useState, useCallback } from "react";
import { Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | boolean | Promise<void | boolean>;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "danger" | "burgundy";
  icon?: React.ComponentType<{ className?: string }>;
  iconBgColor?: string;
  iconColor?: string;
  itemPreview?: React.ReactNode;
  children?: React.ReactNode;
  isLoading?: boolean;
  maxWidth?: "sm" | "md" | "lg";
  className?: string;
  /** Whether to play a Telegram-style dust burst on confirm (default: true) */
  enableDustBurst?: boolean;
}

interface MiniParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

/**
 * Reusable Delete Confirmation Modal
 * Designed with a floating top badge icon, centered typography,
 * optional item preview card, and full-width pill action buttons.
 */
export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Record",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmText = "Delete Record",
  cancelText = "Cancel",
  confirmVariant = "danger",
  icon: Icon = Trash2,
  iconBgColor = "bg-[#FDF2F4]",
  iconColor = "text-brand-red",
  itemPreview,
  children,
  isLoading = false,
  maxWidth = "md",
  className,
  enableDustBurst = true,
}) => {
  const [miniParticles, setMiniParticles] = useState<MiniParticle[]>([]);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
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
  }, [isOpen, onClose, isLoading]);

  // Mini particle animation loop for button burst
  useEffect(() => {
    if (miniParticles.length === 0) return;
    const interval = setInterval(() => {
      setMiniParticles((prev) =>
        prev
          .map((p) => {
            const nextLife = p.life + 16;
            const progress = nextLife / p.maxLife;
            return {
              ...p,
              x: p.x + p.vx,
              y: p.y + p.vy,
              vy: p.vy * 0.98,
              alpha: Math.max(0, 1 - progress),
              life: nextLife,
            };
          })
          .filter((p) => p.life < p.maxLife),
      );
    }, 16);
    return () => clearInterval(interval);
  }, [miniParticles.length]);

  const triggerDust = useCallback(() => {
    if (!enableDustBurst || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const colors =
      confirmVariant === "danger"
        ? ["#E11D48", "#BE123C", "#F43F5E", "#F59E0B", "#FFFFFF"]
        : ["#6B1D2F", "#800020", "#9F1239", "#BE123C", "#F59E0B", "#FFFFFF"];

    const particles: MiniParticle[] = [];
    for (let i = 0; i < 35; i++) {
      particles.push({
        id: Date.now() + i,
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vx: (Math.random() - 0.5) * 3,
        vy: -(Math.random() * 2.8 + 1.2),
        size: Math.random() * 2.5 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0,
        maxLife: 400 + Math.random() * 250,
      });
    }
    setMiniParticles(particles);
  }, [enableDustBurst, confirmVariant]);

  const handleConfirmClick = async () => {
    if (isLoading) return;
    triggerDust();
    try {
      await onConfirm();
    } catch (err) {
      console.error("Delete confirmation failed:", err);
    }
  };

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  };

  const confirmBtnStyles =
    confirmVariant === "danger"
      ? "bg-brand-red hover:bg-brand-dark-red text-white shadow-lg shadow-brand-red/20 active:bg-brand-dark-red"
      : "bg-burgundy-primary hover:bg-burgundy-hover text-white shadow-lg shadow-burgundy/20 active:bg-burgundy-hover";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
          {/* Backdrop with soft blur, allowing table context to be visible underneath */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={() => !isLoading && onClose()}
            className="fixed inset-0 bg-black/70"
          />

          {/* Modal Card with crisp, responsive spring exit */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ type: "spring", damping: 26, stiffness: 380 }}
            className={cn(
              "relative z-10 w-full rounded-[28px] border border-brand-border/60 bg-white px-6 pb-6 pt-12 text-center shadow-2xl sm:px-8 sm:pb-8 sm:pt-14",
              maxWidthClasses[maxWidth],
              className,
            )}
          >
            {/* Close Button at top-right */}
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1.5 text-text-muted transition-colors hover:bg-brand-bg hover:text-text-primary disabled:opacity-50"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Floating Top Circular Badge */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 sm:-top-11">
              <div
                className={cn(
                  "sm:h-22 sm:w-22 flex h-20 w-20 items-center justify-center rounded-full border-[5px] border-white shadow-xl shadow-brand-red/10 sm:border-[6px]",
                  iconBgColor,
                )}
              >
                <Icon className={cn("h-8 w-8 stroke-[2.2] sm:h-9 sm:w-9", iconColor)} />
              </div>
            </div>

            {/* Modal Heading */}
            <h3 className="text-lg font-bold tracking-tight text-text-primary sm:text-xl">{title}</h3>

            {/* Modal Description */}
            {description && <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-text-secondary sm:max-w-sm sm:text-sm">{description}</p>}

            {/* Optional Item Details Card (e.g. Student details) */}
            {itemPreview && <div className="mt-4 text-left">{itemPreview}</div>}

            {/* Custom Content Slot */}
            {children && <div className="mt-4">{children}</div>}

            {/* Action Buttons: Stacked Full-Width Pills matching the design */}
            <div className="mt-6 flex flex-col gap-2.5">
              <div className="relative w-full">
                <button
                  ref={buttonRef}
                  type="button"
                  disabled={isLoading}
                  onClick={handleConfirmClick}
                  className={cn(
                    "group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl px-5 py-3 text-xs font-bold transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm",
                    confirmBtnStyles,
                  )}
                >
                  <Icon className="h-4 w-4 transition-transform duration-150 group-hover:scale-110" />
                  <span>{isLoading ? "Deleting..." : confirmText}</span>

                  {/* Dust particles on button confirm */}
                  {miniParticles.length > 0 && (
                    <div className="pointer-events-none absolute inset-0 overflow-visible">
                      {miniParticles.map((p) => (
                        <span
                          key={p.id}
                          style={{
                            position: "absolute",
                            left: `${p.x}px`,
                            top: `${p.y}px`,
                            width: `${p.size}px`,
                            height: `${p.size}px`,
                            backgroundColor: p.color,
                            opacity: p.alpha,
                            borderRadius: "50%",
                            transform: "translate(-50%, -50%)",
                            boxShadow: `0 0 4px ${p.color}`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </button>
              </div>

              <button
                type="button"
                disabled={isLoading}
                onClick={onClose}
                className="w-full rounded-2xl border border-burgundy-tint py-2.5 text-xs font-semibold text-text-secondary transition-colors hover:bg-brand-bg hover:text-text-primary disabled:opacity-50 sm:text-sm"
              >
                {cancelText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeleteModal;
