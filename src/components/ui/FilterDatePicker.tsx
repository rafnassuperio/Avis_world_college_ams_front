import React, { useRef } from "react";
import { Calendar, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Convert varied date formats (DD/MM/YYYY, ISO, etc.) to YYYY-MM-DD for <input type="date"> */
export const toDateInputValue = (val?: string): string => {
  if (!val || val === "all" || val === "none") return "";
  const trimmed = val.trim();
  // Already in YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  // Format DD/MM/YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, "0");
    const month = dmyMatch[2].padStart(2, "0");
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }
  // Try Date parsing
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  return "";
};

/** Convert YYYY-MM-DD from <input type="date"> to display string e.g. "08 Nov 2026" */
export const formatDisplayDate = (val?: string): string => {
  if (!val || val === "all" || val === "none") return "";
  const trimmed = val.trim();
  // Match YYYY-MM-DD
  const ymdMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
  }

  // Match DD/MM/YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
  }

  // Fallback Date parse
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return val;
};

export interface FilterDatePickerProps {
  label?: string;
  icon?: React.ComponentType<{ className?: string }>;
  buttonIcon?: React.ComponentType<{ className?: string }>;
  rightIcon?: React.ComponentType<{ className?: string }>;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  defaultValue?: string;
  placeholder?: string;
  size?: "sm" | "md";
  disabled?: boolean;
  min?: string;
  max?: string;
  className?: string;
  buttonClassName?: string;
  labelClassName?: string;
  required?: boolean;
  hasError?: boolean;
}

/**
 * Reusable Filter Date Picker Component
 * Designed to seamlessly match the design, geometry, typography, and active filter states
 * of FilterSelect. Features native date picking, custom formatted date labels, quick-clear button,
 * keyboard accessibility, and Burgundy theme highlights.
 */
export const FilterDatePicker: React.FC<FilterDatePickerProps> = ({
  label,
  icon: Icon,
  buttonIcon: ButtonIcon,
  rightIcon,
  value,
  onChange,
  onClear,
  defaultValue,
  placeholder = "Select date...",
  size = "sm",
  disabled = false,
  min,
  max,
  className,
  buttonClassName,
  labelClassName,
  required = false,
  hasError = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const isFiltered = defaultValue !== undefined ? value !== defaultValue : Boolean(value);
  const formattedValue = formatDisplayDate(value);
  const displayLabel = formattedValue || placeholder;

  const ResolvedRightIcon = rightIcon || (ButtonIcon ? ChevronDown : Calendar);

  const handleClear = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onChange(defaultValue !== undefined ? defaultValue : "");
    onClear?.();
  };

  const handleContainerClick = () => {
    if (disabled) return;
    try {
      inputRef.current?.showPicker?.();
    } catch {
      inputRef.current?.focus();
    }
  };

  return (
    <div className={cn("relative flex flex-col gap-1 text-left", className)}>
      {label && (
        <label className={cn("flex select-none items-center gap-1.5 text-[11px] font-bold text-text-secondary", labelClassName)}>
          {Icon && <Icon className="h-3.5 w-3.5 text-burgundy-primary" />}
          <span className="truncate">{label}</span>
          {required && <span className="text-brand-red">*</span>}
        </label>
      )}

      <div
        onClick={handleContainerClick}
        className={cn(
          "group relative flex w-full select-none items-center justify-between gap-1.5 rounded-xl border transition-all duration-150 focus-within:outline-none focus-within:ring-1",
          size === "sm" ? "h-9 py-2 pl-3 pr-2.5 text-xs font-medium" : "h-10 py-2.5 pl-3.5 pr-3 text-sm font-medium",
          hasError
            ? "border-brand-red bg-white text-text-primary ring-1 ring-brand-red"
            : isFiltered
              ? "border-burgundy-primary/50 bg-burgundy-primary/5 font-semibold text-burgundy-primary ring-1 ring-burgundy-primary/20 hover:bg-burgundy-primary/10"
              : "border-brand-border bg-brand-bg/40 text-text-primary focus-within:border-burgundy-primary focus-within:bg-white focus-within:ring-burgundy-primary hover:border-brand-border/80 hover:bg-white",
          disabled && "cursor-not-allowed opacity-50",
          buttonClassName,
        )}
      >
        {/* Invisible Native Date Input with WebKit Calendar Trigger overlay */}
        <input
          ref={inputRef}
          type="date"
          value={toDateInputValue(value)}
          min={min}
          max={max}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onClick={(e) => {
            e.stopPropagation();
            try {
              inputRef.current?.showPicker?.();
            } catch {}
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              try {
                inputRef.current?.showPicker?.();
              } catch {}
            }
          }}
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 [color-scheme:light] disabled:cursor-not-allowed [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
          tabIndex={0}
          aria-label={label || "Date picker"}
        />

        {/* Display Content matching FilterSelect */}
        <div className="pointer-events-none flex items-center gap-1.5 truncate">
          {ButtonIcon ? <ButtonIcon className="h-3.5 w-3.5 shrink-0 text-burgundy-primary" /> : null}
          <span
            className={cn("truncate text-left", !isFiltered && "font-normal text-text-muted")}
            title={displayLabel}
          >
            {displayLabel}
          </span>
        </div>

        {/* Action Controls: Reset/Clear Button & Dropdown/Calendar Icon */}
        <div className="flex shrink-0 items-center gap-1">
          {isFiltered && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleClear(e);
                }
              }}
              className="relative z-20 cursor-pointer rounded-full p-0.5 text-burgundy-primary/70 transition-colors hover:bg-burgundy-primary/20 hover:text-burgundy-primary focus:outline-none"
              title="Clear date filter"
              aria-label="Clear date filter"
            >
              <X className="h-3 w-3" />
            </span>
          )}

          <ResolvedRightIcon
            className={cn(
              "pointer-events-none h-3.5 w-3.5 shrink-0 opacity-80 transition-all duration-200 group-hover:opacity-100",
              isFiltered ? "text-burgundy-primary" : "text-text-secondary",
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default FilterDatePicker;
