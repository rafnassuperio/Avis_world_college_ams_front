import { useAnalytics } from "@/services/analytics";
import { useApiCollection } from "@/hooks/useApiCollection";
import { intakes, categories, overseasRequests } from "@/services/ams";
import React, { useMemo, useState } from "react";
import { GraduationCap, BookOpen, CalendarRange, Layers, Globe2, UploadCloud } from "lucide-react";
import { Tabs, TabItem, TabAlignment } from "@/components/ui/Tabs";
import { CollegeTabId } from "../types";
import { collegeTabsList } from "../data/collegeTabs";
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
  const { data: overview } = useAnalytics();
  const intakeRows = useApiCollection(intakes);
  const categoryRows = useApiCollection(categories);
  const requestRows = useApiCollection(overseasRequests);
  const counts: Record<string, string | number> = { students: overview?.totals.students ?? "—", courses: overview?.totals.courses ?? "—", intakes: intakeRows.loading ? "—" : intakeRows.data.length, categories: categoryRows.loading ? "—" : categoryRows.data.length, "overseas-requests": requestRows.loading ? "—" : requestRows.data.length };
  const [subTabFilters, setSubTabFilters] = useState<Record<string, string>>({
    students: "all",
    courses: "all",
    "overseas-requests": "all",
  });

  const tabContentMap: Record<CollegeTabId, (subTab?: string) => React.ReactNode> = useMemo(
    () => ({
      students: (subTab) => <StudentsTab statusFilter={subTab || "int"} />,
      courses: () => <CoursesTab levelFilter={subTabFilters.courses} />,
      intakes: () => <IntakesTab />,
      categories: () => <CategoriesTab />,
      "overseas-requests": () => <OverseasRequestsTab statusFilter={subTabFilters["overseas-requests"]} />,
      "bulk-upload": () => <BulkUploadTab />,
    }),
    [subTabFilters],
  );

  const tabsWithContent: TabItem<CollegeTabId>[] = useMemo(() => {
    return collegeTabsList.map((tab): TabItem<CollegeTabId> => ({
      ...tab,
      badge: counts[tab.id] ?? tab.badge,
      icon: tabIconMap[tab.iconName],
      content: (_activeTab, activeSubTab) => tabContentMap[tab.id](activeSubTab?.id),
      subTabs: tab.id === "students" && tab.subTabs ? tab.subTabs.map(sub => ({ ...sub, badge: overview ? sub.id === "loc" ? overview.totals.local : sub.id === "ovs" ? overview.totals.overseas : overview.totals.students - overview.totals.local - overview.totals.overseas : "—" })) : tab.subTabs,
      hasChildTabs: tab.hasChildTabs,
    }));
  }, [tabContentMap, overview, intakeRows.data, categoryRows.data, requestRows.data, intakeRows.loading, categoryRows.loading, requestRows.loading]);

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
