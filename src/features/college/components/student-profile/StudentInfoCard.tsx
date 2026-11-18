import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/common/ToastMessage";

export interface InfoFieldItem {
  label: string;
  value: React.ReactNode;
  rawValue?: string;
  isCopyable?: boolean;
  copyFeedback?: string;
  isMono?: boolean;
  colSpan?: 1 | 2 | 3 | "full";
  badgeVariant?: "emerald" | "amber" | "purple" | "sky" | "rose" | "neutral" | "brand";
  badgeText?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface StudentInfoCardProps {
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  iconBgColor?: string;
  headerAction?: React.ReactNode;
  fields: InfoFieldItem[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export const StudentInfoCard: React.FC<StudentInfoCardProps> = ({
  title,
  subtitle,
  icon: Icon,
  iconColor = "text-burgundy-primary",
  iconBgColor = "bg-burgundy-primary/10",
  headerAction,
  fields,
  columns = 3,
  className,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (textToCopy: string, fieldKey: string, feedbackText?: string) => {
    if (!textToCopy || textToCopy === "N/A" || textToCopy === "none") return;
    navigator.clipboard.writeText(textToCopy);
    setCopiedKey(fieldKey);
    toast.success(feedbackText || `${fieldKey} copied to clipboard`);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === fieldKey ? null : prev));
    }, 2000);
  };

  const colGridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  }[columns];

  return (
    <div
      className={cn(
        "rounded-2xl border border-brand-border bg-white shadow-card transition-shadow hover:shadow-card-hover overflow-hidden",
        className,
      )}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-brand-border/60 bg-gradient-to-r from-brand-bg/40 to-white px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className={cn("flex h-8 w-8 items-center justify-center rounded-xl shrink-0 shadow-2xs", iconBgColor)}>
            <Icon className={cn("h-4 w-4", iconColor)} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-text-primary tracking-tight">{title}</h2>
            {subtitle && <p className="text-[11px] text-text-muted">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {headerAction}
          <span className="rounded-md border border-brand-border bg-brand-bg px-2 py-0.5 text-[10px] font-semibold text-text-muted">
            {fields.length} {fields.length === 1 ? "field" : "fields"}
          </span>
        </div>
      </div>

      {/* Structured Grid Type Tiles */}
      <div className={cn("grid gap-2.5 sm:gap-3 p-4 sm:p-5", colGridClasses)}>
        {fields.map((field, idx) => {
          const stringVal = field.rawValue ?? (typeof field.value === "string" ? field.value : "");
          const isNA = !stringVal || stringVal.trim() === "" || stringVal.toUpperCase() === "N/A" || stringVal.toLowerCase() === "none";
          const isCopied = copiedKey === field.label;

          const spanClass = {
            1: "col-span-1",
            2: "col-span-1 sm:col-span-2",
            3: "col-span-1 sm:col-span-2 lg:col-span-3",
            full: "col-span-full",
          }[field.colSpan || 1];

          return (
            <div
              key={`${field.label}-${idx}`}
              className={cn(
                "group relative flex flex-col justify-between rounded-xl border border-brand-border/70 bg-brand-bg/35 p-3 sm:p-3.5 shadow-2xs transition-all duration-200",
                "hover:border-burgundy-primary/40 hover:bg-white hover:shadow-xs",
                spanClass,
              )}
            >
              {/* Tile Top: Label & Copy Button */}
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted truncate">
                  {field.label}
                </span>

                {field.isCopyable && !isNA && (
                  <button
                    type="button"
                    onClick={() => handleCopy(stringVal, field.label, field.copyFeedback)}
                    title={`Copy ${field.label}`}
                    className="rounded p-0.5 text-text-muted opacity-60 transition-all hover:bg-brand-bg hover:opacity-100 hover:text-burgundy-primary group-hover:opacity-100"
                  >
                    {isCopied ? (
                      <Check className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                )}
              </div>

              {/* Tile Bottom: Value & Badges */}
              <div className="flex flex-wrap items-center gap-1.5 mt-auto pt-0.5">
                {field.icon && (
                  <field.icon className="h-3.5 w-3.5 shrink-0 text-text-muted" />
                )}

                <div
                  className={cn(
                    "text-xs leading-snug break-words",
                    field.isMono ? "font-mono font-bold tracking-tight" : "font-semibold",
                    isNA ? "text-text-muted/70 italic font-normal" : "text-text-primary",
                  )}
                >
                  {field.value}
                </div>

                {field.badgeText && (
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider",
                      field.badgeVariant === "emerald" && "bg-emerald-50 text-emerald-700 border border-emerald-200",
                      field.badgeVariant === "amber" && "bg-amber-50 text-amber-700 border border-amber-200",
                      field.badgeVariant === "purple" && "bg-purple-50 text-purple-700 border border-purple-200",
                      field.badgeVariant === "rose" && "bg-rose-50 text-rose-700 border border-rose-200",
                      field.badgeVariant === "sky" && "bg-sky-50 text-sky-700 border border-sky-200",
                      field.badgeVariant === "brand" && "bg-burgundy-primary/10 text-burgundy-primary border border-burgundy-primary/20",
                      (!field.badgeVariant || field.badgeVariant === "neutral") && "bg-white text-text-secondary border border-brand-border",
                    )}
                  >
                    {field.badgeText}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
