import React, { useState, useRef, useCallback, useEffect } from "react";
import { Table as TableIcon, MoveHorizontal, X, RotateCcw } from "lucide-react";
import { motion, AnimatePresence, type HTMLMotionProps } from "framer-motion";
import { smoothEase } from "@/components/animations/transitions";
import { cn } from "@/lib/utils";
import { safeStorage } from "@/lib/security";

export type TableDensity = "compact" | "normal" | "relaxed";
export type TableLayoutMode = "auto" | "fixed";

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  containerClassName?: string;
  layout?: TableLayoutMode;
  density?: TableDensity;
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, containerClassName, layout = "fixed", density = "normal", ...props }, ref) => (
    <div className={cn("w-full overflow-x-auto", containerClassName)}>
      <table
        ref={ref}
        data-density={density}
        className={cn("min-w-full text-left text-xs", layout === "fixed" ? "table-fixed" : "table-auto", className)}
        {...props}
      />
    </div>
  ),
);
Table.displayName = "Table";

export const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn("select-none border-b border-brand-border bg-brand-bg/85 text-text-secondary", className)}
      {...props}
    />
  ),
);
TableHeader.displayName = "TableHeader";

export const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("divide-y divide-brand-border/60", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

export const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={cn("border-t border-brand-border bg-brand-bg/50 font-medium", className)}
      {...props}
    />
  ),
);
TableFooter.displayName = "TableFooter";

export const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn("transition-colors duration-150 hover:bg-brand-bg/60", className)}
    {...props}
  />
));
TableRow.displayName = "TableRow";

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  resizable?: boolean;
  onResize?: (newWidth: number) => void;
  onResizeEnd?: (newWidth: number) => void;
  density?: TableDensity;
}

