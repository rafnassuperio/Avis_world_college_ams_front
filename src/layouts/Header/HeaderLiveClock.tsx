import React, { useState, useEffect, memo } from "react";
import { Calendar, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

/**
 * HeaderLiveClock - High-performance isolated live digital clock ticker.
 * Encapsulates the 1-second interval to prevent constant re-rendering of the entire Header shell.
 * UI/UX and styling preserved exactly.
 */
export const HeaderLiveClock: React.FC = memo(() => {
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      whileHover={{ y: -1, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={cn(
        "group flex items-center gap-2.5 rounded-full border border-brand-border bg-white px-3.5 py-2 text-text-primary shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all duration-200",
        "cursor-default select-none hover:border-brand-accent/40 hover:bg-brand-bg/60 hover:shadow-sm",
      )}
      title={format(currentTime, "EEEE, MMMM d, yyyy 'at' h:mm:ss a")}
    >
      {/* Live Pulser */}
      <span className="relative flex h-2 w-2 flex-shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>

      {/* Date portion */}
      <div className="flex items-center gap-1.5 transition-transform duration-200 group-hover:translate-x-0.5">
        <Calendar className="h-3.5 w-3.5 text-text-secondary transition-colors duration-200 group-hover:text-brand-red" />
        <span className="text-xs font-semibold text-text-primary transition-colors duration-200 group-hover:text-brand-red">
          {format(currentTime, "EEE, dd MMM yyyy")}
        </span>
      </div>

      <span className="h-3.5 w-px bg-brand-border" />

      {/* Clock portion */}
      <div className="flex items-center gap-1.5 transition-transform duration-200 group-hover:translate-x-0.5">
        <Clock className="h-3.5 w-3.5 text-text-secondary transition-colors duration-200 group-hover:text-brand-red" />
        <span className="text-xs font-semibold tabular-nums text-text-primary">{format(currentTime, "hh:mm:ss a")}</span>
      </div>
    </motion.div>
  );
});

HeaderLiveClock.displayName = "HeaderLiveClock";
