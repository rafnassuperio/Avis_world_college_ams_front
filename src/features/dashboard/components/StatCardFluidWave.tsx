import {useAnimationActivity} from "@/hooks/useAnimationActivity";
import React, { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";

export interface StatCardFluidWaveProps {
  id: string;
  waveColor: string;
  index: number;
  isHovered?: boolean;
  className?: string;
}

/**
 * StatCardFluidWave
 *
 * Multi-layer fluid decorative wave aligned to the bottom-right corner of statistics cards.
 * Powered by Framer Motion (continuous SVG path morphing & crest tracking) and GSAP
 * (harmonic levitation physics, micro-droplet ambient drift, and tactile hover surge).
 */
const StatCardFluidWaveComponent: React.FC<StatCardFluidWaveProps> = ({ id, waveColor, index, isHovered = false, className = "" }) => {
  const shouldReduceMotion = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const active = useAnimationActivity(svgRef);
  const waveGroupRef = useRef<SVGGElement>(null);
  const crestLineRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGEllipseElement>(null);
  const particle1Ref = useRef<SVGCircleElement>(null);
  const particle2Ref = useRef<SVGCircleElement>(null);
  const particle3Ref = useRef<SVGCircleElement>(null);

  // Background Wave Harmonic States (viewBox: 0 0 240 54)
  const bgState0 = "M 124 54 C 150 28, 172 15, 195 18 C 216 21, 230 28, 240 29 L 240 54 L 124 54 Z";
  const bgState1 = "M 132 54 C 156 34, 178 24, 198 16 C 218 10, 232 20, 240 24 L 240 54 L 132 54 Z";
  const bgState2 = "M 118 54 C 145 26, 168 12, 190 19 C 212 25, 228 32, 240 34 L 240 54 L 118 54 Z";
  const bgState3 = "M 126 54 C 152 30, 174 20, 194 17 C 216 15, 234 26, 240 27 L 240 54 L 126 54 Z";

  // Foreground Wave Harmonic States
  const fgState0 = "M 150 54 C 172 48, 192 42, 210 38 C 224 34, 234 26, 240 28 L 240 54 L 150 54 Z";
  const fgState1 = "M 158 54 C 178 52, 196 46, 214 43 C 228 40, 236 33, 240 31 L 240 54 L 158 54 Z";
  const fgState2 = "M 144 54 C 166 44, 186 36, 206 35 C 222 35, 232 23, 240 24 L 240 54 L 144 54 Z";
  const fgState3 = "M 152 54 C 174 50, 194 44, 212 39 C 226 35, 235 28, 240 29 L 240 54 L 152 54 Z";

  // Luminous Crest Highlight Path (open stroked contour matching foreground wave surface)
  const crestState0 = "M 150 54 C 172 48, 192 42, 210 38 C 224 34, 234 26, 240 28";
  const crestState1 = "M 158 54 C 178 52, 196 46, 214 43 C 228 40, 236 33, 240 31";
  const crestState2 = "M 144 54 C 166 44, 186 36, 206 35 C 222 35, 232 23, 240 24";
  const crestState3 = "M 152 54 C 174 50, 194 44, 212 39 C 226 35, 235 28, 240 29";

  // GSAP: Continuous harmonic physics & ambient levitation
  useEffect(() => {
    if (!active || shouldReduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = gsap.context(() => {
      // 1. Organic Wave Harmonic Levitation
      if (waveGroupRef.current) {
        gsap.to(waveGroupRef.current, {
          y: -2.8,
          scaleY: 1.04,
          transformOrigin: "bottom right",
          duration: 3.6 + (index % 3) * 0.5,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          force3D: true,
        });
      }

      // 2. Micro ambient floating droplets / sparkles along crest
      if (particle1Ref.current) {
        gsap.to(particle1Ref.current, {
          y: -4,
          x: -3,
          opacity: 0.85,
          scale: 1.3,
          transformOrigin: "center center",
          duration: 2.7 + (index % 2) * 0.4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }

      if (particle2Ref.current) {
        gsap.to(particle2Ref.current, {
          y: -3,
          x: 3.5,
          opacity: 0.75,
          scale: 1.25,
          transformOrigin: "center center",
          duration: 3.3 + (index % 3) * 0.3,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }

      if (particle3Ref.current) {
        gsap.to(particle3Ref.current, {
          y: -2.5,
          x: -2,
          opacity: 0.65,
          scale: 1.2,
          transformOrigin: "center center",
          duration: 4.1,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }

      // 3. Ambient Corner Sheen Breathing
      if (glowRef.current) {
        gsap.to(glowRef.current, {
          opacity: 0.75,
          scale: 1.12,
          transformOrigin: "bottom right",
          duration: 4.2,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }
    }, svgRef);

    return () => ctx.revert();
  }, [index, shouldReduceMotion, active]);

  // GSAP: Interactive liquid swell on card hover
  useEffect(() => {
    if (!active || shouldReduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    if (!waveGroupRef.current) return;

    const hoverContext = gsap.context(() => {
    if (isHovered) {
      gsap.to(waveGroupRef.current, {
        y: -5.5,
        scaleY: 1.15,
        scaleX: 1.03,
        duration: 0.45,
        ease: "power2.out",
        overwrite: "auto",
      });
      if (crestLineRef.current) {
        gsap.to(crestLineRef.current, {
          opacity: 1,
          strokeWidth: 1.8,
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
      if (glowRef.current) {
        gsap.to(glowRef.current, {
          opacity: 0.95,
          duration: 0.3,
          overwrite: "auto",
        });
      }
    } else {
      gsap.to(waveGroupRef.current, {
        y: 0,
        scaleY: 1,
        scaleX: 1,
        duration: 0.85,
        ease: "elastic.out(1, 0.45)",
        overwrite: "auto",
      });
      if (crestLineRef.current) {
        gsap.to(crestLineRef.current, {
          opacity: 0.65,
          strokeWidth: 1.2,
          duration: 0.5,
          ease: "power2.inOut",
          overwrite: "auto",
        });
      }
      if (glowRef.current) {
        gsap.to(glowRef.current, {
          opacity: 0.45,
          duration: 0.6,
          overwrite: "auto",
        });
      }
    }
    }, svgRef);
    return () => hoverContext.revert();
  }, [isHovered, shouldReduceMotion, active]);

  // Animation durations with subtle staggered phase offset per card index
  const bgDuration = 7.4 + (index % 4) * 0.7;
  const fgDuration = 5.6 + (index % 4) * 0.6;

  return (
    <svg
      ref={svgRef}
      className={`pointer-events-none absolute inset-0 z-0 h-full w-full select-none overflow-hidden opacity-95 transition-opacity duration-300 group-hover:opacity-100 ${className}`}
      viewBox="0 0 240 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={`stat-wave-bg-${id}`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop
            offset="0%"
            stopColor={waveColor}
            stopOpacity="0.12"
          />
          <stop
            offset="50%"
            stopColor={waveColor}
            stopOpacity="0.22"
          />
          <stop
            offset="100%"
            stopColor={waveColor}
            stopOpacity="0.08"
          />
        </linearGradient>

        <linearGradient
          id={`stat-wave-fg-${id}`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop
            offset="0%"
            stopColor={waveColor}
            stopOpacity="0.28"
          />
          <stop
            offset="55%"
            stopColor={waveColor}
            stopOpacity="0.18"
          />
          <stop
            offset="100%"
            stopColor={waveColor}
            stopOpacity="0.10"
          />
        </linearGradient>

        <linearGradient
          id={`stat-wave-crest-${id}`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop
            offset="0%"
            stopColor={waveColor}
            stopOpacity="0"
          />
          <stop
            offset="35%"
            stopColor={waveColor}
            stopOpacity="0.75"
          />
          <stop
            offset="70%"
            stopColor="#FFFFFF"
            stopOpacity="0.55"
          />
          <stop
            offset="100%"
            stopColor={waveColor}
            stopOpacity="0.1"
          />
        </linearGradient>

        <radialGradient
          id={`stat-wave-radial-${id}`}
          cx="100%"
          cy="100%"
          r="75%"
        >
          <stop
            offset="0%"
            stopColor={waveColor}
            stopOpacity="0.18"
          />
          <stop
            offset="60%"
            stopColor={waveColor}
            stopOpacity="0.06"
          />
          <stop
            offset="100%"
            stopColor={waveColor}
            stopOpacity="0"
          />
        </radialGradient>
      </defs>

      {/* Layer 0: Corner ambient glow sheen */}
      <ellipse
        ref={glowRef}
        cx="240"
        cy="54"
        rx="85"
        ry="42"
        fill={`url(#stat-wave-radial-${id})`}
        className="opacity-50"
      />

      {/* Animated Wave Group */}
      <g
        ref={waveGroupRef}
        className="origin-bottom-right"
      >
        {/* Layer 1: Background Wave (ambient rolling swell) */}
        <motion.path
          d={bgState0}
          initial={{ d: bgState0 }}
          animate={
            !active || shouldReduceMotion
              ? {d: bgState0}
              : {
                  d: [bgState0, bgState1, bgState2, bgState3, bgState0],
                }
          }
          transition={{
            duration: active ? bgDuration : 0,
            repeat: active ? Infinity : 0,
            ease: "easeInOut",
          }}
          fill={`url(#stat-wave-bg-${id})`}
        />

        {/* Layer 2: Foreground Fluid Wave (crisp overlapping liquid flow) */}
        <motion.path
          d={fgState0}
          initial={{ d: fgState0 }}
          animate={
            !active || shouldReduceMotion
              ? {d: fgState0}
              : {
                  d: [fgState0, fgState1, fgState2, fgState3, fgState0],
                }
          }
          transition={{
            duration: active ? fgDuration : 0,
            repeat: active ? Infinity : 0,
            ease: "easeInOut",
          }}
          fill={`url(#stat-wave-fg-${id})`}
        />

        {/* Layer 3: Luminous Crest Highlight Edge */}
        <motion.path
          ref={crestLineRef}
          d={crestState0}
          initial={{ d: crestState0 }}
          animate={
            !active || shouldReduceMotion
              ? {d: crestState0}
              : {
                  d: [crestState0, crestState1, crestState2, crestState3, crestState0],
                }
          }
          transition={{
            duration: active ? fgDuration : 0,
            repeat: active ? Infinity : 0,
            ease: "easeInOut",
          }}
          fill="none"
          stroke={`url(#stat-wave-crest-${id})`}
          strokeWidth="1.2"
          strokeLinecap="round"
          className="opacity-65"
        />

        {/* Layer 4: Micro Floating Droplets / Shimmer Nodes along Wave Crest */}
        {/* {!shouldReduceMotion && (
          <g className="pointer-events-none">
            <circle
              ref={particle1Ref}
              cx="196"
              cy="18"
              r="1.4"
              fill={waveColor}
              className="opacity-60"
            />
            <circle
              ref={particle2Ref}
              cx="222"
              cy="24"
              r="1.1"
              fill="#FFFFFF"
              className="opacity-50"
            />
            <circle
              ref={particle3Ref}
              cx="172"
              cy="28"
              r="0.9"
              fill={waveColor}
              className="opacity-40"
            />
          </g>
        )} */}
      </g>
    </svg>
  );
};

export const StatCardFluidWave = React.memo(StatCardFluidWaveComponent);
