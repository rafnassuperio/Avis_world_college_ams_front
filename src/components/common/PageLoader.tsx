import React from "react";
import { cn } from "@/lib/utils";

export interface PageLoaderProps {
  /** Text displayed beneath the animated book (default: "Loading...") */
  message?: string;
  /** Whether to show the text label (default: true) */
  showLabel?: boolean;
  /** Size variant of the book loader (default: "md") */
  size?: "sm" | "md" | "lg";
  /** If true, renders as fixed full-screen overlay (default: false) */
  fullScreen?: boolean;
  /** Animation variant: "open-close" (default), "page-flip", or "fanning" */
  variant?: "open-close" | "page-flip" | "fanning";
  /** Optional additional container class names */
  className?: string;
}

const sizeConfig = {
  sm: {
    container: "min-h-[180px] p-4",
    svgWidth: "w-24 sm:w-28 h-auto",
    aura: "w-28 h-20 blur-lg",
    strokeWidth: 17,
    text: "text-[11px] tracking-wider mt-3",
    dot: "h-1 w-1",
  },
  md: {
    container: "min-h-[360px] p-8",
    svgWidth: "w-36 sm:w-44 h-auto",
    aura: "w-48 h-32 blur-xl",
    strokeWidth: 18,
    text: "text-xs sm:text-[13px] tracking-widest mt-4",
    dot: "h-1.5 w-1.5",
  },
  lg: {
    container: "min-h-[460px] p-12",
    svgWidth: "w-48 sm:w-60 h-auto",
    aura: "w-64 h-44 blur-2xl",
    strokeWidth: 19,
    text: "text-sm sm:text-base tracking-widest mt-6",
    dot: "h-2 w-2",
  },
};

