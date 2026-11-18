import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToggleSwitchSize = "xs" | "sm" | "md" | "lg";
export type ToggleSwitchColor = "burgundy" | "emerald" | "brand" | "blue" | "purple" | "indigo" | "amber";

export interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: ToggleSwitchSize;
  label?: React.ReactNode;
  sublabel?: string;
  labelPosition?: "left" | "right";
  id?: string;
  ariaLabel?: string;
  className?: string;
  activeColor?: ToggleSwitchColor;
  showIcons?: boolean;
  checkedIcon?: React.ReactNode;
  uncheckedIcon?: React.ReactNode;
}

// Dimension specs for pixel-perfect iOS tactile ergonomics
interface SizeSpec {
  trackWidth: number;
  trackHeight: number;
  thumbSize: number;
  padding: number;
  travel: number;
  stretchTravel: number;
  labelClass: string;
  iconSize: number;
}

const SIZE_SPECS: Record<ToggleSwitchSize, SizeSpec> = {
  xs: {
    trackWidth: 32,
    trackHeight: 18,
    thumbSize: 14,
    padding: 2,
    travel: 14,
    stretchTravel: 16,
    labelClass: "text-[11px]",
    iconSize: 8,
  },
  sm: {
    trackWidth: 40,
    trackHeight: 22,
    thumbSize: 18,
    padding: 2,
    travel: 18,
    stretchTravel: 21,
    labelClass: "text-xs",
    iconSize: 10,
  },
  md: {
    trackWidth: 48,
    trackHeight: 26,
    thumbSize: 22,
    padding: 2,
    travel: 22,
    stretchTravel: 25,
    labelClass: "text-sm",
    iconSize: 12,
  },
  lg: {
    trackWidth: 58,
    trackHeight: 32,
    thumbSize: 26,
    padding: 3,
    travel: 26,
    stretchTravel: 30,
    labelClass: "text-base",
    iconSize: 14,
  },
};

// Physics-driven iOS liquid spring curve
const iosSwitchSpring = {
  type: "spring" as const,
  stiffness: 650,
  damping: 34,
  mass: 0.55,
};

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  size = "md",
  label,
  sublabel,
  labelPosition = "right",
  id,
  ariaLabel,
  className,
  activeColor = "burgundy",
  showIcons = false,
  checkedIcon,
  uncheckedIcon,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const spec = SIZE_SPECS[size] || SIZE_SPECS.md;

  // Active track styling variants
  const getActiveTrackGradient = () => {
    switch (activeColor) {
      case "emerald":
        return "from-emerald-500 via-emerald-600 to-teal-600 border-emerald-600 shadow-[0_2px_10px_-1px_rgba(16,185,129,0.4)]";
      case "brand":
        return "from-brand-accent via-brand-red to-burgundy-primary border-brand-red shadow-[0_2px_10px_-1px_rgba(166,76,97,0.4)]";
      case "blue":
        return "from-blue-500 via-blue-600 to-indigo-600 border-blue-600 shadow-[0_2px_10px_-1px_rgba(37,99,235,0.4)]";
      case "purple":
        return "from-purple-500 via-purple-600 to-violet-700 border-purple-600 shadow-[0_2px_10px_-1px_rgba(147,51,234,0.4)]";
      case "indigo":
        return "from-indigo-500 via-indigo-600 to-purple-600 border-indigo-600 shadow-[0_2px_10px_-1px_rgba(79,70,229,0.4)]";
      case "amber":
        return "from-amber-400 via-amber-500 to-orange-500 border-amber-500 shadow-[0_2px_10px_-1px_rgba(245,158,11,0.4)]";
      case "burgundy":
      default:
        return "from-burgundy-primary via-[#571D2F] to-brand-red border-[#421B29]/40 shadow-[0_2px_12px_-1px_rgba(112,43,64,0.45)]";
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      onChange(!checked);
    }
  };

  // Elastic pill stretch width during press (like iOS 18 native switch)
  const thumbWidth = isPressed ? spec.thumbSize * 1.25 : spec.thumbSize;
  const thumbX = checked ? (isPressed ? spec.stretchTravel - (thumbWidth - spec.thumbSize) : spec.travel) : 0;

  const labelContent = (label || sublabel) && (
    <div
      onClick={handleClick}
      className={cn(
        "flex cursor-pointer select-none flex-col",
        labelPosition === "left" ? "text-right" : "text-left",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      {label && <span className={cn("font-semibold text-text-primary transition-colors", spec.labelClass)}>{label}</span>}
      {sublabel && <span className="text-[10.5px] leading-tight text-text-muted">{sublabel}</span>}
    </div>
  );

  return (
    <div className={cn("inline-flex items-center gap-2.5", disabled && "pointer-events-none cursor-not-allowed opacity-50", className)}>
      {labelPosition === "left" && labelContent}

      {/* The Tactile Toggle Button */}
      <motion.button
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        aria-label={ariaLabel || (typeof label === "string" ? label : "Toggle switch")}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseDown={() => !disabled && setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        onTouchStart={() => !disabled && setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
        whileTap={{ scale: disabled ? 1 : 0.94 }}
        style={{
          width: spec.trackWidth,
          height: spec.trackHeight,
          padding: spec.padding,
        }}
        className={cn(
          "relative inline-flex flex-shrink-0 cursor-pointer select-none rounded-full border p-0 outline-none transition-shadow duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/50 focus-visible:ring-offset-2",
          disabled && "cursor-not-allowed",
        )}
      >
        {/* Inactive Track Layer (Smooth Cross-fade) */}
        <motion.div
          initial={false}
          animate={{ opacity: checked ? 0 : 1 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 rounded-full border border-slate-300/80 bg-slate-200/90 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.08)] hover:bg-slate-300/80"
        />

        {/* Active Track Layer (Gradient + Glowing Specular Sheen) */}
        <motion.div
          initial={false}
          animate={{ opacity: checked ? 1 : 0 }}
          transition={{ duration: 0.22 }}
          className={cn("absolute inset-0 rounded-full border bg-gradient-to-r", getActiveTrackGradient())}
        >
          {/* Subtle Gliding Specular Highlight */}
          <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/25 via-transparent to-black/10" />
        </motion.div>

        {/* Sliding Mechanical / iOS Thumb */}
        <motion.div
          animate={{
            x: thumbX,
            width: thumbWidth,
          }}
          transition={iosSwitchSpring}
          style={{
            height: spec.thumbSize,
          }}
          className={cn(
            "relative z-10 flex items-center justify-center rounded-full bg-white transition-colors duration-150",
            // 3D specular depth & drop shadow
            "shadow-[0_2.5px_6px_rgba(0,0,0,0.24),0_1px_2px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.9)]",
          )}
        >
          {/* Micro Icon / Dot Indicator */}
          {showIcons && (
            <AnimatePresence mode="wait">
              {checked ? (
                <motion.span
                  key="checked-icon"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="flex items-center justify-center text-burgundy-primary"
                >
                  {checkedIcon || (
                    <Check
                      className="stroke-[3]"
                      style={{ width: spec.iconSize, height: spec.iconSize }}
                    />
                  )}
                </motion.span>
              ) : (
                <motion.span
                  key="unchecked-icon"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  className="flex items-center justify-center text-slate-400"
                >
                  {uncheckedIcon || (
                    <X
                      className="stroke-[2.5]"
                      style={{ width: spec.iconSize, height: spec.iconSize }}
                    />
                  )}
                </motion.span>
              )}
            </AnimatePresence>
          )}
        </motion.div>
      </motion.button>

      {labelPosition === "right" && labelContent}
    </div>
  );
};

export default ToggleSwitch;
