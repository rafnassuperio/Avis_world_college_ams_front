import React, { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ReceiptText, FileSpreadsheet, Users, Briefcase } from "lucide-react";
import BreadcrumbBanner from "@/components/common/BreadcrumbBanner";
import { Tabs, TabItem } from "@/components/ui/Tabs";
import { dashboardContainerVariants, dashboardSectionVariants } from "@/components/animations/transitions";
import { PaymentReportTab } from "./components/PaymentReportTab";
import { AgentRepReportTab } from "./components/AgentRepReportTab";
import { CpCaseReportTab } from "./components/CpCaseReportTab";
import { PaymentReportTabId, PaymentSubTabId } from "./types";
import { useFinanceSummary, useCpReportCount } from "@/services/reports";

export const PaymentReportPage: React.FC = () => {
  const { data: finance } = useFinanceSummary();
  const { data: cpCases } = useCpReportCount();
  const paymentCount = finance?.paymentCount || 0;
  const partnerCount = (finance?.agentCount || 0) + (finance?.repCount || 0);
  const shouldReduceMotion = useReducedMotion();

  // Active tab states for contextual breadcrumbs and UI synchronization
  const [activeTab, setActiveTab] = useState<PaymentReportTabId>("payment-report");
  const [activeSubTab, setActiveSubTab] = useState<PaymentSubTabId>("payment-report-sub");

  // Animation variants
  const containerVariants = shouldReduceMotion ? { hidden: { opacity: 1 }, visible: { opacity: 1 } } : dashboardContainerVariants;
  const sectionVariants = shouldReduceMotion ? { hidden: { opacity: 1 }, visible: { opacity: 1 } } : dashboardSectionVariants;

  // Breadcrumb
  const breadcrumbParts = [{ name: "Payment Report" }];

  // Page banner title
  const bannerTitle = useMemo(() => {
    if (activeTab === "cp-case-report") return "CP Case Report";
    if (activeSubTab === "agent-rep-report") return "Agent & Rep Report";
    return "Payment Report";
  }, [activeTab, activeSubTab]);

  const reportTabs: TabItem<PaymentReportTabId, PaymentSubTabId>[] = useMemo(
    () => [
      {
        id: "payment-report",
        label: "Payment Report",
        shortLabel: "Payment",
        icon: ReceiptText,
        badge: paymentCount + partnerCount,
        badgeVariant: "brand",
        hasChildTabs: true,
        defaultSubTabId: "payment-report-sub",
        subTabs: [
          {
            id: "payment-report-sub",
            label: "Payment Report",
            icon: FileSpreadsheet,
            badge: paymentCount,
            badgeVariant: "success",
            content: <PaymentReportTab />,
          },
          {
            id: "agent-rep-report",
            label: "Agent & Rep Report",
            icon: Users,
            badge: partnerCount,
            badgeVariant: "purple",
            content: <AgentRepReportTab />,
          },
        ],
      },
      {
        id: "cp-case-report",
        label: "CP Case Report",
        shortLabel: "CP Case",
        icon: Briefcase,
        badge: cpCases ?? 0,
        badgeVariant: "alert",
        hasChildTabs: false,
        subTabs: false,
        content: <CpCaseReportTab />,
      },
    ],
    [finance, cpCases],
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
          title={bannerTitle}
          items={breadcrumbParts}
          containerClassName="mb-0"
        />
      </motion.div>

      {/* Tabs Navigation */}
      <motion.div variants={sectionVariants}>
        <Tabs<PaymentReportTabId, PaymentSubTabId>
          items={reportTabs}
          defaultValue="payment-report"
          defaultSubTabId="payment-report-sub"
          storageKey="ams_payment_report_active_tab"
          onChange={(tabId) => {
            setActiveTab(tabId);
          }}
          onSubTabChange={(subTabId) => {
            setActiveSubTab(subTabId);
          }}
          ariaLabel="Payment and CP Case Reports Navigation"
          layoutId="paymentReportTabsIndicator"
          variant="folder"
          align="50/50"
        />
      </motion.div>
    </motion.div>
  );
};

export default PaymentReportPage;