export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, style, width, minWidth, maxWidth, resizable = false, onResize, onResizeEnd, density = "normal", children, ...props }, ref) => {
    const [isDragging, setIsDragging] = useState(false);
    const startXRef = useRef(0);
    const startWidthRef = useRef(0);
    const currentWidthRef = useRef<number>(0);
    const thRef = useRef<HTMLTableCellElement | null>(null);

    const handleMouseDown = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!thRef.current) return;

        setIsDragging(true);
        startXRef.current = e.clientX;
        const initialWidth = thRef.current.getBoundingClientRect().width;
        startWidthRef.current = initialWidth;
        currentWidthRef.current = initialWidth;

        const min = typeof minWidth === "number" ? minWidth : 50;
        const max = typeof maxWidth === "number" ? maxWidth : 1000;

        let rafId: number | null = null;
        const handleMouseMove = (moveEvent: MouseEvent) => {
          const diff = moveEvent.clientX - startXRef.current;
          const newWidth = Math.max(min, Math.min(max, Math.round(startWidthRef.current + diff)));
          currentWidthRef.current = newWidth;
          if (rafId === null) {
            rafId = requestAnimationFrame(() => {
              rafId = null;
              onResize?.(currentWidthRef.current);
            });
          }
        };

        const handleMouseUp = () => {
          if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
          }
          setIsDragging(false);
          window.removeEventListener("mousemove", handleMouseMove);
          window.removeEventListener("mouseup", handleMouseUp);
          document.body.style.cursor = "";
          document.body.style.userSelect = "";
          if (currentWidthRef.current > 0) {
            onResize?.(currentWidthRef.current);
            onResizeEnd?.(currentWidthRef.current);
          }
        };

        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
      },
      [minWidth, maxWidth, onResize, onResizeEnd],
    );

    const handleTouchStart = useCallback(
      (e: React.TouchEvent) => {
        if (!thRef.current || e.touches.length !== 1) return;
        const touch = e.touches[0];
        setIsDragging(true);
        startXRef.current = touch.clientX;
        const initialWidth = thRef.current.getBoundingClientRect().width;
        startWidthRef.current = initialWidth;
        currentWidthRef.current = initialWidth;

        const min = typeof minWidth === "number" ? minWidth : 50;
        const max = typeof maxWidth === "number" ? maxWidth : 1000;

        let touchRafId: number | null = null;
        const handleTouchMove = (moveEvent: TouchEvent) => {
          if (moveEvent.touches.length !== 1) return;
          const diff = moveEvent.touches[0].clientX - startXRef.current;
          const newWidth = Math.max(min, Math.min(max, Math.round(startWidthRef.current + diff)));
          currentWidthRef.current = newWidth;
          if (touchRafId === null) {
            touchRafId = requestAnimationFrame(() => {
              touchRafId = null;
              onResize?.(currentWidthRef.current);
            });
          }
        };

        const handleTouchEnd = () => {
          if (touchRafId !== null) {
            cancelAnimationFrame(touchRafId);
            touchRafId = null;
          }
          setIsDragging(false);
          window.removeEventListener("touchmove", handleTouchMove);
          window.removeEventListener("touchend", handleTouchEnd);
          if (currentWidthRef.current > 0) {
            onResize?.(currentWidthRef.current);
            onResizeEnd?.(currentWidthRef.current);
          }
        };

        window.addEventListener("touchmove", handleTouchMove, { passive: true });
        window.addEventListener("touchend", handleTouchEnd);
      },
      [minWidth, maxWidth, onResize, onResizeEnd],
    );

    useEffect(() => {
      return () => {
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
    }, []);

    const densityPadding =
      density === "compact"
        ? "py-2 px-2.5 sm:py-2.5 sm:px-3.5"
        : density === "relaxed"
          ? "py-3 px-3.5 sm:py-4 sm:px-5"
          : "py-2.5 px-3 sm:py-3 sm:px-4";

    const widthPx = width !== undefined ? (typeof width === "number" ? `${width}px` : width) : undefined;
    const minWidthPx = minWidth !== undefined ? (typeof minWidth === "number" ? `${minWidth}px` : minWidth) : widthPx;
    const maxWidthPx = maxWidth !== undefined ? (typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth) : undefined;

    const mergedStyle: React.CSSProperties = {
      ...style,
      width: widthPx ?? style?.width,
      minWidth: minWidthPx ?? style?.minWidth,
      maxWidth: maxWidthPx ?? style?.maxWidth,
    };

    const isCenter = className?.includes("text-center") || props.align === "center";
    const isRight = className?.includes("text-right") || props.align === "right";

    return (
      <th
        ref={(el) => {
          thRef.current = el;
          if (typeof ref === "function") ref(el);
          else if (ref) ref.current = el;
        }}
        style={mergedStyle}
        className={cn(
          "relative select-none align-middle text-[11px] font-bold uppercase tracking-wider text-text-secondary",
          densityPadding,
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            "flex items-center gap-1 overflow-hidden text-ellipsis whitespace-nowrap",
            isCenter ? "justify-center text-center" : isRight ? "justify-end text-right" : "justify-between",
          )}
        >
          <span>{children}</span>
        </div>
        {resizable && (
          <div
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            role="separator"
            aria-orientation="vertical"
            title="Drag to resize column width"
            aria-label="Drag to resize column width"
            className="group/resizer absolute -right-2 bottom-0 top-0 z-10 flex w-4 cursor-col-resize touch-none select-none items-center justify-center"
          >
            <div
              className={cn(
                "h-4 w-[1px] rounded-full transition-colors duration-150",
                isDragging
                  ? "shadow-xs h-5 w-[2px] bg-brand-red"
                  : "bg-brand-border/90 group-hover/resizer:h-5 group-hover/resizer:w-[2px] group-hover/resizer:bg-brand-red",
              )}
            />
          </div>
        )}
      </th>
    );
  },
);
TableHead.displayName = "TableHead";

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  density?: TableDensity;
}

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, style, width, minWidth, maxWidth, density = "normal", ...props }, ref) => {
    const densityPadding =
      density === "compact"
        ? "py-2 px-2.5 sm:py-2.5 sm:px-3.5"
        : density === "relaxed"
          ? "py-3 px-3.5 sm:py-4 sm:px-5"
          : "py-2.5 px-3 sm:py-3 sm:px-4";

    const widthPx = width !== undefined ? (typeof width === "number" ? `${width}px` : width) : undefined;
    const minWidthPx = minWidth !== undefined ? (typeof minWidth === "number" ? `${minWidth}px` : minWidth) : widthPx;
    const maxWidthPx = maxWidth !== undefined ? (typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth) : undefined;

    const mergedStyle: React.CSSProperties = {
      ...style,
      width: widthPx ?? style?.width,
      minWidth: minWidthPx ?? style?.minWidth,
      maxWidth: maxWidthPx ?? style?.maxWidth,
    };

    return (
      <td
        ref={ref}
        style={mergedStyle}
        className={cn("align-middle text-text-primary", densityPadding, className)}
        {...props}
      />
    );
  },
);
TableCell.displayName = "TableCell";

