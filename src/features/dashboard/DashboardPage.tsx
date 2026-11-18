import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { WelcomeSection } from "./components/WelcomeSection";
import { InstitutionOverview } from "./components/InstitutionOverview";
import { QuickActions } from "./components/QuickActions";
import { MonthlyStudentsChart } from "./components/MonthlyStudentsChart";
import { PaymentsBreakdown } from "./components/PaymentsBreakdown";
import { RecentActivities } from "./components/RecentActivities";
import { PaymentsPending } from "./components/PaymentsPending";
import { QuickActionModals } from "./components/QuickActionModals";
import { dashboardContainerVariants, dashboardSectionVariants, staggeredGridVariants, cardItemVariants } from "@/components/animations/transitions";

export const DashboardPage: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = shouldReduceMotion ? { hidden: { opacity: 1 }, visible: { opacity: 1 } } : dashboardContainerVariants;

  const sectionVariants = shouldReduceMotion ? { hidden: { opacity: 1 }, visible: { opacity: 1 } } : dashboardSectionVariants;

  const gridVariants = shouldReduceMotion ? { hidden: { opacity: 1 }, visible: { opacity: 1 } } : staggeredGridVariants;

  const cardVariants = shouldReduceMotion ? { hidden: { opacity: 1 }, visible: { opacity: 1 } } : cardItemVariants;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto w-full pt-1"
    >
      {/* 1. Welcome Section & Statistics Hero */}
      <motion.div variants={sectionVariants}>
        <WelcomeSection />
      </motion.div>

      {/* 2. Middle Row: Institution Overview (Left) + Quick Actions (Right) */}
      <motion.div
        variants={gridVariants}
        className="mb-5 grid grid-cols-1 items-stretch gap-4 sm:gap-5 lg:grid-cols-12"
      >
        <motion.div
          variants={cardVariants}
          className="flex h-full flex-col lg:col-span-7 xl:col-span-8"
        >
          <InstitutionOverview />
        </motion.div>
        <motion.div
          variants={cardVariants}
          className="flex h-full flex-col lg:col-span-5 xl:col-span-4"
        >
          <QuickActions />
        </motion.div>
      </motion.div>

      {/* 3. Lower Row: Pending Payments Breakdown + Monthly Students Chart + Recent Activities */}
      <motion.div
        variants={gridVariants}
        className="mb-5 grid grid-cols-1 items-stretch gap-4 sm:gap-5 md:grid-cols-3"
      >
        <motion.div
          variants={cardVariants}
          className="flex h-full flex-col"
        >
          <PaymentsBreakdown />
        </motion.div>
        <motion.div
          variants={cardVariants}
          className="flex h-full flex-col"
        >
          <MonthlyStudentsChart />
        </motion.div>
        <motion.div
          variants={cardVariants}
          className="flex h-full flex-col"
        >
          <RecentActivities />
        </motion.div>
      </motion.div>

      {/* 4. Bottom Row: Pending Payments Cards Carousel */}
      <motion.div variants={sectionVariants}>
        <PaymentsPending />
      </motion.div>

      {/* Global Quick Action Modals */}
      <QuickActionModals />
    </motion.div>
  );
};
