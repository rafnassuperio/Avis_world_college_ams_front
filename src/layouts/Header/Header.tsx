import React, { useState, useEffect } from "react";
import { Search, Bell } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { NotificationDropdown } from "./NotificationDropdown";
import { ProfileDropdown } from "./ProfileDropdown";
import { HeaderLiveClock } from "./HeaderLiveClock";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const Header: React.FC = () => {
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const toggleMobileSidebar = useAppStore((state) => state.toggleMobileSidebar);
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed);
  const setIsSearchOpen = useAppStore((state) => state.setIsSearchOpen);
  const isSearchOpen = useAppStore(state => state.isSearchOpen);
  const unreadCount = useAppStore((state) => state.notifications.filter((n) => !n.isRead).length);
  const adminProfile = useAppStore((state) => state.adminProfile);

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => { if (isSearchOpen) { setIsNotifOpen(false); setIsProfileMenuOpen(false); } }, [isSearchOpen]);

  // Platform detection for keyboard shortcut display
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform || navigator.userAgent || ""));
    }
  }, []);

  // Scroll detection to adapt header glass effect dynamically
  useEffect(() => {
    const handleScroll = () => {
      const nextScrolled = window.scrollY > 10;
      setIsScrolled((prev) => (prev !== nextScrolled ? nextScrolled : prev));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "sticky top-0 z-30 flex items-center justify-between gap-3 px-6 py-3.5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isScrolled ? "bg-brand-bg" : "bg-brand-bg/85 shadow-none",
      )}
    >
      {/* Left Area: Toggle & Search */}
      <motion.div
        initial={{ x: -16, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        className="flex max-w-xl flex-1 items-center gap-4"
      >
        {/* Toggle Button with Morphing Hamburger & Ambient Glow */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          onClick={() => {
            if (window.innerWidth >= 1024) {
              toggleSidebar();
            } else {
              toggleMobileSidebar();
            }
          }}
          className={cn(
            "group relative flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full",
            "border border-brand-border bg-gradient-to-r from-burgundy-primary to-[#571D2F] text-white",
            "shadow-[0_2px_8px_rgba(66,27,41,0.18)] transition-all duration-300",
            "hover:border-brand-accent/50 hover:shadow-[0_0_16px_rgba(166,76,97,0.4)]",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/40",
          )}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {/* Subtle Ambient Sheen Sweep on Hover */}
          <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />

          {/* Animated Hamburger Lines */}
          <div className="relative z-10 flex h-4 w-[18px] flex-col items-start justify-between">
            <motion.span
              animate={{
                width: sidebarCollapsed ? 18 : 18,
              }}
              className={cn(
                "h-[2px] rounded-full bg-current transition-all duration-300 ease-out",
                sidebarCollapsed ? "w-[18px]" : "w-[18px] group-hover:w-3",
              )}
            />
            <motion.span
              animate={{
                width: sidebarCollapsed ? 10 : 12,
              }}
              className={cn(
                "h-[2px] rounded-full transition-all duration-300 ease-out",
                sidebarCollapsed ? "w-2.5 bg-brand-red" : "w-3 bg-current group-hover:w-[18px] group-hover:bg-brand-red",
              )}
            />
            <motion.span
              animate={{
                width: sidebarCollapsed ? 18 : 18,
              }}
              className={cn(
                "h-[2px] rounded-full bg-current transition-all duration-300 ease-out",
                sidebarCollapsed ? "w-[18px]" : "w-[18px] group-hover:w-2",
              )}
            />
          </div>
        </motion.button>

        {/* Global Search Bar with Smooth Hover & Focus Rings */}
        <motion.div
          whileHover={{ scale: 1.012, y: -0.5 }}
          whileTap={{ scale: 0.985 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          onClick={() => setIsSearchOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsSearchOpen(true);
            }
          }}
          aria-label="Global Search - Press Ctrl+K or Cmd+K to open"
          title={`Search students, courses, staff, partners, and system pages (${isMac ? "⌘K" : "Ctrl+K"})`}
          className="group relative flex h-10 w-full max-w-md cursor-pointer items-center rounded-full border border-brand-border/80 bg-white/95 px-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all duration-300 hover:border-brand-accent/40 hover:bg-white hover:shadow-[0_4px_16px_rgba(166,76,97,0.1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/40"
        >
          <motion.div
            whileHover={{ rotate: 14, scale: 1.15 }}
            transition={{ type: "spring", stiffness: 350, damping: 15 }}
            className="flex items-center justify-center"
          >
            <Search className="h-4 w-4 flex-shrink-0 text-text-secondary transition-colors duration-200 group-hover:text-brand-red" />
          </motion.div>
          <span className="ml-2.5 flex-1 select-none truncate text-xs text-text-secondary transition-colors duration-200 group-hover:text-text-primary">
            Search students, courses, staff, partners, pages...
          </span>
          <motion.kbd
            whileHover={{ scale: 1.08 }}
            className="hidden items-center gap-0.5 rounded-md border border-brand-border/80 bg-brand-bg/80 px-2 py-0.5 text-[10px] font-semibold text-text-secondary transition-colors duration-200 group-hover:border-brand-accent/30 group-hover:bg-brand-light-red/30 group-hover:text-brand-red sm:inline-flex"
          >
            <span>{isMac ? "⌘" : "Ctrl"}</span>
            <span>K</span>
          </motion.kbd>
        </motion.div>
      </motion.div>

      {/* Right Area: Actions & Avatar */}
      <motion.div
        initial={{ x: 16, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.45, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-3"
      >
        {/* Notification Bell with Ping Ripple and Swing Animation */}
        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{
              scale: 1.06,
              rotate: [0, -8, 8, -4, 4, 0],
              transition: { duration: 0.35, ease: "easeInOut" },
            }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsProfileMenuOpen(false);
            }}
            className={cn(
              "relative rounded-full border border-brand-border bg-white p-2.5 text-text-primary shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all duration-200 hover:border-brand-accent/40 hover:bg-brand-bg focus:outline-none",
              isNotifOpen && "border-brand-red/40 bg-brand-light-red/30 text-brand-red shadow-sm ring-2 ring-brand-red/10",
            )}
            aria-label="Notifications"
          >
            <motion.div
              animate={isNotifOpen ? { rotate: [0, -16, 14, -10, 6, 0] } : { rotate: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <Bell className="h-4 w-4" />
            </motion.div>

            {/* Unread Indicator Badge with Pulsing Ping Ripple */}
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  className="absolute -right-1 -top-1 flex items-center justify-center"
                >
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-red opacity-60" />
                  <span className="relative flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-red px-1 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
                    {unreadCount}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
          {isNotifOpen && (
            <NotificationDropdown
              isOpen={isNotifOpen}
              onClose={() => setIsNotifOpen(false)}
            />
          )}
        </div>

        {/* Live Institutional Time and Calendar Date Badge (Isolated high-performance micro-component) */}
        <div className="relative hidden sm:block">
          <HeaderLiveClock />
        </div>

        {/* Administrator Avatar with Animated Ring & Dropdown */}
        <div className="relative">
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.06 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            onClick={() => {
              setIsProfileMenuOpen(!isProfileMenuOpen);
              setIsNotifOpen(false);
            }}
            className={cn(
              "group relative flex items-center justify-center rounded-full p-[2px] transition-all duration-300 focus:outline-none",
              "bg-gradient-to-tr from-burgundy-surface via-burgundy-accent to-burgundy-dark shadow-sm",
              "hover:shadow-[0_0_14px_rgba(166,76,97,0.38)]",
              isProfileMenuOpen && "ring-2 ring-brand-red/40 ring-offset-2",
            )}
            aria-label="User profile menu"
            aria-expanded={isProfileMenuOpen}
          >
            <div className="rounded-full bg-white p-[1.5px]">
              <img
                src={adminProfile.avatarUrl}
                alt={adminProfile.name}
                className="h-8 w-8 rounded-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/avis-emblem.png";
                }}
              />
            </div>

            {/* Online Active Status Indicator */}
            <span className="absolute bottom-0 right-0 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
            </span>
          </motion.button>

          {isProfileMenuOpen && (
            <ProfileDropdown
              isOpen={isProfileMenuOpen}
              onClose={() => setIsProfileMenuOpen(false)}
              user={adminProfile}
            />
          )}
        </div>
      </motion.div>
    </motion.header>
  );
};
