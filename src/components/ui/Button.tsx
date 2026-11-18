import React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "burgundy";
  size?: "sm" | "md" | "lg" | "icon";
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = "primary", size = "md", children, ...props }, ref) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-red/30 disabled:opacity-50 disabled:pointer-events-none select-none";

  const variants = {
    primary:
      "bg-gradient-to-r from-brand-red to-brand-accent text-white shadow-md shadow-brand-red/25 hover:shadow-lg hover:shadow-brand-red/40 hover:brightness-105 active:scale-[0.98]",
    secondary: "bg-brand-bg hover:bg-brand-border/30 text-text-primary border border-brand-border active:scale-[0.98]",
    outline: "bg-transparent hover:bg-brand-light-red/40 text-brand-red border border-brand-red/30 active:scale-[0.98]",
    ghost: "bg-transparent hover:bg-brand-bg text-text-secondary hover:text-text-primary active:scale-[0.98]",
    burgundy: "bg-burgundy-primary hover:bg-burgundy-sidebar text-white shadow-md shadow-burgundy/20 active:scale-[0.98]",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2 gap-2",
    lg: "text-base px-5 py-2.5 gap-2.5",
    icon: "p-2 rounded-xl",
  };

  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.98 }}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </motion.button>
  );
});

Button.displayName = "Button";