export const PageLoader: React.FC<PageLoaderProps> = ({
  message = "Loading...",
  showLabel = true,
  size = "md",
  fullScreen = false,
  variant = "open-close",
  className,
}) => {
  const currentSize = sizeConfig[size] ?? sizeConfig.md;
  const isFanning = variant === "fanning";
  const isPageFlip = variant === "page-flip";
  const isOpenClose = variant === "open-close";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className={cn(
        "relative flex flex-col items-center justify-center select-none transition-opacity duration-200",
        fullScreen
          ? "fixed inset-0 z-50 bg-brand-bg/90 backdrop-blur-md p-6"
          : cn("w-full", currentSize.container, className)
      )}
    >
      {/* Animated Book Emblem Stage */}
      <div className="relative flex items-center justify-center">
        {/* Soft Ambient College-Brand Radial Aura */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute rounded-full bg-gradient-to-r from-brand-red/20 via-burgundy-primary/10 to-transparent book-loader-aura",
            currentSize.aura
          )}
        />

        {/* Scalable Vector Book Opening & Closing Animation */}
        <svg
          viewBox="0 0 550 320"
          fill="none"
          strokeWidth={currentSize.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "overflow-visible drop-shadow-[0_4px_16px_rgba(112,43,64,0.15)] transition-all duration-300",
            currentSize.svgWidth
          )}
          aria-hidden="true"
        >
          <defs>
            {/* Rich collegiate palette linear gradients */}
            <linearGradient id="avis-page-loader-base" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#702B40" />
              <stop offset="50%" stopColor="#421B29" />
              <stop offset="100%" stopColor="#702B40" />
            </linearGradient>
            <linearGradient id="avis-page-loader-mid" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8A324C" />
              <stop offset="100%" stopColor="#A64C61" />
            </linearGradient>
            <linearGradient id="avis-page-loader-top" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#A64C61" />
              <stop offset="100%" stopColor="#D28B96" />
            </linearGradient>
          </defs>

          {/* Center Spine Notch (Hinged at 275, 260) */}
          <g transform="translate(275, 260)">
            <g
              className={isOpenClose ? "book-loader-spine" : undefined}
              style={{ transformOrigin: "0px 0px" }}
            >
              <path
                stroke="url(#avis-page-loader-base)"
                d="M -65 -15 C -55 -15 -47 -8 -41 6 C -37 15 -29 18 -15 18 L 15 18 C 29 18 37 15 41 6 C 47 -8 55 -15 65 -15"
              />
            </g>
          </g>

          {/* Left Base Cover (Hinged at 210, 245) */}
          <g transform="translate(210, 245)">
            <g
              className={isOpenClose ? "book-loader-cover-l" : undefined}
              style={{ transformOrigin: "0px 0px" }}
            >
              <path stroke="#702B40" d="M 0 0 L -178 0" />
            </g>
          </g>

          {/* Right Base Cover (Hinged at 340, 245) */}
          <g transform="translate(340, 245)">
            <g
              className={isOpenClose ? "book-loader-cover-r" : undefined}
              style={{ transformOrigin: "0px 0px" }}
            >
              <path stroke="#702B40" d="M 0 0 L 178 0" />
            </g>
          </g>

          {/* Left Pages (Cascading from Bottom to Top Rays) */}
          {/* Layer 1: Bottom Page (Hinged at 220, 208) */}
          <g transform="translate(220, 208)">
            <g
              className={
                isFanning
                  ? "book-loader-fan-p1-l"
                  : isOpenClose
                    ? "book-loader-p1-l"
                    : undefined
              }
              style={{ transformOrigin: "0px 0px" }}
            >
              <path stroke="#7D2D45" d="M 0 0 Q -20 3 -45 4 L -170 4" />
            </g>
          </g>

          {/* Layer 2: Middle Page (Hinged at 218, 198) */}
          <g transform="translate(218, 198)">
            <g
              className={
                isFanning
                  ? "book-loader-fan-p2-l"
                  : isOpenClose
                    ? "book-loader-p2-l"
                    : undefined
              }
              style={{ transformOrigin: "0px 0px" }}
            >
              <path stroke="url(#avis-page-loader-mid)" d="M 0 0 L -156 -44" />
            </g>
          </g>

          {/* Layer 3: Top Sunburst Ray (Hinged at 244, 186) */}
          <g transform="translate(244, 186)">
            <g
              className={
                isFanning
                  ? "book-loader-fan-p3-l"
                  : isOpenClose
                    ? "book-loader-p3-l"
                    : undefined
              }
              style={{ transformOrigin: "0px 0px" }}
            >
              <path stroke="url(#avis-page-loader-top)" d="M 0 0 L -72 -148" />
            </g>
          </g>

          {/* Right Pages (Cascading from Bottom to Top Rays) */}
          {/* Layer 1: Bottom Page (Hinged at 330, 208) */}
          <g transform="translate(330, 208)">
            <g
              className={
                isFanning
                  ? "book-loader-fan-p1-r"
                  : isOpenClose
                    ? "book-loader-p1-r"
                    : undefined
              }
              style={{ transformOrigin: "0px 0px" }}
            >
              <path stroke="#7D2D45" d="M 0 0 Q 20 3 45 4 L 170 4" />
            </g>
          </g>

          {/* Layer 2: Middle Page (Hinged at 332, 198) */}
          <g transform="translate(332, 198)">
            <g
              className={
                isFanning
                  ? "book-loader-fan-p2-r"
                  : isOpenClose
                    ? "book-loader-p2-r"
                    : undefined
              }
              style={{ transformOrigin: "0px 0px" }}
            >
              <path stroke="url(#avis-page-loader-mid)" d="M 0 0 L 156 -44" />
            </g>
          </g>

          {/* Layer 3: Top Sunburst Ray (Hinged at 306, 186) */}
          <g transform="translate(306, 186)">
            <g
              className={
                isFanning
                  ? "book-loader-fan-p3-r"
                  : isOpenClose
                    ? "book-loader-p3-r"
                    : undefined
              }
              style={{ transformOrigin: "0px 0px" }}
            >
              <path stroke="url(#avis-page-loader-top)" d="M 0 0 L 72 -148" />
            </g>
          </g>

          {/* Continuous Flipping Pages (Only rendered in "page-flip" mode) */}
          {isPageFlip && (
            <g transform="translate(275, 245)">
              <g
                className="book-loader-flipper-1"
                style={{ transformOrigin: "0px 0px" }}
              >
                <path stroke="url(#avis-page-loader-mid)" d="M 0 0 L 160 -40" />
              </g>
              <g
                className="book-loader-flipper-2"
                style={{ transformOrigin: "0px 0px" }}
              >
                <path stroke="url(#avis-page-loader-top)" d="M 0 0 L 160 -40" />
              </g>
            </g>
          )}
        </svg>
      </div>

      {/* Brand Collegiate Typography Label & Pulsing Ellipsis */}
      {showLabel && (
        <div
          className={cn(
            "flex items-center gap-2 font-serif font-bold text-burgundy-primary uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]",
            currentSize.text
          )}
        >
          <span>{message}</span>
          <span className="inline-flex items-center gap-1 pl-0.5" aria-hidden="true">
            <span
              className={cn("rounded-full bg-brand-red book-loader-dot", currentSize.dot)}
              style={{ animationDelay: "-0.32s" }}
            />
            <span
              className={cn("rounded-full bg-brand-red book-loader-dot", currentSize.dot)}
              style={{ animationDelay: "-0.16s" }}
            />
            <span className={cn("rounded-full bg-brand-red book-loader-dot", currentSize.dot)} />
          </span>
        </div>
      )}

      {/* Screen Reader Announcement */}
      <span className="sr-only">{message}</span>
    </div>
  );
};

export default PageLoader;
