import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { MapPin, Phone, Mail, Pencil, ZoomIn, ZoomOut, RotateCcw, X } from "lucide-react";
import { CollegeDetails } from "../types";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { smoothEase } from "@/components/animations/transitions";

export interface CollegeDetailsCardProps {
  college: CollegeDetails;
  onEdit?: () => void;
  showEditButton?: boolean;
  className?: string;
}

export const CollegeDetailsCard: React.FC<CollegeDetailsCardProps> = ({ college, onEdit, showEditButton = true, className }) => {
  const shouldReduceMotion = useReducedMotion();
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Lock body scroll and listen for Escape key when zoomed
  useEffect(() => {
    if (!isZoomed) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsZoomed(false);
        setZoomLevel(1);
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isZoomed]);

  const cardVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: smoothEase,
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 10, scale: shouldReduceMotion ? 1 : 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.35,
        ease: smoothEase,
      },
    },
  };

  return (
    <>
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={shouldReduceMotion ? undefined : { y: -2 }}
        transition={{ duration: 0.25 }}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-brand-border bg-white p-4 shadow-[0_4px_20px_-4px_rgba(87,0,31,0.04)] sm:p-5",
          className,
        )}
      >
        {/* Subtle decorative background glow */}
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-gradient-to-br from-brand-light-red/30 via-burgundy-primary/5 to-transparent blur-2xl" />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* 1. College Image with click-to-zoom */}
          <motion.div
            variants={itemVariants}
            whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            onClick={() => {
              setIsZoomed(true);
              setZoomLevel(1);
            }}
            className="group relative h-28 w-full shrink-0 cursor-zoom-in overflow-hidden rounded-xl border border-brand-border bg-brand-bg shadow-sm transition-shadow hover:shadow-md sm:h-32 sm:w-44 md:h-36 md:w-48"
            title="Click to view and zoom image"
          >
            <motion.img
              key={college.image}
              initial={{ opacity: 0.7, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: smoothEase }}
              src={college.image}
              alt={college.name}
              className="group-hover:scale-108 h-full w-full object-cover transition-transform duration-500 ease-out"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80";
              }}
            />
            {/* Hover overlay with Zoom indicator */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 backdrop-blur-[0.5px] transition-all duration-300 group-hover:opacity-100">
              <div className="flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-text-primary shadow-lg backdrop-blur">
                <ZoomIn className="h-3.5 w-3.5 text-brand-red" />
              </div>
            </div>
          </motion.div>

          {/* 2. College Details Information */}
          <div className="flex min-w-0 flex-1 flex-col justify-between space-y-3">
            {/* Header: College Name & Edit Button */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-border/60 pb-2.5"
            >
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-brand-red">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-red" />
                  Institutional Details
                </span>
                <h2 className="truncate text-lg font-bold tracking-tight text-text-primary sm:text-xl">{college.name}</h2>
              </div>

              {showEditButton && onEdit && (
                <motion.div
                  whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onEdit}
                    className="h-8 gap-1.5 border-brand-border bg-white bg-gradient-to-r from-burgundy-primary to-[#571D2F] px-2.5 text-xs text-text-primary shadow-sm transition-all hover:border-brand-red hover:bg-brand-light-red/30 hover:text-brand-red"
                  >
                    <Pencil className="h-3.5 w-3.5 text-white" />
                  </Button>
                </motion.div>
              )}
            </motion.div>

            {/* Details Grid: Place, Phone No, Mail ID */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {/* Place */}
              <motion.div
                variants={itemVariants}
                whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.015 }}
                transition={{ duration: 0.2 }}
                className="group flex cursor-default items-center gap-2.5 rounded-lg border border-brand-border/60 bg-brand-bg/50 p-2.5 transition-colors hover:border-brand-red/30 hover:bg-brand-bg hover:shadow-sm"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-light-red/60 text-brand-red transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-red group-hover:text-white">
                  <MapPin className="h-4 w-4 transition-transform" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">Place</p>
                  <p
                    className="truncate text-xs font-medium text-text-primary sm:text-[13px]"
                    title={college.place}
                  >
                    {college.place}
                  </p>
                </div>
              </motion.div>

              {/* Phone No */}
              <motion.div
                variants={itemVariants}
                whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.015 }}
                transition={{ duration: 0.2 }}
                className="group flex items-center gap-2.5 rounded-lg border border-brand-border/60 bg-brand-bg/50 p-2.5 transition-colors hover:border-brand-red/30 hover:bg-brand-bg hover:shadow-sm"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-light-red/60 text-brand-red transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-red group-hover:text-white">
                  <Phone className="h-4 w-4 transition-transform" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">Phone No</p>
                  <a
                    href={`tel:${college.phone}`}
                    className="block truncate text-xs font-medium text-text-primary transition-colors hover:text-brand-red sm:text-[13px]"
                    title={college.phone}
                  >
                    {college.phone}
                  </a>
                </div>
              </motion.div>

              {/* Mail ID */}
              <motion.div
                variants={itemVariants}
                whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.015 }}
                transition={{ duration: 0.2 }}
                className="group flex items-center gap-2.5 rounded-lg border border-brand-border/60 bg-brand-bg/50 p-2.5 transition-colors hover:border-brand-red/30 hover:bg-brand-bg hover:shadow-sm"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-light-red/60 text-brand-red transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-red group-hover:text-white">
                  <Mail className="h-4 w-4 transition-transform" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">Mail ID</p>
                  <a
                    href={`mailto:${college.email}`}
                    className="block truncate text-xs font-medium text-text-primary transition-colors hover:text-brand-red sm:text-[13px]"
                    title={college.email}
                  >
                    {college.email}
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Fullscreen Zoom Lightbox Modal */}
      <AnimatePresence>
        {isZoomed && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                setIsZoomed(false);
                setZoomLevel(1);
              }}
              className="fixed inset-0 bg-black/70"
            />

            {/* Lightbox Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 16 }}
              transition={{ type: "spring", damping: 25, stiffness: 320 }}
              className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-neutral-950/95 shadow-2xl backdrop-blur-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
                <div className="min-w-0 pr-4">
                  <h3 className="truncate text-sm font-semibold text-white sm:text-base">{college.name}</h3>
                  <p className="truncate text-xs text-neutral-400">{college.place} • Click image to toggle 1x / 2x zoom</p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => setZoomLevel((prev) => Math.min(Number((prev + 0.5).toFixed(1)), 3))}
                    disabled={zoomLevel >= 3}
                    title="Zoom In"
                    className="rounded-lg border border-white/10 bg-white/10 p-1.5 text-neutral-200 transition-colors hover:bg-white/20 disabled:opacity-40"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((prev) => Math.max(Number((prev - 0.5).toFixed(1)), 1))}
                    disabled={zoomLevel <= 1}
                    title="Zoom Out"
                    className="rounded-lg border border-white/10 bg-white/10 p-1.5 text-neutral-200 transition-colors hover:bg-white/20 disabled:opacity-40"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(1)}
                    disabled={zoomLevel === 1}
                    title="Reset Zoom"
                    className="rounded-lg border border-white/10 bg-white/10 p-1.5 text-neutral-200 transition-colors hover:bg-white/20 disabled:opacity-40"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <div className="mx-1 h-5 w-[1px] bg-white/15" />
                  <button
                    type="button"
                    onClick={() => {
                      setIsZoomed(false);
                      setZoomLevel(1);
                    }}
                    title="Close (Esc)"
                    className="rounded-lg border border-white/10 bg-white/10 p-1.5 text-white transition-colors hover:bg-red-500/80"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Body: Zoomable Image */}
              <div className="relative flex max-h-[75vh] min-h-[280px] w-full items-center justify-center overflow-hidden bg-neutral-950 p-3 sm:min-h-[380px] sm:p-5">
                <motion.div
                  drag={zoomLevel > 1}
                  dragConstraints={{
                    left: -120 * zoomLevel,
                    right: 120 * zoomLevel,
                    top: -120 * zoomLevel,
                    bottom: 120 * zoomLevel,
                  }}
                  className={`flex items-center justify-center ${zoomLevel > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"}`}
                  onClick={() => {
                    setZoomLevel((prev) => (prev > 1 ? 1 : 2));
                  }}
                >
                  <motion.img
                    src={college.image}
                    alt={college.name}
                    animate={{ scale: zoomLevel }}
                    transition={{ type: "spring", damping: 22, stiffness: 260 }}
                    className="max-h-[70vh] w-auto max-w-full select-none rounded-lg object-contain shadow-2xl"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80";
                    }}
                  />
                </motion.div>
              </div>

              {/* Footer info pill */}
              <div className="flex items-center justify-between border-t border-white/10 bg-white/5 px-4 py-2.5 text-[11px] text-neutral-400 sm:px-6">
                <span>Current Scale: {Math.round(zoomLevel * 100)}%</span>
                <span>{zoomLevel > 1 ? "Drag to pan image" : "Click image to toggle 2x"} • Esc to close</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CollegeDetailsCard;
