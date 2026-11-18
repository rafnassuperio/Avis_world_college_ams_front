import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  GraduationCap,
  Shield,
  FileText,
  DollarSign,
  Briefcase,
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  CalendarCheck,
  FolderGit2,
  LayoutGrid,
  Search,
  X,
  ArrowRight,
  ScrollText,
} from "lucide-react";
import BreadcrumbBanner from "@/components/common/BreadcrumbBanner";
import { Button } from "@/components/ui/Button";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { toast } from "@/components/common/ToastMessage";
import { safeStorage } from "@/lib/security";
import { cn } from "@/lib/utils";
import { dashboardContainerVariants, dashboardSectionVariants } from "@/components/animations/transitions";
import { CollegeStudent } from "./types";
import { initialStudentsData } from "./data/collegeTabData";
import { defaultStudentProfile, StudentDriveLink } from "./data/defaultStudentProfile";
import {
  StudentProfileHeader,
  StudentInfoCard,
  GoogleDriveLinksCard,
  AddGoogleDriveLinkModal,
  EditStudentModal,
  StudentAcademicsTab,
  StudentAttendanceTab,
  StudentDocumentsTab,
  StudentContractsTab,
  ProgressiveCourseModal,
  InfoFieldItem,
} from "./components/student-profile";

const STORAGE_KEY = "ams_college_students_list";

type TabViewId = "overview" | "academics" | "personal" | "attendance" | "fees" | "documents" | "contracts";

