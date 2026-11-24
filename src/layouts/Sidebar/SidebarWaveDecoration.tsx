import {createWaveSamples, updateWaveSamples} from "./waveGeometry";
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SidebarWaveDecorationProps {
  collapsed?: boolean;
  className?: string;
  companyName?: string;
  companyUrl?: string;
}

interface Particle {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  speedY: number;
  speedX: number;
  phase: number;
}

export const SidebarWaveDecorationComponent: React.FC<SidebarWaveDecorationProps> = ({
  collapsed = false,
  className,
  companyName = 'Superio Digital Solutions.',
  companyUrl = 'https://superiodigital.com/',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean; targetBoost: number; boost: number }>({
    x: 0,
    y: 0,
    active: false,
    targetBoost: 0,
    boost: 0,
  });

  const currentYear = new Date().getFullYear();
  const [isHovered, setIsHovered] = useState(false);

  const isVisibleRef = useRef(true);

  // Initialize subtle ambient floating bokeh particles
  const particlesRef = useRef<Particle[]>([
    { x: 0.22, y: 0.55, r: 1.5, baseAlpha: 0.35, speedY: -0.06, speedX: 0.02, phase: 0.2 },
    { x: 0.45, y: 0.45, r: 1.8, baseAlpha: 0.45, speedY: -0.05, speedX: -0.03, phase: 1.5 },
    { x: 0.68, y: 0.35, r: 2.2, baseAlpha: 0.55, speedY: -0.08, speedX: 0.03, phase: 2.8 },
    { x: 0.85, y: 0.50, r: 1.6, baseAlpha: 0.40, speedY: -0.06, speedX: -0.02, phase: 4.1 },
    { x: 0.32, y: 0.60, r: 1.3, baseAlpha: 0.30, speedY: -0.04, speedX: 0.01, phase: 5.3 },
  ]);

  // Handle canvas sizing with device pixel ratio
  const updateCanvasDimensions = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = container.getBoundingClientRect();
    const width = Math.max(rect.width, 10);
    const height = Math.max(rect.height || container.clientHeight, collapsed ? 135 : 175);

    const targetW = Math.round(width * dpr);
    const targetH = Math.round(height * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }
  }, [collapsed]);

  useEffect(() => {
    updateCanvasDimensions();
    const ro = new ResizeObserver(() => {
      updateCanvasDimensions();
    });
    if (containerRef.current) {
      ro.observe(containerRef.current);
    }
    return () => ro.disconnect();
  }, [updateCanvasDimensions, collapsed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = motionPreference.matches;
    let samples: ReturnType<typeof createWaveSamples> = [];
    let sampleWidth = 0, sampleHeight = 0;
    let startTime: number | null = null;
    let isRunning = false;

    const stopLoop = () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      isRunning = false;
    };

    const startLoop = () => {
      if (isRunning || prefersReducedMotion || document.hidden || !isVisibleRef.current) return;
      isRunning = true;
      startTime = null;
      animFrameRef.current = requestAnimationFrame(render);
    };

    const render = (timestamp: number, staticFrame = false) => {
      if (!isRunning && !staticFrame) return;
      if (startTime === null) startTime = timestamp;
      const elapsed = (timestamp - startTime) * 0.001; // elapsed seconds
      const t = prefersReducedMotion ? 0 : elapsed;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;

      if (W <= 0 || H <= 0) {
        if (!prefersReducedMotion && isRunning) {
          animFrameRef.current = requestAnimationFrame(render);
        }
        return;
      }

      // Smooth mouse interaction interpolation
      const mouse = mouseRef.current;
      if (Math.abs(mouse.targetBoost - mouse.boost) > 0.001) {
        mouse.boost += (mouse.targetBoost - mouse.boost) * 0.06;
      } else {
        mouse.boost = mouse.targetBoost;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, W, H);

      if (W !== sampleWidth || H !== sampleHeight) {
        samples = createWaveSamples(W, H); sampleWidth = W; sampleHeight = H;
      }
      updateWaveSamples(samples, W, t, mouse);

      // --- 2. Render Secondary Crossing Wave Strands (Dynamically scaled spread) ---
      const crossStrandCount = 10;

      for (let i = 0; i < crossStrandCount; i++) {
        const s = i / Math.max(crossStrandCount - 1, 1);
        const strandAlpha = (0.46 - s * 0.28) * (1 + mouse.boost * 0.2);
        ctx.beginPath();
        for (const point of samples) {
          const {x, u} = point;
          const yBase = point.crossingY;
          const spread = (s - 0.5) * point.crossingSpread;
          const ripple = 1.0 * Math.sin(u * 7.0 + i * 0.3 + t);
          const y = yBase + spread + ripple;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.lineWidth = i === 0 ? 1.2 : 0.8;
        ctx.strokeStyle =
          i === 0
            ? `rgba(215, 45, 95, ${Math.max(strandAlpha * 1.3, 0.15)})`
            : `rgba(166, 76, 97, ${Math.max(strandAlpha, 0.05)})`;
        ctx.stroke();
      }

      // --- 3. Render Primary Wave Silk Strands (Dense Clean Ribbon Mesh) ---
      const primaryStrandCount = 18;

      for (let i = primaryStrandCount - 1; i >= 0; i--) {
        const s = i / Math.max(primaryStrandCount - 1, 1);
        ctx.beginPath();

        for (const point of samples) {
          const {x, u} = point;
          const crestY = point.primaryY;
          const spread = point.spread;

          // Individual strand ripple offset
          const ripple = 1.5 * Math.sin(u * 8.5 + i * 0.26 - t * 1.25);
          const y = crestY + s * spread + ripple;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        if (i === 0) {
          // Top luminous highlight line (clean stroke, no blur shadow)
          ctx.lineWidth = 1.85;

          // Horizontal gradient for crest highlight
          const crestLineGrad = ctx.createLinearGradient(0, 0, W, 0);
          crestLineGrad.addColorStop(0, 'rgba(190, 24, 75, 0.75)');
          crestLineGrad.addColorStop(0.35, 'rgba(235, 35, 95, 0.92)');
          crestLineGrad.addColorStop(0.72, 'rgba(255, 90, 145, 1.0)');
          crestLineGrad.addColorStop(0.88, 'rgba(240, 45, 105, 0.90)');
          crestLineGrad.addColorStop(1, 'rgba(180, 20, 70, 0.70)');

          ctx.strokeStyle = crestLineGrad;
          ctx.stroke();
        } else {
          // Inner harmonic silk filaments with brand colors
          const r = Math.round(245 - s * 115);
          const g = Math.round(40 - s * 22);
          const b = Math.round(95 - s * 55);
          const alpha = 0.80 * (1.0 - s * 0.65) + mouse.boost * 0.15;

          ctx.lineWidth = 0.85;
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${Math.max(alpha, 0.08)})`;
          ctx.stroke();
        }
      }

      // --- 4. Ambient Floating Luminous Bokeh Dust ---
      for (const p of particlesRef.current) {
        if (!prefersReducedMotion) {
          p.y += p.speedY * 0.008;
          p.x += p.speedX * 0.008;
          if (p.y < 0.1) p.y = 0.85;
          if (p.x < 0.05) p.x = 0.95;
          if (p.x > 0.95) p.x = 0.05;
        }

        const px = p.x * W;
        const py = p.y * H;
        const alpha =
          p.baseAlpha *
          (0.65 + 0.35 * Math.sin(t * 1.8 + p.phase)) *
          (1 + mouse.boost * 0.4);

        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(241, 221, 224, ${alpha})`;
        ctx.fill();
      }

      ctx.restore();

      if (!prefersReducedMotion && isRunning) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    // IntersectionObserver to pause the animation loop when offscreen
    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined' && containerRef.current) {
      io = new IntersectionObserver(
        ([entry]) => {
          isVisibleRef.current = entry.isIntersecting;
          if (entry.isIntersecting) {
            startLoop();
          } else {
            stopLoop();
          }
        },
        { threshold: 0.05 }
      );
      io.observe(containerRef.current);
    }

    const drawStatic = () => { updateCanvasDimensions(); render(0, true); };
    const onMotionChange = () => {
      prefersReducedMotion = motionPreference.matches;
      if (prefersReducedMotion) { stopLoop(); drawStatic(); } else startLoop();
    };
    const resize = new ResizeObserver(() => { if (prefersReducedMotion) drawStatic(); });
    if (containerRef.current) resize.observe(containerRef.current);
    motionPreference.addEventListener('change', onMotionChange);
    if (prefersReducedMotion) drawStatic(); else startLoop();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopLoop();
      } else if (isVisibleRef.current) {
        startLoop();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopLoop();
      io?.disconnect();
      resize.disconnect();
      motionPreference.removeEventListener('change', onMotionChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [collapsed, updateCanvasDimensions]);

  // Interactive mouse reactions
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current.x = e.clientX - rect.left;
    mouseRef.current.y = e.clientY - rect.top;
    mouseRef.current.active = true;
    mouseRef.current.targetBoost = 1.0;
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    mouseRef.current.active = true;
    mouseRef.current.targetBoost = 1.0;
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseRef.current.active = false;
    mouseRef.current.targetBoost = 0;
  };

  const shortName = companyName.includes('Superio')
    ? 'Superio'
    : companyName.split(' ')[0] || 'Avis';

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'relative select-none overflow-hidden transition-[height] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] w-full',
        collapsed ? 'h-[140px]' : 'h-[175px]',
        className
      )}
    >
      {/* 1. Dynamic Animated Ribbon Wave Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none w-full h-full block z-10"
      />

      {/* 2. Footer Copyright Text overlaid cleanly at the bottom */}
      <div
        className={cn(
          'absolute bottom-0 inset-x-0 z-20 text-center select-none pb-3.5 transition-[padding] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]',
          collapsed ? 'px-1' : 'px-3'
        )}
      >
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              key="expanded-footer"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="space-y-0.5"
            >
              <p
                className={cn(
                  'text-[12px] font-semibold tracking-wide text-white/95 leading-tight transition-colors duration-200',
                  isHovered && 'text-white'
                )}
              >
                © {currentYear}{' '}
                <a
                  href={companyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline hover:text-white transition-colors duration-200 cursor-pointer"
                >
                  {companyName}
                </a>
              </p>
              <p className="text-[11px] font-normal tracking-wide text-white/70 leading-tight">
                All rights reserved.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed-footer"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <a
                href={companyUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={`© ${currentYear} ${companyName} All rights reserved.`}
                className="flex flex-col items-center justify-center cursor-pointer py-0.5 group/collapsed-link"
              >
                <span className="text-[10px] font-semibold text-white/90 leading-tight group-hover/collapsed-link:text-white">
                  © {currentYear}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-white/60 font-medium mt-0.5 group-hover/collapsed-link:text-white group-hover/collapsed-link:underline">
                  {shortName}
                </span>
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export const SidebarWaveDecoration = React.memo(SidebarWaveDecorationComponent);
