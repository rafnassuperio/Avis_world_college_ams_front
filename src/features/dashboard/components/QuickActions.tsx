import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserPlus,
  GraduationCap,
  UserCheck,
  CreditCard,
  BarChart3,
  Megaphone,
  CalendarRange,
  Settings,
  ArrowRight,
  ArrowUpRight,
  Zap,
  Sparkles,
  ReceiptText,
  ShieldCheck,
  Percent,
  Building2,
  Wallet,
  Search,
  X,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { smoothEase } from "@/components/animations/transitions";
import { cn } from "@/lib/utils";
import { QuickAction } from "@/types";

interface ActionTheme {
  iconBg: string;
  iconColor: string;
  borderHover: string;
  badgeBg: string;
  badgeText: string;
  gradientBg: string;
  shadowHover: string;
}

const actionThemes: Record<string, ActionTheme> = {
  "add-student": {
    iconBg: "bg-brand-light-red",
    iconColor: "text-brand-red",
    borderHover: "hover:border-brand-red/40",
    badgeBg: "bg-brand-light-red",
    badgeText: "text-brand-red",
    gradientBg: "group-hover:bg-gradient-to-br group-hover:from-white group-hover:via-white group-hover:to-brand-light-red/30",
    shadowHover: "hover:shadow-[0_8px_20px_-3px_rgba(166,76,97,0.14)]",
  },
  "create-program": {
    iconBg: "bg-brand-light-red/80",
    iconColor: "text-burgundy-primary",
    borderHover: "hover:border-burgundy-primary/40",
    badgeBg: "bg-brand-light-red/80",
    badgeText: "text-burgundy-primary",
    gradientBg: "group-hover:bg-gradient-to-br group-hover:from-white group-hover:via-white group-hover:to-burgundy-primary/10",
    shadowHover: "hover:shadow-[0_8px_20px_-3px_rgba(112,43,64,0.14)]",
  },
  "collect-payment": {
    iconBg: "bg-brand-light-red",
    iconColor: "text-brand-red",
    borderHover: "hover:border-brand-red/40",
    badgeBg: "bg-brand-light-red",
    badgeText: "text-brand-red",
    gradientBg: "group-hover:bg-gradient-to-br group-hover:from-white group-hover:via-white group-hover:to-brand-light-red/30",
    shadowHover: "hover:shadow-[0_8px_20px_-3px_rgba(166,76,97,0.14)]",
  },
  "settle-payment": {
    iconBg: "bg-brand-light-red/80",
    iconColor: "text-burgundy-primary",
    borderHover: "hover:border-burgundy-primary/40",
    badgeBg: "bg-brand-light-red/80",
    badgeText: "text-burgundy-primary",
    gradientBg: "group-hover:bg-gradient-to-br group-hover:from-white group-hover:via-white group-hover:to-burgundy-primary/10",
    shadowHover: "hover:shadow-[0_8px_20px_-3px_rgba(112,43,64,0.14)]",
  },
  "payment-report": {
    iconBg: "bg-palette-5/20",
    iconColor: "text-burgundy-primary",
    borderHover: "hover:border-palette-5/50",
    badgeBg: "bg-palette-5/20",
    badgeText: "text-burgundy-primary",
    gradientBg: "group-hover:bg-gradient-to-br group-hover:from-white group-hover:via-white group-hover:to-palette-5/20",
    shadowHover: "hover:shadow-[0_8px_20px_-3px_rgba(112,43,64,0.14)]",
  },
  "generate-report": {
    iconBg: "bg-brand-light-red/80",
    iconColor: "text-burgundy-primary",
    borderHover: "hover:border-burgundy-primary/40",
    badgeBg: "bg-brand-light-red/80",
    badgeText: "text-burgundy-primary",
    gradientBg: "group-hover:bg-gradient-to-br group-hover:from-white group-hover:via-white group-hover:to-burgundy-primary/10",
    shadowHover: "hover:shadow-[0_8px_20px_-3px_rgba(112,43,64,0.14)]",
  },
  "manage-intake": {
    iconBg: "bg-brand-light-red",
    iconColor: "text-brand-red",
    borderHover: "hover:border-brand-red/40",
    badgeBg: "bg-brand-light-red",
    badgeText: "text-brand-red",
    gradientBg: "group-hover:bg-gradient-to-br group-hover:from-white group-hover:via-white group-hover:to-brand-light-red/30",
    shadowHover: "hover:shadow-[0_8px_20px_-3px_rgba(166,76,97,0.14)]",
  },
  "manage-admins": {
    iconBg: "bg-burgundy-dark/10",
    iconColor: "text-burgundy-dark",
    borderHover: "hover:border-burgundy-dark/40",
    badgeBg: "bg-burgundy-dark/10",
    badgeText: "text-burgundy-dark",
    gradientBg: "group-hover:bg-gradient-to-br group-hover:from-white group-hover:via-white group-hover:to-burgundy-dark/10",
    shadowHover: "hover:shadow-[0_8px_20px_-3px_rgba(66,27,41,0.14)]",
  },
  "partner-agents": {
    iconBg: "bg-palette-5/20",
    iconColor: "text-brand-red",
    borderHover: "hover:border-palette-5/50",
    badgeBg: "bg-palette-5/20",
    badgeText: "text-brand-red",
    gradientBg: "group-hover:bg-gradient-to-br group-hover:from-white group-hover:via-white group-hover:to-palette-5/20",
    shadowHover: "hover:shadow-[0_8px_20px_-3px_rgba(166,76,97,0.14)]",
  },
  "course-commission": {
    iconBg: "bg-brand-light-red/80",
    iconColor: "text-burgundy-primary",
    borderHover: "hover:border-burgundy-primary/40",
    badgeBg: "bg-brand-light-red/80",
    badgeText: "text-burgundy-primary",
    gradientBg: "group-hover:bg-gradient-to-br group-hover:from-white group-hover:via-white group-hover:to-burgundy-primary/10",
    shadowHover: "hover:shadow-[0_8px_20px_-3px_rgba(112,43,64,0.14)]",
  },
  "institute-settings": {
    iconBg: "bg-brand-border/70",
    iconColor: "text-burgundy-dark",
    borderHover: "hover:border-burgundy-dark/35",
    badgeBg: "bg-brand-border/70",
    badgeText: "text-burgundy-dark",
    gradientBg: "group-hover:bg-gradient-to-br group-hover:from-white group-hover:via-white group-hover:to-brand-border/40",
    shadowHover: "hover:shadow-[0_8px_20px_-3px_rgba(66,27,41,0.12)]",
  },
  // Backward compatibility fallback aliases
  "assign-staff": {
    iconBg: "bg-brand-light-red",
    iconColor: "text-brand-red",
    borderHover: "hover:border-brand-red/40",
    badgeBg: "bg-brand-light-red",
    badgeText: "text-brand-red",
    gradientBg: "group-hover:bg-gradient-to-br group-hover:from-white group-hover:via-white group-hover:to-brand-light-red/30",
    shadowHover: "hover:shadow-[0_8px_20px_-3px_rgba(166,76,97,0.14)]",
  },
  "send-notice": {
    iconBg: "bg-brand-light-red/80",
    iconColor: "text-burgundy-primary",
    borderHover: "hover:border-burgundy-primary/40",
    badgeBg: "bg-brand-light-red/80",
    badgeText: "text-burgundy-primary",
    gradientBg: "group-hover:bg-gradient-to-br group-hover:from-white group-hover:via-white group-hover:to-burgundy-primary/10",
    shadowHover: "hover:shadow-[0_8px_20px_-3px_rgba(112,43,64,0.14)]",
  },
  settings: {
    iconBg: "bg-brand-border/70",
    iconColor: "text-burgundy-dark",
    borderHover: "hover:border-burgundy-dark/35",
    badgeBg: "bg-brand-border/70",
    badgeText: "text-burgundy-dark",
    gradientBg: "group-hover:bg-gradient-to-br group-hover:from-white group-hover:via-white group-hover:to-brand-border/40",
    shadowHover: "hover:shadow-[0_8px_20px_-3px_rgba(66,27,41,0.12)]",
  },
};

