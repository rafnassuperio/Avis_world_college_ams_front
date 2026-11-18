import React from "react";
import { motion } from "framer-motion";
import { smoothEase } from "@/components/animations/transitions";
import { Breadcrumb, BreadcrumbProps } from "./Breadcrumb";
import { cn } from "@/lib/utils";

export interface BreadcrumbBannerProps extends BreadcrumbProps {
  actions?: React.ReactNode;
  containerClassName?: string;
  glow?: boolean;
}

export const BreadcrumbBanner: React.FC<BreadcrumbBannerProps> = ({
  title,
  actions,
  items,
  containerClassName,
  glow = true,
  className,
  ...breadcrumbProps
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.995, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: smoothEase }}
      className={cn(
        "relative mb-4 sm:mb-5 overflow-hidden rounded-2xl sm:rounded-[22px] md:rounded-[26px] border border-brand-border bg-gradient-to-r from-brand-bg via-brand-bg/90 to-brand-bg p-3.5 sm:px-6 sm:py-4 md:px-7 md:py-5 shadow-[0_4px_20px_-4px_rgba(87,0,31,0.03)]",
        containerClassName,
      )}
    >
      {/* Subtle decorative ambient glow */}
      {glow && (
        <div className="pointer-events-none absolute -right-10 -top-10 sm:-right-16 sm:-top-16 h-32 w-32 sm:h-44 sm:w-44 rounded-full bg-gradient-to-br from-brand-light-red/40 via-burgundy-primary/5 to-transparent blur-2xl" />
      )}

      <div className="relative z-10 flex flex-col justify-between gap-3 sm:gap-4 md:flex-row md:items-center">
        <div className="min-w-0 flex-1">
          <Breadcrumb
            title={title}
            items={items}
            className={className}
            {...breadcrumbProps}
          />
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-1 md:pt-0">
            {actions}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BreadcrumbBanner;
