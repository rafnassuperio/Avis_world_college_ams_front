import React, { useState, useRef, useEffect, useCallback, useId } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { smoothEase, snappySpring } from "@/components/animations/transitions";
import { DynamicIcon } from "./DynamicIcon";

export type TabBadgeVariant = "default" | "alert" | "warning" | "neutral" | "brand" | "success" | "purple" | "blue";

export type TabAlignment = "start" | "center" | "end" | "between" | "stretch" | "equal" | "50/50" | "50-50" | "left" | "right";

export type TabContentAlignment = "start" | "center" | "end" | "between";

export interface SubTabItem<S extends string = string> {
  id: S;
  label: React.ReactNode;
  shortLabel?: string;
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  iconName?: string;
  badge?: string | number;
  badgeVariant?: TabBadgeVariant;
  dotColor?: string;
  disabled?: boolean;
  content?: React.ReactNode | ((subTab: SubTabItem<S>) => React.ReactNode);
  ariaLabel?: string;
}

export interface TabItem<T extends string = string, S extends string = string> {
  id: T;
  label: React.ReactNode;
  shortLabel?: string;
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  iconName?: string;
  badge?: string | number;
  badgeVariant?: TabBadgeVariant;
  description?: string;
  disabled?: boolean;
  className?: string;
  content?: React.ReactNode | ((tab: TabItem<T, S>, activeSubTab?: SubTabItem<S>) => React.ReactNode);
  ariaLabel?: string;

  /**
   * Child tabs (submenu pills).
   * If provided with items and not false, the child tab bar will be displayed.
   * If false, undefined, or empty, the child tab bar will NOT be shown, and the component/page renders directly.
   */
  subTabs?: SubTabItem<S>[] | false;
  childrenTabs?: SubTabItem<S>[] | false;
  hasChildTabs?: boolean;
  showSubTabs?: boolean;
  defaultSubTabId?: S;
  activeSubTabId?: S;
}

export type TabsVariant = "folder" | "pills" | "underline" | "minimal";
export type TabsSize = "sm" | "md" | "lg";

export interface TabsProps<T extends string = string, S extends string = string> {
  items: TabItem<T, S>[];
  value?: T;
  defaultValue?: T;
  onChange?: (tabId: T, tabItem: TabItem<T, S>) => void;
  storageKey?: string;

  // Sub-tab controls
  activeSubTabId?: S;
  defaultSubTabId?: S;
  onSubTabChange?: (subTabId: S, subTab: SubTabItem<S>, parentTab: TabItem<T, S>) => void;
  showChildTabs?: boolean;

  ariaLabel?: string;
  variant?: TabsVariant;
  size?: TabsSize;
  layoutId?: string;
  animated?: boolean;
  hideScrollArrows?: boolean;

  /**
   * Tab alignment and distribution mode:
   * - "start" / "left": tabs aligned to left with natural width (default)
   * - "center": tabs centered horizontally with natural width
   * - "end" / "right": tabs aligned to right with natural width
   * - "between": spaced across the bar
   * - "equal" / "stretch" / "50/50" / "50-50": tabs expand to equal width (50% and 50% rule for 2 tabs)
   */
  align?: TabAlignment;

  /**
   * Enforces equal width distribution across all tabs (50% and 50% rule for 2 tabs).
   */
  equalWidth?: boolean;

  /**
   * Alias for equalWidth / stretch.
   */
  fullWidth?: boolean;

  /**
   * Explicit 50 and 50 rule flag (allocates 50% width to each tab when 2 tabs exist, or equal split).
   */
  fiftyFifty?: boolean;

  /**
   * Whether to display vertical dividers between inactive tabs (defaults to true for multi-tab lists).
   */
  showDividers?: boolean;

  /**
   * Alignment of content (icon, label, badge) inside each tab button:
   * - "center": centered inside the tab button (default when equalWidth / 50-50 is active)
   * - "start": aligned to start / left
   * - "end": aligned to end / right
   * - "between": space between icon, label, and badge
   */
  contentAlign?: TabContentAlignment;

  /**
   * Spacing between tab buttons: "none" (0) | "sm" (4px) | "md" (6px) | "lg" (10px)
   */
  gap?: "none" | "sm" | "md" | "lg";

