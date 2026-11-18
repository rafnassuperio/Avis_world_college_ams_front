import React, { useRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "size"> {
  value: string;
  onChange: (value: string, e?: React.ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  label?: string;
  labelIcon?: React.ComponentType<{ className?: string }>;
  icon?: React.ComponentType<{ className?: string }>;
  showClearButton?: boolean;
  size?: "sm" | "md";
  className?: string;
  containerClassName?: string;
  inputClassName?: string;
  labelClassName?: string;
  required?: boolean;
}

/**
 * Reusable SearchInput Component
 * Features an optional label, search icon, quick clear button,
 * focus rings matching the Burgundy & Brand theme, and smooth responsive styling.
 */
export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onClear,
  label,
  labelIcon: LabelIcon,
  icon: Icon = Search,
  placeholder = "Search...",
  showClearButton = true,
  size = "sm",
  disabled = false,
  className,
  containerClassName,
  inputClassName,
  labelClassName,
  required = false,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onChange("");
    onClear?.();
    inputRef.current?.focus();
  };

  return (
    <div className={cn("relative flex flex-col gap-1 text-left", containerClassName, className)}>
      {label && (
        <label className={cn("flex select-none items-center gap-1.5 text-[11px] font-bold text-text-secondary", labelClassName)}>
          {LabelIcon && <LabelIcon className="h-3.5 w-3.5 text-burgundy-primary" />}
          <span className="truncate">{label}</span>
          {required && <span className="text-brand-red">*</span>}
        </label>
      )}

      <div className="group relative flex w-full items-center">
        {Icon && (
          <Icon
            className={cn(
              "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-burgundy-primary",
              size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4",
            )}
          />
        )}

        <input
          ref={inputRef}
          type="text"
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value, e)}
          className={cn(
            "w-full rounded-xl border border-brand-border bg-brand-bg/40 text-text-primary transition-all placeholder:text-text-muted focus:border-burgundy-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-burgundy-primary disabled:cursor-not-allowed disabled:opacity-50",
            Icon ? "pl-9" : "pl-3.5",
            showClearButton && Boolean(value) ? "pr-8" : "pr-3",
            size === "sm" ? "py-2 text-xs" : "py-2.5 text-sm",
            inputClassName,
          )}
          {...props}
        />

        {showClearButton && Boolean(value) && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-brand-border/60 hover:text-text-primary focus:outline-none"
            title="Clear search"
            aria-label="Clear search input"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchInput;