const defaultTheme: ActionTheme = {
  iconBg: "bg-brand-light-red",
  iconColor: "text-brand-red",
  borderHover: "hover:border-brand-red/40",
  badgeBg: "bg-brand-light-red",
  badgeText: "text-brand-red",
  gradientBg: "group-hover:bg-gradient-to-br group-hover:from-white group-hover:via-white group-hover:to-brand-light-red/30",
  shadowHover: "hover:shadow-[0_8px_20px_-3px_rgba(112,43,64,0.12)]",
};

const actionContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.04,
    },
  },
};

const actionItemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: smoothEase,
    },
  },
};

const QuickActionsComponent: React.FC = () => {
  const navigate = useNavigate();
  const openModal = useAppStore((state) => state.openModal);
  const quickActions = useAppStore((state) => state.quickActions);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const [directorySearch, setDirectorySearch] = useState("");
  const [directoryCategory, setDirectoryCategory] = useState("all");

  const handleActionClick = (action: QuickAction) => {
    // 1. External portal navigation (e.g., SMS / LMS)
    if (action.external && action.path) {
      window.open(action.path, "_blank", "noopener,noreferrer");
      return;
    }

    // 2. Tab persistence for College modules
    if (action.targetTab) {
      try {
        sessionStorage.setItem("studentsTableActiveTab", action.targetTab);
        if (action.id === "add-student") {
          sessionStorage.setItem("ams_open_add_student", "true");
        }
      } catch {
        // Fallback for private browsing restrictions
      }
    }

    // 3. Router navigation or modal trigger
    if (action.path) {
      navigate(action.path);
    } else if (action.modalType) {
      openModal(action.modalType);
    }
  };

  // Keyboard shortcut listener for power users
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }

      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const key = e.key.toLowerCase();
        const matched = quickActions.find((a) => {
          if (!a.hotkey) return false;
          const hotkeyChar = a.hotkey.replace(/alt\+/i, "").toLowerCase();
          return hotkeyChar === key;
        });

        if (matched) {
          e.preventDefault();
          handleActionClick(matched);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [quickActions, navigate]);

  const getActionIcon = (name: string, colorClass: string) => {
    const className = `w-4 h-4 sm:w-[17px] sm:h-[17px] ${colorClass}`;
    switch (name) {
      case "UserPlus":
        return <UserPlus className={className} />;
      case "GraduationCap":
        return <GraduationCap className={className} />;
      case "CreditCard":
        return <CreditCard className={className} />;
      case "Wallet":
        return <Wallet className={className} />;
      case "ReceiptText":
        return <ReceiptText className={className} />;
      case "BarChart3":
        return <BarChart3 className={className} />;
      case "CalendarRange":
        return <CalendarRange className={className} />;
      case "ShieldCheck":
        return <ShieldCheck className={className} />;
      case "UserCheck":
        return <UserCheck className={className} />;
      case "Percent":
        return <Percent className={className} />;
      case "Building2":
        return <Building2 className={className} />;
      case "Settings":
        return <Settings className={className} />;
      case "Megaphone":
        return <Megaphone className={className} />;
      default:
        return <Zap className={className} />;
    }
  };

  const categories = useMemo(
    () => [
      { id: "all", label: "All", count: quickActions.length },
      {
        id: "admissions",
        label: "Admissions",
        count: quickActions.filter((a) => a.category === "admissions").length,
      },
      {
        id: "academics",
        label: "Academics",
        count: quickActions.filter((a) => a.category === "academics").length,
      },
      {
        id: "finance",
        label: "Finance",
        count: quickActions.filter((a) => a.category === "finance").length,
      },
      {
        id: "admin",
        label: "Admin",
        count: quickActions.filter((a) => a.category === "admin").length,
      },
    ],
    [quickActions],
  );

  const filteredActions = useMemo(() => {
    if (selectedCategory === "all") return quickActions;
    return quickActions.filter((action) => action.category === selectedCategory);
  }, [selectedCategory, quickActions]);

  const directoryFilteredActions = useMemo(() => {
    return quickActions.filter((action) => {
      const q = directorySearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        action.title.toLowerCase().includes(q) ||
        action.description.toLowerCase().includes(q) ||
        (action.subtitle && action.subtitle.toLowerCase().includes(q)) ||
        (action.path && action.path.toLowerCase().includes(q)) ||
        (action.hotkey && action.hotkey.toLowerCase().includes(q));
      const matchesCategory = directoryCategory === "all" || action.category === directoryCategory;
      return matchesSearch && matchesCategory;
    });
  }, [directorySearch, directoryCategory, quickActions]);

  return (
    <>
      <div className="flex h-full flex-col justify-between rounded-[22px] border border-brand-border bg-white p-4 shadow-[0_2px_10px_-2px_rgba(66,27,41,0.04)] transition-all duration-300 hover:shadow-[0_8px_24px_-4px_rgba(66,27,41,0.08)] sm:p-5">
        {/* 1. Header Section */}
        <div>
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="shadow-xs flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-brand-light-red text-brand-red">
                <Zap className="h-4 w-4 fill-brand-red/15" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-sm font-bold tracking-tight text-text-primary sm:text-base md:text-[15px]">Quick Actions</h2>
                  <span className="xs:inline-flex hidden items-center rounded-full border border-brand-border bg-brand-light-red/90 px-1.5 py-0.5 text-[10px] font-bold leading-none text-brand-red">
                    {filteredActions.length} Shortcuts
                  </span>
                </div>
              </div>
            </div>

            {/* View All Button */}
            <button
              type="button"
              onClick={() => setIsDirectoryOpen(true)}
              className="group flex flex-shrink-0 cursor-pointer items-center gap-1 pl-0.5 text-xs font-semibold text-brand-red transition-colors hover:text-brand-accent"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>

          {/* 2. Category Filter Pill Strip */}
          <div className="no-scrollbar mb-3 flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all duration-150",
                    isActive
                      ? "shadow-xs bg-burgundy-primary text-white"
                      : "border border-brand-border/60 bg-brand-bg/75 text-text-secondary hover:bg-brand-bg hover:text-text-primary",
                  )}
                >
                  <span>{cat.label}</span>
                  <span
                    className={cn(
                      "rounded-full px-1 text-[9px] font-bold leading-none",
                      isActive ? "bg-white/25 text-white" : "border border-brand-border/50 bg-white text-text-muted",
                    )}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Actions Area: Detailed Cards (2 columns, smooth scroll if many) */}
        <div className="my-0.5 flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={`cards-${selectedCategory}`}
              variants={actionContainerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="no-scrollbar grid max-h-[310px] grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2 sm:gap-2.5 sm:pr-0.5"
            >
              {filteredActions.map((action: QuickAction) => {
                const theme = actionThemes[action.id] || defaultTheme;

                return (
                  <motion.button
                    key={action.id}
                    variants={actionItemVariants}
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 450, damping: 25 }}
                    onClick={() => handleActionClick(action)}
                    className={cn(
                      "sm:p-2.8 group relative flex cursor-pointer items-center justify-between rounded-xl border border-brand-border/80 bg-white p-2.5 text-left transition-all duration-200",
                      theme.gradientBg,
                      theme.borderHover,
                      theme.shadowHover,
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-2.5 pr-1">
                      {/* Squircle Icon Badge */}
                      <div
                        className={cn(
                          "shadow-xs flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:rotate-2 group-hover:scale-110",
                          theme.iconBg,
                        )}
                      >
                        {getActionIcon(action.iconName, theme.iconColor)}
                      </div>

                      {/* Title & Context Caption */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-xs font-bold text-text-primary transition-colors group-hover:text-brand-red">
                            {action.title}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-[10px] leading-tight text-text-secondary sm:text-[10.5px]">
                          {action.subtitle || action.description}
                        </p>
                      </div>
                    </div>

                    {/* Launch Arrow & Hotkey */}
                    <div className="flex flex-shrink-0 items-center gap-1">
                      {action.hotkey && (
                        <span className="hidden rounded border border-brand-border/60 bg-brand-bg px-1 py-0.5 text-[9px] font-semibold text-text-muted/80 xl:inline-block">
                          {action.hotkey}
                        </span>
                      )}
                      <div className="flex h-5 w-5 items-center justify-center rounded-full text-text-secondary/50 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:bg-brand-light-red/70 group-hover:text-brand-red">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 4. Bottom Footer Hint */}
        <div className="mt-2 flex items-center justify-between border-t border-brand-border/60 pt-2.5 text-[11px] text-text-secondary">
          <div className="flex min-w-0 items-center gap-1.5 truncate text-text-muted">
            <Sparkles className="h-3.5 w-3.5 flex-shrink-0 text-brand-red" />
            <span className="truncate">
              Press{" "}
              <kbd className="rounded border border-brand-border bg-brand-bg px-1 py-0.5 font-sans text-[9.5px] font-semibold text-text-primary">
                Alt
              </kbd>{" "}
              + key for direct navigation
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsDirectoryOpen(true)}
            className="flex-shrink-0 cursor-pointer text-[11px] font-semibold text-brand-red transition-colors hover:text-brand-accent"
          >
            Explore All
          </button>
        </div>
      </div>

      {/* 5. Complete Quick Action Directory Modal with Navigation */}
      <AnimatePresence>
        {isDirectoryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDirectoryOpen(false)}
              className="backdrop-blur-xs fixed inset-0 bg-black/45 transition-opacity"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-brand-border bg-white shadow-2xl"
            >
              {/* Directory Header */}
              <div className="flex items-center justify-between border-b border-brand-border/70 px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-light-red text-brand-red">
                    <Zap className="h-4 w-4 fill-brand-red/15" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary sm:text-base">Quick Action Directory</h3>
                    <p className="text-xs text-text-secondary">Jump directly to any college workflow, finance ledger, or administrative module</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDirectoryOpen(false)}
                  className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-brand-bg hover:text-text-primary"
                  aria-label="Close directory"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Search & Filter Toolbar */}
              <div className="border-b border-brand-border/60 bg-brand-bg/40 px-5 py-3">
                <div className="relative mb-2.5">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    value={directorySearch}
                    onChange={(e) => setDirectorySearch(e.target.value)}
                    placeholder="Search shortcuts, routes, or hotkeys (e.g., student, payment, Alt+S)..."
                    className="w-full rounded-xl border border-brand-border bg-white py-2 pl-8 pr-9 text-xs text-text-primary placeholder:text-text-muted focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
                    autoFocus
                  />
                  {directorySearch && (
                    <button
                      type="button"
                      onClick={() => setDirectorySearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Directory Categories */}
                <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-0.5">
                  {categories.map((cat) => {
                    const isActive = directoryCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setDirectoryCategory(cat.id)}
                        className={cn(
                          "flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all",
                          isActive
                            ? "shadow-xs bg-burgundy-primary text-white"
                            : "border border-brand-border/60 bg-white text-text-secondary hover:bg-brand-bg hover:text-text-primary",
                        )}
                      >
                        <span>{cat.label}</span>
                        <span
                          className={cn(
                            "rounded-full px-1 text-[9px] font-bold leading-none",
                            isActive ? "bg-white/25 text-white" : "bg-brand-bg text-text-muted",
                          )}
                        >
                          {cat.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Directory Action Cards Grid */}
              <div className="no-scrollbar max-h-[380px] flex-1 overflow-y-auto p-4 sm:p-5">
                {directoryFilteredActions.length === 0 ? (
                  <div className="py-10 text-center">
                    <Search className="mx-auto mb-2 h-7 w-7 text-text-muted/60" />
                    <p className="text-xs font-semibold text-text-primary">No actions found</p>
                    <p className="text-[11px] text-text-secondary">Try searching with different keywords or switch categories</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {directoryFilteredActions.map((action) => {
                      const theme = actionThemes[action.id] || defaultTheme;

                      return (
                        <button
                          key={action.id}
                          type="button"
                          onClick={() => {
                            setIsDirectoryOpen(false);
                            handleActionClick(action);
                          }}
                          className={cn(
                            "group flex cursor-pointer items-center justify-between rounded-xl border border-brand-border/80 bg-white p-3 text-left transition-all duration-200",
                            theme.gradientBg,
                            theme.borderHover,
                            theme.shadowHover,
                          )}
                        >
                          <div className="flex min-w-0 items-center gap-3 pr-2">
                            <div
                              className={cn(
                                "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105",
                                theme.iconBg,
                              )}
                            >
                              {getActionIcon(action.iconName, theme.iconColor)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="truncate text-xs font-bold text-text-primary group-hover:text-brand-red">{action.title}</span>
                                {action.category && (
                                  <span className="py-0.2 rounded bg-brand-light-red/80 px-1 text-[9px] font-semibold uppercase text-brand-red">
                                    {action.category}
                                  </span>
                                )}
                              </div>
                              <p className="mt-0.5 truncate text-[11px] text-text-secondary">{action.description}</p>
                              {action.path && (
                                <span className="mt-0.5 inline-block text-[10px] font-medium text-text-muted">Go to: {action.path}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-shrink-0 items-center gap-1.5">
                            {action.hotkey && (
                              <span className="rounded border border-brand-border/70 bg-brand-bg px-1.5 py-0.5 text-[9.5px] font-semibold text-text-muted">
                                {action.hotkey}
                              </span>
                            )}
                            <div className="flex h-6 w-6 items-center justify-center rounded-full text-text-secondary/50 transition-colors group-hover:bg-brand-light-red group-hover:text-brand-red">
                              <ArrowUpRight className="h-4 w-4" />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Directory Footer */}
              <div className="flex items-center justify-between border-t border-brand-border/70 px-5 py-3 text-xs text-text-secondary">
                <span className="flex items-center gap-1 text-[11px] text-text-muted">
                  <Sparkles className="h-3.5 w-3.5 text-brand-red" />
                  Shortcuts work globally with{" "}
                  <kbd className="rounded border border-brand-border bg-brand-bg px-1 py-0.5 font-sans font-semibold">Alt</kbd>
                </span>
                <button
                  type="button"
                  onClick={() => setIsDirectoryOpen(false)}
                  className="rounded-lg border border-brand-border bg-brand-bg px-3 py-1 text-xs font-semibold text-text-primary transition-colors hover:bg-white"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export const QuickActions = React.memo(QuickActionsComponent);
