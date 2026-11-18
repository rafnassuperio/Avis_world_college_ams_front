import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  IndianRupee,
  UserCheck,
  BookOpen,
  ArrowRight,
  UserPlus,
  CreditCard,
  GraduationCap,
  ShieldCheck,
  Users,
  Clock,
  Sparkles,
  ChevronRight,
  FilterX,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { smoothEase } from "@/components/animations/transitions";
import { Dropdown, DropdownOption } from "@/components/ui/Dropdown";
import { RecentActivity } from "@/types";
import { ActivityDetailModal } from "./ActivityDetailModal";

const FILTER_OPTIONS: DropdownOption[] = [
  { label: "All Activities", value: "all" },
  { label: "Admissions", value: "admission" },
  { label: "Fee Receipts", value: "fee" },
  { label: "Academic", value: "program" },
  { label: "Faculty & Staff", value: "staff" },
  { label: "System & Audit", value: "system" },
];

const RecentActivitiesComponent: React.FC = () => {
  const activities = useAppStore((state) => state.activities);
  const openModal = useAppStore((state) => state.openModal);
  const removeActivity = useAppStore((state) => state.removeActivity);

  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedActivity, setSelectedActivity] = useState<RecentActivity | null>(null);

  // Filter activities based on the selected category
  const filteredActivities = useMemo(() => {
    if (selectedFilter === "all") return activities;
    return activities.filter((act) => act.type === selectedFilter);
  }, [activities, selectedFilter]);

  // Resolved Icon per activity using Avis World College brand colors from globals.css
  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
      case "UserPlus":
        return <UserPlus className="h-4 w-4 text-brand-red" />;
      case "IndianRupee":
        return <IndianRupee className="h-4 w-4 text-brand-red" />;
      case "CreditCard":
        return <CreditCard className="h-4 w-4 text-brand-red" />;
      case "UserCheck":
        return <UserCheck className="h-4 w-4 text-brand-red" />;
      case "BookOpen":
        return <BookOpen className="h-4 w-4 text-brand-red" />;
      case "GraduationCap":
        return <GraduationCap className="h-4 w-4 text-brand-red" />;
      case "ShieldCheck":
        return <ShieldCheck className="h-4 w-4 text-brand-red" />;
      case "Users":
        return <Users className="h-4 w-4 text-brand-red" />;
      case "FileText":
        return <FileText className="h-4 w-4 text-brand-red" />;
      default:
        return <FileText className="h-4 w-4 text-brand-red" />;
    }
  };

  return (
    <>
      <div className="flex h-full flex-col justify-between rounded-[20px] border border-brand-border bg-white p-5 shadow-[0_2px_10px_-2px_rgba(87,0,31,0.03)] transition-all duration-300 hover:shadow-[0_8px_24px_-4px_rgba(87,0,31,0.06)]">
        {/* Header */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex min-w-0 items-center gap-2 pr-2">
              <h3 className="truncate text-sm font-bold tracking-tight text-text-primary sm:text-[15px]">
                Recent Activities
              </h3>
              <span className="inline-flex select-none items-center gap-1 rounded-full border border-brand-border bg-brand-light-red/60 px-2 py-0.5 text-[10px] font-bold text-brand-red">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-red" />
                Live
              </span>
            </div>
            <Dropdown
              value={selectedFilter}
              options={FILTER_OPTIONS}
              onChange={setSelectedFilter}
              size="sm"
            />
          </div>

          {/* Subheader Toolbar Pill */}
          <div className="mb-2 flex items-center justify-between rounded-xl border border-brand-border bg-brand-bg px-2.5 py-1 text-xs">
            <div className="flex items-center gap-1.5 text-[11px] text-text-secondary">
              <Clock className="h-3 w-3 text-brand-red" />
              <span>Events:</span>
              <span className="font-bold text-text-primary">
                {filteredActivities.length}
              </span>
              {selectedFilter !== "all" && (
                <span className="text-[10px] text-text-muted capitalize">
                  ({selectedFilter})
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => openModal("view-all-activities")}
              className="group flex cursor-pointer items-center gap-1 text-[11px] font-bold text-brand-red transition-colors hover:text-brand-accent"
              title="Open complete institutional activity log"
            >
              <span>View All</span>
              <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>

        {/* Activity List Container */}
        <div className="my-1 flex-1">
          <AnimatePresence mode="wait">
            {filteredActivities.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex h-36 flex-col items-center justify-center rounded-xl border border-dashed border-brand-border bg-brand-bg/60 p-4 text-center"
              >
                <FilterX className="mb-1.5 h-6 w-6 text-text-muted" />
                <p className="text-xs font-semibold text-text-primary">No activities found</p>
                <p className="mt-0.5 text-[10.5px] text-text-secondary">
                  No events logged in the selected category.
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedFilter("all")}
                  className="mt-2 cursor-pointer text-[11px] font-bold text-brand-red hover:text-brand-accent hover:underline"
                >
                  Show all activities
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={selectedFilter}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="space-y-1.5"
              >
                {filteredActivities.slice(0, 4).map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.05 + idx * 0.04,
                      duration: 0.3,
                      ease: smoothEase,
                    }}
                    whileHover={{ x: 3 }}
                    onClick={() => setSelectedActivity(item)}
                    className="group -mx-1 flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-transparent p-1.5 text-xs transition-all hover:border-brand-border hover:bg-brand-bg/70 hover:shadow-xs"
                    title="Click to view transaction details"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      {/* Icon Container with Avis Brand styling from globals.css */}
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand-light-red transition-all duration-200 group-hover:scale-110 group-hover:bg-brand-light-red/90">
                        {getActivityIcon(item.iconName)}
                      </div>

                      {/* Title, Detail, & Sub-label */}
                      <div className="min-w-0 pr-1">
                        <p className="truncate text-[11px] leading-tight text-text-primary sm:text-xs">
                          <span className="font-semibold text-text-primary transition-colors group-hover:text-brand-red">
                            {item.title}
                          </span>{" "}
                          –{" "}
                          <span className="font-bold text-text-primary">
                            {item.detail}
                          </span>
                        </p>
                        {item.performedBy && (
                          <p className="mt-0.5 truncate text-[10px] text-text-muted">
                            by {item.performedBy}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Time Ago & Hover Chevron */}
                    <div className="flex flex-shrink-0 items-center gap-1">
                      <span className="whitespace-nowrap text-[11px] font-medium text-text-secondary">
                        {item.timeAgo}
                      </span>
                      <ChevronRight className="-mr-0.5 h-3 w-3 text-text-muted opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:text-brand-red" />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Card Footer */}
        <div className="flex items-center justify-between border-t border-brand-border pt-2 text-[11px] text-text-secondary">
          <span className="flex items-center gap-1 text-[10px] text-text-muted">
            <Sparkles className="h-2.5 w-2.5 text-brand-red" />
            Click any row for details
          </span>
          <button
            type="button"
            onClick={() => openModal("view-all-activities")}
            className="flex cursor-pointer items-center gap-0.5 text-[11px] font-semibold text-brand-red hover:text-brand-accent hover:underline"
          >
            <span>Audit log</span>
            <ArrowRight className="h-2.5 w-2.5" />
          </button>
        </div>
      </div>

      {/* Activity Details Modal */}
      <ActivityDetailModal
        isOpen={Boolean(selectedActivity)}
        onClose={() => setSelectedActivity(null)}
        activity={selectedActivity}
        onDismiss={(id) => {
          removeActivity(id);
          setSelectedActivity(null);
        }}
      />
    </>
  );
};

export const RecentActivities = React.memo(RecentActivitiesComponent);
