import React from "react";
import { motion } from "framer-motion";

interface ErrorIllustrationProps {
  className?: string;
  animate?: boolean;
}

export const ErrorIllustration: React.FC<ErrorIllustrationProps> = ({
  className = "",
  animate = true,
}) => {
  return (
    <svg
      viewBox="0 0 350 450"
      className={`w-full max-w-[270px] sm:max-w-[310px] md:max-w-[330px] h-auto select-none overflow-visible ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Decorative ambient top wire entering from ceiling into smooth loop */}
      <motion.path
        d="M 235 0 L 235 48 C 235 60 270 56 295 68 C 308 74 308 90 294 97 C 278 105 255 100 242 88 C 234 80 235 67 225 58 C 212 48 185 52 165 58 C 145 64 135 78 135 95 L 135 110"
        stroke="var(--burgundy-primary, #702B40)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0.95, opacity: 0.9 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Monitor Outer Shell */}
      <rect
        x="52"
        y="108"
        width="246"
        height="174"
        rx="22"
        stroke="var(--burgundy-primary, #702B40)"
        strokeWidth="4.5"
        fill="var(--brand-card, #ffffff)"
      />

      {/* Monitor Top Bevel & Title Bar Divider */}
      <line
        x1="54"
        y1="142"
        x2="296"
        y2="142"
        stroke="var(--brand-border, #EFE4E6)"
        strokeWidth="2.5"
      />

      {/* Window Controls (Pills / Dots) */}
      <circle cx="76" cy="125" r="4.5" fill="var(--brand-red, #A64C61)" />
      <circle cx="91" cy="125" r="4.5" fill="var(--palette-5, #D28B96)" />
      <circle cx="106" cy="125" r="4.5" fill="var(--brand-light-red, #F1DDE0)" />

      {/* Screen Activity / Scanning lines */}
      <rect
        x="72"
        y="156"
        width="48"
        height="4"
        rx="2"
        fill="var(--brand-light-red, #F1DDE0)"
      />
      <rect
        x="72"
        y="166"
        width="32"
        height="4"
        rx="2"
        fill="var(--brand-light-red, #F1DDE0)"
      />

      {/* Floating Animated Error Shield Badge */}
      <motion.g
        animate={
          animate
            ? {
                y: [0, -5, 0],
                rotate: [0, 1, 0, -1, 0],
              }
            : undefined
        }
        transition={{
          repeat: Infinity,
          duration: 3.5,
          ease: "easeInOut",
        }}
        style={{ transformOrigin: "175px 210px" }}
      >
        {/* Soft Ambient Shadow Aura behind Shield */}
        <circle
          cx="175"
          cy="212"
          r="42"
          fill="var(--brand-light-red, #F1DDE0)"
          opacity="0.4"
        />

        {/* Shield Outer Hexagon / Shield Shape */}
        <path
          d="M 175 168 L 214 186 C 214 220 197 243 175 254 C 153 243 136 220 136 186 Z"
          stroke="var(--burgundy-primary, #702B40)"
          strokeWidth="4"
          fill="var(--brand-bg, #FCF8F9)"
          strokeLinejoin="round"
        />

        {/* Inner Warning Triangle */}
        <path
          d="M 175 186 L 198 226 L 152 226 Z"
          stroke="var(--brand-red, #A64C61)"
          strokeWidth="3"
          fill="var(--brand-light-red, #F1DDE0)"
          strokeLinejoin="round"
        />

        {/* Exclamation Bar & Dot */}
        <line
          x1="175"
          y1="197"
          x2="175"
          y2="212"
          stroke="var(--burgundy-primary, #702B40)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx="175" cy="220" r="2.25" fill="var(--burgundy-primary, #702B40)" />
      </motion.g>

      {/* Monitor Neck */}
      <rect
        x="162"
        y="282"
        width="26"
        height="38"
        rx="2"
        fill="var(--brand-bg, #FCF8F9)"
        stroke="var(--burgundy-primary, #702B40)"
        strokeWidth="4"
      />

      {/* Monitor Base Pedestal */}
      <path
        d="M 115 320 C 115 316 235 316 235 320 L 250 334 C 253 338 249 341 243 341 L 107 341 C 101 341 97 338 100 334 Z"
        fill="var(--brand-card, #ffffff)"
        stroke="var(--burgundy-primary, #702B40)"
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* Disconnected Cable from Back of Monitor Looping to Floor */}
      <path
        d="M 188 296 C 228 304 266 332 250 366 C 240 384 208 376 195 362 C 182 348 152 352 146 376 C 138 406 168 418 184 445 L 185 450"
        stroke="var(--burgundy-primary, #702B40)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Spark Particles near cable disconnect */}
      <motion.g
        animate={
          animate
            ? {
                scale: [1, 1.25, 1],
                opacity: [0.7, 1, 0.7],
              }
            : undefined
        }
        transition={{
          repeat: Infinity,
          duration: 2,
          ease: "easeInOut",
        }}
      >
        <line
          x1="262"
          y1="344"
          x2="272"
          y2="340"
          stroke="var(--brand-red, #A64C61)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <line
          x1="266"
          y1="352"
          x2="275"
          y2="356"
          stroke="var(--brand-red, #A64C61)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </motion.g>
    </svg>
  );
};

export default ErrorIllustration;

