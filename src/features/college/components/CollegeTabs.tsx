import React, { useMemo, useState } from "react";
import { GraduationCap, BookOpen, CalendarRange, Layers, Globe2, UploadCloud } from "lucide-react";
import { Tabs, TabItem, TabAlignment } from "@/components/ui/Tabs";
import { CollegeTabId } from "../types";
import { collegeTabsList } from "../data/collegeTabData";
import { StudentsTab, CoursesTab, IntakesTab, CategoriesTab, OverseasRequestsTab, BulkUploadTab } from "./tabs";

const tabIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  GraduationCap,
  BookOpen,
  CalendarRange,
  FolderTree: Layers,
  Layers,
  Globe2,
  UploadCloud,
};

export interface CollegeTabsProps {
  defaultTab?: CollegeTabId;
  activeTab?: CollegeTabId;
  onTabChange?: (tabId: CollegeTabId) => void;
  align?: TabAlignment;
  equalWidth?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export const CollegeTabs: React.FC<CollegeTabsProps> = ({
  defaultTab = "students",
  activeTab,
  onTabChange,
  align = "equal",
  equalWidth = true,
  fullWidth = true,
  className,
}) => {
  const [subTabFilters, setSubTabFilters] = useState<Record<string, string>>({
    students: "all",
    courses: "all",
    "overseas-requests": "all",
  });

  const tabContentMap: Record<CollegeTabId, () => React.ReactNode> = useMemo(
    () => ({
      students: () => <StudentsTab statusFilter={subTabFilters.students} />,
      courses: () => <CoursesTab levelFilter={subTabFilters.courses} />,
      intakes: () => <IntakesTab />,
      categories: () => <CategoriesTab />,
      "overseas-requests": () => <OverseasRequestsTab statusFilter={subTabFilters["overseas-requests"]} />,
      "bulk-upload": () => <BulkUploadTab />,
    }),
    [subTabFilters],
  );

  const tabsWithContent: TabItem<CollegeTabId>[] = useMemo(() => {
    return collegeTabsList.map((tab) => ({
      ...tab,
      icon: tabIconMap[tab.iconName],
      content: tabContentMap[tab.id],
      subTabs: tab.subTabs,
      hasChildTabs: tab.hasChildTabs,
    }));
  }, [tabContentMap]);

  return (
    <Tabs<CollegeTabId>
      items={tabsWithContent}
      defaultValue={defaultTab}
      value={activeTab}
      storageKey="studentsTableActiveTab"
      onChange={(tabId) => onTabChange?.(tabId)}
      onSubTabChange={(subTabId, _subItem, parentTab) => {
        setSubTabFilters((prev) => ({
          ...prev,
          [parentTab.id]: subTabId,
        }));
      }}
      ariaLabel="College Sections Navigation"
      layoutId="collegeTabsIndicator"
      variant="folder"
      className={className}
      align={align}
      equalWidth={equalWidth}
      fullWidth={fullWidth}
    />
  );
};

export default CollegeTabs;