export const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => (
    <caption
      ref={ref}
      className={cn("mt-4 text-xs text-text-secondary", className)}
      {...props}
    />
  ),
);
TableCaption.displayName = "TableCaption";

export interface ColumnWidthSetting {
  key: string;
  label: string;
  width: number;
  minWidth?: number;
  maxWidth?: number;
  defaultWidth?: number;
}

export interface ColumnResizeGuideNoticeProps {
  onDismiss?: () => void;
  onResetWidths?: () => void;
  hasCustomWidths?: boolean;
  note?: React.ReactNode;
  className?: string;
}

export const ColumnResizeGuideNotice: React.FC<ColumnResizeGuideNoticeProps> = ({ onDismiss, onResetWidths, hasCustomWidths, note, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: smoothEase }}
      style={{ position: "absolute" }}
      className={cn(
        "shadow-2xs backdrop-blur-xs absolute right-3.5 top-[-15px] z-20 inline-flex items-center gap-1.5 rounded-full border border-brand-red/25 bg-brand-light-red/95 px-2.5 py-1 text-[11px] font-medium text-brand-red transition-all sm:right-5 sm:top-[-15px]",
        className,
      )}
      title="Drag the vertical divider lines (┊) between column headers to resize columns"
    >
      <MoveHorizontal className="h-3 w-3 shrink-0 text-brand-red" />
      <span className="whitespace-nowrap font-semibold">
        {note || (
          <>
            Drag the vertical divider lines <span className="font-bold">┊</span> between column headers to resize columns
          </>
        )}
      </span>

      {onResetWidths && hasCustomWidths && (
        <button
          type="button"
          onClick={onResetWidths}
          className="shadow-2xs hover:text-brand-dark-red ml-1 inline-flex items-center gap-1 rounded-full border border-brand-red/30 bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-brand-red transition-all hover:bg-white"
          title="Reset column widths to default"
          aria-label="Reset column widths"
        >
          <RotateCcw className="h-2.5 w-2.5 shrink-0" />
          <span>Reset</span>
        </button>
      )}

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="ml-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-brand-red/70 transition-colors hover:bg-brand-red/15 hover:text-brand-red"
          title="Dismiss notice"
          aria-label="Dismiss column width adjustment notice"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </motion.div>
  );
};

export interface TableCardProps extends Omit<HTMLMotionProps<"div">, "title"> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  /** Whether to show the column width adjustment guide notice (default: true) */
  showResizeGuide?: boolean;
  /** Storage key used to persist dismissal state in safeStorage */
  guideStorageKey?: string;
  /** Custom guide note text or elements */
  guideNote?: React.ReactNode;
  /** Optional callback to reset column widths */
  onResetWidths?: () => void;
  /** Whether columns have custom widths */
  hasCustomWidths?: boolean;
  /** @deprecated Tab section removed in favor of direct in-table resizing */
  showLayoutTab?: boolean;
  /** @deprecated */
  activeTab?: "table" | "layout";
  /** @deprecated */
  onTabChange?: (tab: "table" | "layout") => void;
  /** @deprecated */
  layoutTabContent?: React.ReactNode;
}

