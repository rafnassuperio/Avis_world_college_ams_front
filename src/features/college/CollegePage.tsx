import {useSearchParams} from "react-router-dom";
import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import BreadcrumbBanner from "@/components/common/BreadcrumbBanner";
import { toast } from "@/components/common/ToastMessage";
import { CollegeDetailsCard, EditCollegeModal, CollegeTabs } from "./components";
import { findCollege, saveCollege, apiMessage } from "@/services/ams";
import { AsyncStateView } from "@/components/common/AsyncStateView";
import { CollegeDetails, CollegeTabId } from "./types";
import { dashboardContainerVariants, dashboardSectionVariants } from "@/components/animations/transitions";


const CollegePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const searchTab = ["students", "courses", "intakes", "categories", "overseas-requests", "bulk-upload"].includes(requestedTab || "") ? requestedTab as CollegeTabId : undefined;
  const breadcrumbParts = [{ name: "College" }];
  const shouldReduceMotion = useReducedMotion();

  const [college, setCollege] = useState<CollegeDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    try { setCollege(await findCollege()); setError(null); }
    catch (error) { setError(apiMessage(error)); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updateKey, setUpdateKey] = useState(0);

  const handleSaveCollege = async (updated: CollegeDetails) => {
    try {
      await saveCollege(updated);
      await load(); setUpdateKey(prev => prev + 1);
      toast.success("College details have been saved successfully.");
    } catch (error) { toast.error("Unable to save college", { description: apiMessage(error) }); return false; }
  };

  const containerVariants = shouldReduceMotion ? { hidden: { opacity: 1 }, visible: { opacity: 1 } } : dashboardContainerVariants;

  const sectionVariants = shouldReduceMotion ? { hidden: { opacity: 1 }, visible: { opacity: 1 } } : dashboardSectionVariants;

  if (loading || error) return <AsyncStateView isLoading={loading} error={error} onRetry={() => void load()}>{null}</AsyncStateView>;
  if (!college) return <div className="space-y-4">
    <BreadcrumbBanner title="College" items={breadcrumbParts} containerClassName="mb-0" />
    <AsyncStateView isEmpty emptyTitle="College is not configured" emptyMessage="Ask your administrator to configure the college record in the database, then refresh this page.">{null}</AsyncStateView>
  </div>;

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
          title="College"
          items={breadcrumbParts}
          containerClassName="mb-0"
        />
      </motion.div>

      {/* College Details */}
      <motion.div variants={sectionVariants}>
        <CollegeDetailsCard
          key={updateKey}
          college={college}
          onEdit={() => setIsEditModalOpen(true)}
        />
      </motion.div>
      {/* College Tabs */}
      <motion.div variants={sectionVariants}>
        <CollegeTabs equalWidth fullWidth align="equal" activeTab={searchTab} onTabChange={tab => { if (searchTab) setSearchParams(params => { params.set("tab", tab); return params; }); }} />
      </motion.div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <EditCollegeModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          college={college}
          onSave={handleSaveCollege}
        />
      )}
    </motion.div>
  );
};

export default CollegePage;
