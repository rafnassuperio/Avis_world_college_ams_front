import React, { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BarChart3, FileCheck2 } from "lucide-react";
import BreadcrumbBanner from "@/components/common/BreadcrumbBanner";
import { Tabs, TabItem } from "@/components/ui/Tabs";
import { dashboardContainerVariants, dashboardSectionVariants } from "@/components/animations/transitions";
import { CollegeReportsTab } from "./components/CollegeReportsTab";
import { StudentDocumentCountTab } from "./components/StudentDocumentCountTab";
import { ReportTabId } from "./types";

export const ReportsPage: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const breadcrumbParts = [{ name: "Report" }];

  const containerVariants = shouldReduceMotion ? { hidden: { opacity: 1 }, visible: { opacity: 1 } } : dashboardContainerVariants;

  const sectionVariants = shouldReduceMotion ? { hidden: { opacity: 1 }, visible: { opacity: 1 } } : dashboardSectionVariants;

  const reportTabs: TabItem<ReportTabId>[] = useMemo(
    () => [
      {
        id: "reports",
        label: "Report",
        shortLabel: "Report",
        icon: BarChart3,
        content: <CollegeReportsTab />,
        hasChildTabs: false,
      },
      {
        id: "document-count",
        label: "Student Document Count",
        shortLabel: "Doc Count",
        icon: FileCheck2,
        content: <StudentDocumentCountTab />,
        hasChildTabs: false,
      },
    ],
    [],
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative mx-auto w-full space-y-4 pt-1"
    >
      {/* Breadcrumb Banner */}
      <motion.div variants={sectionVariants}>
        <BreadcrumbBanner
          title="Report"
          items={breadcrumbParts}
          containerClassName="mb-0"
        />
      </motion.div>

      {/* Tabs Navigation */}
      <motion.div variants={sectionVariants}>
        <Tabs<ReportTabId>
          items={reportTabs}
          defaultValue="reports"
          storageKey="ams_reports_active_tab"
          ariaLabel="Reports Navigation Tabs"
          layoutId="reportsTabsIndicator"
          variant="folder"
          align="50/50"
        />
      </motion.div>
    </motion.div>
  );
};

export default ReportsPage;
