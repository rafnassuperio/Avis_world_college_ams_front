import React, { forwardRef } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/** Convert varied date formats (DD/MM/YYYY, ISO, etc.) to YYYY-MM-DD for <input type="date"> */
export const toDateInputValue = (val?: string): string => {
  if (!val || val === "N/A" || val === "none") return "";
  const trimmed = val.trim();
  // Already in YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  // Format DD/MM/YYYY
  const parts = trimmed.split("/");
  if (parts.length === 3 && parts[0].length <= 2 && parts[1].length <= 2 && parts[2].length === 4) {
    const day = parts[0].padStart(2, "0");
    const month = parts[1].padStart(2, "0");
    const year = parts[2];
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

/** Convert YYYY-MM-DD from <input type="date"> to display DD/MM/YYYY format */
export const fromDateInputValue = (val: string): string => {
  if (!val) return "";
  const parts = val.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return val;
};

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> {
  label?: string;
  labelIcon?: React.ComponentType<{ className?: string }>;
  icon?: React.ComponentType<{ className?: string }>;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  error?: string;
  hasError?: boolean;
  helperText?: string;
  size?: "sm" | "md";
  isMono?: boolean;
  formatAsDate?: boolean;
  containerClassName?: string;
  inputClassName?: string;
  labelClassName?: string;
}

/**
 * Universal Input Component matching AMS College Design System
 * Supports text, date, number, email, tel, url with prefix/suffix adornments,
 * smooth focus rings, inline helper/error messages and date auto-formatting.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      labelIcon: LabelIcon,
      icon: Icon,
      prefix,
      suffix,
      error,
      hasError = false,
      helperText,
      size = "sm",
      isMono = false,
      formatAsDate = false,
      type = "text",
      value,
      defaultValue,
      onChange,
      disabled = false,
      required = false,
      className,
      containerClassName,
      inputClassName,
      labelClassName,
      ...props
    },
    ref,
  ) => {
    const isDateType = type === "date" || formatAsDate;
    const isError = Boolean(error) || hasError;

    // Date value conversion
    const displayValue = isDateType && typeof value === "string" ? toDateInputValue(value) : value;

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (formatAsDate && onChange) {
        const dmy = fromDateInputValue(e.target.value);
        // Create synthetic event with DD/MM/YYYY value
        const syntheticEvent = {
          ...e,
          target: { ...e.target, value: dmy },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      } else if (onChange) {
        onChange(e);
      }
    };

    return (
      <div className={cn("relative flex flex-col gap-1 text-left", containerClassName, className)}>
        {/* Label */}
        {label && (
          <label
            className={cn(
              "flex select-none items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-secondary",
              labelClassName,
            )}
          >
            {LabelIcon && <LabelIcon className="h-3.5 w-3.5 text-burgundy-primary" />}
            <span className="truncate">{label}</span>
            {required && <span className="text-brand-red">*</span>}
          </label>
        )}

        {/* Input Wrapper */}
        <div className="group relative flex w-full items-center">
          {/* Leading Icon */}
          {Icon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-burgundy-primary">
              <Icon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
            </div>
          )}

          {/* Prefix adornment (e.g. $, SGD, ID:) */}
          {prefix && (
            <div
              className={cn(
                "pointer-events-none absolute top-1/2 -translate-y-1/2 select-none font-semibold text-text-secondary flex items-center gap-1.5",
                Icon ? "left-8" : "left-3",
                size === "sm" ? "text-xs" : "text-sm",
              )}
            >
              <span>{prefix}</span>
              {typeof prefix === "string" && prefix.length > 1 && (
                <span className="h-3.5 w-px bg-brand-border" />
              )}
            </div>
          )}

          {/* Actual Input */}
          <input
            ref={ref}
            type={isDateType ? "date" : type}
            disabled={disabled}
            value={displayValue}
            defaultValue={defaultValue}
            onChange={isDateType && formatAsDate ? handleDateChange : onChange}
            className={cn(
              "w-full rounded-xl border bg-white text-text-primary transition-all placeholder:text-text-muted focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:bg-brand-bg/50 disabled:opacity-60",
              size === "sm" ? "h-9 py-2 text-xs" : "h-10 py-2.5 text-sm",
              Icon && prefix
                ? "pl-16"
                : Icon
                  ? "pl-9"
                  : prefix
                    ? typeof prefix === "string" && prefix.length > 1
                      ? "pl-14"
                      : "pl-8"
                    : "px-3.5",
              suffix ? "pr-10" : "pr-3.5",
              isMono && "font-mono",
              isError
                ? "border-brand-red text-brand-red focus:border-brand-red focus:ring-brand-red"
                : "border-brand-border hover:border-brand-border/80 focus:border-burgundy-primary focus:ring-burgundy-primary",
              inputClassName,
            )}
            {...props}
          />

          {/* Suffix adornment (e.g. %, Days, SGD) */}
          {suffix && (
            <div
              className={cn(
                "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 select-none font-medium text-text-muted",
                size === "sm" ? "text-xs" : "text-sm",
              )}
            >
              {suffix}
            </div>
          )}
        </div>

        {/* Error / Helper text */}
        {error ? (
          <p className="flex items-center gap-1 text-[11px] font-medium text-brand-red">
            <AlertCircle className="h-3 w-3 shrink-0" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-[11px] text-text-muted">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  labelIcon?: React.ComponentType<{ className?: string }>;
  error?: string;
  hasError?: boolean;
  helperText?: string;
  containerClassName?: string;
  textareaClassName?: string;
  labelClassName?: string;
}

/**
 * Universal Textarea Component matching AMS College Design System
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      labelIcon: LabelIcon,
      error,
      hasError = false,
      helperText,
      rows = 3,
      disabled = false,
      required = false,
      className,
      containerClassName,
      textareaClassName,
      labelClassName,
      ...props
    },
    ref,
  ) => {
    const isError = Boolean(error) || hasError;

    return (
      <div className={cn("relative flex flex-col gap-1 text-left", containerClassName, className)}>
        {/* Label */}
        {label && (
          <label
            className={cn(
              "flex select-none items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-secondary",
              labelClassName,
            )}
          >
            {LabelIcon && <LabelIcon className="h-3.5 w-3.5 text-burgundy-primary" />}
            <span className="truncate">{label}</span>
            {required && <span className="text-brand-red">*</span>}
          </label>
        )}

        {/* Textarea */}
        <textarea
          ref={ref}
          rows={rows}
          disabled={disabled}
          className={cn(
            "w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-text-primary transition-all placeholder:text-text-muted focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:bg-brand-bg/50 disabled:opacity-60",
            isError
              ? "border-brand-red text-brand-red focus:border-brand-red focus:ring-brand-red"
              : "border-brand-border hover:border-brand-border/80 focus:border-burgundy-primary focus:ring-burgundy-primary",
            textareaClassName,
          )}
          {...props}
        />

        {/* Error / Helper text */}
        {error ? (
          <p className="flex items-center gap-1 text-[11px] font-medium text-brand-red">
            <AlertCircle className="h-3 w-3 shrink-0" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-[11px] text-text-muted">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export default Input;
