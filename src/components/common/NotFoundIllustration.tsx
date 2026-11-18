import React from "react";
import { motion } from "framer-motion";

interface NotFoundIllustrationProps {
  className?: string;
  animatePlug?: boolean;
}

export const NotFoundIllustration: React.FC<NotFoundIllustrationProps> = ({
  className = "",
  animatePlug = true,
}) => {
  return (
    <svg
      viewBox="0 0 350 450"
      className={`w-full max-w-[270px] sm:max-w-[310px] md:max-w-[330px] h-auto select-none overflow-visible ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Top wire entering from ceiling into loop, curving to plug */}
      <motion.path
        d="M 254.5 0 L 254.5 56 C 254.5 61 280 58 310 64 C 324 67 324 81 312 88 C 298 97 280 102 266 96 C 257 88 257 75 254.5 66 C 248 65 218 67 195 70 C 170 73 148 71 145 61 C 142 50 155 40 173 38.5 C 183 38 189 48 189 70 L 189 88"
        stroke="var(--burgundy-primary, #702B40)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0.95, opacity: 0.9 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Dangling Unplugged Plug */}
      <motion.g
        animate={
          animatePlug
            ? {
                y: [0, -3.5, 0],
                rotate: [0, 0.5, 0, -0.5, 0],
              }
            : undefined
        }
        transition={{
          repeat: Infinity,
          duration: 3.5,
          ease: "easeInOut",
        }}
        style={{ transformOrigin: "189px 88px" }}
      >
        {/* Upper step / neck */}
        <rect
          x="177.5"
          y="88"
          width="23"
          height="17"
          rx="1.5"
          fill="var(--brand-bg, #FCF8F9)"
          stroke="var(--burgundy-primary, #702B40)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Main plug body */}
        <rect
          x="168"
          y="105"
          width="42"
          height="18"
          rx="2"
          fill="var(--brand-bg, #FCF8F9)"
          stroke="var(--burgundy-primary, #702B40)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Bottom flange */}
        <rect
          x="163"
          y="123"
          width="52"
          height="3"
          rx="1"
          fill="var(--brand-red, #A64C61)"
          stroke="var(--brand-red, #A64C61)"
          strokeWidth="0.5"
        />
        {/* Prongs */}
        <line
          x1="179"
          y1="126"
          x2="179"
          y2="145"
          stroke="var(--burgundy-primary, #702B40)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <line
          x1="199"
          y1="126"
          x2="199"
          y2="145"
          stroke="var(--burgundy-primary, #702B40)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </motion.g>

      {/* First digit '4' */}
      <path
        d="M 98 171 L 48 238 L 117 238 M 98 171 L 98 276"
        stroke="var(--burgundy-primary, #702B40)"
        strokeWidth="8.5"
        strokeLinecap="round"
        strokeLinejoin="miter"
      />

      {/* Wall Socket '0' */}
      <g>
        {/* Outer ring */}
        <circle
          cx="189.5"
          cy="231.5"
          r="47.5"
          stroke="var(--burgundy-primary, #702B40)"
          strokeWidth="4.5"
          fill="var(--brand-card, #ffffff)"
        />
        {/* Inner ring */}
        <circle
          cx="189.5"
          cy="231.5"
          r="34.5"
          stroke="var(--brand-red, #A64C61)"
          strokeWidth="3"
          fill="var(--brand-bg, #FCF8F9)"
        />
        {/* Socket pin holes */}
        <circle cx="176.5" cy="231.5" r="3.75" fill="var(--burgundy-primary, #702B40)" />
        <circle cx="202.5" cy="231.5" r="3.75" fill="var(--burgundy-primary, #702B40)" />
      </g>

      {/* Second digit '4' */}
      <path
        d="M 312 171 L 262 238 L 331 238 M 312 171 L 312 276"
        stroke="var(--burgundy-primary, #702B40)"
        strokeWidth="8.5"
        strokeLinecap="round"
        strokeLinejoin="miter"
      />

      {/* Bottom wire from socket curving through loop down to floor */}
      <path
        d="M 189.5 279 L 187 330 C 187 342 220 340 234 352 C 242 358 240 369 234 374 C 224 381 205 380 193 365 C 182 350 152 336 125 350 C 113 360 106 376 104 395 L 102 450"
        stroke="var(--burgundy-primary, #702B40)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default NotFoundIllustration;
