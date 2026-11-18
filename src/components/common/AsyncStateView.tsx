import React from "react";
import { Loader2, AlertCircle, Inbox, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AsyncStateViewProps {
  isLoading?: boolean;
  error?: Error | string | null;
  isEmpty?: boolean;
  onRetry?: () => void;
  loadingMessage?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  errorTitle?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * AsyncStateView - Universal Container for Asynchronous Component Lifecycles
 * Unifies Loading, Error, Empty, and Success states while strictly conforming
 * to the Avis World College brand design system (Burgundy / Brand-Red).
 */
export const AsyncStateView: React.FC<AsyncStateViewProps> = ({
  isLoading = false,
  error = null,
  isEmpty = false,
  onRetry,
  loadingMessage = "Loading institutional data...",
  emptyTitle = "No records found",
  emptyMessage = "There are no entries matching your current filters or search criteria.",
  errorTitle = "Unable to load data",
  className,
  children,
}) => {
  // 1. Loading State
  if (isLoading) {
    return (
      <div className={cn("flex min-h-[220px] flex-col items-center justify-center p-8 text-center", className)}>
        <div className="relative mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light-red/40">
          <Loader2 className="h-6 w-6 animate-spin text-brand-red" />
        </div>
        <p className="text-xs font-semibold text-text-secondary sm:text-sm">{loadingMessage}</p>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    const message = typeof error === "string" ? error : error.message || "An unexpected issue occurred.";
    return (
      <div className={cn("flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-brand-border bg-white p-8 text-center", className)}>
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-brand-red">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h4 className="text-sm font-bold text-text-primary">{errorTitle}</h4>
        <p className="mx-auto mt-1 max-w-md text-xs text-text-muted">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-brand-border bg-white px-4 py-2 text-xs font-semibold text-text-primary shadow-xs transition-colors hover:bg-brand-bg hover:text-brand-red active:scale-95"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Try Again</span>
          </button>
        )}
      </div>
    );
  }

  // 3. Empty State
  if (isEmpty) {
    return (
      <div className={cn("flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-brand-border bg-brand-bg/40 p-8 text-center", className)}>
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light-red/30 text-text-muted">
          <Inbox className="h-6 w-6" />
        </div>
        <h4 className="text-sm font-bold text-text-primary">{emptyTitle}</h4>
        <p className="mx-auto mt-1 max-w-sm text-xs text-text-muted">{emptyMessage}</p>
      </div>
    );
  }

  // 4. Success State
  return <>{children}</>;
};

export default AsyncStateView;
