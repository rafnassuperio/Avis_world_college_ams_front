import React, { useState, useRef, useEffect } from 'react';
import {
  Lightbulb,
  Wrench,
  GraduationCap,
  CreditCard,
  BookOpen,
  Bell,
  CheckCheck,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { NotificationItem } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'All' | 'Today' | 'This Week' | 'Earlier';

// Custom SVG matching the connected points line chart from the design reference
const ChartPointsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 17L8.5 9.5L13.5 14.5L20 6" />
    <circle cx="4" cy="17" r="1.5" fill="currentColor" />
    <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" />
    <circle cx="13.5" cy="14.5" r="1.5" fill="currentColor" />
    <circle cx="20" cy="6" r="1.5" fill="currentColor" />
  </svg>
);

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
}) => {
  const notifications = useAppStore((state) => state.notifications);
  const markNotificationAsRead = useAppStore((state) => state.markNotificationAsRead);
  const markAllNotificationsAsRead = useAppStore((state) => state.markAllNotificationsAsRead);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<TabType>('Today');

  const tabs: TabType[] = ['Today', 'This Week', 'Earlier', 'All'];

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        // If clicking on the notification trigger button, let its toggle handler manage it
        const target = event.target as HTMLElement;
        if (target.closest('[aria-label="Notifications"]')) {
          return;
        }
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const matchesTab = (item: NotificationItem, tab: TabType) => {
    if (tab === 'All') return true;
    if (item.period) return item.period === tab;

    // Fallback heuristics if period is not set
    if (tab === 'Today') {
      return (
        item.timestamp.includes('min') ||
        item.timestamp.includes('hour') ||
        item.timestamp.includes('1h') ||
        item.timestamp.includes('3h') ||
        item.timestamp.includes('5h')
      );
    }
    if (tab === 'This Week') {
      return (
        item.timestamp.includes('Yesterday') ||
        item.timestamp.includes('2d') ||
        item.timestamp.includes('3d') ||
        item.timestamp.includes('4d') ||
        item.timestamp.includes('5d')
      );
    }
    return (
      item.timestamp.includes('w ago') ||
      item.timestamp.includes('week') ||
      item.timestamp.includes('month')
    );
  };

  const filteredNotifications = notifications.filter((item) =>
    matchesTab(item, activeTab)
  );

  const getTabCount = (tab: TabType) => {
    return notifications.filter((item) => matchesTab(item, tab)).length;
  };

  const renderIcon = (item: NotificationItem) => {
    const iconType = item.iconType || item.type;

    switch (iconType) {
      case 'ai':
        return (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-palette-6/80 text-brand-red ring-1 ring-brand-red/15 transition-transform group-hover:scale-105">
            <Lightbulb className="h-4 w-4 stroke-[2]" />
          </div>
        );
      case 'analytics':
        return (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-burgundy/10 text-burgundy-primary ring-1 ring-burgundy/15 transition-transform group-hover:scale-105">
            <ChartPointsIcon className="h-4 w-4" />
          </div>
        );
      case 'maintenance':
      case 'system':
        return (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 ring-1 ring-slate-200 transition-transform group-hover:scale-105">
            <Wrench className="h-4 w-4 stroke-[1.8]" />
          </div>
        );
      case 'admission':
        return (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60 transition-transform group-hover:scale-105">
            <GraduationCap className="h-4 w-4 stroke-[1.8]" />
          </div>
        );
      case 'payment':
        return (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700 ring-1 ring-amber-200/60 transition-transform group-hover:scale-105">
            <CreditCard className="h-4 w-4 stroke-[1.8]" />
          </div>
        );
      case 'academic':
        return (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-700 ring-1 ring-rose-200/60 transition-transform group-hover:scale-105">
            <BookOpen className="h-4 w-4 stroke-[1.8]" />
          </div>
        );
      default:
        return (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-bg text-brand-red ring-1 ring-brand-border transition-transform group-hover:scale-105">
            <Bell className="h-4 w-4 stroke-[1.8]" />
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          style={{ transformOrigin: 'calc(100% - 20px) 0px' }}
          initial={{ opacity: 0, y: -8, scale: 0.95, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -6, scale: 0.96, filter: 'blur(2px)' }}
          transition={{
            type: 'spring',
            stiffness: 420,
            damping: 28,
            mass: 0.7,
            filter: { duration: 0.22, ease: 'easeOut' },
          }}
          className="absolute -right-12 sm:right-0 top-full mt-2.5 w-[calc(100vw-32px)] sm:w-[420px] max-w-[430px] rounded-2xl bg-white/95 backdrop-blur-md border border-brand-border shadow-dropdown shadow-burgundy/10 z-40 overflow-hidden text-left"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-brand-border/70 px-4 py-3.5 bg-gradient-to-b from-brand-bg/50 to-white">
            <div className="flex items-center gap-2.5">
              <motion.div
                whileHover={{ rotate: 12, scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-palette-6/80 text-brand-red"
              >
                <Bell className="h-3.5 w-3.5" />
              </motion.div>
              <h3 className="text-sm font-bold text-text-primary tracking-tight">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="inline-flex items-center justify-center rounded-full bg-brand-light-red px-2 py-0.5 text-[10.5px] font-bold text-brand-red leading-none"
                >
                  {unreadCount} new
                </motion.span>
              )}
            </div>

            {unreadCount > 0 && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                whileHover={{ scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                onClick={() => markAllNotificationsAsRead()}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-brand-red transition-colors hover:bg-brand-light-red/60 flex-shrink-0"
                title="Mark all notifications as read"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span className="whitespace-nowrap">Mark all read</span>
              </motion.button>
            )}
          </div>

          {/* Filter Tabs (Segmented Control with Animated Slider) */}
          <div className="px-4 pt-3 pb-2">
            <div className="flex items-center gap-1 rounded-xl bg-brand-bg border border-brand-border/70 p-1 relative">
              {tabs.map((tab) => {
                const isActive = activeTab === tab;
                const count = getTabCount(tab);
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="relative flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs rounded-lg transition-colors font-medium z-10"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNotificationTab"
                        className="absolute inset-0 rounded-lg bg-white shadow-sm ring-1 ring-black/5 -z-10"
                        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                      />
                    )}
                    <span
                      className={`transition-colors ${
                        isActive
                          ? 'text-text-primary font-bold'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {tab}
                    </span>
                    {count > 0 && (
                      <span
                        className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold transition-colors ${
                          isActive
                            ? 'bg-brand-light-red text-brand-red'
                            : 'bg-brand-border/60 text-text-muted'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notification List with Smooth Transitions */}
          <div className="max-h-[380px] overflow-y-auto px-4 pb-2 divide-y divide-brand-border/40 scrollbar-thin">
            <AnimatePresence mode="wait">
              {filteredNotifications.length > 0 ? (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                  className="space-y-1 py-1"
                >
                  {filteredNotifications.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.985 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => markNotificationAsRead(item.id)}
                      className={`group flex items-start gap-3 rounded-xl p-2.5 transition-colors cursor-pointer ${
                        !item.isRead
                          ? 'bg-brand-bg/60 hover:bg-brand-bg border border-brand-border/60'
                          : 'hover:bg-brand-bg/40 border border-transparent'
                      }`}
                    >
                      {/* Category Icon */}
                      <div className="flex-shrink-0 pt-0.5">
                        {renderIcon(item)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <AnimatePresence>
                              {!item.isRead && (
                                <motion.span
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="h-1.5 w-1.5 rounded-full bg-brand-red flex-shrink-0 ring-2 ring-brand-red/30"
                                />
                              )}
                            </AnimatePresence>
                            <span
                              className={`text-[13px] leading-tight truncate tracking-tight transition-colors ${
                                !item.isRead
                                  ? 'font-bold text-text-primary'
                                  : 'font-medium text-text-secondary'
                              }`}
                            >
                              {item.title}
                            </span>
                          </div>
                          <span className="text-[11px] text-text-muted whitespace-nowrap flex-shrink-0">
                            {item.timestamp}
                          </span>
                        </div>

                        <p className="mt-1 text-[12px] text-text-secondary leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="py-10 text-center"
                >
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -6, 6, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 3.5,
                      ease: 'easeInOut',
                    }}
                    className="mx-auto mb-2.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-light-red/50 text-brand-red"
                  >
                    <Bell className="h-5 w-5 stroke-[1.75]" />
                  </motion.div>
                  <p className="text-xs font-bold text-text-primary">No notifications</p>
                  <p className="mt-0.5 text-[11px] text-text-secondary max-w-[220px] mx-auto">
                    You have caught up with all updates for {activeTab.toLowerCase()}.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-brand-border/70 bg-brand-bg/40 px-4 py-2 text-xs text-text-secondary">
            <span className="text-[11px] font-medium text-text-muted">
              {notifications.length} total updates
            </span>
            <span className="text-[11px] font-semibold text-brand-red">
              Avis Notification Hub
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
