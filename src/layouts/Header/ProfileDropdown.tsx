import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Download, LogOut, Users, ShieldCheck, UserCheck, Building2, Briefcase, Search, X, Sliders } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { currentUser as defaultUser } from "@/data/mockData";
import { UserProfile } from "@/types";
import { ROUTES } from "@/app/routes";
import { totalAdminsRoster, type AdminRosterItem } from "@/features/admins/data/mockAdminsData";
import { totalRepresentativesList } from "@/features/representatives/data/mockRepresentativesData";
import { totalAgentsList } from "@/features/agents/data/mockAgentsData";

export interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserProfile;
  onSignOut?: () => void;
}

export type { AdminRosterItem };
export { totalAdminsRoster };

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
  const openModal = useAppStore((state) => state.openModal);
  const openPWAInstall = useAppStore((state) => state.openPWAInstall);
  const { isInstalled } = usePWAInstall();
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Accordion state: both open by default for immediate discoverability
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(true);
  const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(true);

  // Total Admins Roster modal state
  const [isTotalAdminsModalOpen, setIsTotalAdminsModalOpen] = useState(false);
  const [adminSearchQuery, setAdminSearchQuery] = useState("");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isTotalAdminsModalOpen) {
        return;
      }
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
        if (isTotalAdminsModalOpen) {
          setIsTotalAdminsModalOpen(false);
        } else {
          onClose();
        }
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
  }, [isOpen, onClose, isTotalAdminsModalOpen]);

  const handleNavigateToProfile = () => {
    onClose();
    navigate(ROUTES.PROFILE);
  };

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  const filteredAdmins = totalAdminsRoster.filter(
    (adm) =>
      adm.name.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
      adm.role.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
      adm.department.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
      adm.email.toLowerCase().includes(adminSearchQuery.toLowerCase()),
  );

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
                    {user.role || "super-admin"}
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
                      {totalAdminsRoster.length} Admins
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
                            {totalAdminsRoster.length} Active
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
                        78 Total
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
                              {totalAgentsList.length} Agents
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
                              {totalRepresentativesList.length} Reps
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

      {/* ============================================================== */}
      {/* 4. TOTAL ADMINS ROSTER MODAL                                   */}
      {/* ============================================================== */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isTotalAdminsModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsTotalAdminsModalOpen(false)}
                  className="fixed inset-0 bg-[#1D1015]/50 backdrop-blur-sm"
                />

                {/* Modal Container */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.94, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: 12 }}
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative z-10 w-full max-w-lg overflow-hidden rounded-[26px] border border-brand-border bg-white shadow-2xl"
                >
                  {/* Modal Header */}
                  <div className="border-b border-brand-border/70 bg-gradient-to-r from-brand-bg via-white to-brand-bg px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="shadow-xs flex h-10 w-10 items-center justify-center rounded-xl bg-burgundy-primary/10 text-burgundy-primary">
                          <Users className="h-5 w-5 stroke-[2.2]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-text-primary">Total Administrators</h3>
                            <span className="rounded-full bg-burgundy-primary/10 px-2.5 py-0.5 text-xs font-bold text-burgundy-primary">
                              {totalAdminsRoster.length} Active
                            </span>
                          </div>
                          <p className="text-xs text-text-muted">Avis World College administrative personnel roster</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsTotalAdminsModalOpen(false)}
                        className="rounded-full p-1.5 text-text-muted transition-colors hover:bg-brand-light-red/60 hover:text-text-primary"
                        aria-label="Close modal"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative mt-3.5">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                      <input
                        type="text"
                        placeholder="Search administrators by name, role, email..."
                        value={adminSearchQuery}
                        onChange={(e) => setAdminSearchQuery(e.target.value)}
                        className="w-full rounded-xl border border-brand-border/80 bg-white py-2 pl-9 pr-4 text-xs text-text-primary outline-none transition-all placeholder:text-text-muted focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/20"
                      />
                    </div>
                  </div>

                  {/* Modal Body: Admins List */}
                  <div className="custom-scrollbar max-h-[380px] space-y-2.5 overflow-y-auto p-4">
                    {filteredAdmins.length === 0 ? (
                      <div className="py-8 text-center">
                        <Users className="mx-auto h-8 w-8 text-text-muted/60" />
                        <p className="mt-2 text-xs font-semibold text-text-primary">No administrators found</p>
                        <p className="text-[11px] text-text-muted">Try adjusting your search criteria</p>
                      </div>
                    ) : (
                      filteredAdmins.map((adm) => (
                        <div
                          key={adm.id}
                          className="hover:shadow-xs group flex items-center justify-between rounded-2xl border border-brand-border/80 bg-brand-bg/40 p-3 transition-all hover:border-brand-accent/40 hover:bg-white"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img
                                src={adm.avatarUrl}
                                alt={adm.name}
                                className="h-10 w-10 rounded-full border border-brand-border object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/avis-emblem.png";
                                }}
                              />
                              <span className="absolute bottom-0 right-0 flex h-2.5 w-2.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                              </span>
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-text-primary group-hover:text-brand-red">{adm.name}</h4>
                                <span className="rounded-full bg-burgundy-primary/10 px-2 py-0.5 text-[9.5px] font-bold text-burgundy-primary">
                                  {adm.role}
                                </span>
                              </div>
                              <p className="text-[11px] text-text-muted">{adm.email}</p>
                              <p className="mt-0.5 text-[10.5px] font-medium text-text-secondary">{adm.department}</p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="inline-block rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                              {adm.lastActive}
                            </span>
                            <p className="mt-1 text-[10px] text-text-muted">{adm.accessLevel}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div className="flex items-center justify-between border-t border-brand-border/70 bg-brand-bg/60 px-6 py-3.5">
                    <span className="text-xs text-text-muted">
                      Showing {filteredAdmins.length} of {totalAdminsRoster.length} admins
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsTotalAdminsModalOpen(false)}
                        className="rounded-xl border border-brand-border px-3.5 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:bg-white"
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsTotalAdminsModalOpen(false);
                          handleNavigate(ROUTES.ADMINS);
                        }}
                        className="shadow-xs flex items-center gap-1.5 rounded-xl bg-burgundy-primary px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-red"
                      >
                        <Users className="h-3.5 w-3.5" />
                        <span>View Total Admins Table</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
};

export { ProfileDropdown as ProfileMenu };
