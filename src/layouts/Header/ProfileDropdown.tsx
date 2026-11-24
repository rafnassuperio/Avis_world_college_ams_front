import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Download, LogOut, Users, ShieldCheck, UserCheck, Building2, Briefcase, Sliders } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { emptyUser as defaultUser } from "@/store/useAuthStore";
import {getHeaderSummary} from "@/services/header";
import { useApiQuery } from "@/hooks/useApiQuery";
import { UserProfile } from "@/types";
import { ROUTES } from "@/app/routes";
import type { AdminRosterItem } from "@/features/admins/types";



export interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserProfile;
  onSignOut?: () => void;
}

export type { AdminRosterItem };


const profileMenuVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -10,
    scale: 0.94,
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
      staggerChildren: 0.03,
      delayChildren: 0.04,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.95,
    filter: "blur(2px)",
    transition: {
      duration: 0.16,
      ease: "easeOut",
    },
  },
};

const profileItemVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2, ease: "easeOut" },
  },
};

const submenuVariants: Variants = {
  hidden: {
    opacity: 0,
    height: 0,
    overflow: "hidden",
    transition: { duration: 0.18, ease: "easeInOut" },
  },
  visible: {
    opacity: 1,
    height: "auto",
    overflow: "hidden",
    transition: {
      duration: 0.24,
      ease: [0.04, 0.62, 0.23, 0.98],
      staggerChildren: 0.03,
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    overflow: "hidden",
    transition: { duration: 0.18, ease: "easeInOut" },
  },
};

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ isOpen, onClose, user = defaultUser, onSignOut }) => {
  const navigate = useNavigate();
  const {data: summary, loading, error, reload} = useApiQuery(signal => isOpen ? getHeaderSummary(signal) : Promise.resolve(null), [isOpen]);
  const count = (value?: number) => loading || error ? "—" : value ?? "—";
  const openModal = useAppStore((state) => state.openModal);
  const openPWAInstall = useAppStore((state) => state.openPWAInstall);
  const { isInstalled } = usePWAInstall();
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Accordion state: both open by default for immediate discoverability
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(true);
  const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(true);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (target.closest('[aria-label="User profile menu"]')) {
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

  const handleNavigateToProfile = () => {
    onClose();
    navigate(ROUTES.PROFILE);
  };

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={profileMenuRef}
            style={{ transformOrigin: "calc(100% - 20px) 0px" }}
            variants={profileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="custom-scrollbar absolute right-0 top-full z-40 mt-2.5 max-h-[min(640px,calc(100vh-85px))] w-[350px] select-none overflow-y-auto rounded-[26px] border border-brand-border/80 bg-white/95 p-2.5 text-left shadow-dropdown shadow-burgundy/10 backdrop-blur-md"
          >
            {error && <p role="alert" className="p-2 text-xs text-brand-red">Unable to load totals. <button onClick={() => void reload()} className="underline">Retry</button></p>}
            {/* Top Profile Card - Clickable to View Admin Profile */}
            <motion.div
              variants={profileItemVariants}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleNavigateToProfile}
              role="button"
              tabIndex={0}
              title="View Admin Profile"
              className="hover:shadow-xs group mb-2 flex cursor-pointer items-center justify-between rounded-[20px] border border-brand-border/70 bg-gradient-to-b from-brand-bg/80 to-brand-bg/30 p-3.5 transition-all duration-200 hover:border-brand-accent/40 hover:bg-brand-bg"
            >
              <div className="min-w-0 pr-3">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-[13px] font-bold leading-snug tracking-tight text-text-primary transition-colors group-hover:text-brand-red">
                    {user.name}
                  </p>
                </div>
                <p className="mt-0.5 truncate text-xs font-normal leading-tight text-text-muted">{user.email}</p>
                <div className="mt-1 flex items-center gap-1">
                  <span className="inline-flex items-center rounded-full bg-burgundy-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-burgundy-primary">
                    {user.role || "Administrator"}
                  </span>
                </div>
              </div>

              <div className="relative flex-shrink-0">
                <div className="rounded-full bg-gradient-to-tr from-burgundy-surface via-burgundy-accent to-burgundy-dark p-[2.5px] shadow-sm transition-transform duration-200 group-hover:scale-105">
                  <div className="rounded-full bg-white p-[2px]">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="h-10 w-10 rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/avis-emblem.png";
                      }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Menu Items Container */}
            <div className="space-y-1.5 px-0.5">
              {/* ============================================================== */}
              {/* 1. ADMIN PROFILE DROPDOWN WITH "TOTAL ADMINS" OPTION           */}
              {/* ============================================================== */}
              <div className="rounded-2xl border border-brand-border/70 bg-brand-bg/50 p-1 transition-colors hover:border-brand-accent/30">
                <motion.button
                  variants={profileItemVariants}
                  whileTap={{ scale: 0.985 }}
                  type="button"
                  onClick={() => setIsAdminDropdownOpen((prev) => !prev)}
                  className="group flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-[13.5px] font-medium text-text-primary transition-colors hover:bg-white/80"
                  aria-expanded={isAdminDropdownOpen}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-burgundy-primary/10 text-burgundy-primary transition-transform group-hover:scale-105">
                      <ShieldCheck className="h-4 w-4 stroke-[2.2]" />
                    </div>
                    <span className="font-semibold text-text-primary transition-colors group-hover:text-brand-red">Admin</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full border border-burgundy-primary/20 bg-burgundy-primary/5 px-2 py-0.5 text-[10px] font-bold text-burgundy-primary">
                      {count(summary?.admins)} Admins
                    </span>
                    <motion.span
                      animate={{ rotate: isAdminDropdownOpen ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex h-5 w-5 items-center justify-center text-text-muted"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </motion.span>
                  </div>
                </motion.button>

                {/* Submenu: Total Admins Option & Profile Overview */}
                <AnimatePresence initial={false}>
                  {isAdminDropdownOpen && (
                    <motion.div
                      variants={submenuVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-0.5 px-1 pb-0.5 pt-1"
                    >
                      {/* Total Admins Option */}
                      <button
                        type="button"
                        onClick={() => handleNavigate(ROUTES.ADMINS)}
                        className="group flex w-full items-center justify-between rounded-lg bg-white/70 px-2.5 py-1.5 text-[12.5px] font-medium text-text-secondary transition-all hover:bg-brand-light-red/40 hover:text-text-primary"
                      >
                        <div className="flex items-center gap-2.5">
                          <Users className="h-4 w-4 text-brand-red transition-transform group-hover:scale-110" />
                          <span className="font-semibold text-text-primary group-hover:text-brand-red">Total Admins</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-md bg-brand-light-red px-1.5 py-0.5 text-[10px] font-bold text-brand-red">
                            {count(summary?.activeAdmins)} Active
                          </span>
                          <ChevronRight className="h-3.5 w-3.5 text-text-muted opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100" />
                        </div>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ============================================================== */}
              {/* 2. AGENT HEADING & DROPDOWN AGENT APPLICATIONS                 */}
              {/* ============================================================== */}
              <div className="pt-1">
                {/* Dropdown Agent Applications Accordion */}
                <div className="rounded-2xl border border-brand-border/70 bg-brand-bg/50 p-1 transition-colors hover:border-brand-accent/30">
                  <motion.button
                    variants={profileItemVariants}
                    whileTap={{ scale: 0.985 }}
                    type="button"
                    onClick={() => setIsAgentDropdownOpen((prev) => !prev)}
                    className="group flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-[13.5px] font-medium text-text-primary transition-colors hover:bg-white/80"
                    aria-expanded={isAgentDropdownOpen}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-burgundy-primary/10 text-burgundy-primary transition-transform group-hover:scale-105">
                        <Briefcase className="h-4 w-4 stroke-[2.2]" />
                      </div>
                      <span className="font-semibold text-text-primary transition-colors group-hover:text-brand-red">Agent & Representative</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="rounded-full border border-brand-red/20 bg-brand-light-red/80 px-2 py-0.5 text-[10px] font-bold text-brand-red">
                        {count(summary?.partners)} Total
                      </span>
                      <motion.span
                        animate={{ rotate: isAgentDropdownOpen ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex h-5 w-5 items-center justify-center text-text-muted"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </motion.span>
                    </div>
                  </motion.button>

                  {/* Submenu for Agent Applications: Agent Applications, Representative & Commission */}
                  <AnimatePresence initial={false}>
                    {isAgentDropdownOpen && (
                      <motion.div
                        variants={submenuVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="space-y-0.5 px-1 pb-0.5 pt-1"
                      >
                        {/* Sub-option 2: Total Agents */}
                        <button
                          type="button"
                          onClick={() => handleNavigate(ROUTES.AGENTS)}
                          className="group flex w-full items-center justify-between rounded-lg bg-white/70 px-2.5 py-1.5 text-[12.5px] font-medium text-text-secondary transition-all hover:bg-brand-light-red/40 hover:text-text-primary"
                        >
                          <div className="flex items-center gap-2.5">
                            <UserCheck className="h-4 w-4 text-[#BE185D] transition-transform group-hover:scale-110" />
                            <span className="font-semibold text-text-primary group-hover:text-brand-red">Total Agents</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="rounded-md border border-brand-border/60 bg-brand-bg px-1.5 py-0.5 text-[10px] font-bold text-text-secondary">
                              {count(summary?.agents)} Agents
                            </span>
                            <ChevronRight className="h-3.5 w-3.5 text-text-muted opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100" />
                          </div>
                        </button>

                        {/* Sub-option 3: Total Representatives */}
                        <button
                          type="button"
                          onClick={() => handleNavigate(ROUTES.REPRESENTATIVES)}
                          className="group flex w-full items-center justify-between rounded-lg bg-white/70 px-2.5 py-1.5 text-[12.5px] font-medium text-text-secondary transition-all hover:bg-brand-light-red/40 hover:text-text-primary"
                        >
                          <div className="flex items-center gap-2.5">
                            <UserCheck className="h-4 w-4 text-[#BE185D] transition-transform group-hover:scale-110" />
                            <span className="font-semibold text-text-primary group-hover:text-brand-red">Total Representatives</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="rounded-md border border-brand-border/60 bg-brand-bg px-1.5 py-0.5 text-[10px] font-bold text-text-secondary">
                              {count(summary?.representatives)} Reps
                            </span>
                            <ChevronRight className="h-3.5 w-3.5 text-text-muted opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100" />
                          </div>
                        </button>

                        {/* Sub-option 3: Course Commission Config */}
                        <button
                          type="button"
                          onClick={() => handleNavigate(ROUTES.COMMISSION_CONFIG)}
                          className="group flex w-full items-center justify-between rounded-lg bg-white/70 px-2.5 py-1.5 text-[12.5px] font-medium text-text-secondary transition-all hover:bg-brand-light-red/40 hover:text-text-primary"
                        >
                          <div className="flex items-center gap-2.5">
                            <Sliders className="h-4 w-4 text-[#BE185D] transition-transform group-hover:scale-110" />
                            <span className="font-semibold text-text-primary group-hover:text-brand-red">Commission Config</span>
                          </div>
                          <span className="rounded-md border border-brand-border/60 bg-brand-bg px-1.5 py-0.5 text-[10px] font-bold text-text-secondary">
                            Config
                          </span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* ============================================================== */}
              {/* 3. INSTITUTE (SEPARATE STANDALONE SECTION / OPTION)            */}
              {/* ============================================================== */}
              <div className="pt-1">
                <motion.button
                  variants={profileItemVariants}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.985 }}
                  type="button"
                  onClick={() => handleNavigate(ROUTES.INSTITUTE)}
                  className="hover:shadow-xs group flex w-full items-center justify-between rounded-2xl border border-brand-border/80 bg-gradient-to-r from-white via-brand-bg/50 to-white p-2.5 text-[13.5px] font-medium text-text-primary transition-all hover:border-brand-accent/50 hover:bg-white"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-burgundy-primary/10 text-burgundy-primary transition-transform group-hover:scale-105">
                      <Building2 className="h-4 w-4 stroke-[2.2]" />
                    </div>
                    <div className="text-left">
                      <span className="font-semibold text-text-primary transition-colors group-hover:text-brand-red">Institute</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <ChevronRight className="h-4 w-4 text-text-muted opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </div>
                </motion.button>
              </div>

              {/* ============================================================== */}
              {/* 4. STANDARD UTILITIES & SETTINGS                               */}
              {/* ============================================================== */}
              <div className="space-y-1 pt-1">
                {/* Install PWA Application */}
                {!isInstalled && (
                  <motion.button
                    variants={profileItemVariants}
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.985 }}
                    type="button"
                    onClick={() => {
                      onClose();
                      openPWAInstall();
                    }}
                    className="group flex w-full items-center justify-between rounded-2xl px-3 py-2 text-[13.5px] font-medium text-brand-red transition-colors hover:bg-brand-light-red/40"
                  >
                    <div className="flex items-center gap-3">
                      <Download className="h-4 w-4 flex-shrink-0 stroke-[1.9] text-brand-red transition-all duration-200 group-hover:scale-110" />
                      <span className="font-semibold">Install App</span>
                    </div>
                    <span className="rounded-full border border-brand-red/20 bg-brand-light-red px-2 py-0.5 text-[10px] font-bold text-brand-red">
                      PWA
                    </span>
                  </motion.button>
                )}

                {/* Divider */}
                <div className="mx-1 my-1 border-t border-brand-border/60" />

                {/* Sign out */}
                <motion.button
                  variants={profileItemVariants}
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.985 }}
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onSignOut) {
                      onSignOut();
                    } else {
                      openModal("sign-out");
                    }
                  }}
                  className="group flex w-full items-center justify-between rounded-2xl px-3 py-2 text-[13.5px] font-medium text-text-secondary transition-colors hover:bg-brand-light-red/40 hover:text-brand-red"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="h-4 w-4 flex-shrink-0 stroke-[1.9] text-text-secondary transition-all duration-200 group-hover:scale-110 group-hover:text-brand-red" />
                    <span>Sign out</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-brand-red/60 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
};

export { ProfileDropdown as ProfileMenu };
