import React, { useEffect, useRef } from "react";
import gsap from "gsap";

export interface CollegeIllustrationProps {
  className?: string;
}

/**
 * CollegeIllustration - Institutional AMS Dashboard & Academic Vector SVG
 *
 * Highly refined, silky-smooth GSAP animations:
 * - Fluid, harmonic floating physics on widgets, cap, and dashboard
 * - GPU-composited 3D transforms (force3D: true)
 * - Calibrated sine wave periods to prevent mechanical repetition
 * - Accessible with automatic prefers-reduced-motion detection
 */
export const CollegeIllustration: React.FC<CollegeIllustrationProps> = ({
  className = "w-full h-auto max-h-[230px] sm:max-h-[260px] md:max-h-[285px] select-none pointer-events-none drop-shadow-2xl",
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Respect user's system preferences for reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = gsap.context(() => {
      // 1. Gentle breathing float for Main Canvas Screen
      gsap.to(".ill-main-canvas", {
        y: -4,
        duration: 5.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        force3D: true,
      });

      // 2. Silky float for Widget 1 (Pass Rate - Top Left)
      gsap.to(".ill-widget-1", {
        y: -8,
        x: 2,
        duration: 4.2,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        force3D: true,
      });

      // 3. Counter-balanced float for Widget 2 (Student Roster - Top Right)
      gsap.to(".ill-widget-2", {
        y: 7,
        x: -2,
        duration: 4.8,
        delay: 0.6,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        force3D: true,
      });

      // 4. Harmonic drift for Widget 3 (Security Shield - Bottom Right)
      gsap.to(".ill-widget-3", {
        y: -6,
        x: 2,
        duration: 5.2,
        delay: 1.2,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        force3D: true,
      });

      // 5. Weightless Gold Graduation Cap (Gentle 3D tilt and drift)
      gsap.to(".ill-cap", {
        y: -9,
        rotation: 7,
        transformOrigin: "center center",
        duration: 3.8,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        force3D: true,
      });

      // 6. Serene Twinkling Sparkle Stars
      gsap.to(".ill-star", {
        scale: 1.28,
        opacity: 0.95,
        transformOrigin: "center center",
        duration: 2.2,
        stagger: {
          each: 0.5,
          repeat: -1,
          yoyo: true,
        },
        ease: "sine.inOut",
        force3D: true,
      });

      // 7. Ambient Pulsing Data Node on Spline Peak
      gsap.to(".ill-peak-node", {
        scale: 1.35,
        transformOrigin: "center center",
        duration: 2.0,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        force3D: true,
      });
    }, svgRef);

    return () => ctx.revert();
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 520 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Avis College Academic Management Illustration"
    >
      <defs>
        {/* Soft Ambient Blur Filter */}
        <filter id="ams-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#1D1015" floodOpacity="0.35" />
        </filter>

        <filter id="widget-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#1D1015" floodOpacity="0.25" />
        </filter>

        <filter id="glow-filter" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Gradients */}
        <linearGradient id="main-canvas-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.08" />
        </linearGradient>

        <linearGradient id="glass-card-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.12" />
        </linearGradient>

        <linearGradient id="brand-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#F1DDE0" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
        </linearGradient>

        <linearGradient id="chart-line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F1DDE0" />
          <stop offset="50%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FDE68A" />
        </linearGradient>

        <linearGradient id="chart-area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F1DDE0" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#F1DDE0" stopOpacity="0.0" />
        </linearGradient>

        <linearGradient id="accent-pill-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A64C61" />
          <stop offset="100%" stopColor="#702B40" />
        </linearGradient>

        <linearGradient id="emerald-pill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        <linearGradient id="bar-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#A64C61" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#F1DDE0" />
        </linearGradient>

        <radialGradient id="aura-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#A64C61" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#702B40" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ============================================================
          AMBIENT LIGHTING & GROUND CONTACT SHADOW
          ============================================================ */}
      <circle cx="260" cy="165" r="140" fill="url(#aura-glow)" />
      
      {/* Soft Ground Elliptical Shadow */}
      <ellipse cx="260" cy="324" rx="200" ry="12" fill="#1D1015" fillOpacity="0.4" />
      <ellipse cx="260" cy="324" rx="140" ry="7" fill="#1D1015" fillOpacity="0.3" />

      {/* ============================================================
          MAIN DASHBOARD DISPLAY PANEL
          ============================================================ */}
      <g className="ill-main-canvas" filter="url(#ams-shadow)">
        {/* Main Canvas Window */}
        <rect
          x="95"
          y="42"
          width="330"
          height="228"
          rx="22"
          fill="url(#main-canvas-bg)"
          stroke="url(#brand-stroke)"
          strokeWidth="1.5"
        />

        {/* Top Window Header Bar */}
        <path
          d="M 95 64 Q 95 42 117 42 L 403 42 Q 425 42 425 64 L 425 78 L 95 78 Z"
          fill="#FFFFFF"
          fillOpacity="0.1"
        />

        {/* macOS-style Window Control Dots */}
        <circle cx="118" cy="60" r="4.5" fill="#EF4444" fillOpacity="0.85" />
        <circle cx="132" cy="60" r="4.5" fill="#F59E0B" fillOpacity="0.85" />
        <circle cx="146" cy="60" r="4.5" fill="#10B981" fillOpacity="0.85" />

        {/* Search / Status Pill in Header */}
        <rect
          x="172"
          y="52"
          width="135"
          height="16"
          rx="8"
          fill="#FFFFFF"
          fillOpacity="0.15"
        />
        <circle cx="182" cy="60" r="3" fill="#FFFFFF" fillOpacity="0.5" />
        <rect x="192" y="58" width="55" height="4" rx="2" fill="#FFFFFF" fillOpacity="0.45" />

        {/* Header Right Mini Badges */}
        <rect x="365" y="53" width="44" height="14" rx="7" fill="#F1DDE0" fillOpacity="0.25" />
        <text x="372" y="63.5" fill="#FFFFFF" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
          LIVE AMS
        </text>

        {/* Window Content Split: Left Navigation / Metric Roster */}
        <line x1="165" y1="78" x2="165" y2="270" stroke="#FFFFFF" strokeOpacity="0.12" strokeWidth="1" />

        {/* Sidebar Nav Items */}
        <g opacity="0.85">
          <rect x="108" y="94" width="46" height="8" rx="4" fill="#FFFFFF" fillOpacity="0.45" />
          <rect x="108" y="112" width="38" height="6" rx="3" fill="#FFFFFF" fillOpacity="0.25" />
          <rect x="108" y="128" width="42" height="6" rx="3" fill="#FFFFFF" fillOpacity="0.25" />
          <rect x="108" y="144" width="34" height="6" rx="3" fill="#FFFFFF" fillOpacity="0.25" />
          <rect x="108" y="160" width="40" height="6" rx="3" fill="#FFFFFF" fillOpacity="0.25" />
        </g>

        {/* Active Module Indicator on Sidebar */}
        <rect x="104" y="91" width="52" height="14" rx="7" fill="#FFFFFF" fillOpacity="0.18" />

        {/* Mini Completion Donut in Sidebar Bottom */}
        <circle cx="130" cy="215" r="20" stroke="#FFFFFF" strokeOpacity="0.15" strokeWidth="4.5" fill="none" />
        <circle
          cx="130"
          cy="215"
          r="20"
          stroke="#F1DDE0"
          strokeWidth="4.5"
          strokeDasharray="125"
          strokeDashoffset="32"
          strokeLinecap="round"
          fill="none"
        />
        <text x="120" y="219" fill="#FFFFFF" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
          92%
        </text>
        <text x="110" y="244" fill="#F1DDE0" fontSize="7" opacity="0.85" fontFamily="sans-serif">
          Admissions
        </text>

        {/* ============================================================
            MAIN CONTENT AREA INSIDE WINDOW
            ============================================================ */}

        {/* KPI Mini-Cards Row */}
        <g transform="translate(178, 92)">
          {/* KPI 1: Students */}
          <rect x="0" y="0" width="72" height="34" rx="8" fill="#FFFFFF" fillOpacity="0.12" />
          <rect x="8" y="7" width="28" height="4" rx="2" fill="#FFFFFF" fillOpacity="0.4" />
          <text x="8" y="24" fill="#FFFFFF" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
            1,480
          </text>
          <text x="46" y="24" fill="#34D399" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
            +18%
          </text>

          {/* KPI 2: Courses */}
          <rect x="78" y="0" width="72" height="34" rx="8" fill="#FFFFFF" fillOpacity="0.12" />
          <rect x="86" y="7" width="24" height="4" rx="2" fill="#FFFFFF" fillOpacity="0.4" />
          <text x="86" y="24" fill="#FFFFFF" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
            42
          </text>
          <text x="108" y="24" fill="#F59E0B" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
            Active
          </text>

          {/* KPI 3: Branches */}
          <rect x="156" y="0" width="76" height="34" rx="8" fill="#FFFFFF" fillOpacity="0.12" />
          <rect x="164" y="7" width="30" height="4" rx="2" fill="#FFFFFF" fillOpacity="0.4" />
          <text x="164" y="24" fill="#FFFFFF" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
            100%
          </text>
          <text x="198" y="24" fill="#60A5FA" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
            SLA
          </text>
        </g>

        {/* Analytics Growth Spline Chart */}
        <g transform="translate(178, 140)">
          {/* Chart Header */}
          <rect x="0" y="0" width="55" height="5" rx="2.5" fill="#FFFFFF" fillOpacity="0.45" />

          {/* Grid Guideline Bars */}
          <line x1="0" y1="20" x2="232" y2="20" stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="0" y1="46" x2="232" y2="46" stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="0" y1="72" x2="232" y2="72" stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="1" />

          {/* Area Fill Under Spline */}
          <path
            d="M 5 62 Q 40 48 70 32 T 130 38 T 180 18 T 225 12 L 225 72 L 5 72 Z"
            fill="url(#chart-area-gradient)"
          />

          {/* Spline Path */}
          <path
            d="M 5 62 Q 40 48 70 32 T 130 38 T 180 18 T 225 12"
            fill="none"
            stroke="url(#chart-line-gradient)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Interactive Chart Data Nodes */}
          <circle cx="70" cy="32" r="3.5" fill="#FFFFFF" stroke="#702B40" strokeWidth="2" />
          <circle cx="130" cy="38" r="3.5" fill="#FFFFFF" stroke="#702B40" strokeWidth="2" />
          <circle className="ill-peak-node" cx="180" cy="18" r="4.5" fill="#FDE68A" stroke="#702B40" strokeWidth="2.5" filter="url(#glow-filter)" />
          <circle cx="225" cy="12" r="4" fill="#FFFFFF" stroke="#A64C61" strokeWidth="2" />

          {/* Active Tooltip Pill on Peak Node */}
          <rect x="156" y="-6" width="48" height="16" rx="8" fill="#1D1015" fillOpacity="0.8" stroke="#F1DDE0" strokeWidth="0.8" />
          <text x="165" y="5.5" fill="#FDE68A" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
            ★ Peak 98%
          </text>
        </g>

        {/* Bottom Metric Bar Strip */}
        <g transform="translate(178, 228)">
          <rect x="0" y="18" width="22" height="16" rx="4" fill="url(#bar-gradient)" />
          <rect x="28" y="12" width="22" height="22" rx="4" fill="url(#bar-gradient)" />
          <rect x="56" y="6" width="22" height="28" rx="4" fill="url(#bar-gradient)" />
          <rect x="84" y="15" width="22" height="19" rx="4" fill="url(#bar-gradient)" />
          <rect x="112" y="2" width="22" height="32" rx="4" fill="url(#bar-gradient)" />
          <rect x="140" y="8" width="22" height="26" rx="4" fill="url(#bar-gradient)" />
          <rect x="168" y="14" width="22" height="20" rx="4" fill="url(#bar-gradient)" />
          <rect x="196" y="4" width="22" height="30" rx="4" fill="url(#bar-gradient)" />
        </g>
      </g>

      {/* ============================================================
          FLOATING GLASS WIDGET 1: Top Left - Student Pass Rate Badge
          ============================================================ */}
      <g className="ill-widget-1" filter="url(#widget-shadow)" transform="translate(42, 85)">
        <rect
          x="0"
          y="0"
          width="125"
          height="76"
          rx="18"
          fill="url(#glass-card-bg)"
          stroke="url(#brand-stroke)"
          strokeWidth="1.2"
        />

        {/* Graduation Cap Badge Icon */}
        <rect x="12" y="14" width="30" height="30" rx="10" fill="url(#accent-pill-1)" />
        {/* Cap Shape */}
        <path d="M 27 22 L 37 26.5 L 27 31 L 17 26.5 Z" fill="#FFFFFF" />
        <path d="M 21 28.5 L 21 33.5 Q 27 36 33 33.5 L 33 28.5" stroke="#FFFFFF" strokeWidth="1.4" fill="none" />
        <circle cx="38" cy="27" r="1.5" fill="#FDE68A" />

        {/* Text Details */}
        <text x="48" y="24" fill="#FFFFFF" fontSize="13" fontWeight="bold" fontFamily="sans-serif">
          99.4%
        </text>
        <text x="48" y="36" fill="#F1DDE0" fontSize="8.5" fontFamily="sans-serif" opacity="0.9">
          Graduation Rate
        </text>

        {/* Mini Status Pill */}
        <rect x="12" y="52" width="101" height="14" rx="7" fill="#34D399" fillOpacity="0.2" />
        <circle cx="20" cy="59" r="2.5" fill="#34D399" />
        <text x="27" y="62.5" fill="#34D399" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
          Verified Academic Excellence
        </text>
      </g>

      {/* ============================================================
          FLOATING GLASS WIDGET 2: Top Right - Active Students Roster
          ============================================================ */}
      <g className="ill-widget-2" filter="url(#widget-shadow)" transform="translate(365, 70)">
        <rect
          x="0"
          y="0"
          width="122"
          height="82"
          rx="18"
          fill="url(#glass-card-bg)"
          stroke="url(#brand-stroke)"
          strokeWidth="1.2"
        />

        {/* Student Avatar Cluster */}
        <g transform="translate(14, 15)">
          {/* Avatar 1 */}
          <circle cx="12" cy="12" r="11" fill="#D97706" stroke="#FFFFFF" strokeWidth="1.5" />
          <circle cx="12" cy="9" r="4.5" fill="#FDE68A" />
          <path d="M 6 19 Q 12 14 18 19" fill="#B45309" />

          {/* Avatar 2 */}
          <circle cx="28" cy="12" r="11" fill="#702B40" stroke="#FFFFFF" strokeWidth="1.5" />
          <circle cx="28" cy="9" r="4.5" fill="#F1DDE0" />
          <path d="M 22 19 Q 28 14 34 19" fill="#421B29" />

          {/* Avatar 3 */}
          <circle cx="44" cy="12" r="11" fill="#059669" stroke="#FFFFFF" strokeWidth="1.5" />
          <circle cx="44" cy="9" r="4.5" fill="#A7F3D0" />
          <path d="M 38 19 Q 44 14 50 19" fill="#047857" />

          {/* Avatar Plus Badge */}
          <circle cx="62" cy="12" r="10" fill="#FFFFFF" fillOpacity="0.3" stroke="#FFFFFF" strokeWidth="1.2" />
          <text x="56.5" y="15.5" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
            +4k
          </text>
        </g>

        {/* Text Details */}
        <text x="14" y="52" fill="#FFFFFF" fontSize="13" fontWeight="bold" fontFamily="sans-serif">
          4,850+
        </text>
        <text x="14" y="65" fill="#F1DDE0" fontSize="8.5" fontFamily="sans-serif" opacity="0.9">
          Global Active Students
        </text>
      </g>

      {/* ============================================================
          FLOATING GLASS WIDGET 3: Bottom Right - Institutional Security
          ============================================================ */}
      <g className="ill-widget-3" filter="url(#widget-shadow)" transform="translate(360, 205)">
        <rect
          x="0"
          y="0"
          width="132"
          height="64"
          rx="18"
          fill="url(#glass-card-bg)"
          stroke="url(#brand-stroke)"
          strokeWidth="1.2"
        />

        {/* Shield Icon Badge */}
        <rect x="12" y="12" width="30" height="30" rx="10" fill="url(#emerald-pill)" />
        {/* Shield + Check */}
        <path
          d="M 27 18 L 34 21 V 27 Q 34 33 27 36 Q 20 33 20 27 V 21 Z"
          fill="#FFFFFF"
          fillOpacity="0.25"
          stroke="#FFFFFF"
          strokeWidth="1.5"
        />
        <path d="M 24 27 L 26.5 29.5 L 30.5 24" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

        {/* Details */}
        <text x="48" y="24" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
          Avis College
        </text>
        <text x="48" y="36" fill="#A7F3D0" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
          ✓ Secure & ISO Sync
        </text>
        <text x="14" y="54" fill="#F1DDE0" fontSize="7.5" opacity="0.85" fontFamily="sans-serif">
          Real-time Central Governance
        </text>
      </g>

      {/* ============================================================
          FLOATING GOLD GRADUATION CAP ORNAMENT
          ============================================================ */}
      <g className="ill-cap" transform="translate(195, 18) rotate(-12)" filter="url(#widget-shadow)">
        <polygon points="25,5 45,13 25,21 5,13" fill="#FDE68A" stroke="#FFFFFF" strokeWidth="1" />
        <path d="M 12 16 L 12 24 Q 25 29 38 24 L 38 16" stroke="#FDE68A" strokeWidth="2" fill="none" />
        <circle cx="45" cy="14" r="2" fill="#F59E0B" />
        <line x1="45" y1="14" x2="47" y2="22" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Sparkles / Dynamic Star Elements */}
      <g fill="#FDE68A">
        {/* Star 1 */}
        <path className="ill-star" d="M 85 45 Q 85 53 93 53 Q 85 53 85 61 Q 85 53 77 53 Q 85 53 85 45 Z" opacity="0.8" />
        {/* Star 2 */}
        <path className="ill-star" d="M 445 180 Q 445 186 451 186 Q 445 186 445 192 Q 445 186 439 186 Q 445 186 445 180 Z" opacity="0.75" />
        {/* Star 3 */}
        <path className="ill-star" d="M 68 220 Q 68 224 72 224 Q 68 224 68 228 Q 68 224 64 224 Q 68 224 68 220 Z" opacity="0.6" />
      </g>
    </svg>
  );
};

export { SmartCampusIllustration } from "./SmartCampusIllustration";
export default CollegeIllustration;
