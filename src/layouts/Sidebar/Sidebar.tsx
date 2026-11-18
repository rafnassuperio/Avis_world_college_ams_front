import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { assets } from "@/assets/assets";
import { SidebarWaveDecoration } from "./SidebarWaveDecoration";
import { navItems, type NavItem } from "./navItems";

interface SidebarNavItemProps {
  item: NavItem;
  scopeId: "desktop" | "mobile";
  sidebarCollapsed: boolean;
  isActive: boolean;
  onNavigate: () => void;
}

const SidebarNavItemComponent: React.FC<SidebarNavItemProps> = ({
  item,
  scopeId,
  sidebarCollapsed,
  isActive,
  onNavigate,
}) => {
  const Icon = item.icon;
  const isExternal = Boolean(
    item.target === "_blank" ||
      item.path?.trim().startsWith("http://") ||
      item.path?.trim().startsWith("https://"),
  );

  // High-performance CSS variable-driven pointer spotlight (Zero React re-renders)
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  const navItemContent = (
    <>
      {/* 1. iOS 26+ Liquid Active Cutout Pill with Apple Fluid Spring */}
      {isActive && (
        <motion.div
          layoutId={`activeNavIndicator-${scopeId}`}
          className={cn(
            "ios-liquid-pill-breathe pointer-events-none absolute inset-0 z-10 bg-brand-bg will-change-transform",
            sidebarCollapsed
              ? "rounded-l-xl rounded-r-none"
              : "rounded-l-2xl rounded-r-none",
          )}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 30,
            mass: 0.8,
          }}
        >
          {/* Gliding Liquid Glass Specular Sheen */}
          <div className="ios-liquid-sheen-active pointer-events-none absolute inset-0 z-10 w-1/2 bg-gradient-to-r from-transparent via-white/45 to-transparent" />

          {/* Inverted Fillet Curve: Top Right with Meniscus Specular Highlight */}
          <svg
            className="pointer-events-none absolute -top-5 right-0 z-20 h-5 w-5 overflow-visible"
            viewBox="0 0 20 20"
            fill="none"
            shapeRendering="geometricPrecision"
          >
            <path
              d="M0,20 A20,20 0 0,0 20,0 L21,0 L21,20 Z"
              style={{ fill: "var(--brand-bg)" }}
            />
            {/* Liquid Meniscus Highlight Stroke */}
            <path
              d="M0,20 A20,20 0 0,0 20,0"
              stroke="rgba(241, 221, 224, 0.5)"
              strokeWidth="1.2"
              fill="none"
            />
          </svg>

          {/* Inverted Fillet Curve: Bottom Right with Meniscus Specular Highlight */}
          <svg
            className="pointer-events-none absolute -bottom-5 right-0 z-20 h-5 w-5 overflow-visible"
            viewBox="0 0 20 20"
            fill="none"
            shapeRendering="geometricPrecision"
          >
            <path
              d="M0,0 A20,20 0 0,1 20,20 L21,20 L21,0 Z"
              style={{ fill: "var(--brand-bg)" }}
            />
            {/* Liquid Meniscus Highlight Stroke */}
            <path
              d="M0,0 A20,20 0 0,1 20,20"
              stroke="rgba(241, 221, 224, 0.5)"
              strokeWidth="1.2"
              fill="none"
            />
          </svg>
        </motion.div>
      )}

      {/* 2. Zero-Lag Magnetic Liquid Hover Spotlight (Pure GPU CSS Shader) */}
      {!isActive && (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100",
            sidebarCollapsed ? "mr-2 rounded-xl" : "mr-3.5 rounded-2xl",
          )}
          style={{
            background:
              "radial-gradient(130px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.16), rgba(210, 139, 150, 0.08) 45%, transparent 75%)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.18), 0 4px 14px rgba(0,0,0,0.22)",
            border: "1px solid rgba(255,255,255,0.14)",
          }}
        />
      )}

      {/* 3. Navigation Item Content (Icon, Dynamic Dot & Label) */}
      <div
        className={cn(
          "relative z-20 flex w-full items-center transition-transform duration-200 active:scale-[0.98]",
          sidebarCollapsed ? "justify-center" : "justify-start",
          isActive && !sidebarCollapsed ? "translate-x-0.5" : "",
        )}
      >
        {/* Dynamic Island Style Pulsing Liquid Micro-Dot for Active State */}
        {isActive && !sidebarCollapsed && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 25 }}
            className="ios-liquid-dot-glow mr-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gradient-to-br from-brand-red to-burgundy-primary"
          />
        )}

        <div className="relative flex h-5 w-5 flex-shrink-0 items-center justify-center">
          <Icon
            className={cn(
              "h-4 w-4 flex-shrink-0 transition-all duration-200 ease-out",
              isActive
                ? "scale-110 text-burgundy-primary drop-shadow-[0_2px_4px_rgba(112,43,64,0.28)]"
                : "text-white/85 group-hover:scale-110 group-hover:text-white group-hover:drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]",
            )}
          />
        </div>

        <AnimatePresence initial={false}>
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0, x: -6 }}
              animate={{ opacity: 1, width: "auto", x: 0 }}
              exit={{ opacity: 0, width: 0, x: -6 }}
              transition={{
                duration: 0.22,
                ease: [0.25, 1, 0.5, 1],
              }}
              className={cn(
                "ml-3 overflow-hidden truncate whitespace-nowrap text-[13px] font-medium tracking-tight transition-colors duration-200",
                isActive
                  ? "font-semibold text-burgundy-sidebar"
                  : "font-medium text-white/80 group-hover:text-white",
              )}
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>

        {isExternal && !sidebarCollapsed && (
          <ExternalLink
            className={cn(
              "ml-auto h-3.5 w-3.5 flex-shrink-0 transition-colors duration-200",
              isActive
                ? "text-burgundy-sidebar/70"
                : "text-white/60 group-hover:text-white",
            )}
          />
        )}
      </div>

      {/* 4. Smooth Liquid Tooltip for Collapsed Sidebar */}
      {sidebarCollapsed && (
        <div className="pointer-events-none absolute left-full z-50 ml-3.5 hidden -translate-x-2 items-center opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100 lg:flex">
          <div className="relative whitespace-nowrap rounded-xl border border-white/20 bg-[#240c16]/95 px-3 py-1.5 text-[12px] font-semibold text-white shadow-[0_8px_24px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-[#240c16]/95" />
            {item.label}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="relative">
      {isExternal ? (
        <a
          href={item.path}
          target={item.target || "_blank"}
          rel="noopener noreferrer"
          onClick={onNavigate}
          onMouseMove={handleMouseMove}
          className={cn(
            "group relative mr-0 flex h-11 select-none items-center py-2.5 text-[13px] font-medium outline-none transition-[padding] duration-250 ease-out",
            sidebarCollapsed ? "justify-center px-2" : "pl-3.5 pr-4",
          )}
        >
          {navItemContent}
        </a>
      ) : (
        <NavLink
          to={item.path}
          end={item.path === "/"}
          onClick={onNavigate}
          onMouseMove={handleMouseMove}
          className={cn(
            "group relative mr-0 flex h-11 select-none items-center py-2.5 text-[13px] font-medium outline-none transition-[padding] duration-250 ease-out",
            sidebarCollapsed ? "justify-center px-2" : "pl-3.5 pr-4",
          )}
        >
          {navItemContent}
        </NavLink>
      )}
    </div>
  );
};

