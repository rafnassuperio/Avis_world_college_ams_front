import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import BreadcrumbBanner from "@/components/common/BreadcrumbBanner";
import { toast } from "@/components/common/ToastMessage";
import { CollegeDetailsCard, EditCollegeModal, CollegeTabs } from "./components";
import { initialCollegeDetails } from "./data/collegeData";
import { CollegeDetails } from "./types";
import { dashboardContainerVariants, dashboardSectionVariants } from "@/components/animations/transitions";
import { safeStorage } from "@/lib/security";

const CollegePage: React.FC = () => {
  const breadcrumbParts = [{ name: "College" }];
  const shouldReduceMotion = useReducedMotion();

  const [college, setCollege] = useState<CollegeDetails>(() => {
    return safeStorage.getItem<CollegeDetails>("ams_college_details", initialCollegeDetails);
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updateKey, setUpdateKey] = useState(0);

  const handleSaveCollege = (updated: CollegeDetails) => {
    setCollege(updated);
    setUpdateKey((prev) => prev + 1);
    const saved = safeStorage.setItem("ams_college_details", updated);
    if (saved) {
      toast.success("College details have been saved successfully.");
    } else {
      toast.error("Failed to persist changes locally: storage limit exceeded.");
    }
  };

  const containerVariants = shouldReduceMotion ? { hidden: { opacity: 1 }, visible: { opacity: 1 } } : dashboardContainerVariants;

  const sectionVariants = shouldReduceMotion ? { hidden: { opacity: 1 }, visible: { opacity: 1 } } : dashboardSectionVariants;

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
        <CollegeTabs equalWidth fullWidth align="equal" />
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
