import React from "react";
import { motion } from "framer-motion";

interface OfflineIllustrationProps {
  className?: string;
  animate?: boolean;
}

export const OfflineIllustration: React.FC<OfflineIllustrationProps> = ({
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
        d="M 245 0 L 245 46 C 245 58 275 54 298 65 C 310 71 310 86 296 93 C 280 101 258 96 246 84 C 238 76 238 64 228 55 C 215 45 188 49 168 55 C 148 61 138 75 138 92 L 138 108"
        stroke="var(--burgundy-primary, #702B40)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0.95, opacity: 0.9 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Floating Wi-Fi Slash Badge / Disconnected Signal Waves */}
      <motion.g
        animate={
          animate
            ? {
                y: [0, -6, 0],
                rotate: [0, 0.8, 0, -0.8, 0],
              }
            : undefined
        }
        transition={{
          repeat: Infinity,
          duration: 3.8,
          ease: "easeInOut",
        }}
        style={{ transformOrigin: "175px 125px" }}
      >
        {/* Soft Ambient Glow Aura behind Wi-Fi Badge */}
        <circle
          cx="175"
          cy="125"
          r="48"
          fill="var(--brand-light-red, #F1DDE0)"
          opacity="0.45"
        />

        {/* Concentric Signal Arcs */}
        {/* Outer Arc (3rd Wave) - severed */}
        <path
          d="M 132 108 C 144 94 160 88 175 88 C 190 88 206 94 218 108"
          stroke="var(--palette-5, #D28B96)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="6 4"
        />

        {/* Middle Arc (2nd Wave) */}
        <path
          d="M 145 122 C 153 112 163 107 175 107 C 187 107 197 112 205 122"
          stroke="var(--brand-red, #A64C61)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Inner Arc (1st Wave) */}
        <path
          d="M 158 135 C 163 129 168 126 175 126 C 182 126 187 129 192 135"
          stroke="var(--burgundy-primary, #702B40)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Wi-Fi Beacon Center Dot */}
        <circle cx="175" cy="147" r="4.5" fill="var(--burgundy-primary, #702B40)" />

        {/* Diagonal Disconnect Strike / Slash Line */}
        <motion.line
          x1="126"
          y1="162"
          x2="224"
          y2="76"
          stroke="var(--brand-red, #A64C61)"
          strokeWidth="4"
          strokeLinecap="round"
          animate={
            animate
              ? {
                  opacity: [0.85, 1, 0.85],
                }
              : undefined
          }
          transition={{ repeat: Infinity, duration: 2 }}
        />
      </motion.g>

      {/* Left Router Antenna */}
      <motion.g
        animate={
          animate
            ? {
                rotate: [-2, 1, -2],
              }
            : undefined
        }
        transition={{
          repeat: Infinity,
          duration: 4.5,
          ease: "easeInOut",
        }}
        style={{ transformOrigin: "105px 235px" }}
      >
        <line
          x1="105"
          y1="235"
          x2="88"
          y2="152"
          stroke="var(--burgundy-primary, #702B40)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Antenna Tip Cap */}
        <circle cx="87" cy="148" r="4" fill="var(--brand-red, #A64C61)" />
        {/* Antenna joint collar */}
        <rect
          x="99"
          y="230"
          width="12"
          height="8"
          rx="2"
          fill="var(--brand-light-red, #F1DDE0)"
          stroke="var(--burgundy-primary, #702B40)"
          strokeWidth="2"
        />
      </motion.g>

      {/* Right Router Antenna */}
      <motion.g
        animate={
          animate
            ? {
                rotate: [2, -1, 2],
              }
            : undefined
        }
        transition={{
          repeat: Infinity,
          duration: 4.2,
          ease: "easeInOut",
        }}
        style={{ transformOrigin: "245px 235px" }}
      >
        <line
          x1="245"
          y1="235"
          x2="262"
          y2="152"
          stroke="var(--burgundy-primary, #702B40)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Antenna Tip Cap */}
        <circle cx="263" cy="148" r="4" fill="var(--brand-red, #A64C61)" />
        {/* Antenna joint collar */}
        <rect
          x="239"
          y="230"
          width="12"
          height="8"
          rx="2"
          fill="var(--brand-light-red, #F1DDE0)"
          stroke="var(--burgundy-primary, #702B40)"
          strokeWidth="2"
        />
      </motion.g>

      {/* Router Main Chassis (Sleek Modern Hardware Shape) */}
      <rect
        x="64"
        y="234"
        width="222"
        height="76"
        rx="20"
        stroke="var(--burgundy-primary, #702B40)"
        strokeWidth="4.5"
        fill="var(--brand-card, #ffffff)"
      />

      {/* Router Front Face Groove */}
      <rect
        x="78"
        y="248"
        width="194"
        height="48"
        rx="12"
        fill="var(--brand-bg, #FCF8F9)"
        stroke="var(--brand-border, #EFE4E6)"
        strokeWidth="2"
      />

      {/* Front Status Indicator Lights */}
      {/* Power LED (Solid Brand Red / On) */}
      <circle cx="106" cy="272" r="4.5" fill="var(--brand-red, #A64C61)" />

      {/* Offline Internet LED (Pulsing Warning / Disconnected) */}
      <motion.circle
        cx="126"
        cy="272"
        r="4.5"
        fill="#D97706"
        animate={
          animate
            ? {
                opacity: [1, 0.3, 1],
                scale: [1, 1.25, 1],
              }
            : undefined
        }
        transition={{
          repeat: Infinity,
          duration: 1.2,
          ease: "easeInOut",
        }}
        style={{ transformOrigin: "126px 272px" }}
      />

      {/* Wi-Fi LED (Dim / No connection) */}
      <circle cx="146" cy="272" r="4.5" fill="var(--brand-light-red, #F1DDE0)" />

      {/* Ethernet LED (Inactive) */}
      <circle cx="166" cy="272" r="4.5" fill="var(--brand-light-red, #F1DDE0)" />

      {/* Router Horizontal Grille / Vent Accent Lines */}
      <line
        x1="194"
        y1="268"
        x2="252"
        y2="268"
        stroke="var(--palette-5, #D28B96)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="194"
        y1="276"
        x2="242"
        y2="276"
        stroke="var(--brand-light-red, #F1DDE0)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Router Rubber Feet / Stand Base */}
      <rect
        x="92"
        y="308"
        width="32"
        height="10"
        rx="3"
        fill="var(--brand-bg, #FCF8F9)"
        stroke="var(--burgundy-primary, #702B40)"
        strokeWidth="3.5"
      />
      <rect
        x="226"
        y="308"
        width="32"
        height="10"
        rx="3"
        fill="var(--brand-bg, #FCF8F9)"
        stroke="var(--burgundy-primary, #702B40)"
        strokeWidth="3.5"
      />

      {/* Disconnected Ethernet Cable looping gracefully down */}
      <path
        d="M 188 310 L 188 344 C 188 358 226 354 246 368 C 256 375 254 388 244 394 C 230 403 205 398 190 382 C 176 367 142 369 132 396 C 122 422 154 438 174 446 L 176 450"
        stroke="var(--burgundy-primary, #702B40)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dangling RJ45 Plug Connector near the floor loop */}
      <g transform="translate(244, 372) rotate(32)">
        <rect
          x="-7"
          y="-12"
          width="14"
          height="18"
          rx="2"
          fill="var(--brand-bg, #FCF8F9)"
          stroke="var(--burgundy-primary, #702B40)"
          strokeWidth="2.5"
        />
        <rect
          x="-5"
          y="-16"
          width="10"
          height="5"
          fill="var(--brand-red, #A64C61)"
        />
      </g>

      {/* Subtle Offline Warning Particles */}
      <motion.g
        animate={
          animate
            ? {
                opacity: [0.3, 0.9, 0.3],
                scale: [0.9, 1.15, 0.9],
              }
            : undefined
        }
        transition={{
          repeat: Infinity,
          duration: 2.4,
          ease: "easeInOut",
        }}
        style={{ transformOrigin: "280px 240px" }}
      >
        <circle cx="282" cy="235" r="3" fill="var(--brand-red, #A64C61)" />
        <circle cx="295" cy="248" r="2" fill="var(--palette-5, #D28B96)" />
        <circle cx="68" cy="226" r="2.5" fill="var(--palette-5, #D28B96)" />
      </motion.g>
    </svg>
  );
};

export default OfflineIllustration;

