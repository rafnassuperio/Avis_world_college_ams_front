import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface FilterSelectOption {
  label: string;
  value: string;
  badgeDot?: string;
  badgeText?: string;
  subLabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

export interface FilterSelectProps {
  label?: string;
  icon?: React.ComponentType<{ className?: string }>;
  buttonIcon?: React.ComponentType<{ className?: string }>;
  value: string;
  options: FilterSelectOption[];
  onChange: (value: string) => void;
  defaultValue?: string;
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  align?: "left" | "right";
  placement?: "bottom" | "top";
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  labelClassName?: string;
  required?: boolean;
  hasError?: boolean;
  usePortal?: boolean;
}

/**
 * Reusable Filter Select Dropdown Component
 * Designed for filtering datasets with support for category icons,
 * search inside options, active indicator rings, quick-clear button,
 * status badge dots, smooth Framer Motion transitions, and createPortal
 * to avoid table clipping and stacking context / z-index conflicts.
 */
export const FilterSelect: React.FC<FilterSelectProps> = ({
  label,
  icon: Icon,
  buttonIcon: ButtonIcon,
  value,
  options,
  onChange,
  defaultValue,
  placeholder,
  searchable = false,
  searchPlaceholder,
  align = "left",
  placement = "bottom",
  size = "sm",
  disabled = false,
  className,
  buttonClassName,
  menuClassName,
  labelClassName,
  required = false,
  hasError = false,
  usePortal = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Portal floating coordinates
  const [menuCoords, setMenuCoords] = useState<{
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    width: number;
    openUp: boolean;
  } | null>(null);

  const isFiltered = defaultValue !== undefined ? value !== defaultValue : false;
  const selectedOption = value ? options.find((opt) => opt.value.toLowerCase() === value.toLowerCase() || opt.value === value) : undefined;
  const displayLabel = selectedOption?.label || value || placeholder || "Select...";

  // Calculate coordinates when open with portal
  const updateCoords = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;

    const clientWidth = document.documentElement.clientWidth || window.innerWidth;
    const clientHeight = document.documentElement.clientHeight || window.innerHeight;
    const spaceBelow = clientHeight - rect.bottom;
    const openUp = placement === "top" || (spaceBelow < 220 && rect.top > 220);
    const menuWidth = Math.max(rect.width, 210);

    let left: number | undefined;
    let right: number | undefined;

    if (align === "right") {
      right = Math.max(8, clientWidth - rect.right);
    } else {
      left = Math.max(8, Math.min(rect.left, clientWidth - menuWidth - 8));
    }

    setMenuCoords({
      top: openUp ? undefined : rect.bottom + 4,
      bottom: openUp ? clientHeight - rect.top + 4 : undefined,
      left,
      right,
      width: menuWidth,
      openUp,
    });
  }, [placement, align]);

  // Synchronous coordinate update on layout/scroll
  useEffect(() => {
    if (isOpen && usePortal && containerRef.current) {
      updateCoords();
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
      return () => {
        window.removeEventListener("scroll", updateCoords, true);
        window.removeEventListener("resize", updateCoords);
      };
    }
  }, [isOpen, usePortal, updateCoords]);

  // Click outside and escape key handling
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current && !containerRef.current.contains(target) && (!menuRef.current || !menuRef.current.contains(target))) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && searchable) {
      const timer = setTimeout(() => searchInputRef.current?.focus(), 60);
      return () => clearTimeout(timer);
    } else {
      setSearchTerm("");
    }
  }, [isOpen, searchable]);

  const displayOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(term) ||
        (opt.subLabel && opt.subLabel.toLowerCase().includes(term)) ||
        opt.value.toLowerCase().includes(term),
    );
  }, [options, searchTerm]);

  const isMenuOpeningUp = usePortal ? menuCoords?.openUp : placement === "top";

  const menuDropdown = (
    <AnimatePresence>
      {isOpen && (!usePortal || menuCoords) && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: isMenuOpeningUp ? 4 : -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: isMenuOpeningUp ? 4 : -4, scale: 0.98 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          role="listbox"
          style={
            usePortal && menuCoords
              ? {
                  position: "fixed",
                  top: menuCoords.top !== undefined ? `${menuCoords.top}px` : undefined,
                  bottom: menuCoords.bottom !== undefined ? `${menuCoords.bottom}px` : undefined,
                  left: menuCoords.left !== undefined ? `${menuCoords.left}px` : undefined,
                  right: menuCoords.right !== undefined ? `${menuCoords.right}px` : undefined,
                  width: `${menuCoords.width}px`,
                  minWidth: `${menuCoords.width}px`,
                  zIndex: 99999,
                }
              : undefined
          }
          className={cn(
            "rounded-2xl border border-brand-border bg-white p-1.5 shadow-xl shadow-burgundy/10 focus:outline-none",
            !usePortal && "absolute z-50 w-full min-w-[210px] max-w-[340px]",
            !usePortal && (placement === "top" ? "bottom-full mb-1" : "top-full mt-1"),
            !usePortal && (align === "right" ? "right-0" : "left-0"),
            menuClassName,
          )}
        >
          {searchable && (
            <div className="relative mb-1.5 px-1 pt-0.5">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={searchPlaceholder || (label ? `Search ${label.toLowerCase()}...` : "Search options...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-brand-border bg-brand-bg/50 py-1.5 pl-8 pr-2.5 text-xs text-text-primary placeholder:text-text-muted focus:border-burgundy-primary focus:bg-white focus:outline-none"
              />
            </div>
          )}

          <div className="max-h-56 space-y-0.5 overflow-y-auto pr-0.5">
            {displayOptions.length === 0 ? (
              <div className="py-3 text-center text-xs text-text-muted">No matches found</div>
            ) : (
              displayOptions.map((option) => {
                const isSelected = option.value === value;
                const OptionIcon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={option.disabled}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-semibold capitalize transition-colors",
                      isSelected ? "bg-burgundy-primary/10 font-bold text-burgundy-primary" : "text-text-primary hover:bg-brand-bg",
                      option.disabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {option.badgeDot && <span className={cn("h-2 w-2 shrink-0 rounded-full", option.badgeDot)} />}
                      {OptionIcon && <OptionIcon className="h-3.5 w-3.5 shrink-0 text-text-muted" />}
                      <div className="flex flex-col truncate">
                        <span className="truncate">{option.label}</span>
                        {option.subLabel && <span className="text-[10px] font-normal normal-case text-text-muted">{option.subLabel}</span>}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {option.badgeText && (
                        <span className="rounded bg-brand-bg px-1.5 py-0.5 text-[10px] font-semibold text-text-secondary">{option.badgeText}</span>
                      )}
                      {isSelected && <Check className="h-3.5 w-3.5 shrink-0 stroke-[2.5] text-burgundy-primary" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div
      ref={containerRef}
      className={cn("relative flex flex-col gap-1 text-left", isOpen && !usePortal && "z-40", className)}
    >
      {label && (
        <label className={cn("flex select-none items-center gap-1.5 text-[11px] font-bold text-text-secondary", labelClassName)}>
          {Icon && <Icon className="h-3.5 w-3.5 text-burgundy-primary" />}
          <span className="truncate">{label}</span>
          {required && <span className="text-brand-red">*</span>}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          if (!isOpen && usePortal) {
            updateCoords();
          }
          setIsOpen(!isOpen);
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          "group flex w-full select-none items-center justify-between gap-1.5 rounded-xl border transition-all duration-150 focus:outline-none focus:ring-1",
          size === "sm" ? "py-2 pl-3 pr-2.5 text-xs font-medium" : "py-2.5 pl-3.5 pr-3 text-sm font-medium",
          hasError
            ? "border-brand-red bg-white text-text-primary ring-1 ring-brand-red"
            : isFiltered
              ? "border-burgundy-primary/50 bg-burgundy-primary/5 font-semibold text-burgundy-primary ring-1 ring-burgundy-primary/20 hover:bg-burgundy-primary/10"
              : "border-brand-border bg-brand-bg/40 text-text-primary hover:border-brand-border/80 hover:bg-white focus:border-burgundy-primary focus:bg-white focus:ring-burgundy-primary",
          disabled && "cursor-not-allowed opacity-50",
          buttonClassName,
        )}
      >
        <div className="flex items-center gap-1.5 truncate">
          {selectedOption?.badgeDot && <span className={cn("h-2 w-2 shrink-0 rounded-full", selectedOption.badgeDot)} />}
          {selectedOption?.icon ? (
            <selectedOption.icon className="h-3.5 w-3.5 shrink-0 text-burgundy-primary" />
          ) : ButtonIcon ? (
            <ButtonIcon className="h-3.5 w-3.5 shrink-0 text-burgundy-primary" />
          ) : null}
          <span
            className="truncate text-left"
            title={displayLabel}
          >
            {displayLabel}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {isFiltered && defaultValue !== undefined && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange(defaultValue);
                setIsOpen(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  onChange(defaultValue);
                  setIsOpen(false);
                }
              }}
              className="cursor-pointer rounded-full p-0.5 text-burgundy-primary/70 transition-colors hover:bg-burgundy-primary/20 hover:text-burgundy-primary"
              title={`Reset to ${defaultValue}`}
            >
              <X className="h-3 w-3" />
            </span>
          )}

          <ChevronDown
            className={cn("h-3.5 w-3.5 shrink-0 opacity-80 transition-transform duration-200 group-hover:opacity-100", isOpen && "rotate-180")}
          />
        </div>
      </button>

      {usePortal ? createPortal(menuDropdown, document.body) : menuDropdown}
    </div>
  );
};

export default FilterSelect;
