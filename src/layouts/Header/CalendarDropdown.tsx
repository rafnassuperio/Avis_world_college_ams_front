import React, { useRef, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, MapPin, ArrowRight, Sparkles } from "lucide-react";
import { calendarEvents } from "@/data/mockData";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { format } from "date-fns";

interface CalendarDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const dropdownVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -8,
    scale: 0.95,
    filter: "blur(4px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 420,
      damping: 28,
      mass: 0.7,
      filter: { duration: 0.22, ease: "easeOut" },
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.96,
    filter: "blur(2px)",
    transition: {
      duration: 0.15,
      ease: "easeOut",
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -6 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2, ease: "easeOut" },
  },
};

export const CalendarDropdown: React.FC<CalendarDropdownProps> = ({
  isOpen,
  onClose,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        const target = event.target as HTMLElement;
        if (target.closest('[aria-label="Institutional Calendar"]')) {
          return;
        }
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const todayStr = format(new Date(), "EEE, dd MMM yyyy");

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          style={{ transformOrigin: "calc(100% - 40px) 0px" }}
          variants={dropdownVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute right-0 top-full mt-2.5 w-80 sm:w-96 rounded-2xl bg-white/95 backdrop-blur-md border border-brand-border/80 shadow-dropdown shadow-burgundy/10 z-40 overflow-hidden text-left"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-brand-border/70 px-4 py-3.5 bg-gradient-to-b from-brand-bg/50 to-white">
            <div className="flex items-center gap-2.5">
              <motion.div
                whileHover={{ rotate: 12, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand-light-red/60 text-brand-red"
              >
                <CalendarIcon className="h-3.5 w-3.5" />
              </motion.div>
              <div>
                <h4 className="text-xs font-bold text-text-primary tracking-tight">
                  Academic Calendar
                </h4>
                <p className="text-[10.5px] text-text-muted">Upcoming institution schedule</p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-brand-red bg-brand-light-red/60 border border-brand-red/15 px-2.5 py-0.5 rounded-full">
              <Sparkles className="h-3 w-3" />
              {todayStr}
            </span>
          </div>

          {/* Event List with Staggered Fade-in */}
          <div className="max-h-[300px] overflow-y-auto divide-y divide-brand-border/50 p-2 scrollbar-thin">
            {calendarEvents.map((ev) => (
              <motion.div
                key={ev.id}
                variants={itemVariants}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.985 }}
                className="group flex flex-col gap-1.5 rounded-xl p-2.5 transition-colors duration-150 hover:bg-brand-bg/70 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-bold text-text-primary group-hover:text-brand-red transition-colors">
                    {ev.title}
                  </p>
                  <span className="text-[10px] font-semibold text-brand-red/80 bg-brand-light-red/40 px-1.5 py-0.5 rounded-md flex-shrink-0">
                    {ev.date}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-text-secondary">
                  <span className="flex items-center gap-1 font-medium text-text-muted">
                    <Clock className="w-3 h-3 text-brand-red flex-shrink-0" />
                    {ev.time}
                  </span>
                  <span className="flex items-center gap-1 truncate text-text-muted">
                    <MapPin className="w-3 h-3 text-text-secondary flex-shrink-0" />
                    <span className="truncate">{ev.location}</span>
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-brand-border/70 bg-brand-bg/40 px-4 py-2.5 text-center">
            <motion.button
              type="button"
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-brand-red hover:text-burgundy-dark transition-colors"
            >
              <span>View full institution timetable</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