export const TableCard: React.FC<TableCardProps> = ({
  title: _title,
  subtitle,
  action,
  children,
  className,
  showResizeGuide = true,
  guideStorageKey = "ams_table_column_resize_guide_dismissed",
  guideNote,
  onResetWidths,
  hasCustomWidths,
  ...props
}) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (!showResizeGuide) return true;
    return safeStorage.getItem<boolean>(guideStorageKey, false);
  });

  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
    safeStorage.setItem(guideStorageKey, true);
  }, [guideStorageKey]);

  const handleShowGuide = useCallback(() => {
    setIsDismissed(false);
    safeStorage.setItem(guideStorageKey, false);
  }, [guideStorageKey]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: smoothEase }}
      style={{ position: "relative" }}
      className={cn(
        "relative rounded-[18px] border border-brand-border bg-white p-3.5 shadow-card transition-all sm:rounded-[20px] sm:p-5 md:p-6",
        className,
      )}
      {...props}
    >
      {(subtitle || action) && (
        <div className="mb-2.5 flex flex-col gap-2 sm:mb-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          {subtitle && <p className="text-xs text-text-secondary">{subtitle}</p>}
          {action && <div className="flex items-center gap-2 pr-32 sm:ml-auto">{action}</div>}
        </div>
      )}

      <AnimatePresence>
        {showResizeGuide && !isDismissed && (
          <ColumnResizeGuideNotice
            onDismiss={handleDismiss}
            onResetWidths={onResetWidths}
            hasCustomWidths={hasCustomWidths}
            note={guideNote}
          />
        )}
      </AnimatePresence>

      {showResizeGuide && isDismissed && (
        <div
          style={{ position: "absolute" }}
          className="absolute right-3.5 top-[-15px] z-20 flex items-center gap-1.5 sm:right-5 sm:top-[-15px]"
        >
          {onResetWidths && hasCustomWidths && (
            <button
              type="button"
              onClick={onResetWidths}
              className="shadow-2xs inline-flex items-center gap-1 rounded-full border border-brand-border bg-white px-2.5 py-1 text-[11px] font-medium text-text-secondary transition-colors hover:border-brand-red/30 hover:bg-brand-bg hover:text-brand-red"
              title="Reset column widths to default"
            >
              <RotateCcw className="h-2.5 w-2.5 text-brand-red" />
              <span>Reset Widths</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleShowGuide}
            className="shadow-2xs inline-flex items-center gap-1.5 rounded-full border border-brand-border bg-white px-2.5 py-1 text-[11px] font-medium text-text-secondary transition-colors hover:border-brand-red/30 hover:bg-brand-bg hover:text-brand-red"
            title="Show column width adjustment guide"
          >
            <MoveHorizontal className="h-3 w-3 text-brand-red" />
            <span>Resize Guide</span>
          </button>
        </div>
      )}

      {children}
    </motion.div>
  );
};