  className?: string;
  headerClassName?: string;
  listClassName?: string;
  tabClassName?: string;
  activeTabClassName?: string;
  indicatorClassName?: string;
  panelClassName?: string;
  subTabListClassName?: string;
  subTabClassName?: string;
  activeSubTabClassName?: string;
  subTabAlign?: TabAlignment;
  subTabEqualWidth?: boolean;
  children?: React.ReactNode | ((activeTab: T, activeItem?: TabItem<T, S>, activeSubTab?: SubTabItem<S>) => React.ReactNode);
}

export function Tabs<T extends string = string, S extends string = string>({
  items,
  value,
  defaultValue,
  onChange,
  storageKey = "studentsTableActiveTab",
  activeSubTabId,
  defaultSubTabId,
  onSubTabChange,
  showChildTabs = true,
  ariaLabel = "Tabs",
  variant = "folder",
  size = "md",
  layoutId,
  animated = true,
  hideScrollArrows = false,
  align = "start",
  equalWidth = false,
  fullWidth = false,
  fiftyFifty = false,
  showDividers,
  contentAlign,
  gap,
  className,
  headerClassName,
  listClassName,
  tabClassName,
  activeTabClassName,
  indicatorClassName,
  panelClassName,
  subTabListClassName,
  subTabClassName,
  activeSubTabClassName,
  subTabAlign = "start",
  subTabEqualWidth = false,
  children,
}: TabsProps<T, S>) {
  const autoId = useId();
  const shouldReduceMotion = useReducedMotion();
  const effectiveLayoutId = layoutId || `tabs-indicator-${autoId}`;

  // Tab alignment and equal width (50/50 rule) resolution
  const is5050Rule = Boolean(fiftyFifty || align === "50/50" || align === "50-50");
  const isEqualWidth = Boolean(equalWidth || fullWidth || align === "equal" || align === "stretch" || is5050Rule);

  const getTabWidthClass = (equal: boolean, itemCount: number) => {
    if (!equal) return "shrink-0";
    if (itemCount <= 2) return "flex-1 min-w-0";
    return "flex-1 min-w-[135px] lg:min-w-0";
  };

  const getAlignmentClass = (alignment?: TabAlignment) => {
    switch (alignment) {
      case "center":
        return "justify-center";
      case "end":
      case "right":
        return "justify-end";
      case "between":
        return "justify-between";
      case "stretch":
      case "equal":
      case "50/50":
      case "50-50":
      case "start":
      case "left":
      default:
        return "justify-start";
    }
  };

  const getContentAlignmentClass = (alignment?: TabContentAlignment, equal?: boolean) => {
    if (alignment) {
      switch (alignment) {
        case "start":
          return "justify-start text-left";
        case "end":
          return "justify-end text-right";
        case "between":
          return "justify-between";
        case "center":
        default:
          return "justify-center text-center";
      }
    }
    return equal ? "justify-center text-center" : "justify-start text-left";
  };

  const getGapClass = (gapSize?: "none" | "sm" | "md" | "lg") => {
    switch (gapSize) {
      case "none":
        return "gap-0";
      case "sm":
        return "gap-1";
      case "lg":
        return "gap-2.5";
      case "md":
      default:
        return isImageTabStyle && hasChildTabs ? "gap-1" : "gap-1.5";
    }
  };

  // Find first enabled tab id for default
  const firstEnabledId = items.find((item) => !item.disabled)?.id || items[0]?.id;

  // Uncontrolled vs Controlled state for main tab with persistence
  const isControlled = value !== undefined;
  const [internalActiveTab, setInternalActiveTab] = useState<T>(() => {
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        const savedTab = sessionStorage.getItem(storageKey || "studentsTableActiveTab");
        if (savedTab && items.some((item) => item.id === savedTab && !item.disabled)) {
          return savedTab as T;
        }
      }
    } catch {
      // Ignore sessionStorage access errors
    }
    return defaultValue !== undefined ? defaultValue : firstEnabledId;
  });

  const activeTab = isControlled ? (value as T) : internalActiveTab;

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.sessionStorage && activeTab) {
        sessionStorage.setItem(storageKey || "studentsTableActiveTab", String(activeTab));
      }
    } catch {
      // Ignore sessionStorage access errors
    }
  }, [activeTab, storageKey]);
  const activeIndex = items.findIndex((item) => item.id === activeTab);
  const activeItem = items[activeIndex] || items.find((item) => item.id === activeTab);

  // SubTab resolution
  const rawSubTabs = activeItem?.subTabs ?? activeItem?.childrenTabs;
  const hasChildExplicit = activeItem?.hasChildTabs !== false && activeItem?.showSubTabs !== false;
  const hasChildTabs = Boolean(showChildTabs && hasChildExplicit && Array.isArray(rawSubTabs) && rawSubTabs.length > 0);
  const currentSubTabs: SubTabItem<S>[] = hasChildTabs ? (rawSubTabs as SubTabItem<S>[]) : [];

  // SubTab state per parent tab
  const isSubControlled = activeSubTabId !== undefined;
  const [internalSubTabMap, setInternalSubTabMap] = useState<Record<string, S>>({});

  const currentActiveSubTabId: S | undefined = isSubControlled
    ? activeSubTabId
    : internalSubTabMap[String(activeTab)] ||
      activeItem?.activeSubTabId ||
      activeItem?.defaultSubTabId ||
      defaultSubTabId ||
      currentSubTabs.find((s) => !s.disabled)?.id ||
      currentSubTabs[0]?.id;

  const activeSubItem = currentSubTabs.find((s) => s.id === currentActiveSubTabId) || currentSubTabs[0];

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll overflows for responsive indicator arrows
  const checkScroll = useCallback(() => {
    if (!scrollContainerRef.current || hideScrollArrows) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, [hideScrollArrows]);

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      checkScroll();
    });

    resizeObserver.observe(container);
    window.addEventListener("resize", checkScroll);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, items.length]);

  const scrollTabs = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const distance = 240;
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  const handleSelectTab = (tab: TabItem<T, S>) => {
    if (tab.disabled || tab.id === activeTab) return;
    if (!isControlled) {
      setInternalActiveTab(tab.id);
    }
    onChange?.(tab.id, tab);
  };

  const handleSelectSubTab = (subTab: SubTabItem<S>) => {
    if (subTab.disabled || subTab.id === currentActiveSubTabId) return;
    if (!isSubControlled) {
      setInternalSubTabMap((prev) => ({
        ...prev,
        [String(activeTab)]: subTab.id,
      }));
    }
    if (activeItem) {
      onSubTabChange?.(subTab.id, subTab, activeItem);
    }
  };

  // Keyboard navigation for main tabs
  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    const enabledIndices = items.map((item, idx) => (!item.disabled ? idx : -1)).filter((idx) => idx !== -1);
    if (enabledIndices.length === 0) return;

    const currentPositionInEnabled = enabledIndices.indexOf(currentIndex);

    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextPos = (currentPositionInEnabled + 1) % enabledIndices.length;
      handleSelectTab(items[enabledIndices[nextPos]]);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevPos = (currentPositionInEnabled - 1 + enabledIndices.length) % enabledIndices.length;
      handleSelectTab(items[enabledIndices[prevPos]]);
    } else if (e.key === "Home") {
      e.preventDefault();
      handleSelectTab(items[enabledIndices[0]]);
    } else if (e.key === "End") {
      e.preventDefault();
      handleSelectTab(items[enabledIndices[enabledIndices.length - 1]]);
    }
  };

  // Helper for rendering icons
  const renderIcon = (item: { icon?: React.ComponentType<{ className?: string }> | React.ReactNode; iconName?: string }) => {
    if (item.icon) {
      if (React.isValidElement(item.icon)) {
        return item.icon;
      }
      const IconComp = item.icon as React.ComponentType<{ className?: string }>;
      return <IconComp className="h-4 w-4" />;
    }

    if (item.iconName) {
      return (
        <DynamicIcon
          name={item.iconName}
          className="h-4 w-4"
        />
      );
    }

    return null;
  };

  // Helper for status dot on inactive subtabs
  const getSubTabDotColor = (subTab: SubTabItem<S>) => {
    if (subTab.dotColor) return subTab.dotColor;

    const idLower = String(subTab.id).toLowerCase();
    const labelLower = typeof subTab.label === "string" ? subTab.label.toLowerCase() : "";
    const variant = subTab.badgeVariant;

    if (variant === "success" || idLower.includes("active") || labelLower.includes("active") || idLower.includes("approved")) {
      return "bg-[#10B981]";
    }
    if (variant === "alert" || variant === "warning" || idLower.includes("pending") || labelLower.includes("pending")) {
      return "bg-[#F59E0B]";
    }
    if (variant === "brand" || variant === "purple" || idLower.includes("graduated") || labelLower.includes("graduated")) {
      return "bg-[#9333EA]";
    }
    if (variant === "neutral" || variant === "blue" || idLower.includes("leave") || labelLower.includes("leave")) {
      return "bg-[#3B82F6]";
    }
    return null;
  };

  // Helper for rendering badges on main tabs
  const renderBadge = (tab: TabItem<T, S>, isActive: boolean) => {
    if (tab.badge === undefined || tab.badge === null) return null;

    if (isActive) {
      return (
        <span className="relative z-10 rounded-full bg-[#FCE7ED] px-2.5 py-0.5 text-[11px] font-bold leading-none text-[#7E1638] transition-colors">
          {tab.badge}
        </span>
      );
    }

    if (tab.badgeVariant === "alert") {
      return (
        <span className="relative z-10 rounded-full bg-[#E11D48] px-2.5 py-0.5 text-[11px] font-bold leading-none text-white shadow-sm transition-colors">
          {tab.badge}
        </span>
      );
    }

    if (tab.badgeVariant === "neutral") {
      return (
        <span className="backdrop-blur-xs relative z-10 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-medium leading-none text-white/95 transition-colors">
          {tab.badge}
        </span>
      );
    }

    return (
      <span className="backdrop-blur-xs relative z-10 rounded-full bg-black/25 px-2.5 py-0.5 text-[11px] font-medium leading-none text-white/90 transition-colors">
        {tab.badge}
      </span>
    );
  };

  // Helper for rendering badges on sub tabs
  const renderSubBadge = (subTab: SubTabItem<S>, isSubActive: boolean) => {
    if (subTab.badge === undefined || subTab.badge === null) return null;

    if (isSubActive) {
      return (
        <span className="relative z-10 rounded-full bg-[#851C42] px-2.5 py-0.5 text-[11px] font-bold leading-none text-white transition-colors">
          {subTab.badge}
        </span>
      );
    }

    const idLower = String(subTab.id).toLowerCase();
    const labelLower = typeof subTab.label === "string" ? subTab.label.toLowerCase() : "";
    const variant = subTab.badgeVariant;

    // Active / Success -> mint green badge
    if (variant === "success" || idLower.includes("active") || labelLower.includes("active") || idLower.includes("approved")) {
      return (
        <span className="relative z-10 rounded-full bg-[#D1FAE5] px-2 py-0.5 text-[11px] font-bold leading-none text-[#047857] transition-colors">
          {subTab.badge}
        </span>
      );
    }

    // Pending / Alert / Warning -> warm amber badge
    if (variant === "alert" || variant === "warning" || idLower.includes("pending") || labelLower.includes("pending")) {
      return (
        <span className="relative z-10 rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[11px] font-bold leading-none text-[#B45309] transition-colors">
          {subTab.badge}
        </span>
      );
    }

    // Graduated / Brand / Purple -> lavender/purple badge
    if (variant === "brand" || variant === "purple" || idLower.includes("graduated") || labelLower.includes("graduated")) {
      return (
        <span className="relative z-10 rounded-full bg-[#F3E8FF] px-2 py-0.5 text-[11px] font-bold leading-none text-[#7E22CE] transition-colors">
          {subTab.badge}
        </span>
      );
    }

    // On Leave / Neutral / Blue -> soft blue badge
    if (variant === "neutral" || variant === "blue" || idLower.includes("leave") || labelLower.includes("leave")) {
      return (
        <span className="relative z-10 rounded-full bg-[#DBEAFE] px-2 py-0.5 text-[11px] font-bold leading-none text-[#1D4ED8] transition-colors">
          {subTab.badge}
        </span>
      );
    }

    // Default neutral pill badge
    return (
      <span className="relative z-10 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium leading-none text-slate-700 transition-colors">
        {subTab.badge}
      </span>
    );
  };

  // Size styling map
  const sizeStyles: Record<TabsSize, string> = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-xs sm:text-sm",
    lg: "px-5 py-2.5 text-sm sm:text-base",
  };

  const isImageTabStyle = variant === "folder" || variant === "pills";

  // Dynamic header container styling
  const getHeaderContainerStyles = () => {
    if (isImageTabStyle) {
      if (hasChildTabs) {
        return "relative z-20 flex w-full items-center justify-between rounded-t-[22px] sm:rounded-t-[26px] rounded-b-none bg-gradient-to-r from-[#4A1024] via-[#5C142E] to-[#6E1837] pt-2 sm:pt-2.5 px-3 sm:px-4 pb-0 shadow-[0_4px_20px_-2px_rgba(40,12,22,0.18)]";
      }
      return "relative z-20 flex w-full items-center justify-between rounded-[22px] sm:rounded-[26px] bg-gradient-to-r from-[#4A1024] via-[#5C142E] to-[#6E1837] p-2 sm:p-2.5 shadow-[0_4px_20px_-2px_rgba(40,12,22,0.18)]";
    }

    if (variant === "underline") {
      return "border-b border-brand-border bg-transparent p-0 pb-1 rounded-none shadow-none w-full";
    }

    return "rounded-xl border-none bg-brand-bg/60 p-1.5 shadow-none w-full";
  };

  // Determine content to render in panel
  const renderPanelContent = () => {
    if (typeof children === "function") {
      return children(activeTab, activeItem, activeSubItem);
    }
    if (children) {
      return children;
    }
    // If child tab is active and has individual content
    if (hasChildTabs && activeSubItem?.content) {
      return typeof activeSubItem.content === "function" ? activeSubItem.content(activeSubItem) : activeSubItem.content;
    }
    // Parent tab content
    if (activeItem?.content) {
      return typeof activeItem.content === "function" ? activeItem.content(activeItem, activeSubItem) : activeItem.content;
    }
    return null;
  };

  const panelContent = renderPanelContent();

  return (
    <div className={cn("space-y-4", className)}>
      {/* Navigation Bars Group */}
      <div className={cn("relative", headerClassName)}>
        {/* Top Navigation Bar */}
        <div className={cn(getHeaderContainerStyles(), "transition-all")}>
          {/* Decorative organic ribbons / waves on the right matching reference design */}
          {isImageTabStyle && (
            <svg
              className="sm:rounded-tb-[26px] pointer-events-none absolute bottom-0 right-0 top-0 h-full w-72 select-none overflow-hidden rounded-tr-[22px] opacity-45 sm:w-80 sm:rounded-tr-[26px]"
              viewBox="0 0 320 60"
              preserveAspectRatio="none"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M 110 60 C 170 55 210 30 260 0 L 320 0 L 320 60 Z"
                fill="url(#topbar-wave-1)"
              />
              <path
                d="M 180 60 C 230 48 265 24 320 10 L 320 60 Z"
                fill="url(#topbar-wave-2)"
              />
              <path
                d="M 130 60 C 185 56 235 36 290 0"
                stroke="rgba(244, 63, 94, 0.3)"
                strokeWidth="1.5"
              />
              <path
                d="M 200 60 C 242 52 272 30 320 16"
                stroke="rgba(251, 113, 133, 0.25)"
                strokeWidth="1.5"
              />
              <defs>
                <linearGradient
                  id="topbar-wave-1"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#831843"
                    stopOpacity="0.1"
                  />
                  <stop
                    offset="100%"
                    stopColor="#BE123C"
                    stopOpacity="0.38"
                  />
                </linearGradient>
                <linearGradient
                  id="topbar-wave-2"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#9F1239"
                    stopOpacity="0.15"
                  />
                  <stop
                    offset="100%"
                    stopColor="#E11D48"
                    stopOpacity="0.45"
                  />
                </linearGradient>
              </defs>
            </svg>
          )}

          {/* Left Scroll Arrow */}
          {!hideScrollArrows && !isEqualWidth && canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollTabs("left")}
              className="absolute left-1 top-1/2 z-30 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl border border-white/20 bg-burgundy-dark/90 text-white shadow-md hover:bg-burgundy-dark focus:outline-none"
              aria-label="Scroll tabs left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          {/* Scrollable Tab List */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            role="tablist"
            aria-label={ariaLabel}
            className={cn(
              "no-scrollbar relative z-10 flex w-full min-w-0 flex-1 overflow-x-auto scroll-smooth",
              getAlignmentClass(align),
              getGapClass(gap),
              isImageTabStyle && hasChildTabs ? "items-end px-2.5 pb-0 pt-1 sm:px-3" : "items-center px-2.5 py-1 sm:px-3",
              listClassName,
            )}
          >
            {items.map((tab, index) => {
              const isActive = activeTab === tab.id;
              const iconElement = renderIcon(tab);

              if (isImageTabStyle) {
                return (
                  <React.Fragment key={tab.id}>
                    <button
                      type="button"
                      role="tab"
                      id={`tab-${autoId}-${tab.id}`}
                      aria-selected={isActive}
                      aria-controls={`panel-${autoId}-${tab.id}`}
                      aria-label={tab.ariaLabel || (typeof tab.label === "string" ? tab.label : undefined)}
                      disabled={tab.disabled}
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => handleSelectTab(tab)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className={cn(
                        "group relative flex items-center gap-2 font-semibold transition-all duration-200 focus:outline-none",
                        getTabWidthClass(isEqualWidth, items.length),
                        getContentAlignmentClass(contentAlign, isEqualWidth),
                        sizeStyles[size],
                        tab.disabled && "cursor-not-allowed opacity-50",
                        isActive
                          ? hasChildTabs
                            ? "z-30 px-4 pb-2.5 pt-2.5 font-bold text-[#2A0815] sm:px-5"
                            : "z-20 my-1 rounded-xl border border-transparent px-4 py-2 font-bold text-[#2A0815]"
                          : hasChildTabs
                            ? "backdrop-blur-xs mb-1.5 rounded-xl border border-white/10 px-3.5 py-2 text-white shadow-sm transition-all hover:border-white/10 hover:bg-white/10 hover:shadow sm:px-4"
                            : "backdrop-blur-xs my-1 rounded-xl border border-white/10 px-3.5 py-2 text-white shadow-sm transition-all hover:border-white/10 hover:bg-white/10 hover:shadow sm:px-4",
                        isActive && activeTabClassName,
                        tab.className,
                        tabClassName,
                      )}
                    >
                      {/* Smooth animated active tab white surface & inverted fillet curves */}
                      {isActive && (
                        <motion.div
                          layoutId={`${effectiveLayoutId}-folder-active-bg`}
                          className={cn(
                            "absolute inset-0 z-0 bg-white",
                            hasChildTabs
                              ? "rounded-b-none rounded-t-[18px] shadow-[0_-2px_8px_rgba(0,0,0,0.04)]"
                              : "rounded-xl border border-white shadow-sm",
                          )}
                          transition={shouldReduceMotion ? { duration: 0 } : snappySpring}
                        >
                          {/* Inverted fillet curves connecting seamlessly into child tab bar */}
                          {hasChildTabs && (
                            <>
                              {/* Left concave fillet */}
                              <svg
                                className="pointer-events-none absolute -bottom-[0.5px] -left-[17px] z-30 h-[18px] w-[18px] fill-white text-white"
                                viewBox="0 0 18 18"
                                aria-hidden="true"
                              >
                                <path d="M 18 0 A 18 18 0 0 1 0 18 H 18 Z" />
                              </svg>

                              {/* Right concave fillet */}
                              <svg
                                className="pointer-events-none absolute -bottom-[0.5px] -right-[17px] z-30 h-[18px] w-[18px] fill-white text-white"
                                viewBox="0 0 18 18"
                                aria-hidden="true"
                              >
                                <path d="M 0 0 A 18 18 0 0 0 18 18 H 0 Z" />
                              </svg>
                            </>
                          )}
                        </motion.div>
                      )}

                      {/* Tab Icon */}
                      {iconElement && (
                        <span
                          className={cn(
                            "relative z-10 flex h-4 w-4 shrink-0 items-center justify-center transition-all duration-200 group-hover:scale-105",
                            isActive ? "text-[#4A1024]" : "text-white/85 group-hover:text-white",
                          )}
                        >
                          {iconElement}
                        </span>
                      )}

                      {/* Tab Label */}
                      <span className="relative z-10 truncate whitespace-nowrap tracking-tight">
                        {tab.shortLabel ? (
                          <>
                            <span className="sm:hidden">{tab.shortLabel}</span>
                            <span className="hidden sm:inline">{tab.label}</span>
                          </>
                        ) : (
                          tab.label
                        )}
                      </span>

                      {/* Tab Badge */}
                      <span className="relative z-10 shrink-0">{renderBadge(tab, isActive)}</span>
                    </button>

                    {/* Sleek vertical divider between inactive tabs (if showDividers is explicitly enabled) */}
                    {Boolean(showDividers) && index < items.length - 1 && !isActive && items[index + 1]?.id !== activeTab && (
                      <span
                        className={cn("mx-1 h-3.5 w-[1px] shrink-0 self-center bg-white/20 sm:mx-1.5 sm:h-4", hasChildTabs ? "mb-1.5" : "my-0")}
                        aria-hidden="true"
                      />
                    )}
                  </React.Fragment>
                );
              }

              // Fallback for minimal / underline variants
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={`tab-${autoId}-${tab.id}`}
                  aria-selected={isActive}
                  aria-controls={`panel-${autoId}-${tab.id}`}
                  aria-label={tab.ariaLabel || (typeof tab.label === "string" ? tab.label : undefined)}
                  disabled={tab.disabled}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => handleSelectTab(tab)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className={cn(
                    "group relative flex items-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red",
                    getTabWidthClass(isEqualWidth, items.length),
                    getContentAlignmentClass(contentAlign, isEqualWidth),
                    sizeStyles[size],
                    tab.disabled && "cursor-not-allowed opacity-50",
                    isActive ? cn("text-burgundy-primary", activeTabClassName) : "text-text-secondary hover:bg-brand-bg/70 hover:text-text-primary",
                    tab.className,
                    tabClassName,
                  )}
                >
                  {isActive && variant === "underline" && (
                    <motion.div
                      layoutId={shouldReduceMotion ? undefined : effectiveLayoutId}
                      className={cn("absolute bottom-0 left-0 right-0 h-0.5 bg-burgundy-primary shadow-sm", indicatorClassName)}
                    />
                  )}
                  {iconElement && <span className="relative z-10 shrink-0">{iconElement}</span>}
                  <span className="relative z-10 truncate whitespace-nowrap tracking-tight">{tab.label}</span>
                  <span className="relative z-10 shrink-0">{renderBadge(tab, isActive)}</span>
                </button>
              );
            })}
          </div>

          {/* Right Scroll Arrow */}
          {!hideScrollArrows && !isEqualWidth && canScrollRight && (
            <button
              type="button"
              onClick={() => scrollTabs("right")}
              className="absolute right-1 top-1/2 z-30 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl border border-white/20 bg-burgundy-dark/90 text-white shadow-md hover:bg-burgundy-dark focus:outline-none"
              aria-label="Scroll tabs right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Child Tab Submenu Bar (rendered ONLY if child tab is active/true) */}
        <AnimatePresence>
          {hasChildTabs && currentSubTabs.length > 0 && (
            <motion.div
              key="child-tab-submenu-bar"
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -4, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -4, height: 0 }}
              transition={{ duration: 0.22, ease: smoothEase }}
              className="relative z-20 -mt-[1px] overflow-hidden"
            >
              <div
                role="tablist"
                aria-label={`${typeof activeItem?.label === "string" ? activeItem.label : "Section"} Submenu`}
                className={cn(
                  "no-scrollbar flex w-full items-center justify-between gap-3 overflow-x-auto rounded-b-[22px] border-x border-b border-[#F0E6EB]/80 bg-white px-3 py-2 sm:rounded-b-[26px] sm:px-4 sm:py-2.5",
                  subTabListClassName,
                )}
              >
                {/* Left: Sub-tab Pill Buttons */}
                <div
                  className={cn(
                    "no-scrollbar flex items-center gap-1 overflow-x-auto sm:gap-1.5",
                    subTabEqualWidth ? "w-full justify-stretch" : getAlignmentClass(subTabAlign),
                  )}
                >
                  {currentSubTabs.map((subTab, subIndex) => {
                    const isSubActive = subTab.id === currentActiveSubTabId;
                    const subIcon = renderIcon(subTab);
                    const dotColor = getSubTabDotColor(subTab);

                    return (
                      <React.Fragment key={subTab.id}>
                        <button
                          type="button"
                          role="tab"
                          id={`subtab-${autoId}-${subTab.id}`}
                          aria-selected={isSubActive}
                          aria-label={subTab.ariaLabel || (typeof subTab.label === "string" ? subTab.label : undefined)}
                          disabled={subTab.disabled}
                          onClick={() => handleSelectSubTab(subTab)}
                          className={cn(
                            "group relative flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#501024] sm:px-4 sm:text-sm",
                            subTabEqualWidth ? "min-w-0 flex-1 justify-center text-center" : "shrink-0",
                            isSubActive ? "text-white" : "text-slate-700 hover:text-slate-900",
                            subTab.disabled && "cursor-not-allowed opacity-50",
                            subTabClassName,
                          )}
                        >
                          {/* Animated Active Pill Background */}
                          {isSubActive && (
                            <motion.span
                              layoutId={`${effectiveLayoutId}-subtab-pill`}
                              className={cn(
                                "absolute inset-0 z-0 rounded-full bg-gradient-to-r from-[#501024] to-[#681430] shadow-sm shadow-[#501024]/20",
                                activeSubTabClassName,
                              )}
                              transition={shouldReduceMotion ? { duration: 0 } : snappySpring}
                            />
                          )}

                          {/* Status Dot (for inactive filter tabs with a status dot) */}
                          {!isSubActive && dotColor && (
                            <span
                              className={cn(
                                "relative z-10 h-2 w-2 shrink-0 rounded-full transition-transform duration-150 group-hover:scale-125",
                                dotColor,
                              )}
                              aria-hidden="true"
                            />
                          )}

                          {/* SubTab Icon if explicitly provided */}
                          {subIcon && (
                            <span
                              className={cn(
                                "relative z-10 flex h-3.5 w-3.5 items-center justify-center transition-colors",
                                isSubActive ? "text-white" : "text-slate-500 group-hover:text-slate-800",
                              )}
                            >
                              {subIcon}
                            </span>
                          )}

                          <span className="relative z-10 whitespace-nowrap tracking-tight">{subTab.label}</span>
                          <span className="relative z-10">{renderSubBadge(subTab, isSubActive)}</span>
                        </button>

                        {/* Vertical divider after the active subtab (as in reference image) */}
                        {isSubActive && subIndex < currentSubTabs.length - 1 && (
                          <span
                            className="mx-1 h-4 w-[1px] shrink-0 bg-slate-200/90"
                            aria-hidden="true"
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Right: Active status viewing pill widget matching reference image */}
                {activeSubItem && (
                  <div className="hidden shrink-0 items-center gap-3 sm:flex">
                    <span
                      className="h-4 w-[1px] shrink-0 bg-slate-200/90"
                      aria-hidden="true"
                    />
                    <div className="flex items-center gap-2 rounded-full border border-slate-200/90 bg-white px-3.5 py-1 text-xs text-slate-700 shadow-sm transition-colors hover:border-slate-300 sm:text-sm">
                      <Layers className="h-4 w-4 text-[#501024]" />
                      <span className="whitespace-nowrap text-slate-600">
                        Viewing:{" "}
                        <AnimatePresence mode="wait">
                          <motion.strong
                            key={String(activeSubItem.id)}
                            initial={{ opacity: 0, y: 3 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -3 }}
                            transition={{ duration: 0.15 }}
                            className="inline-block font-bold text-slate-900"
                          >
                            {activeSubItem.label}
                          </motion.strong>
                        </AnimatePresence>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tab Panel Content (renders active child content or parent content/page directly) */}
      {panelContent !== null && (
        <div
          id={`panel-${autoId}-${activeTab}${hasChildTabs && currentActiveSubTabId ? `-${currentActiveSubTabId}` : ""}`}
          role="tabpanel"
          aria-labelledby={`tab-${autoId}-${activeTab}`}
          className={cn("w-full", panelClassName)}
        >
          {animated ? (
              <motion.div
                key={`${String(activeTab)}-${hasChildTabs ? String(currentActiveSubTabId) : "root"}`}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.14, ease: smoothEase }}
              >
                {panelContent}
              </motion.div>
          ) : (
            panelContent
          )}
        </div>
      )}
    </div>
  );
}

export default Tabs;