export const StudentProfilePage: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  // Active view tab state
  const [activeTab, setActiveTab] = useState<TabViewId>("overview");

  // Profile Search Query state & input ref
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Combine parameter segments in case studentId contains slashes (e.g. ATCG624/09/001)
  const routeStudentId = useMemo(() => {
    const rawId = params.studentId || "";
    const splat = params["*"] || "";
    if (splat) {
      return `${rawId}/${splat}`;
    }
    return rawId;
  }, [params]);

  // Load students list from persistent storage
  const [studentsList, setStudentsList] = useState<CollegeStudent[]>(() => {
    return safeStorage.getItem<CollegeStudent[]>(STORAGE_KEY, initialStudentsData);
  });

  // Find targeted student or default to standard student profile
  const matchedStudent = useMemo(() => {
    if (!routeStudentId) return defaultStudentProfile;
    const lowerTarget = routeStudentId.toLowerCase().trim();
    const decodedTarget = decodeURIComponent(routeStudentId).toLowerCase().trim();

    const found = studentsList.find((s) => {
      const sId = (s.studentId || "").toLowerCase().trim();
      const dbId = (s.id || "").toLowerCase().trim();
      return sId === lowerTarget || sId === decodedTarget || dbId === lowerTarget || dbId === decodedTarget;
    });

    if (found) return found;

    // Fallback: check if target matches default student
    if (lowerTarget.includes("atcg624") || lowerTarget.includes("misriya") || decodedTarget.includes("atcg624")) {
      return defaultStudentProfile;
    }

    return defaultStudentProfile;
  }, [studentsList, routeStudentId]);

  // Active student state
  const [currentStudent, setCurrentStudent] = useState<CollegeStudent>(matchedStudent);

  // Sync state if matched student changes externally
  useEffect(() => {
    if (matchedStudent) {
      setCurrentStudent(matchedStudent);
    }
  }, [matchedStudent]);

  // Modal visibility states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddDriveLinkModalOpen, setIsAddDriveLinkModalOpen] = useState(false);
  const [isProgressiveCourseModalOpen, setIsProgressiveCourseModalOpen] = useState(false);

  // Helper to persist student changes to storage
  const persistStudent = useCallback(
    (updated: CollegeStudent) => {
      setCurrentStudent(updated);

      const existsInList = studentsList.some((s) => s.id === updated.id || s.studentId === updated.studentId);

      let newList: CollegeStudent[];
      if (existsInList) {
        newList = studentsList.map((s) => (s.id === updated.id || s.studentId === updated.studentId ? updated : s));
      } else {
        newList = [updated, ...studentsList];
      }

      setStudentsList(newList);
      safeStorage.setItem(STORAGE_KEY, newList);
      window.dispatchEvent(new Event("ams_students_updated"));
    },
    [studentsList],
  );

  // Status Change Handler
  const handleStatusChange = (newStatus: string) => {
    const updated: CollegeStudent = {
      ...currentStudent,
      status: newStatus,
      editedAt: new Date().toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
    persistStudent(updated);
    toast.success(`Student status changed to "${newStatus}"`);
  };

  // Progressive Course Type Change Handler
  const handleSaveProgressiveCourse = (newCourseType: string) => {
    const updated: CollegeStudent = {
      ...currentStudent,
      courseType: newCourseType,
      editedAt: new Date().toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
    persistStudent(updated);
    setIsProgressiveCourseModalOpen(false);
    toast.success(`Course type updated to "${newCourseType}"`);
  };

  // Avatar Image Change Handler
  const handleAvatarChange = (newUrl: string) => {
    const updated: CollegeStudent = {
      ...currentStudent,
      avatar: newUrl,
      editedAt: new Date().toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
    persistStudent(updated);
  };

  // Delete Student Handler
  const handleConfirmDelete = () => {
    const filteredList = studentsList.filter((s) => s.id !== currentStudent.id && s.studentId !== currentStudent.studentId);
    setStudentsList(filteredList);
    safeStorage.setItem(STORAGE_KEY, filteredList);
    window.dispatchEvent(new Event("ams_students_updated"));
    setIsDeleteModalOpen(false);
    toast.success(`Student "${currentStudent.name}" (${currentStudent.studentId}) was deleted`);
    navigate("/college");
  };

  // Add Google Drive Link Handler
  const handleAddDriveLink = (newLink: { title: string; url: string; category?: string }) => {
    const links = currentStudent.googleDriveLinks || [];
    const createdLink: StudentDriveLink = {
      id: `gdrive-${Date.now()}`,
      title: newLink.title,
      url: newLink.url,
      category: newLink.category || "General",
      addedDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
    const updated: CollegeStudent = {
      ...currentStudent,
      googleDriveLinks: [...links, createdLink],
      editedAt: new Date().toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
    persistStudent(updated);
  };

  // Remove Google Drive Link Handler
  const handleRemoveDriveLink = (linkId: string) => {
    const links = currentStudent.googleDriveLinks || [];
    const updated: CollegeStudent = {
      ...currentStudent,
      googleDriveLinks: links.filter((l) => l.id !== linkId),
    };
    persistStudent(updated);
    toast.info("Google Drive link removed");
  };

  // Format currency
  const formatCurrency = (val: number | string | undefined): string => {
    if (val === undefined || val === null || val === "") return "$0.00";
    const num = typeof val === "number" ? val : parseFloat(val);
    if (isNaN(num)) return String(val);
    return new Intl.NumberFormat("en-SG", {
      style: "currency",
      currency: "SGD",
      minimumFractionDigits: 2,
    }).format(num);
  };

  // Prepare Fields for Academic Information Card
  const academicFields: InfoFieldItem[] = [
    {
      label: "College",
      value: currentStudent.college || "Acetek College",
      badgeVariant: "brand",
    },
    {
      label: "Intake",
      value: currentStudent.intake || "January",
    },
    {
      label: "Intake Name",
      value: currentStudent.intakeName || "HDIT2601",
      isMono: true,
      isCopyable: true,
    },
    {
      label: "Course",
      value: currentStudent.course || "HIGHER DIPLOMA IN IT",
      badgeText: currentStudent.courseCode || "HDIT",
      badgeVariant: "brand",
      colSpan: 2,
    },
    {
      label: "Course Type",
      value: currentStudent.courseType || "Higher Diploma",
      badgeText: currentStudent.courseType || "Higher Diploma",
      badgeVariant: "brand",
    },
    {
      label: "Class",
      value: currentStudent.class || "N/A",
    },
    {
      label: "Highest Academic Qualification",
      value: currentStudent.highestQualification || "OTHER POST-SECONDARY CERTIFICATES",
      colSpan: 2,
    },
    {
      label: "Study Mode",
      value: currentStudent.studyMode || "N/A",
    },
    {
      label: "PE Course Title",
      value: currentStudent.peCourseTitle || "Diploma in Culinary and Baking",
      colSpan: 2,
    },
    {
      label: "Course Delivery Mode",
      value: currentStudent.courseDeliveryMode || "N/A",
    },
    {
      label: "Course Commencement Date",
      value: currentStudent.commencementDate || "05/01/2026",
      isMono: true,
      icon: Calendar,
    },
    {
      label: "Course Completion Date",
      value: currentStudent.completionDate || "05/06/2026",
      isMono: true,
      icon: Calendar,
    },
    {
      label: "Application Date",
      value: currentStudent.applicationDate || "N/A",
      isMono: true,
    },
    {
      label: "Student Status",
      value: currentStudent.studentStatus || "N/A",
      colSpan: 2,
    },
  ];

  // Prepare Fields for Payment Status Card
  const totalFeesNum =
    typeof currentStudent.totalFees === "number" ? currentStudent.totalFees : parseFloat(String(currentStudent.totalFees || 2583.3)) || 2583.3;
  const amountPaidNum =
    typeof currentStudent.amountPaid === "number" ? currentStudent.amountPaid : parseFloat(String(currentStudent.amountPaid || 0)) || 0;
  const pendingAmountNum =
    typeof currentStudent.pendingAmount === "number"
      ? currentStudent.pendingAmount
      : parseFloat(String(currentStudent.pendingAmount || 2583.3)) || 2583.3;
  const paymentPercentage = totalFeesNum > 0 ? Math.min(100, Math.round((amountPaidNum / totalFeesNum) * 100)) : 0;

  const paymentFields: InfoFieldItem[] = [
    {
      label: "Total Fees",
      value: formatCurrency(totalFeesNum),
      rawValue: String(totalFeesNum),
      isMono: true,
      isCopyable: true,
    },
    {
      label: "Amount Paid",
      value: formatCurrency(amountPaidNum),
      rawValue: String(amountPaidNum),
      isMono: true,
    },
    {
      label: "Pending Amount",
      value: formatCurrency(pendingAmountNum),
      rawValue: String(pendingAmountNum),
      isMono: true,
      badgeText: "Outstanding",
      badgeVariant: "rose",
    },
    {
      label: "Payment Status",
      value: currentStudent.paymentStatus || "pending",
      badgeText: (currentStudent.paymentStatus || "pending").toUpperCase(),
      badgeVariant: currentStudent.paymentStatus === "paid" ? "emerald" : currentStudent.paymentStatus === "partial" ? "amber" : "rose",
    },
  ];

  // Prepare Fields for Representative & Agent Card
  const repFields: InfoFieldItem[] = [
    {
      label: "Representative",
      value: currentStudent.representative || "NONE",
    },
    {
      label: "Agent",
      value: currentStudent.agent || "TEMP AGENT",
      badgeText: "Authorized Agency",
      badgeVariant: "neutral",
    },
  ];

  // Prepare Fields for Guardian Details Card
  const guardianFields: InfoFieldItem[] = [
    {
      label: "Name",
      value: currentStudent.guardianName || "none",
    },
    {
      label: "NRIC",
      value: currentStudent.guardianNric || "N/A",
      isMono: true,
      isCopyable: !!currentStudent.guardianNric,
    },
  ];

  // Prepare Fields for Student Informations (Personal & Passports) Card
  const studentInfoFields: InfoFieldItem[] = [
    {
      label: "Student ID",
      value: currentStudent.studentId || "ATCG624/09/001",
      isMono: true,
      isCopyable: true,
      badgeText: "Primary ID",
      badgeVariant: "brand",
    },
    {
      label: "Passport",
      value: currentStudent.passportNo || currentStudent.passportOrNric || "MDFJHFCVFC",
      rawValue: currentStudent.passportNo || currentStudent.passportOrNric || "MDFJHFCVFC",
      isMono: true,
      isCopyable: true,
    },
    {
      label: "New Passport",
      value: currentStudent.newPassport || "N/A",
      isMono: true,
    },
    {
      label: "Date of Birth",
      value: currentStudent.dateOfBirth || "05/09/2000",
      isMono: true,
      icon: Calendar,
    },
    {
      label: "Gender",
      value: currentStudent.gender || "Male",
    },
    {
      label: "Nationality",
      value: currentStudent.nationality || "Indian",
      badgeText: currentStudent.country || "India",
      badgeVariant: "neutral",
    },
    {
      label: "Address",
      value: currentStudent.address || "DCFVGBHNJKL./",
      colSpan: 2,
    },
    {
      label: "Residential Status",
      value: currentStudent.residentialStatus || "N/A",
    },
    {
      label: "Student Type",
      value: currentStudent.studentType || "International",
      badgeText: "Overseas Matriculant",
      badgeVariant: "brand",
    },
    {
      label: "FIN No / Student Pass Holder",
      value: currentStudent.finNumber || "MERDFFB",
      isMono: true,
      isCopyable: true,
    },
    {
      label: "Identity / Pass Type",
      value: currentStudent.identityPassType || "N/A",
    },
    {
      label: "Student Pass Exp Date",
      value: currentStudent.studentPassExpDate || "N/A",
      isMono: true,
    },
    {
      label: "Student Pass Collection Date",
      value: currentStudent.studentPassCollectionDate || "N/A",
      isMono: true,
    },
    {
      label: "Passport Exp Date",
      value: currentStudent.passportExpDate || "N/A",
      isMono: true,
    },
    {
      label: "Embarkment Card Exp Date",
      value: currentStudent.embarkmentCardExpDate || "N/A",
      isMono: true,
    },
    {
      label: "Singapore Phone Number",
      value: (
        <a
          href={`tel:${currentStudent.singaporePhone || currentStudent.phone || "9562941863"}`}
          className="font-mono text-text-primary hover:text-burgundy-primary"
        >
          {currentStudent.singaporePhone || currentStudent.phone || "9562941863"}
        </a>
      ),
      rawValue: currentStudent.singaporePhone || currentStudent.phone || "9562941863",
      isCopyable: true,
      icon: Phone,
    },
    {
      label: "Mobile",
      value: currentStudent.mobile || "N/A",
      icon: Phone,
    },
    {
      label: "E-Mail",
      value: (
        <a
          href={`mailto:${currentStudent.email || "misriyasalim6@gmail.com"}`}
          className="font-mono text-burgundy-primary hover:underline"
        >
          {currentStudent.email || "misriyasalim6@gmail.com"}
        </a>
      ),
      rawValue: currentStudent.email || "misriyasalim6@gmail.com",
      isCopyable: true,
      icon: Mail,
      colSpan: 3,
    },
  ];

  const driveLinksCount = (currentStudent.googleDriveLinks || []).length;

  const tabOptions = [
    { id: "overview" as TabViewId, label: "Overview", icon: LayoutGrid },
    { id: "academics" as TabViewId, label: "Academics", icon: GraduationCap },
    { id: "personal" as TabViewId, label: "Personal & Passes", icon: FileText },
    { id: "attendance" as TabViewId, label: "Attendance & Leave", icon: CalendarCheck },
    { id: "fees" as TabViewId, label: "Fee Settlement", icon: DollarSign },
    {
      id: "documents" as TabViewId,
      label: "Documents",
      icon: FolderGit2,
      badge: driveLinksCount > 0 ? driveLinksCount : undefined,
    },
    { id: "contracts" as TabViewId, label: "Contracts & Letters", icon: ScrollText },
  ];

  // Keyboard shortcut "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter helper for InfoFieldItem[]
  const filterFields = useCallback(
    (fields: InfoFieldItem[]) => {
      if (!searchQuery.trim()) return fields;
      const q = searchQuery.toLowerCase().trim();
      return fields.filter((f) => {
        const labelMatches = f.label.toLowerCase().includes(q);
        const rawMatches = f.rawValue ? f.rawValue.toLowerCase().includes(q) : false;
        const valMatches = typeof f.value === "string" ? f.value.toLowerCase().includes(q) : false;
        const badgeMatches = f.badgeText ? f.badgeText.toLowerCase().includes(q) : false;
        return labelMatches || rawMatches || valMatches || badgeMatches;
      });
    },
    [searchQuery],
  );

  const displayedAcademicFields = useMemo(() => filterFields(academicFields), [filterFields, academicFields]);
  const displayedStudentInfoFields = useMemo(() => filterFields(studentInfoFields), [filterFields, studentInfoFields]);
  const displayedPaymentFields = useMemo(() => filterFields(paymentFields), [filterFields, paymentFields]);
  const displayedRepFields = useMemo(() => filterFields(repFields), [filterFields, repFields]);
  const displayedGuardianFields = useMemo(() => filterFields(guardianFields), [filterFields, guardianFields]);

  const displayedDriveLinks = useMemo(() => {
    const links = currentStudent.googleDriveLinks || [];
    if (!searchQuery.trim()) return links;
    const q = searchQuery.toLowerCase().trim();
    return links.filter(
      (l) => l.title.toLowerCase().includes(q) || (l.category && l.category.toLowerCase().includes(q)) || l.url.toLowerCase().includes(q),
    );
  }, [currentStudent.googleDriveLinks, searchQuery]);

  // Matching other students in the registry for quick navigation
  const otherStudentMatches = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return [];
    const q = searchQuery.toLowerCase().trim();
    return studentsList.filter((s) => {
      const nameMatches = s.name.toLowerCase().includes(q);
      const idMatches = (s.studentId || "").toLowerCase().includes(q);
      const courseMatches = (s.course || "").toLowerCase().includes(q);
      return (nameMatches || idMatches || courseMatches) && s.id !== currentStudent.id && s.studentId !== currentStudent.studentId;
    });
  }, [studentsList, searchQuery, currentStudent]);

  const totalMatchingFields =
    displayedAcademicFields.length +
    displayedStudentInfoFields.length +
    displayedPaymentFields.length +
    displayedRepFields.length +
    displayedGuardianFields.length +
    displayedDriveLinks.length;

  const containerVariants = shouldReduceMotion ? { hidden: { opacity: 1 }, visible: { opacity: 1 } } : dashboardContainerVariants;
  const sectionVariants = shouldReduceMotion ? { hidden: { opacity: 1 }, visible: { opacity: 1 } } : dashboardSectionVariants;
  const iosTabContentVariants = shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.15 },
      }
    : {
        initial: { opacity: 0, y: 10, scale: 0.995 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -8, scale: 0.995 },
        transition: { duration: 0.24, ease: [0.16, 1, 0.3, 1] },
      };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative mx-auto w-full space-y-4 pb-12 pt-1"
    >
      {/* 1. Breadcrumb Banner with Navigation & Primary Action Buttons */}
      <motion.div variants={sectionVariants}>
        <BreadcrumbBanner
          title={currentStudent.name}
          items={[{ name: "College", path: "/college" }, { name: currentStudent.name }]}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/college")}
                className="h-8.5 shadow-2xs rounded-xl border-brand-border bg-white px-3 text-xs font-semibold text-text-secondary transition-all hover:bg-brand-bg hover:text-text-primary"
              >
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Back to Students
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsProgressiveCourseModalOpen(true)}
                className="h-8.5 shadow-2xs rounded-xl bg-burgundy-primary px-3.5 text-xs font-semibold text-white transition-all hover:bg-burgundy-dark"
              >
                <GraduationCap className="mr-1.5 h-3.5 w-3.5" />
                Progressive Course
              </Button>
            </div>
          }
        />
      </motion.div>

      {/* 2. Hero Profile Header (Campus Banner, High-Contrast Title, Avatar, Status Selector, Contacts & 3 KPI Cards) */}
      <motion.div
        variants={sectionVariants}
        className="relative"
      >
        <StudentProfileHeader
          student={currentStudent}
          onStatusChange={handleStatusChange}
          onEditClick={() => setIsEditModalOpen(true)}
          onDeleteClick={() => setIsDeleteModalOpen(true)}
          onAvatarChange={handleAvatarChange}
        />
      </motion.div>

      {/* 3. Modern Segmented Tab Navigation Bar with Search Button */}
      <motion.div
        variants={sectionVariants}
        className="relative z-20"
      >
        <div className="shadow-xs flex flex-col gap-2 rounded-2xl border border-brand-border bg-white p-1.5 md:flex-row md:items-center md:justify-between">
          {/* Left: Tab options (iOS Segue Fluid Segmented Control) */}
          <div className="scrollbar-none relative flex items-center gap-1 overflow-x-auto rounded-xl border border-brand-border/60 bg-brand-bg/80 p-1">
            {tabOptions.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
                  onClick={() => setActiveTab(tab.id)}
                  className="group relative flex shrink-0 select-none items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-primary/40"
                >
                  {/* iOS Liquid Sliding Active Indicator Pill */}
                  {isActive && (
                    <motion.div
                      layoutId="studentProfileTabActivePill"
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-burgundy-primary via-burgundy-primary to-palette-dark-wine shadow-md shadow-burgundy-primary/25 ring-1 ring-white/15"
                      transition={
                        shouldReduceMotion
                          ? { duration: 0 }
                          : {
                              type: "spring",
                              stiffness: 420,
                              damping: 32,
                              mass: 0.8,
                            }
                      }
                    >
                      {/* Apple Specular Glint along top edge */}
                      <div className="absolute inset-x-2 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/35 to-transparent" />
                    </motion.div>
                  )}

                  {/* Subtle Inactive Hover Ghost Pill */}
                  {!isActive && (
                    <div className="absolute inset-0 rounded-lg bg-brand-border/0 transition-colors duration-150 group-hover:bg-brand-border/40" />
                  )}

                  {/* Icon & Label (Elevated z-10 for perfect contrast) */}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-all duration-200",
                        isActive ? "scale-105 text-white" : "text-text-muted group-hover:scale-105 group-hover:text-burgundy-primary",
                      )}
                    />
                    <span
                      className={cn(
                        "transition-colors duration-200",
                        isActive ? "font-bold tracking-tight text-white" : "text-text-secondary group-hover:text-text-primary",
                      )}
                    >
                      {tab.label}
                    </span>

                    {tab.badge !== undefined && (
                      <span
                        className={cn(
                          "py-0.2 rounded-full px-1.5 text-[10px] font-bold transition-all duration-200",
                          isActive
                            ? "backdrop-blur-xs bg-white/20 text-white ring-1 ring-white/20"
                            : "bg-burgundy-primary/10 text-burgundy-primary group-hover:bg-burgundy-primary/20",
                        )}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Right: Premium Unified Search Capsule */}
          <div className="relative flex w-full items-center pr-0 md:w-auto md:shrink-0 md:pr-1">
            <div className="shadow-2xs group relative flex w-full items-center rounded-xl border border-brand-border/80 bg-brand-bg/50 p-1 transition-all duration-200 focus-within:border-burgundy-primary/60 focus-within:bg-white focus-within:ring-2 focus-within:ring-burgundy-primary/10 hover:border-brand-border hover:bg-white md:w-auto">
              <Search className="ml-2 h-3.5 w-3.5 shrink-0 text-text-muted transition-colors group-focus-within:text-burgundy-primary" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search profile details..."
                className="h-7 w-full min-w-0 flex-1 bg-transparent px-2.5 text-xs font-medium text-text-primary placeholder:text-text-muted focus:outline-none sm:w-44 md:w-52 lg:w-60"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mr-1 shrink-0 rounded-md p-1 text-text-muted transition-colors hover:bg-brand-bg hover:text-text-primary"
                  title="Clear search"
                >
                  <X className="h-3 w-3" />
                </button>
              ) : (
                <kbd className="mr-1.5 hidden rounded border border-brand-border bg-white px-1.5 py-0.5 font-mono text-[9px] font-semibold text-text-muted sm:inline-block">
                  /
                </kbd>
              )}
              <button
                type="button"
                onClick={() => searchInputRef.current?.focus()}
                className="shadow-2xs inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-burgundy-primary px-3 py-1 text-xs font-semibold text-white transition-all hover:bg-burgundy-dark active:scale-95"
              >
                <span>Search</span>
              </button>
            </div>

            {/* Registry Student Matches Dropdown */}
            {otherStudentMatches.length > 0 && searchQuery.trim() && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 w-full rounded-2xl border border-brand-border bg-white p-2.5 shadow-dropdown sm:left-auto sm:right-0 sm:w-80">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  Matching Students in Registry ({otherStudentMatches.length})
                </div>
                <div className="mt-1 max-h-56 space-y-1 overflow-y-auto">
                  {otherStudentMatches.slice(0, 5).map((st) => (
                    <button
                      key={st.id || st.studentId}
                      type="button"
                      onClick={() => {
                        navigate(`/college/students/${st.studentId || st.id}`);
                        setSearchQuery("");
                      }}
                      className="flex w-full items-center justify-between rounded-xl p-2 text-left transition-colors hover:bg-brand-bg"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-burgundy-primary/10 text-xs font-bold text-burgundy-primary">
                          {st.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-text-primary">{st.name}</div>
                          <div className="font-mono text-[10px] text-text-muted">
                            {st.studentId} • {st.courseCode || st.course}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="h-3 w-3 text-text-muted" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search Filter Active Feedback Banner */}
        {searchQuery.trim() && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2.5 flex flex-col gap-2 rounded-xl border border-brand-border bg-brand-bg/60 px-4 py-2 text-xs sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 shrink-0 text-burgundy-primary" />
              <span className="leading-snug text-text-secondary">
                Search results for <strong className="text-text-primary">&ldquo;{searchQuery}&rdquo;</strong>:{" "}
                <span className="font-bold text-burgundy-primary">{totalMatchingFields}</span> matching items found across profile details.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="shrink-0 self-end font-semibold text-burgundy-primary hover:underline sm:self-auto"
            >
              Clear Search
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* 4. Tab Views Content */}
      <AnimatePresence mode="wait">
        {/* Tab 1: OVERVIEW (Comprehensive Dossier View) */}
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            variants={iosTabContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative z-10 grid grid-cols-1 gap-4 lg:grid-cols-3"
          >
            {/* Left Column: Academic Information, Personal & Identification, Google Drive Links */}
            <div className="space-y-4 lg:col-span-2">
              {/* Academic Information Card */}
              <StudentInfoCard
                title="Academic Information"
                icon={GraduationCap}
                iconColor="text-burgundy-primary"
                iconBgColor="bg-burgundy-primary/10"
                fields={displayedAcademicFields}
                columns={3}
              />

              {/* Student Informations Card */}
              <StudentInfoCard
                title="Student Informations"
                icon={FileText}
                iconColor="text-burgundy-primary"
                iconBgColor="bg-burgundy-primary/10"
                fields={displayedStudentInfoFields}
                columns={3}
              />

              {/* Google Drive Links Card */}
              <GoogleDriveLinksCard
                links={displayedDriveLinks}
                onAddClick={() => setIsAddDriveLinkModalOpen(true)}
                onRemoveLink={handleRemoveDriveLink}
              />
            </div>

            {/* Right Column: Payment Status, Representative & Agent, Guardian Details */}
            <div className="space-y-4">
              {/* Card: Payment Status */}
              <div className="shadow-xs overflow-hidden rounded-2xl border border-brand-border bg-white transition-shadow hover:shadow-card">
                <div className="flex items-center justify-between border-b border-brand-border/60 bg-gradient-to-r from-brand-bg/40 to-white px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="shadow-2xs flex h-8 w-8 items-center justify-center rounded-xl border border-burgundy-primary/20 bg-burgundy-primary/10 text-burgundy-primary">
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold tracking-tight text-text-primary">Payment Status</h2>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase",
                      currentStudent.paymentStatus === "paid"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : currentStudent.paymentStatus === "partial"
                          ? "border-amber-200 bg-amber-50 text-amber-700"
                          : "border-burgundy-primary/20 bg-burgundy-primary/10 text-burgundy-primary",
                    )}
                  >
                    {currentStudent.paymentStatus || "pending"}
                  </span>
                </div>

                <div className="space-y-4 p-5">
                  {/* Visual Fee Meter */}
                  <div className="rounded-xl border border-brand-border/80 bg-brand-bg/60 p-3.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-text-secondary">Settlement Progress</span>
                      <span className="font-mono font-bold text-text-primary">{paymentPercentage}% Paid</span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-brand-border">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${paymentPercentage}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-text-muted">
                      <span>Paid: {formatCurrency(amountPaidNum)}</span>
                      <span className="font-bold text-rose-600">Pending: {formatCurrency(pendingAmountNum)}</span>
                    </div>
                  </div>

                  {/* Breakdown items */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    {displayedPaymentFields.map((field, fIdx) => (
                      <div
                        key={fIdx}
                        className="shadow-2xs space-y-1 rounded-xl border border-brand-border/60 bg-brand-bg/40 p-3"
                      >
                        <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{field.label}</div>
                        <div className="font-mono text-sm font-bold text-text-primary">{field.value}</div>
                        {field.badgeText && (
                          <span
                            className={`py-0.2 inline-block rounded px-1.5 text-[9px] font-semibold uppercase ${
                              field.badgeVariant === "emerald"
                                ? "bg-emerald-50 text-emerald-700"
                                : field.badgeVariant === "rose"
                                  ? "bg-rose-50 text-rose-700"
                                  : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {field.badgeText}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card: Representative & Agent */}
              <StudentInfoCard
                title="Representative & Agent"
                icon={Briefcase}
                iconColor="text-burgundy-primary"
                iconBgColor="bg-burgundy-primary/10"
                fields={displayedRepFields}
                columns={1}
              />

              {/* Card: Guardian Details */}
              <StudentInfoCard
                title="Guardian Details"
                icon={Shield}
                iconColor="text-burgundy-primary"
                iconBgColor="bg-burgundy-primary/10"
                fields={displayedGuardianFields}
                columns={1}
              />
            </div>
          </motion.div>
        )}

        {/* Tab 2: ACADEMICS TAB */}
        {activeTab === "academics" && (
          <motion.div
            key="academics"
            variants={iosTabContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <StudentAcademicsTab
              student={currentStudent}
              searchQuery={searchQuery}
            />
          </motion.div>
        )}

        {/* Tab 3: PERSONAL & PASSES TAB */}
        {activeTab === "personal" && (
          <motion.div
            key="personal"
            variants={iosTabContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="grid grid-cols-1 gap-4 lg:grid-cols-3"
          >
            <div className="space-y-4 lg:col-span-2">
              <StudentInfoCard
                title="Student Informations"
                icon={FileText}
                iconColor="text-burgundy-primary"
                iconBgColor="bg-burgundy-primary/10"
                fields={displayedStudentInfoFields}
                columns={3}
              />
            </div>
            <div className="space-y-4">
              <StudentInfoCard
                title="Guardian Details"
                icon={Shield}
                iconColor="text-burgundy-primary"
                iconBgColor="bg-burgundy-primary/10"
                fields={displayedGuardianFields}
                columns={1}
              />
              <StudentInfoCard
                title="Representative & Agent"
                icon={Briefcase}
                iconColor="text-burgundy-primary"
                iconBgColor="bg-burgundy-primary/10"
                fields={displayedRepFields}
                columns={1}
              />
            </div>
          </motion.div>
        )}

        {/* Tab 4: ATTENDANCE & LEAVE TAB */}
        {activeTab === "attendance" && (
          <motion.div
            key="attendance"
            variants={iosTabContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <StudentAttendanceTab student={currentStudent} />
          </motion.div>
        )}

        {/* Tab 5: FEES & FINANCIALS TAB */}
        {activeTab === "fees" && (
          <motion.div
            key="fees"
            variants={iosTabContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="shadow-xs rounded-2xl border border-burgundy-primary/20 bg-gradient-to-br from-brand-light-red/30 via-white to-white p-5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-burgundy-primary">Total Course Fees</span>
                <div className="mt-2 font-mono text-2xl font-extrabold text-palette-midnight">{formatCurrency(totalFeesNum)}</div>
                <div className="mt-1 text-xs text-text-muted">Course: {currentStudent.course}</div>
              </div>

              <div className="shadow-xs rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/50 via-white to-white p-5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Amount Paid</span>
                <div className="mt-2 font-mono text-2xl font-extrabold text-emerald-950">{formatCurrency(amountPaidNum)}</div>
                <div className="mt-1 text-xs font-medium text-emerald-700">{paymentPercentage}% Cleared</div>
              </div>

              <div className="shadow-xs rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50/50 via-white to-white p-5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">Pending Amount</span>
                <div className="mt-2 font-mono text-2xl font-extrabold text-rose-950">{formatCurrency(pendingAmountNum)}</div>
                <div className="mt-1 text-xs font-medium text-rose-700">Status: {(currentStudent.paymentStatus || "pending").toUpperCase()}</div>
              </div>
            </div>

            <div className="shadow-xs rounded-2xl border border-brand-border bg-white p-5">
              <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
                <h3 className="text-sm font-bold text-text-primary">Settlement Progress & Breakdown</h3>
                <span
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-xs font-bold uppercase",
                    currentStudent.paymentStatus === "paid"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : currentStudent.paymentStatus === "partial"
                        ? "border-amber-200 bg-amber-50 text-amber-700"
                        : "border-burgundy-primary/20 bg-burgundy-primary/10 text-burgundy-primary",
                  )}
                >
                  {currentStudent.paymentStatus || "pending"}
                </span>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-text-secondary">Fee Settlement Ratio</span>
                  <span className="font-mono font-bold text-text-primary">{paymentPercentage}% Paid</span>
                </div>
                <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-brand-border">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${paymentPercentage}%` }}
                  />
                </div>
              </div>
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-4">
                {displayedPaymentFields.map((field, fIdx) => (
                  <div
                    key={fIdx}
                    className="rounded-xl border border-brand-border/60 bg-brand-bg/40 p-3.5"
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{field.label}</div>
                    <div className="mt-1 font-mono text-sm font-bold text-text-primary">{field.value}</div>
                    {field.badgeText && (
                      <span className="mt-1 inline-block text-[10px] font-semibold uppercase text-text-muted">{field.badgeText}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 6: DOCUMENTS & GOOGLE DRIVE TAB */}
        {activeTab === "documents" && (
          <motion.div
            key="documents"
            variants={iosTabContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <StudentDocumentsTab
              student={currentStudent}
              onAddClick={() => setIsAddDriveLinkModalOpen(true)}
              onRemoveLink={handleRemoveDriveLink}
            />
          </motion.div>
        )}

        {/* Tab 7: CONTRACTS & OFFICIAL LETTERS TAB */}
        {activeTab === "contracts" && (
          <motion.div
            key="contracts"
            variants={iosTabContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <StudentContractsTab student={currentStudent} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Edit Student Modal */}
      {isEditModalOpen && (
        <EditStudentModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          student={currentStudent}
          onSave={persistStudent}
        />
      )}

      {/* 6. Delete Student Modal */}
      {isDeleteModalOpen && (
        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Student"
          description={`Are you sure you want to permanently delete the profile for ${currentStudent.name}? This will remove all academic history, attached links, and records.`}
          confirmText="Yes, Delete Student"
          itemPreview={
            <div className="rounded-xl border border-brand-border bg-white p-3 text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-burgundy-primary/10 text-sm font-bold text-burgundy-primary">
                  {currentStudent.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-text-primary">{currentStudent.name}</div>
                  <div className="font-mono text-[11px] text-text-muted">
                    {currentStudent.studentId} • {currentStudent.course}
                  </div>
                </div>
              </div>
            </div>
          }
        />
      )}

      {/* 7. Add Google Drive Link Modal */}
      {isAddDriveLinkModalOpen && (
        <AddGoogleDriveLinkModal
          isOpen={isAddDriveLinkModalOpen}
          onClose={() => setIsAddDriveLinkModalOpen(false)}
          onAddLink={handleAddDriveLink}
        />
      )}

      {/* 8. Progressive Course Modal */}
      {isProgressiveCourseModalOpen && (
        <ProgressiveCourseModal
          isOpen={isProgressiveCourseModalOpen}
          onClose={() => setIsProgressiveCourseModalOpen(false)}
          currentCourseType={currentStudent.courseType || "Higher Diploma"}
          studentName={currentStudent.name}
          onSave={handleSaveProgressiveCourse}
        />
      )}
    </motion.div>
  );
};

export default StudentProfilePage;
