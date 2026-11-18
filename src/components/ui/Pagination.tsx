import React, { useId, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  showTotal?: boolean;
  showPageSize?: boolean;
  activeVariant?: "outline" | "solid";
  className?: string;
  controlsOnly?: boolean;
}

/**
 * Generates the sequence of page numbers and ellipsis
 * matching the user's design: e.g. [1, 2, '...', 24, 25, 26]
 */
export const getPaginationRange = (currentPage: number, totalPages: number): (number | string)[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Near the start: e.g. 1, 2, ..., 24, 25, 26
  if (currentPage <= 2) {
    return [1, 2, "...", totalPages - 2, totalPages - 1, totalPages];
  }

  // Page 3
  if (currentPage === 3) {
    return [1, 2, 3, "...", totalPages - 1, totalPages];
  }

  // Near the end
  if (currentPage >= totalPages - 1) {
    return [1, 2, 3, "...", totalPages - 1, totalPages];
  }

  if (currentPage === totalPages - 2) {
    return [1, 2, "...", totalPages - 2, totalPages - 1, totalPages];
  }

  // Middle pages
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
};

/**
 * Reusable Pagination Component with Smooth Framer-Motion Animations
 * Styled with Avis World College brand colors (Burgundy primary, Brand red, and tinted surface)
 * Features a spring-sliding active indicator and smooth hover/tap physics.
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  showTotal = true,
  showPageSize = true,
  activeVariant = "outline",
  className,
  controlsOnly = false,
}) => {
  const layoutIdPrefix = useId();
  const safeTotalPages = Math.max(1, totalPages);
  const safeCurrentPage = Math.min(Math.max(1, currentPage), safeTotalPages);

  const paginationRange = useMemo(() => {
    return getPaginationRange(safeCurrentPage, safeTotalPages);
  }, [safeCurrentPage, safeTotalPages]);

  const canGoPrev = safeCurrentPage > 1;
  const canGoNext = safeCurrentPage < safeTotalPages;

  const handlePrev = () => {
    if (canGoPrev) {
      onPageChange(safeCurrentPage - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      onPageChange(safeCurrentPage + 1);
    }
  };

  // Pure Controls matching the exact image design with fluid Framer Motion animations
  const paginationControls = (
    <div className="inline-flex select-none items-center gap-2 sm:gap-3">
      {/* Previous Button: Brand Burgundy Circular Button with Spring Scale */}
      <motion.button
        type="button"
        onClick={handlePrev}
        disabled={!canGoPrev}
        whileHover={canGoPrev ? { scale: 1.08 } : undefined}
        whileTap={canGoPrev ? { scale: 0.92 } : undefined}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={cn(
          "group flex h-9 w-9 items-center justify-center rounded-full bg-burgundy-primary text-white shadow-sm shadow-burgundy/25 transition-colors sm:h-10 sm:w-10",
          "hover:bg-burgundy-hover",
          "disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-burgundy-primary",
        )}
        title="Previous Page"
        aria-label="Previous Page"
      >
        <ChevronLeft className="h-4 w-4 stroke-[2.5] transition-transform duration-200 group-hover:-translate-x-0.5" />
      </motion.button>

      {/* Center Pill Container: Tinted Brand Background with Fluid Layout Morph */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        className="shadow-2xs relative inline-flex items-center gap-1 rounded-full border border-brand-border/70 bg-brand-bg/85 px-2.5 py-1 sm:gap-1.5 sm:px-3.5 sm:py-1.5"
      >
        {paginationRange.map((page, index) => {
          if (typeof page === "string") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex h-8 min-w-[24px] select-none items-center justify-center px-1 text-xs font-bold text-burgundy-primary/40 sm:min-w-[28px] sm:text-sm"
              >
                ...
              </span>
            );
          }

          const isActive = page === safeCurrentPage;

          return (
            <motion.button
              key={`page-${page}`}
              type="button"
              onClick={() => onPageChange(page)}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
              className={cn(
                "relative flex h-8 min-w-[32px] items-center justify-center rounded-full px-2 text-xs font-semibold sm:min-w-[36px] sm:text-sm",
                !isActive && "text-text-secondary transition-colors duration-150 hover:bg-burgundy-primary/10 hover:text-burgundy-primary",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Smooth Gliding Active Indicator Pill */}
              {isActive && (
                <motion.div
                  layoutId={`${layoutIdPrefix}-active-indicator`}
                  transition={{ type: "spring", stiffness: 420, damping: 30 }}
                  className={cn(
                    "absolute inset-0 rounded-full",
                    activeVariant === "solid"
                      ? "shadow-xs bg-burgundy-primary shadow-burgundy-primary/30"
                      : "shadow-xs border-2 border-burgundy-primary bg-white ring-1 ring-burgundy-primary/20",
                  )}
                />
              )}

              {/* Page Number Label */}
              <span
                className={cn(
                  "relative z-10 transition-colors duration-200",
                  isActive ? (activeVariant === "solid" ? "font-bold text-white" : "font-bold text-burgundy-primary") : "",
                )}
              >
                {page}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Next Button: Brand Burgundy Circular Button with Spring Scale */}
      <motion.button
        type="button"
        onClick={handleNext}
        disabled={!canGoNext}
        whileHover={canGoNext ? { scale: 1.08 } : undefined}
        whileTap={canGoNext ? { scale: 0.92 } : undefined}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={cn(
          "group flex h-9 w-9 items-center justify-center rounded-full bg-burgundy-primary text-white shadow-sm shadow-burgundy/25 transition-colors sm:h-10 sm:w-10",
          "hover:bg-burgundy-hover",
          "disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-burgundy-primary",
        )}
        title="Next Page"
        aria-label="Next Page"
      >
        <ChevronRight className="h-4 w-4 stroke-[2.5] transition-transform duration-200 group-hover:translate-x-0.5" />
      </motion.button>
    </div>
  );

  if (controlsOnly) {
    return <div className={cn("flex justify-center", className)}>{paginationControls}</div>;
  }

  // Calculate item range for summary
  const startItem = totalItems !== undefined && totalItems > 0 && pageSize ? (safeCurrentPage - 1) * pageSize + 1 : 0;
  const endItem = totalItems !== undefined && pageSize ? Math.min(safeCurrentPage * pageSize, totalItems) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-brand-border bg-white px-4 py-3 shadow-card sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      {/* Left: Total Records Info */}
      <div className="flex items-center gap-3 text-xs text-text-secondary">
        {showTotal && totalItems !== undefined ? (
          <span>
            Showing <strong className="font-bold text-burgundy-primary">{startItem}</strong> to{" "}
            <strong className="font-bold text-burgundy-primary">{endItem}</strong> of{" "}
            <strong className="font-bold text-burgundy-primary">{totalItems}</strong> entries
          </span>
        ) : (
          <span>
            Page <strong className="font-bold text-burgundy-primary">{safeCurrentPage}</strong> of{" "}
            <strong className="font-bold text-burgundy-primary">{safeTotalPages}</strong>
          </span>
        )}

        {/* Rows per page selector */}
        {showPageSize && pageSize && onPageSizeChange && (
          <div className="hidden items-center gap-1.5 border-l border-brand-border/60 pl-3 sm:flex">
            <span className="text-text-muted">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-lg border border-brand-border bg-brand-bg/60 px-2 py-1 text-xs font-semibold text-text-primary transition-colors focus:border-burgundy-primary focus:outline-none focus:ring-1 focus:ring-burgundy-primary"
            >
              {pageSizeOptions.map((opt) => (
                <option
                  key={opt}
                  value={opt}
                >
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Center / Right: Image Pagination Design in Brand Colors */}
      <div className="flex justify-center sm:justify-end">{paginationControls}</div>
    </motion.div>
  );
};

export default Pagination;