const SidebarNavItem = React.memo(SidebarNavItemComponent);

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed);
  const isMobileSidebarOpen = useAppStore((state) => state.isMobileSidebarOpen);
  const setMobileSidebarOpen = useAppStore((state) => state.setMobileSidebarOpen);

  const renderSidebarContent = (scopeId: "desktop" | "mobile") => (
    <div className="relative flex h-full select-none flex-col bg-brand-bg">
      {/* Top Header - Brand Logo with Liquid Sheen Reflection */}
      <div className="relative z-20 flex h-[74px] flex-shrink-0 items-center justify-between bg-brand-bg px-3.5 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]">
        <div className="group flex items-center gap-3 overflow-hidden">
          <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl">
            <img
              src={assets.avisLogo}
              alt="Avis Logo"
              className="h-12 w-auto object-contain drop-shadow-[0_2px_6px_rgba(112,43,64,0.22)] filter transition-transform duration-300 group-hover:scale-105"
            />
            {/* Liquid Logo Sheen Reflection */}
            <div className="ios-liquid-logo-sheen pointer-events-none absolute -inset-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          </div>
          <AnimatePresence initial={false}>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0, x: -8 }}
                animate={{ opacity: 1, width: "auto", x: 0 }}
                exit={{ opacity: 0, width: 0, x: -8 }}
                transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                className="overflow-hidden whitespace-nowrap pl-0.5 leading-tight"
              >
                <h1 className="font-serif text-[15px] font-bold uppercase tracking-wider text-burgundy-sidebar drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                  Avis World
                </h1>
                <h2 className="font-serif text-[12px] font-semibold uppercase tracking-wider text-burgundy-sidebar/80">
                  College
                </h2>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Close Button */}
        {scopeId === "mobile" && (
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="rounded-full border border-burgundy-sidebar/20 p-1.5 text-burgundy-sidebar/70 transition-colors duration-200 hover:bg-brand-border/60 hover:text-burgundy-sidebar lg:hidden"
            aria-label="Close mobile sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Main 3D Sculpted Body - iOS 26 Liquid Glass Chamber */}
      <div className="relative flex flex-1 flex-col justify-between overflow-hidden rounded-tr-[42px] border-none bg-gradient-to-b from-[#4e1c2e] via-[#240c16] to-[#16050c]">
        {/* --- iOS 26+ Liquid Ambient Atmosphere (Living Metaball Chamber) --- */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          {/* Liquid Orb 1: Rich Burgundy fluid mass drifting top-left */}
          <div className="ios-liquid-blob-1 absolute -left-12 -top-10 h-64 w-64 bg-gradient-to-tr from-[#702b40]/45 via-[#a64c61]/30 to-transparent blur-3xl" />

          {/* Liquid Orb 2: Deep Berry Wine fluid mass drifting center-right */}
          <div className="ios-liquid-blob-2 absolute -right-16 top-1/3 h-72 w-72 bg-gradient-to-bl from-[#421b29]/55 via-[#d28b96]/20 to-transparent blur-3xl" />

          {/* Liquid Orb 3: Luminous Nectar Blush bubble near bottom */}
          <div className="ios-liquid-blob-3 absolute bottom-28 left-6 h-48 w-48 bg-gradient-to-t from-[#f1dde0]/18 via-[#a64c61]/22 to-transparent blur-2xl" />

          {/* Liquid Glass Edge Meniscus Line along the inner right border */}
          <div className="absolute bottom-0 right-0 top-0 w-[1px] bg-gradient-to-b from-white/25 via-rose-300/20 to-transparent" />
        </div>

        {/* Specular Ambient Glow on the 42px sculpted top-right notch */}
        <div className="pointer-events-none absolute -right-6 -top-6 z-0 h-40 w-40 rounded-full bg-[radial-gradient(circle,_rgba(241,221,224,0.22)_0%,_transparent_68%)] blur-lg" />

        {/* Ambient 3D Specular Light & Vignette Overlays */}
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_30%_0%,_rgba(210,139,150,0.22)_0%,_transparent_68%)]" />
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_65%_45%,_rgba(166,76,97,0.12)_0%,_transparent_72%)]" />

        {/* Scrollable upper section: Navigation Links positioned cleanly below the 42px top-right notch */}
        <div
          className={cn(
            "scrollbar-none relative z-10 flex-1 overflow-y-auto overflow-x-hidden pb-6 pr-0 pt-16 transition-[padding] duration-250 ease-out",
            sidebarCollapsed ? "pl-2.5" : "pl-3.5",
          )}
        >
          <LayoutGroup id={`sidebar-nav-${scopeId}`}>
            <nav className="relative space-y-1.5">
              {navItems.map((item) => {
                const isExternal = Boolean(
                  item.target === "_blank" ||
                    item.path?.trim().startsWith("http://") ||
                    item.path?.trim().startsWith("https://"),
                );
                const isRouteActive =
                  !isExternal &&
                  (item.path === "/"
                    ? location.pathname === "/"
                    : location.pathname === item.path ||
                      location.pathname.startsWith(`${item.path}/`));

                return (
                  <SidebarNavItem
                    key={item.id}
                    item={item}
                    scopeId={scopeId}
                    sidebarCollapsed={sidebarCollapsed}
                    isActive={isRouteActive}
                    onNavigate={() => setMobileSidebarOpen(false)}
                  />
                );
              })}
            </nav>
          </LayoutGroup>
        </div>

        {/* Dynamic Animated Ribbon Wave & Avis World College Footer */}
        <div className="relative z-20 mt-auto flex-shrink-0">
          <SidebarWaveDecoration collapsed={sidebarCollapsed} />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden select-none bg-brand-bg transition-[width] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-[width] lg:block",
          sidebarCollapsed ? "w-20" : "w-[276px]",
        )}
      >
        <LayoutGroup id="desktop-sidebar-root">
          {renderSidebarContent("desktop")}
        </LayoutGroup>
      </aside>

      {/* Mobile Drawer Backdrop & Drawer */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div
              key="mobile-sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              key="mobile-sidebar-drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 300,
                mass: 0.8,
              }}
              className="fixed inset-y-0 left-0 z-50 w-[276px] select-none overflow-hidden rounded-tr-3xl bg-brand-bg shadow-2xl lg:hidden"
            >
              <LayoutGroup id="mobile-sidebar-root">
                {renderSidebarContent("mobile")}
              </LayoutGroup>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
