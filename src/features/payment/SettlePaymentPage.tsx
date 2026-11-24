import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Download, ArrowLeft, ExternalLink, AlertCircle, User, GraduationCap, FileText, Layers } from "lucide-react";
import BreadcrumbBanner from "@/components/common/BreadcrumbBanner";
import { Button } from "@/components/ui/Button";
import { Tabs, TabItem } from "@/components/ui/Tabs";
import { toast } from "@/components/common/ToastMessage";
import { getPayment, downloadPaymentReceipt } from "@/services/payments";
import { useApiQuery } from "@/hooks/useApiQuery";
import { AsyncStateView } from "@/components/common/AsyncStateView";

import { dashboardContainerVariants, dashboardSectionVariants } from "@/components/animations/transitions";
import { CourseFeesTab } from "./components/settle/CourseFeesTab";
import { ApplicationFeesTab } from "./components/settle/ApplicationFeesTab";
import { OtherPaymentOptionsTab } from "./components/settle/OtherPaymentOptionsTab";

export type SettleTabId = "course-fees" | "application-fees" | "other-payments";

export const SettlePaymentPage: React.FC = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  // Active tab state
  const [activeTab, setActiveTab] = useState<SettleTabId>("course-fees");

  const { data: currentRecord, loading, error, reload: refreshRecords } = useApiQuery(() => {
    if (!paymentId) return Promise.reject(new Error("Select a payment from the payment list."));
    return getPayment(paymentId);
  }, [paymentId]);
  useEffect(() => {
    const refresh = () => { void refreshRecords(); };
    window.addEventListener("ams_payment_records_updated", refresh);
    return () => window.removeEventListener("ams_payment_records_updated", refresh);
  }, [refreshRecords]);
  const containerVariants = shouldReduceMotion ? { hidden: { opacity: 1 }, visible: { opacity: 1 } } : dashboardContainerVariants;
  const sectionVariants = shouldReduceMotion ? { hidden: { opacity: 1 }, visible: { opacity: 1 } } : dashboardSectionVariants;

  if (loading || error) return <AsyncStateView isLoading={loading} error={error} onRetry={() => void refreshRecords()}>{null}</AsyncStateView>;
  if (!currentRecord) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 text-center">
        <AlertCircle className="h-12 w-12 text-brand-red" />
        <h2 className="text-xl font-bold text-text-primary">Payment Record Not Found</h2>
        <p className="max-w-md text-sm text-text-secondary">
          No payment record matches reference &quot;{paymentId}&quot;. Please verify the URL or select a student from the payment list.
        </p>
        <Button
          onClick={() => navigate("/payment")}
          variant="burgundy"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Payments
        </Button>
      </div>
    );
  }

  // Course balance calculation for tab badge
  const totalCoursePaid = currentRecord.history
    .filter(
      (h) =>
        (h.status === "Successful" || h.status === "Settled") &&
        (!h.feeCategory ||
          h.feeCategory === "Course Fee" ||
          (!h.note?.toLowerCase().includes("application") && !h.note?.toLowerCase().includes("seat"))),
    )
    .reduce((sum, h) => sum + h.amount, 0);

  const courseBalance = currentRecord.outstandingAmount ?? Math.max(0, currentRecord.totalFee - totalCoursePaid);

  // Application fee settlement check
  const hasPaidAppFee = currentRecord.history.some(
    (h) =>
      (h.status === "Successful" || h.status === "Settled") &&
      (h.feeCategory === "Application Fee" || h.note?.toLowerCase().includes("application") || h.note?.toLowerCase().includes("seat")),
  );

  // Download receipt action
  const handleDownloadReceipt = (receiptNo?: string, _title?: string) => {
    const transaction = receiptNo ? currentRecord.history.find(h => h.receiptNo === receiptNo) : currentRecord.history[0];
    if (!transaction) { toast.info("No receipt has been recorded for this payment yet."); return; }
    void downloadPaymentReceipt(transaction.id);
  };

  const studentProfileUrl = `/college/students/${currentRecord.student.id}`;
  const breadcrumbItems = [{ name: "Payment", path: "/payment" }, { name: `Settle Payment (${currentRecord.student.name})` }];

  // 3 Tabs requested: 1. Course Fees, 2. ApplicationFees, 3. Other Payment Option
  const settleTabs: TabItem<SettleTabId>[] = [
    {
      id: "course-fees",
      label: "Course Fees",
      shortLabel: "Course Fees",
      icon: GraduationCap,
      badge: courseBalance === 0 ? "Paid" : `${currentRecord.currency} ${courseBalance.toLocaleString()}`,
      badgeVariant: courseBalance === 0 ? "success" : "alert",
      content: (
        <CourseFeesTab
          record={currentRecord}
          onUpdate={refreshRecords}
        />
      ),
      hasChildTabs: false,
    },
    {
      id: "application-fees",
      label: "ApplicationFees",
      shortLabel: "Application",
      icon: FileText,
      badge: hasPaidAppFee ? "Settled" : `${currentRecord.currency} ${currentRecord.applicationFees || 0}`,
      badgeVariant: hasPaidAppFee ? "success" : "neutral",
      content: (
        <ApplicationFeesTab
          record={currentRecord}
          onUpdate={refreshRecords}
        />
      ),
      hasChildTabs: false,
    },
    {
      id: "other-payments",
      label: "Other Payment Option",
      shortLabel: "Other Options",
      icon: Layers,
      badge: String(currentRecord.otherPayments?.length || 0),
      badgeVariant: "purple",
      content: (
        <OtherPaymentOptionsTab
          record={currentRecord}
          onUpdate={refreshRecords}
        />
      ),
      hasChildTabs: false,
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto w-full space-y-4 pb-12 pt-1"
    >
      {/* 1. Page Header & Breadcrumb Banner with Direct Student Profile Redirect Link */}
      <motion.div variants={sectionVariants}>
        <BreadcrumbBanner
          title={`Settle Payment • ${currentRecord.student.name}`}
          items={breadcrumbItems}
          showBackButton={true}
          backPath="/payment"
          containerClassName="mb-0"
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={studentProfileUrl}
                className="shadow-2xs inline-flex items-center gap-1.5 rounded-xl border border-burgundy-primary/30 bg-white px-3.5 py-1.5 text-xs font-bold text-burgundy-primary transition-all hover:bg-brand-light-red/40 hover:text-burgundy-sidebar active:scale-95"
                title={`View ${currentRecord.student.name}'s profile`}
              >
                <User className="h-3.5 w-3.5" />
                <span>View Student Profile</span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </Link>

              <Button
                variant="burgundy"
                size="sm"
                onClick={() => handleDownloadReceipt(undefined, "Official Fee Statement")}
                className="gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Statement</span>
              </Button>
            </div>
          }
        />
      </motion.div>

      {/* 3. Three Payment Settlement Tabs: Course Fees, ApplicationFees, Other Payment Option */}
      <motion.div variants={sectionVariants}>
        <Tabs<SettleTabId>
          items={settleTabs}
          value={activeTab}
          onChange={(tabId) => setActiveTab(tabId)}
          defaultValue="course-fees"
          storageKey={`ams_settle_payment_tab_${currentRecord.id}`}
          variant="folder"
          align="equal"
          equalWidth={true}
          ariaLabel="Student Payment Settlement Options"
          layoutId="settlePaymentTabsIndicator"
        />
      </motion.div>
    </motion.div>
  );
};

export default SettlePaymentPage;
