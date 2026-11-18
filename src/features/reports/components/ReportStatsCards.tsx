import React from "react";
import { Users, BookOpen, CalendarRange, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { smoothEase } from "@/components/animations/transitions";
import { ReportOverviewStats } from "../types";

export interface ReportStatsCardsProps {
  stats: ReportOverviewStats;
}

export const ReportStatsCards: React.FC<ReportStatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      id: "student-enrollment",
      title: "Student Enrollment",
      value: stats.studentEnrollment.total.toLocaleString(),
      growth: stats.studentEnrollment.growth,
      period: stats.studentEnrollment.period,
      icon: Users,
      iconBg: "var(--brand-light-red)",
      iconColor: "text-brand-red",
      badgeVariant: "success",
    },
    {
      id: "courses-offered",
      title: "Courses Offered",
      value: stats.coursesOffered.total.toString(),
      growth: `+${stats.coursesOffered.newCourses} New`,
      period: "this academic year",
      icon: BookOpen,
      iconBg: "rgba(112, 43, 64, 0.1)",
      iconColor: "text-burgundy-primary",
      badgeVariant: "brand",
    },
    {
      id: "this-month-intake",
      title: "This Month's Intake",
      value: stats.thisMonthIntake.total.toString(),
      growth: stats.thisMonthIntake.growth,
      period: "MoM",
      icon: CalendarRange,
      iconBg: "rgba(245, 158, 11, 0.12)",
      iconColor: "text-amber-600",
      badgeVariant: "success",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.08, ease: smoothEase }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="group relative cursor-default overflow-hidden rounded-[20px] border border-brand-border bg-white p-4 shadow-[0_2px_10px_-2px_rgba(87,0,31,0.03)] transition-all hover:shadow-[0_12px_24px_-6px_rgba(87,0,31,0.08)] sm:p-5"
          >
            {/* Top decorative gentle glow */}
            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-light-red/40 blur-xl transition-all group-hover:scale-125" />

            <div className="relative z-10 flex items-start gap-4">
              {/* Icon Square */}
              <div
                className="shadow-2xs flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] transition-transform duration-200 group-hover:scale-105"
                style={{ backgroundColor: card.iconBg }}
              >
                <IconComponent className={`h-6 w-6 ${card.iconColor}`} />
              </div>

              {/* Stats & Details */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-2xl font-extrabold tracking-tight text-text-primary sm:text-[26px]">{card.value}</span>
                  <span
                    className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[11px] font-bold leading-none ${
                      card.badgeVariant === "success"
                        ? "border-success/30 bg-success-light text-success"
                        : "border-brand-red/30 bg-brand-light-red text-brand-red"
                    }`}
                  >
                    <ArrowUpRight className="mr-0.5 h-3 w-3 stroke-[2.5]" />
                    {card.growth}
                  </span>
                </div>

                {/* Card Title */}
                <h4 className="mt-1 truncate text-xs font-bold text-text-primary sm:text-sm">{card.title}</h4>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