export interface ColumnDef<T> {
  key: string;
  header: React.ReactNode;
  cell?: (row: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  resizable?: boolean;
  /** Optional parent group header title for multi-tier grouped columns (e.g. "COMMISSION") */
  groupHeader?: React.ReactNode;
  /** Optional class name for the parent group header th */
  groupHeaderClassName?: string;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyExtractor?: (item: T, index: number) => string | number;
  className?: string;
  containerClassName?: string;
  cardClassName?: string;
  emptyMessage?: string;
  density?: TableDensity;
  layout?: TableLayoutMode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  onRowClick?: (item: T, index: number) => void;
  rowClassName?: string | ((item: T, index: number) => string);
  /** Optional renderer for expandable/collapsible row content */
  renderExpandedRow?: (item: T, index: number) => React.ReactNode;
  /** Function to check if a row is expanded */
  isRowExpanded?: (item: T, index: number) => boolean;
  /** Whether to show the column width adjustment guide notice (default: true) */
  showResizeGuide?: boolean;
  /** Storage key to persist guide dismissal in safeStorage */
  guideStorageKey?: string;
  /** Storage key to persist column widths in safeStorage (localStorage). Automatically derived if not specified. */
  storageKey?: string;
  /** Alias for storageKey */
  columnWidthsStorageKey?: string;
  /** Whether to persist column widths to browser localStorage (default: true) */
  persistColumnWidths?: boolean;
  /** Callback fired when column widths change or are saved */
  onColumnWidthsChange?: (widths: Record<string, number>) => void;
  /** Custom guide note text or elements */
  guideNote?: React.ReactNode;
  /** @deprecated Table layout controls section removed in favor of direct in-table resizing */
  enableLayoutTab?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor = (_item, idx) => idx,
  className,
  containerClassName,
  cardClassName,
  emptyMessage = "No records found",
  density = "normal",
  layout = "fixed",
  title,
  subtitle,
  action,
  footer,
  onRowClick,
  rowClassName,
  renderExpandedRow,
  isRowExpanded,
  showResizeGuide = true,
  guideStorageKey = "ams_table_column_resize_guide_dismissed",
  storageKey,
  columnWidthsStorageKey,
  persistColumnWidths = true,
  onColumnWidthsChange,
  guideNote,
}: DataTableProps<T>) {
  // Resolve storage key for column widths persistence in safeStorage
  const resolvedStorageKey = React.useMemo(() => {
    if (!persistColumnWidths) return null;
    const explicitKey = storageKey || columnWidthsStorageKey;
    if (explicitKey) return explicitKey;
    if (typeof title === "string" && title.trim()) {
      return `ams_table_widths_${title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")}`;
    }
    const colSignature = columns.map((c) => c.key).join("_");
    return `ams_table_widths_${colSignature}`;
  }, [persistColumnWidths, storageKey, columnWidthsStorageKey, title, columns]);

  // Compute default column widths from column definitions
  const defaultWidths = React.useMemo(() => {
    const defaults: Record<string, number> = {};
    columns.forEach((col) => {
      defaults[col.key] = col.width || 140;
    });
    return defaults;
  }, [columns]);

  // Initialize columnWidths from safeStorage (localStorage) if available, falling back to defaults
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    const saved = persistColumnWidths && resolvedStorageKey ? safeStorage.getItem<Record<string, number>>(resolvedStorageKey, {}) : {};

    columns.forEach((col) => {
      const savedWidth = saved && typeof saved[col.key] === "number" ? saved[col.key] : undefined;
      if (savedWidth !== undefined) {
        const min = typeof col.minWidth === "number" ? col.minWidth : 50;
        const max = typeof col.maxWidth === "number" ? col.maxWidth : 1000;
        initial[col.key] = Math.max(min, Math.min(max, savedWidth));
      } else {
        initial[col.key] = col.width || 140;
      }
    });
    return initial;
  });

  const [isDirectDismissed, setIsDirectDismissed] = useState<boolean>(() => {
    if (!showResizeGuide || title || subtitle || action) return true;
    return safeStorage.getItem<boolean>(guideStorageKey, false);
  });

  const handleDirectDismiss = useCallback(() => {
    setIsDirectDismissed(true);
    safeStorage.setItem(guideStorageKey, true);
  }, [guideStorageKey]);

  const handleDirectShow = useCallback(() => {
    setIsDirectDismissed(false);
    safeStorage.setItem(guideStorageKey, false);
  }, [guideStorageKey]);

  // Sync columns if columns change dynamically
  useEffect(() => {
    setColumnWidths((prev) => {
      const saved = persistColumnWidths && resolvedStorageKey ? safeStorage.getItem<Record<string, number>>(resolvedStorageKey, {}) : {};

      const next = { ...prev };
      let changed = false;

      columns.forEach((col) => {
        if (next[col.key] === undefined) {
          const savedWidth = saved && typeof saved[col.key] === "number" ? saved[col.key] : undefined;
          if (savedWidth !== undefined) {
            const min = typeof col.minWidth === "number" ? col.minWidth : 50;
            const max = typeof col.maxWidth === "number" ? col.maxWidth : 1000;
            next[col.key] = Math.max(min, Math.min(max, savedWidth));
          } else {
            next[col.key] = col.width || 140;
          }
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [columns, persistColumnWidths, resolvedStorageKey]);

  // Real-time width change during dragging
  const handleWidthChange = useCallback((key: string, newWidth: number) => {
    setColumnWidths((prev) => ({ ...prev, [key]: newWidth }));
  }, []);

  // Save to safeStorage (localStorage) when drag finishes
  const handleResizeEnd = useCallback(
    (key: string, finalWidth: number) => {
      setColumnWidths((prev) => {
        const updated = { ...prev, [key]: finalWidth };
        if (persistColumnWidths && resolvedStorageKey) {
          safeStorage.setItem(resolvedStorageKey, updated);
        }
        onColumnWidthsChange?.(updated);
        return updated;
      });
    },
    [persistColumnWidths, resolvedStorageKey, onColumnWidthsChange],
  );

  // Check if any column has a custom width different from default
  const hasCustomWidths = React.useMemo(() => {
    return columns.some((col) => {
      const current = columnWidths[col.key];
      const defaultW = defaultWidths[col.key];
      return current !== undefined && defaultW !== undefined && current !== defaultW;
    });
  }, [columns, columnWidths, defaultWidths]);

  // Reset column widths to default and clear from safeStorage
  const handleResetWidths = useCallback(() => {
    const reset = { ...defaultWidths };
    setColumnWidths(reset);
    if (persistColumnWidths && resolvedStorageKey) {
      safeStorage.removeItem(resolvedStorageKey);
    }
    onColumnWidthsChange?.(reset);
  }, [defaultWidths, persistColumnWidths, resolvedStorageKey, onColumnWidthsChange]);

  const hasGroupHeaders = React.useMemo(() => {
    return columns.some((col) => col.groupHeader !== undefined && col.groupHeader !== null);
  }, [columns]);

  interface HeaderGroupItem {
    key: string;
    isGroup: boolean;
    groupHeader?: React.ReactNode;
    groupHeaderClassName?: string;
    columns: ColumnDef<T>[];
    colSpan: number;
  }

  const headerGroups = React.useMemo(() => {
    if (!hasGroupHeaders) return [];
    const groups: HeaderGroupItem[] = [];
    let currentGroup: HeaderGroupItem | null = null;

    columns.forEach((col, idx) => {
      if (col.groupHeader) {
        if (currentGroup && currentGroup.isGroup && currentGroup.groupHeader === col.groupHeader) {
          currentGroup.columns.push(col);
          currentGroup.colSpan += 1;
        } else {
          currentGroup = {
            key: `group-${idx}-${col.key}`,
            isGroup: true,
            groupHeader: col.groupHeader,
            groupHeaderClassName: col.groupHeaderClassName,
            columns: [col],
            colSpan: 1,
          };
          groups.push(currentGroup);
        }
      } else {
        currentGroup = null;
        groups.push({
          key: `single-${col.key}`,
          isGroup: false,
          columns: [col],
          colSpan: 1,
        });
      }
    });

    return groups;
  }, [hasGroupHeaders, columns]);

  const tableElement = (
    <div className="shadow-2xs overflow-hidden rounded-xl border border-brand-border/80 bg-white">
      <Table
        layout={layout}
        density={density}
        className={className}
        containerClassName={cn(
          "overflow-x-auto touch-pan-x scrollbar-thin scrollbar-thumb-brand-border/70 scrollbar-track-transparent",
          containerClassName,
        )}
      >
        <TableHeader>
          {!hasGroupHeaders ? (
            <TableRow className="border-b border-brand-border bg-brand-bg/85 hover:bg-brand-bg/85">
              {columns.map((col, index) => {
                const currentW = columnWidths[col.key];
                const isLast = index === columns.length - 1;
                return (
                  <TableHead
                    key={col.key}
                    width={currentW}
                    minWidth={col.minWidth}
                    maxWidth={col.maxWidth}
                    resizable={col.resizable !== false && (col.resizable === true || !isLast)}
                    onResize={(newWidth) => handleWidthChange(col.key, newWidth)}
                    onResizeEnd={(finalWidth) => handleResizeEnd(col.key, finalWidth)}
                    density={density}
                    className={col.headerClassName}
                  >
                    {col.header}
                  </TableHead>
                );
              })}
            </TableRow>
          ) : (
            <>
              <TableRow className="border-b border-brand-border bg-brand-bg/85 text-[11px] font-bold uppercase tracking-wider text-text-secondary hover:bg-brand-bg/85">
                {headerGroups.map((group) => {
                  if (!group.isGroup) {
                    const col = group.columns[0];
                    const colIndex = columns.findIndex((c) => c.key === col.key);
                    const isLast = colIndex === columns.length - 1;
                    const currentW = columnWidths[col.key];

                    return (
                      <TableHead
                        key={col.key}
                        rowSpan={2}
                        width={currentW}
                        minWidth={col.minWidth}
                        maxWidth={col.maxWidth}
                        resizable={col.resizable !== false && (col.resizable === true || !isLast)}
                        onResize={(newWidth) => handleWidthChange(col.key, newWidth)}
                        onResizeEnd={(finalWidth) => handleResizeEnd(col.key, finalWidth)}
                        density={density}
                        className={cn("border-r border-brand-border/70 align-middle font-bold text-text-secondary", col.headerClassName)}
                      >
                        {col.header}
                      </TableHead>
                    );
                  } else {
                    return (
                      <th
                        key={group.key}
                        colSpan={group.colSpan}
                        className={cn(
                          "relative select-none border-b border-r border-brand-border bg-brand-light-red/35 px-3 py-2 text-center align-middle text-[11px] font-bold uppercase tracking-wider text-burgundy-primary",
                          group.groupHeaderClassName,
                        )}
                      >
                        <div className="flex items-center justify-center font-bold text-burgundy-primary">
                          <span>{group.groupHeader}</span>
                        </div>
                      </th>
                    );
                  }
                })}
              </TableRow>

              <TableRow className="border-b border-brand-border bg-brand-bg/85 text-[11px] font-bold uppercase tracking-wider text-text-secondary hover:bg-brand-bg/85">
                {columns
                  .filter((col) => col.groupHeader)
                  .map((col) => {
                    const colIndex = columns.findIndex((c) => c.key === col.key);
                    const isLast = colIndex === columns.length - 1;
                    const currentW = columnWidths[col.key];

                    return (
                      <TableHead
                        key={col.key}
                        width={currentW}
                        minWidth={col.minWidth}
                        maxWidth={col.maxWidth}
                        resizable={col.resizable !== false && (col.resizable === true || !isLast)}
                        onResize={(newWidth) => handleWidthChange(col.key, newWidth)}
                        onResizeEnd={(finalWidth) => handleResizeEnd(col.key, finalWidth)}
                        density={density}
                        className={cn("border-r border-brand-border/70 font-bold text-text-secondary", col.headerClassName)}
                      >
                        {col.header}
                      </TableHead>
                    );
                  })}
              </TableRow>
            </>
          )}
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columns.length}
                density={density}
                className="py-12 text-center"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, ease: smoothEase }}
                  className="flex flex-col items-center justify-center"
                >
                  <div className="shadow-xs mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl border border-brand-border bg-brand-bg text-text-muted">
                    <TableIcon className="h-5 w-5 text-text-muted" />
                  </div>
                  <p className="text-xs font-semibold text-text-primary">{emptyMessage}</p>
                </motion.div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, index) => {
              const customRowClass = typeof rowClassName === "function" ? rowClassName(item, index) : rowClassName;
              const isExpanded = Boolean(isRowExpanded?.(item, index));
              return (
                <React.Fragment key={keyExtractor(item, index)}>
                  <motion.tr
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.24,
                      delay: Math.min(index * 0.03, 0.25),
                      ease: smoothEase,
                    }}
                    whileHover={onRowClick ? { backgroundColor: "rgba(252, 248, 249, 0.85)" } : undefined}
                    whileTap={onRowClick ? { scale: 0.998 } : undefined}
                    onClick={() => onRowClick?.(item, index)}
                    className={cn(
                      "border-b border-brand-border/60 transition-colors duration-150 last:border-b-0",
                      onRowClick ? "cursor-pointer hover:bg-brand-bg/80" : "hover:bg-brand-bg/50",
                      isExpanded && "bg-burgundy-primary/[0.03]",
                      customRowClass,
                    )}
                  >
                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        width={columnWidths[col.key]}
                        minWidth={columnWidths[col.key]}
                        maxWidth={col.maxWidth}
                        density={density}
                        className={col.className}
                      >
                        {col.cell ? col.cell(item, index) : ((item as Record<string, unknown>)[col.key] as React.ReactNode)}
                      </TableCell>
                    ))}
                  </motion.tr>
                  {renderExpandedRow && (
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.tr
                          key={`expanded-row-${keyExtractor(item, index)}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.28, ease: smoothEase }}
                          className="border-b border-brand-border/80 bg-brand-bg/30"
                        >
                          <td
                            colSpan={columns.length}
                            className="p-0"
                          >
                            <motion.div
                              key={`expanded-content-${keyExtractor(item, index)}`}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{
                                height: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
                                opacity: { duration: 0.22, ease: "easeInOut" },
                              }}
                              className="overflow-hidden"
                            >
                              {renderExpandedRow(item, index)}
                            </motion.div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  )}
                </React.Fragment>
              );
            })
          )}
        </TableBody>
        {footer && <TableFooter>{footer}</TableFooter>}
      </Table>
      {/* Mobile scroll swipe indicator hint */}
      <div className="flex items-center justify-between border-t border-brand-border/40 bg-brand-bg/40 px-3 py-1.5 text-[10px] font-medium text-text-secondary sm:hidden">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brand-red" />
          Swipe horizontally to view all columns
        </span>
        <span className="font-bold text-brand-red">→</span>
      </div>
    </div>
  );

  if (title || subtitle || action || cardClassName) {
    return (
      <TableCard
        title={title}
        subtitle={subtitle}
        action={action}
        className={cardClassName}
        showResizeGuide={showResizeGuide}
        guideStorageKey={guideStorageKey}
        guideNote={guideNote}
        onResetWidths={handleResetWidths}
        hasCustomWidths={hasCustomWidths}
      >
        {tableElement}
      </TableCard>
    );
  }

  return (
    <div
      style={{ position: "relative" }}
      className="relative"
    >
      <AnimatePresence>
        {showResizeGuide && !isDirectDismissed && (
          <ColumnResizeGuideNotice
            onDismiss={handleDirectDismiss}
            onResetWidths={handleResetWidths}
            hasCustomWidths={hasCustomWidths}
            note={guideNote}
          />
        )}
      </AnimatePresence>

      {showResizeGuide && isDirectDismissed && (
        <div
          style={{ position: "absolute" }}
          className="absolute right-3.5 top-[-15px] z-20 flex items-center gap-1.5 sm:right-5 sm:top-[-15px]"
        >
          {hasCustomWidths && (
            <button
              type="button"
              onClick={handleResetWidths}
              className="shadow-2xs inline-flex items-center gap-1 rounded-full border border-brand-border bg-white px-2.5 py-1 text-[11px] font-medium text-text-secondary transition-colors hover:border-brand-red/30 hover:bg-brand-bg hover:text-brand-red"
              title="Reset column widths to default"
            >
              <RotateCcw className="h-2.5 w-2.5 text-brand-red" />
              <span>Reset Widths</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleDirectShow}
            className="shadow-2xs inline-flex items-center gap-1.5 rounded-full border border-brand-border bg-white px-2.5 py-1 text-[11px] font-medium text-text-secondary transition-colors hover:border-brand-red/30 hover:bg-brand-bg hover:text-brand-red"
            title="Show column width adjustment guide"
          >
            <MoveHorizontal className="h-3 w-3 text-brand-red" />
            <span>Resize Guide</span>
          </button>
        </div>
      )}

      {tableElement}
    </div>
  );
}
