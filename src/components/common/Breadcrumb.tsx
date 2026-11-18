import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { smoothEase } from "@/components/animations/transitions";
import { Home, LayoutDashboard, GraduationCap, Users, BookOpen, IndianRupee, Settings, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  name: string;
  path?: string;
  onClick?: (e?: React.MouseEvent) => void;
  icon?: React.ReactNode;
}

export interface BreadcrumbProps {
  title?: string;
  items?: BreadcrumbItem[];
  includeHome?: boolean;
  showHomeText?: boolean;
  size?: "sm" | "md";
  className?: string;
  showBackButton?: boolean;
  showBackText?: boolean;
  backText?: string;
  backPath?: string;
  onBack?: () => void;
  backIcon?: React.ReactNode;
  backButtonPosition?: "breadcrumbs" | "title";
  backButtonClassName?: string;
  backAriaLabel?: string;
  layout?: "stacked" | "row";
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  title,
  items = [],
  includeHome = true,
  showHomeText = false,
  size = "sm",
  className,
  showBackButton = true,
  showBackText = false,
  backText,
  backPath,
  onBack,
  backIcon,
  backButtonPosition = "breadcrumbs",
  backButtonClassName,
  backAriaLabel = "Go back",
  layout = "stacked",
}) => {
  const navigate = useNavigate();

  const finalItems: BreadcrumbItem[] = includeHome ? [{ name: "Home", path: "/" }, ...items] : items;
  const lastIndex = finalItems.length - 1;

  // Chevron slope width in pixels (proportional to height)
  const isCompact = size === "sm";
  const chevronWidth = isCompact ? 10 : 13;
  const shouldShowText = showBackText || Boolean(backText);
  const label = backText || "Back";

  const handleBack = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (onBack) {
      onBack();
      return;
    }
    if (backPath) {
      navigate(backPath);
      return;
    }
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const renderBackButton = () => {
    const iconSizeClass = isCompact ? "h-3.5 w-3.5" : "h-4 w-4";

    return (
      <motion.button
        type="button"
        onClick={handleBack}
        aria-label={backAriaLabel}
        title={backAriaLabel}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "group inline-flex flex-shrink-0 select-none items-center justify-center transition-colors duration-200",
          "rounded-md border border-brand-border bg-gradient-to-r from-burgundy-primary to-[#571D2F] text-white",
          "hover:border-brand-accent/40 hover:bg-brand-light-red/30 hover:text-white hover:shadow-sm",
          "shadow-[0_1px_2px_rgba(112,43,64,0.06)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/25",
          isCompact
            ? cn("h-7 sm:h-[28px]", shouldShowText ? "gap-1.5 px-2 text-[11px] sm:px-2.5 sm:text-[12px]" : "w-7 sm:w-[28px]")
            : cn("h-8 sm:h-9", shouldShowText ? "gap-1.5 px-2.5 text-xs sm:gap-2 sm:px-3 sm:text-[13px]" : "w-8 sm:w-9"),
          backButtonClassName,
        )}
      >
        {backIcon ? (
          <span className="inline-flex flex-shrink-0 items-center">{backIcon}</span>
        ) : (
          <ArrowLeft className={cn(iconSizeClass, "flex-shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5")} />
        )}
        {shouldShowText && <span className="truncate font-medium leading-none">{label}</span>}
      </motion.button>
    );
  };

  const renderIcon = (item: BreadcrumbItem, index: number, isLast: boolean) => {
    const iconSizeClass = isCompact ? "h-3 w-3 sm:h-3.5 sm:w-3.5" : "h-3.5 w-3.5 sm:h-4 sm:w-4";

    if (item.icon) {
      return (
        <span
          className={cn(
            "inline-flex flex-shrink-0 items-center",
            item.name && (index !== 0 || showHomeText) ? "mr-1.5" : "",
            isLast ? "text-white" : "text-text-secondary group-hover:text-brand-red",
          )}
        >
          {item.icon}
        </span>
      );
    }

    if (index === 0 && (item.name === "Home" || includeHome)) {
      return (
        <Home
          className={cn(
            iconSizeClass,
            "flex-shrink-0 transition-colors duration-200",
            item.name && showHomeText ? "mr-1.5" : "",
            isLast ? "text-white" : "text-burgundy-primary group-hover:text-brand-red",
          )}
        />
      );
    }

    const lower = item.name.toLowerCase().trim();
    const iconClass = cn(
      iconSizeClass,
      "flex-shrink-0 mr-1.5 transition-colors duration-200",
      isLast ? "text-white" : "text-text-secondary group-hover:text-brand-red opacity-85",
    );

    switch (lower) {
      case "dashboard":
        return <LayoutDashboard className={iconClass} />;
      case "college":
      case "academics":
      case "academic":
        return <GraduationCap className={iconClass} />;
      case "students":
      case "student":
        return <Users className={iconClass} />;
      case "programs":
      case "program":
      case "courses":
      case "course":
        return <BookOpen className={iconClass} />;
      case "fees":
      case "fee":
      case "collection":
        return <IndianRupee className={iconClass} />;
      case "settings":
      case "setting":
        return <Settings className={iconClass} />;
      default:
        return null;
    }
  };

  const isRow = layout === "row";

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "w-full select-none",
        isRow ? "flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between" : "flex flex-col justify-center",
        className,
      )}
    >
      {title && (
        <motion.div
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: smoothEase }}
          className={cn("flex min-w-0 items-center gap-2 sm:gap-2.5", isRow ? "mb-0" : "mb-1.5 sm:mb-2")}
        >
          {showBackButton && backButtonPosition === "title" && renderBackButton()}
          <h1 className="truncate text-base font-bold leading-tight tracking-tight text-text-primary sm:text-lg md:text-xl">{title}</h1>
        </motion.div>
      )}

      <div className="flex w-full min-w-0 items-center gap-1.5 py-0.5 sm:gap-2">
        {showBackButton && backButtonPosition === "breadcrumbs" && renderBackButton()}

        {finalItems.length > 0 && (
          <div className="no-scrollbar -mx-0.5 min-w-0 flex-1 touch-pan-x overflow-x-auto px-0.5 py-0.5">
            <ol className="inline-flex items-center drop-shadow-[0_1px_2px_rgba(112,43,64,0.06)] filter">
              {finalItems.map((item, index) => {
                const isFirst = index === 0;
                const isLast = index === lastIndex;
                const isSingle = isFirst && isLast;

                // Geometry clip-path polygon with compact chevron width
                const clipPathStyle: React.CSSProperties = {
                  clipPath: isFirst
                    ? `polygon(0 0, calc(100% - ${chevronWidth}px) 0, 100% 50%, calc(100% - ${chevronWidth}px) 100%, 0 100%)`
                    : `polygon(0 0, calc(100% - ${chevronWidth}px) 0, 100% 50%, calc(100% - ${chevronWidth}px) 100%, 0 100%, ${chevronWidth}px 50%)`,
                };

                const isHomeOnlyIcon = isFirst && item.name === "Home" && !showHomeText;

                const content = (
                  <>
                    {/* Seam SVG divider connecting to previous item */}
                    {!isFirst && !isLast && (
                      <svg
                        className="pointer-events-none absolute left-0 top-0 z-10 h-full"
                        style={{ width: `${chevronWidth}px` }}
                        viewBox={`0 0 ${chevronWidth} 30`}
                        fill="none"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                      >
                        <path
                          d={`M 0 0 L ${chevronWidth} 15 L 0 30`}
                          stroke="var(--brand-border)"
                          strokeWidth="1.5"
                          vectorEffect="non-scaling-stroke"
                        />
                      </svg>
                    )}

                    {renderIcon(item, index, isLast)}

                    {/* Text Label */}
                    {(!isHomeOnlyIcon || showHomeText) && <span className="max-w-[120px] truncate sm:max-w-none">{item.name}</span>}

                    {isHomeOnlyIcon && <span className="sr-only">Home</span>}
                  </>
                );

                // Responsive height, proportional typography, and touch padding
                const baseItemStyles = cn(
                  "relative inline-flex items-center transition-all duration-200 select-none whitespace-nowrap leading-none",
                  isCompact ? "h-7 sm:h-[28px] text-[11px] sm:text-[12px]" : "h-8 sm:h-9 text-xs sm:text-[13px]",
                  isFirst
                    ? isCompact
                      ? "rounded-l-md pl-2 sm:pl-3 pr-3.5 sm:pr-5 z-10"
                      : "rounded-l-lg pl-2.5 sm:pl-3.5 pr-4.5 sm:pr-6 z-10"
                    : isCompact
                      ? "pl-3.5 sm:pl-5 pr-3.5 sm:pr-5"
                      : "pl-4.5 sm:pl-6 pr-4.5 sm:pr-6",
                  isLast ? "z-30 font-semibold" : "z-20 font-medium",
                );

                return (
                  <motion.li
                    key={`${item.name}-${index}`}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.28, delay: index * 0.04, ease: smoothEase }}
                    className="inline-flex items-center"
                    style={!isFirst ? { marginLeft: `-${chevronWidth}px` } : undefined}
                  >
                    {item.path && !isLast ? (
                      <Link
                        to={item.path}
                        onClick={item.onClick}
                        style={clipPathStyle}
                        className={cn(
                          baseItemStyles,
                          "group",
                          isFirst
                            ? "border-b border-l border-t border-brand-border bg-white text-burgundy-primary hover:bg-brand-light-red/30 hover:text-brand-red"
                            : "border-b border-t border-brand-border bg-white text-text-secondary hover:bg-brand-light-red/30 hover:text-brand-red sm:bg-[#FAF7F8]",
                        )}
                        title={item.name}
                      >
                        {content}
                      </Link>
                    ) : item.onClick && !isLast ? (
                      <button
                        type="button"
                        onClick={item.onClick}
                        style={clipPathStyle}
                        className={cn(
                          baseItemStyles,
                          "group cursor-pointer",
                          isFirst
                            ? "border-b border-l border-t border-brand-border bg-white text-burgundy-primary hover:bg-brand-light-red/30 hover:text-brand-red"
                            : "border-b border-t border-brand-border bg-white text-text-secondary hover:bg-brand-light-red/30 hover:text-brand-red sm:bg-[#FAF7F8]",
                        )}
                        title={item.name}
                      >
                        {content}
                      </button>
                    ) : (
                      <span
                        aria-current={isLast ? "page" : undefined}
                        style={clipPathStyle}
                        className={cn(
                          baseItemStyles,
                          isLast
                            ? "bg-gradient-to-r from-burgundy-primary to-[#571D2F] text-white shadow-sm"
                            : "border-b border-t border-brand-border bg-white text-text-secondary",
                          isSingle ? "rounded-l-md border-l-0" : "",
                        )}
                        title={item.name}
                      >
                        {content}
                      </span>
                    )}
                  </motion.li>
                );
              })}
            </ol>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Breadcrumb;
export { BreadcrumbBanner } from "./BreadcrumbBanner";
export type { BreadcrumbBannerProps } from "./BreadcrumbBanner";
