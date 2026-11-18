import React, { useEffect, useRef } from "react";
import gsap from "gsap";

export interface SmartCampusIllustrationProps {
  className?: string;
}

/**
 * SmartCampusIllustration
 * 
 * 3D Isometric Smart Digital Campus & Global Academic Cloud Ecosystem
 * Designed for Avis World College AMS.
 *
 * Features:
 * - Multi-tier floating isometric academic island with glass pavilions
 * - Central Administration Tower with glowing digital clock & beacon spire
 * - Pulsing data highways routing student & institutional traffic
 * - Floating glass satellite hologram widgets (Accreditation, Global Scholars, Security)
 * - Levitation physics with smooth GSAP sine-wave harmonic oscillators
 * - Accessible with prefers-reduced-motion support
 */
export const SmartCampusIllustration: React.FC<SmartCampusIllustrationProps> = ({
  className = "w-full h-auto max-h-[250px] sm:max-h-[280px] md:max-h-[305px] select-none pointer-events-none drop-shadow-2xl",
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = gsap.context(() => {
      // 1. Organic Breathing Levitation of the Entire Campus Island
      gsap.to(".iso-island-group", {
        y: -6,
        duration: 6,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        force3D: true,
      });

      // 2. Island Ground Contact Shadow Breathing (expands as island lowers, contracts as it rises)
      gsap.to(".iso-ground-shadow", {
        scaleX: 1.08,
        scaleY: 1.12,
        opacity: 0.35,
        transformOrigin: "center center",
        duration: 6,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        force3D: true,
      });

      // 3. Central Beacon Radar Wave Expansion
      gsap.to(".beacon-ring-1", {
        r: 32,
        opacity: 0,
        strokeWidth: 0.5,
        duration: 2.8,
        repeat: -1,
        ease: "power1.out",
      });

      gsap.to(".beacon-ring-2", {
        r: 32,
        opacity: 0,
        strokeWidth: 0.5,
        duration: 2.8,
        delay: 1.4,
        repeat: -1,
        ease: "power1.out",
      });

      // 4. Data Stream Highway Pulses (Continuous animated energy through pathways)
      gsap.to(".data-stream-left", {
        strokeDashoffset: -120,
        duration: 3.2,
        repeat: -1,
        ease: "none",
      });

      gsap.to(".data-stream-right", {
        strokeDashoffset: 120,
        duration: 3.6,
        repeat: -1,
        ease: "none",
      });

      gsap.to(".data-stream-center", {
        strokeDashoffset: -100,
        duration: 2.6,
        repeat: -1,
        ease: "none",
      });

      // 5. Floating Triumphant Golden Graduation Cap
      gsap.to(".floating-tassel-cap", {
        y: -10,
        rotation: 6,
        transformOrigin: "center center",
        duration: 4.2,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        force3D: true,
      });

      // 6. Floating Hologram Card 1 (Left - Academic Excellence)
      gsap.to(".hologram-card-left", {
        y: -9,
        x: 3,
        duration: 4.8,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        force3D: true,
      });

      // 7. Floating Hologram Card 2 (Right - Global Scholars)
      gsap.to(".hologram-card-right", {
        y: 8,
        x: -3,
        duration: 5.4,
        delay: 0.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        force3D: true,
      });

      // 8. Floating Hologram Card 3 (Bottom Right - ISO Shield)
      gsap.to(".hologram-card-shield", {
        y: -7,
        x: 2,
        duration: 4.6,
        delay: 1.1,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        force3D: true,
      });

      // 9. Pulsing Scholar Nodes & Live Indicators
      gsap.to(".live-indicator-glow", {
        scale: 1.5,
        opacity: 0.3,
        transformOrigin: "center center",
        duration: 1.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // 10. Twinkling Academic Constellation Sparkles
      gsap.to(".sparkle-star", {
        scale: 1.35,
        opacity: 0.95,
        transformOrigin: "center center",
        duration: 2.2,
        stagger: {
          each: 0.45,
          repeat: -1,
          yoyo: true,
        },
        ease: "sine.inOut",
      });
    }, svgRef);

    return () => ctx.revert();
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 560 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Avis World College 3D Smart Campus Illustration"
    >
      <defs>
        {/* Drop Shadows */}
        <filter id="campus-depth-shadow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="16" stdDeviation="18" floodColor="#1A0A10" floodOpacity="0.45" />
        </filter>

        <filter id="hologram-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#1A0A10" floodOpacity="0.32" />
        </filter>

        <filter id="soft-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <filter id="intense-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="9" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Linear & Radial Gradients */}
        <radialGradient id="ambient-campus-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C95D75" stopOpacity="0.42" />
          <stop offset="65%" stopColor="#702B40" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#421B29" stopOpacity="0" />
        </radialGradient>

        {/* Island Surface Gradient */}
        <linearGradient id="island-top" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.28" />
          <stop offset="45%" stopColor="#F1DDE0" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.08" />
        </linearGradient>

        <linearGradient id="island-front-left" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#702B40" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#32101B" stopOpacity="0.95" />
        </linearGradient>

        <linearGradient id="island-front-right" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#551F2F" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#220B13" stopOpacity="0.98" />
        </linearGradient>

        {/* Tower Facade Gradients */}
        <linearGradient id="tower-facade-left" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.32" />
          <stop offset="50%" stopColor="#F1DDE0" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#8E344D" stopOpacity="0.35" />
        </linearGradient>

        <linearGradient id="tower-facade-right" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.20" />
          <stop offset="50%" stopColor="#702B40" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#421B29" stopOpacity="0.55" />
        </linearGradient>

        <linearGradient id="tower-roof" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#F1DDE0" stopOpacity="0.25" />
        </linearGradient>

        {/* Glass Hologram Backgrounds */}
        <linearGradient id="glass-badge-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.10" />
        </linearGradient>

        <linearGradient id="gold-cap-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF3B0" />
          <stop offset="45%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        <linearGradient id="gold-tassel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        <linearGradient id="emerald-glow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        <linearGradient id="cyan-glow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A5F3FC" />
          <stop offset="100%" stopColor="#0891B2" />
        </linearGradient>

        <linearGradient id="brand-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.65" />
          <stop offset="50%" stopColor="#F1DDE0" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.12" />
        </linearGradient>
      </defs>

      {/* ============================================================
          AMBIENT ATMOSPHERE & GROUND SHADOW
          ============================================================ */}
      <circle cx="280" cy="180" r="165" fill="url(#ambient-campus-glow)" />

      {/* Floating Ground Shadow (Reactive Breathing) */}
      <ellipse
        className="iso-ground-shadow"
        cx="280"
        cy="350"
        rx="210"
        ry="18"
        fill="#12050A"
        opacity="0.45"
      />
      <ellipse
        className="iso-ground-shadow"
        cx="280"
        cy="350"
        rx="145"
        ry="11"
        fill="#1A0A10"
        opacity="0.35"
      />

      {/* ============================================================
          MAIN ISOMETRIC SMART CAMPUS ISLAND
          ============================================================ */}
      <g className="iso-island-group" filter="url(#campus-depth-shadow)">
        {/* Island Lower Extrusion - Left Face */}
        <path
          d="M 120 235 L 280 325 L 280 348 L 120 258 Z"
          fill="url(#island-front-left)"
          stroke="#FFFFFF"
          strokeOpacity="0.15"
          strokeWidth="0.8"
        />

        {/* Island Lower Extrusion - Right Face */}
        <path
          d="M 280 325 L 440 235 L 440 258 L 280 348 Z"
          fill="url(#island-front-right)"
          stroke="#FFFFFF"
          strokeOpacity="0.12"
          strokeWidth="0.8"
        />

        {/* Island Top Surface (Polished Frosted Glass Isometric Hexagon / Diamond) */}
        <path
          d="M 280 145 L 440 235 L 280 325 L 120 235 Z"
          fill="url(#island-top)"
          stroke="url(#brand-stroke)"
          strokeWidth="1.5"
        />

        {/* Decorative Concentric Isometric Campus Contours */}
        <path
          d="M 280 162 L 418 238 L 280 312 L 142 238 Z"
          stroke="#FFFFFF"
          strokeOpacity="0.14"
          strokeWidth="1"
          strokeDasharray="4 4"
          fill="none"
        />
        <path
          d="M 280 178 L 395 240 L 280 298 L 165 240 Z"
          stroke="#FFFFFF"
          strokeOpacity="0.18"
          strokeWidth="1"
          fill="none"
        />

        {/* ============================================================
            ENERGY HIGHWAYS & DATA TRANSIT TRACKS
            ============================================================ */}
        {/* Track Left: Library to Center */}
        <path
          d="M 175 220 L 235 245 L 270 230"
          stroke="#A5F3FC"
          strokeOpacity="0.3"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          className="data-stream-left"
          d="M 175 220 L 235 245 L 270 230"
          stroke="#67E8F9"
          strokeWidth="2.5"
          strokeDasharray="8 35"
          strokeLinecap="round"
          filter="url(#soft-glow)"
          fill="none"
        />

        {/* Track Right: Research Lab to Center */}
        <path
          d="M 385 220 L 325 245 L 290 230"
          stroke="#FDE68A"
          strokeOpacity="0.3"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          className="data-stream-right"
          d="M 385 220 L 325 245 L 290 230"
          stroke="#FDE68A"
          strokeWidth="2.5"
          strokeDasharray="10 40"
          strokeLinecap="round"
          filter="url(#soft-glow)"
          fill="none"
        />

        {/* Track Center: Main Gate to Hub */}
        <path
          d="M 280 305 L 280 250"
          stroke="#34D399"
          strokeOpacity="0.35"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          className="data-stream-center"
          d="M 280 305 L 280 250"
          stroke="#34D399"
          strokeWidth="2.5"
          strokeDasharray="6 30"
          strokeLinecap="round"
          filter="url(#soft-glow)"
          fill="none"
        />

        {/* Grand Plaza Entrance Steps */}
        <polygon points="265,302 295,302 300,312 260,312" fill="#FFFFFF" fillOpacity="0.25" stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="0.8" />
        <polygon points="268,294 292,294 296,301 264,301" fill="#FFFFFF" fillOpacity="0.3" stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="0.8" />

        {/* Campus Trees / Biophilic Groves */}
        <g transform="translate(195, 255)">
          <ellipse cx="0" cy="0" rx="9" ry="6" fill="#059669" fillOpacity="0.75" />
          <ellipse cx="0" cy="-3" rx="7" ry="5" fill="#34D399" fillOpacity="0.9" />
          <ellipse cx="0" cy="-5" rx="5" ry="3.5" fill="#A7F3D0" />
        </g>
        <g transform="translate(365, 255)">
          <ellipse cx="0" cy="0" rx="9" ry="6" fill="#059669" fillOpacity="0.75" />
          <ellipse cx="0" cy="-3" rx="7" ry="5" fill="#34D399" fillOpacity="0.9" />
          <ellipse cx="0" cy="-5" rx="5" ry="3.5" fill="#A7F3D0" />
        </g>

        {/* ============================================================
            WEST WING: Digital Library & Knowledge Atrium
            ============================================================ */}
        <g id="west-faculty-wing">
          {/* Base Plinth */}
          <polygon points="160,205 195,185 220,200 185,220" fill="url(#island-top)" stroke="url(#brand-stroke)" strokeWidth="0.8" />

          {/* Building Left Face */}
          <polygon points="160,205 185,220 185,185 160,170" fill="url(#tower-facade-left)" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="0.8" />
          {/* Building Right Face */}
          <polygon points="185,220 220,200 220,165 185,185" fill="url(#tower-facade-right)" stroke="#FFFFFF" strokeOpacity="0.2" strokeWidth="0.8" />
          {/* Roof */}
          <polygon points="160,170 195,150 220,165 185,185" fill="url(#tower-roof)" stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="0.8" />

          {/* Glowing Library Windows (Horizontal Ribbon Strips) */}
          <line x1="166" y1="181" x2="180" y2="190" stroke="#67E8F9" strokeWidth="2.2" strokeLinecap="round" opacity="0.9" filter="url(#soft-glow)" />
          <line x1="166" y1="193" x2="180" y2="202" stroke="#67E8F9" strokeWidth="2.2" strokeLinecap="round" opacity="0.9" filter="url(#soft-glow)" />
          <line x1="166" y1="205" x2="180" y2="214" stroke="#67E8F9" strokeWidth="2.2" strokeLinecap="round" opacity="0.9" filter="url(#soft-glow)" />

          <line x1="190" y1="190" x2="214" y2="176" stroke="#A5F3FC" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
          <line x1="190" y1="202" x2="214" y2="188" stroke="#A5F3FC" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />

          {/* Roof Solar Garden Ring */}
          <polygon points="175,168 195,156 208,164 188,176" fill="#0284C7" fillOpacity="0.6" stroke="#38BDF8" strokeWidth="0.8" />
        </g>

        {/* ============================================================
            EAST WING: Research, Technology & Innovation Arena
            ============================================================ */}
        <g id="east-faculty-wing">
          {/* Base Plinth */}
          <polygon points="340,200 365,185 400,205 375,220" fill="url(#island-top)" stroke="url(#brand-stroke)" strokeWidth="0.8" />

          {/* Building Left Face */}
          <polygon points="340,200 375,220 375,180 340,160" fill="url(#tower-facade-left)" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="0.8" />
          {/* Building Right Face */}
          <polygon points="375,220 400,205 400,165 375,180" fill="url(#tower-facade-right)" stroke="#FFFFFF" strokeOpacity="0.2" strokeWidth="0.8" />
          {/* Roof */}
          <polygon points="340,160 365,145 400,165 375,180" fill="url(#tower-roof)" stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="0.8" />

          {/* Research Lab Hologram Atrium Glow */}
          <circle cx="372" cy="188" r="8" fill="#FDE68A" fillOpacity="0.2" filter="url(#soft-glow)" />
          <line x1="346" y1="174" x2="368" y2="187" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
          <line x1="346" y1="186" x2="368" y2="199" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
          <line x1="380" y1="184" x2="394" y2="176" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
          <line x1="380" y1="196" x2="394" y2="188" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
        </g>

        {/* ============================================================
            CENTRAL MONUMENT: Avis World Administration & Cloud Spire
            ============================================================ */}
        <g id="central-administration-tower">
          {/* Main Tower - Tier 1 (Base Level) */}
          <polygon points="238,208 280,184 322,208 280,232" fill="url(#island-top)" stroke="url(#brand-stroke)" strokeWidth="1" />
          <polygon points="238,208 280,232 280,256 238,232" fill="url(#tower-facade-left)" stroke="#FFFFFF" strokeOpacity="0.3" strokeWidth="1" />
          <polygon points="280,232 322,208 322,232 280,256" fill="url(#tower-facade-right)" stroke="#FFFFFF" strokeOpacity="0.2" strokeWidth="1" />

          {/* Main Tower - Tier 2 (High Rise Section) */}
          <polygon points="248,162 280,144 312,162 280,180" fill="url(#tower-roof)" stroke="url(#brand-stroke)" strokeWidth="1.2" />
          <polygon points="248,162 280,180 280,222 248,204" fill="url(#tower-facade-left)" stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="1" />
          <polygon points="280,180 312,162 312,204 280,222" fill="url(#tower-facade-right)" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="1" />

          {/* Tower Facade Vertical Windows / Architectural Fins */}
          <line x1="258" y1="174" x2="258" y2="204" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
          <line x1="268" y1="180" x2="268" y2="210" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
          <line x1="292" y1="180" x2="292" y2="210" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
          <line x1="302" y1="174" x2="302" y2="204" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />

          {/* Tower Tier 3 (Glass Penthouse Observation Deck) */}
          <polygon points="260,135 280,123 300,135 280,147" fill="#F1DDE0" fillOpacity="0.45" stroke="#FFFFFF" strokeWidth="1" />
          <polygon points="260,135 280,147 280,158 260,146" fill="url(#tower-facade-left)" stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="0.8" />
          <polygon points="280,147 300,135 300,146 280,158" fill="url(#tower-facade-right)" stroke="#FFFFFF" strokeOpacity="0.3" strokeWidth="0.8" />

          {/* Avis Institutional Portal Badge / Shield on Central Facade */}
          <g transform="translate(270, 190)">
            <rect x="0" y="0" width="20" height="24" rx="4" fill="#702B40" stroke="#FDE68A" strokeWidth="1.2" />
            <path d="M 10 4 L 17 8 V 14 Q 10 20 10 20 Q 10 20 3 14 V 8 Z" fill="#FDE68A" fillOpacity="0.9" />
            <path d="M 7 11 L 9.5 13.5 L 14 9" stroke="#702B40" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* Central Beacon Spire & Transmission Radar */}
          <line x1="280" y1="123" x2="280" y2="76" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="280" y1="76" x2="280" y2="64" stroke="#FDE68A" strokeWidth="1.8" strokeLinecap="round" />

          {/* Glowing Beacon Diamond Tip */}
          <polygon points="280,58 284,64 280,70 276,64" fill="#FDE68A" filter="url(#intense-glow)" />

          {/* Dynamic Radar Wave Rings Expanding from Beacon */}
          <circle className="beacon-ring-1" cx="280" cy="64" r="8" stroke="#FDE68A" strokeWidth="1.5" fill="none" opacity="0.8" />
          <circle className="beacon-ring-2" cx="280" cy="64" r="8" stroke="#FDE68A" strokeWidth="1.5" fill="none" opacity="0.8" />
        </g>
      </g>

      {/* ============================================================
          FLOATING TRIUMPHANT GRADUATION CAP (Golden Halo Elevation)
          ============================================================ */}
      <g className="floating-tassel-cap" transform="translate(280, 44)" filter="url(#hologram-shadow)">
        {/* Soft Golden Aura Halo */}
        <ellipse cx="0" cy="18" rx="36" ry="9" fill="#FDE68A" fillOpacity="0.22" filter="url(#soft-glow)" />

        {/* Graduation Cap Diamond Top */}
        <polygon
          points="0,-4 38,9 0,22 -38,9"
          fill="url(#gold-cap-grad)"
          stroke="#FFFFFF"
          strokeWidth="1.5"
        />

        {/* Skull Cap Base Underneath */}
        <path
          d="M -20 12 L -20 22 Q 0 30 20 22 L 20 12"
          stroke="url(#gold-cap-grad)"
          strokeWidth="3.2"
          fill="none"
          strokeLinecap="round"
        />

        {/* Center Button & Hanging Gold Tassel */}
        <circle cx="0" cy="9" r="2.8" fill="#FFFFFF" />
        <path
          d="M 0 9 Q 24 12 36 24"
          stroke="url(#gold-tassel)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="36" cy="24" r="2.2" fill="#F59E0B" />
        <line x1="36" y1="24" x2="38" y2="33" stroke="#F59E0B" strokeWidth="2.4" strokeLinecap="round" />
      </g>

      {/* ============================================================
          FLOATING GLASS SATELLITE BADGE 1: Left - Academic Excellence
          ============================================================ */}
      <g className="hologram-card-left" transform="translate(32, 108)" filter="url(#hologram-shadow)">
        <rect
          x="0"
          y="0"
          width="132"
          height="80"
          rx="18"
          fill="url(#glass-badge-bg)"
          stroke="url(#brand-stroke)"
          strokeWidth="1.4"
        />

        {/* Institutional Crest Icon */}
        <rect x="12" y="14" width="32" height="32" rx="10" fill="url(#island-front-left)" stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="0.8" />
        <path d="M 28 20 L 37 24 L 28 28 L 19 24 Z" fill="#FDE68A" />
        <path d="M 23 26 V 30.5 Q 28 33 33 30.5 V 26" stroke="#FDE68A" strokeWidth="1.4" fill="none" />

        {/* Metric Value */}
        <text x="52" y="26" fill="#FFFFFF" fontSize="14" fontWeight="bold" fontFamily="sans-serif">
          99.8%
        </text>
        <text x="52" y="38" fill="#F1DDE0" fontSize="8" fontFamily="sans-serif" opacity="0.9">
          Graduation Rate
        </text>

        {/* Verified Pill */}
        <rect x="12" y="54" width="108" height="15" rx="7.5" fill="#10B981" fillOpacity="0.22" stroke="#34D399" strokeOpacity="0.4" strokeWidth="0.8" />
        <circle cx="21" cy="61.5" r="3" fill="#34D399" />
        <circle className="live-indicator-glow" cx="21" cy="61.5" r="3" stroke="#34D399" strokeWidth="1" fill="none" />
        <text x="28" y="65" fill="#A7F3D0" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
          Top-Tier Accreditation
        </text>
      </g>

      {/* ============================================================
          FLOATING GLASS SATELLITE BADGE 2: Right - Global Student Network
          ============================================================ */}
      <g className="hologram-card-right" transform="translate(390, 84)" filter="url(#hologram-shadow)">
        <rect
          x="0"
          y="0"
          width="138"
          height="86"
          rx="18"
          fill="url(#glass-badge-bg)"
          stroke="url(#brand-stroke)"
          strokeWidth="1.4"
        />

        {/* Connected Student Multi-Avatar Group */}
        <g transform="translate(14, 15)">
          <circle cx="12" cy="12" r="11" fill="#D97706" stroke="#FFFFFF" strokeWidth="1.5" />
          <circle cx="12" cy="9" r="4.2" fill="#FDE68A" />
          <path d="M 6 19 Q 12 14 18 19" fill="#B45309" />

          <circle cx="30" cy="12" r="11" fill="#702B40" stroke="#FFFFFF" strokeWidth="1.5" />
          <circle cx="30" cy="9" r="4.2" fill="#F1DDE0" />
          <path d="M 24 19 Q 30 14 36 19" fill="#421B29" />

          <circle cx="48" cy="12" r="11" fill="#0891B2" stroke="#FFFFFF" strokeWidth="1.5" />
          <circle cx="48" cy="9" r="4.2" fill="#A5F3FC" />
          <path d="M 42 19 Q 48 14 54 19" fill="#0E7490" />

          <circle cx="68" cy="12" r="10" fill="#FFFFFF" fillOpacity="0.25" stroke="#FFFFFF" strokeWidth="1.2" />
          <text x="62.5" y="15.5" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
            +5k
          </text>
        </g>

        {/* Global Student Stats */}
        <text x="14" y="55" fill="#FFFFFF" fontSize="14" fontWeight="bold" fontFamily="sans-serif">
          5,200+
        </text>
        <text x="14" y="68" fill="#F1DDE0" fontSize="8.5" fontFamily="sans-serif" opacity="0.9">
          Global Active Scholars
        </text>
      </g>

      {/* ============================================================
          FLOATING GLASS SATELLITE BADGE 3: Bottom Right - Institutional Security
          ============================================================ */}
      <g className="hologram-card-shield" transform="translate(382, 230)" filter="url(#hologram-shadow)">
        <rect
          x="0"
          y="0"
          width="144"
          height="66"
          rx="18"
          fill="url(#glass-badge-bg)"
          stroke="url(#brand-stroke)"
          strokeWidth="1.4"
        />

        {/* Security Shield Icon */}
        <rect x="12" y="13" width="30" height="30" rx="10" fill="url(#emerald-glow-grad)" stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="0.8" />
        <path
          d="M 27 19 L 34 22 V 28 Q 34 34 27 37 Q 20 34 20 28 V 22 Z"
          fill="#FFFFFF"
          fillOpacity="0.3"
          stroke="#FFFFFF"
          strokeWidth="1.4"
        />
        <path d="M 24 28 L 26.5 30.5 L 30.5 25" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

        {/* Text Details */}
        <text x="50" y="26" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
          Avis Smart Cloud
        </text>
        <text x="50" y="38" fill="#A7F3D0" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
          ✓ ISO 27001 & SOC-2
        </text>
        <text x="14" y="55" fill="#F1DDE0" fontSize="7.5" opacity="0.85" fontFamily="sans-serif">
          Real-time Central Governance
        </text>
      </g>

      {/* ============================================================
          COSMIC & ACADEMIC SPARKLE CONSTELLATIONS
          ============================================================ */}
      <g fill="#FDE68A">
        {/* Star 1: Top Left */}
        <path
          className="sparkle-star"
          d="M 96 65 Q 96 73 104 73 Q 96 73 96 81 Q 96 73 88 73 Q 96 73 96 65 Z"
          opacity="0.85"
        />

        {/* Star 2: Top Right */}
        <path
          className="sparkle-star"
          d="M 465 52 Q 465 59 472 59 Q 465 59 465 66 Q 465 59 458 59 Q 465 59 465 52 Z"
          opacity="0.9"
        />

        {/* Star 3: Center Mid-Right */}
        <path
          className="sparkle-star"
          d="M 495 195 Q 495 200 500 200 Q 495 200 495 205 Q 495 200 490 200 Q 495 200 495 195 Z"
          opacity="0.7"
        />

        {/* Star 4: Bottom Left */}
        <path
          className="sparkle-star"
          d="M 80 270 Q 80 275 85 275 Q 80 275 80 280 Q 80 275 75 275 Q 80 275 80 270 Z"
          opacity="0.75"
        />
      </g>
    </svg>
  );
};

export default SmartCampusIllustration;
