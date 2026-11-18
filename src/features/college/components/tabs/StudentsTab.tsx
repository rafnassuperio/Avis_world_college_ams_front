import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Trash2,
  Calendar,
  MapPin,
  CreditCard,
  RotateCcw,
  GraduationCap,
  CalendarRange,
  Clock,
  CheckCircle2,
  X,
  UserPlus,
  UploadCloud,
} from "lucide-react";
import { initialStudentsData } from "../../data/collegeTabData";
import { CollegeStudent } from "../../types";
import { DataTable, ColumnDef } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { AddStudentModal } from "../AddStudentModal";
import { BulkUploadModal } from "../BulkUploadModal";
import { Avatar } from "@/components/ui/Avatar";
import { FilterSelect, FilterSelectOption, FilterSelectProps } from "@/components/ui/FilterSelect";
import { SearchInput } from "@/components/ui/SearchInput";
import { Pagination } from "@/components/ui/Pagination";
import { toast } from "@/components/common/ToastMessage";
import { cn } from "@/lib/utils";
import { safeStorage } from "@/lib/security";
import { useAppStore } from "@/store/useAppStore";
import countryData from "@/data/country.json";

// Re-export for convenience
export { FilterSelect, type FilterSelectOption, type FilterSelectProps, DeleteModal, Pagination, SearchInput };

export const ENROLLMENT_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const STUDENT_STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Enrolled: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  Approved: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
    dot: "bg-sky-500",
  },
  Reported: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    dot: "bg-purple-500",
  },
  Rejected: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    dot: "bg-rose-500",
  },
};

const MONTH_LOOKUP: Record<string, string> = {
  jan: "January",
  feb: "February",
  mar: "March",
  apr: "April",
  may: "May",
  jun: "June",
  jul: "July",
  aug: "August",
  sep: "September",
  oct: "October",
  nov: "November",
  dec: "December",
};

/** Extract enrollment month and year from varied date formats reliably */
export const getEnrollmentDateParts = (dateStr?: string): { month: string; year: string } => {
  if (!dateStr) return { month: "", year: "" };
  const lower = dateStr.toLowerCase();

  let matchedMonth = "";
  for (const [short, full] of Object.entries(MONTH_LOOKUP)) {
    if (lower.includes(short) || lower.includes(full.toLowerCase())) {
      matchedMonth = full;
      break;
    }
  }

  const yearMatch = dateStr.match(/\b(20\d{2}|19\d{2})\b/);
  let matchedYear = yearMatch ? yearMatch[1] : "";

  if (!matchedMonth || !matchedYear) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      if (!matchedMonth) matchedMonth = ENROLLMENT_MONTHS[d.getMonth()] || "";
      if (!matchedYear) matchedYear = d.getFullYear().toString();
    }
  }

  return { month: matchedMonth, year: matchedYear };
};

export interface StudentsTabProps {
  students?: CollegeStudent[];
  className?: string;
  statusFilter?: string;
  onDelete?: (studentId: string) => void;
  onAddStudent?: (student: CollegeStudent) => void;
}

const STUDENTS_STORAGE_KEY = "ams_college_students_list";

export const StudentsTab: React.FC<StudentsTabProps> = ({ students = initialStudentsData, className, statusFilter, onDelete, onAddStudent }) => {
  const [studentList, setStudentList] = useState<CollegeStudent[]>(() => {
    return safeStorage.getItem<CollegeStudent[]>(STUDENTS_STORAGE_KEY, students);
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 6 Dedicated Filter States matching user specifications
  const [selectedCourse, setSelectedCourse] = useState<string>("All Courses");
  const [selectedIntake, setSelectedIntake] = useState<string>("All Intakes");
  const [selectedStatus, setSelectedStatus] = useState<string>("All Status");
  const [selectedMonth, setSelectedMonth] = useState<string>("All Months");
  const [selectedYear, setSelectedYear] = useState<string>("All Years");
  const [selectedCountry, setSelectedCountry] = useState<string>("All Countries");

  // Reusable Pagination States
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(8);

  const [studentToDelete, setStudentToDelete] = useState<CollegeStudent | null>(null);

  // Sync with prop updates if external data changes
  useEffect(() => {
    if (students && students.length > 0) {
      setStudentList(students);
    }
  }, [students]);

  // Listen for global bulk upload updates
  useEffect(() => {
    const handleStorageSync = () => {
      const stored = safeStorage.getItem<CollegeStudent[]>(STUDENTS_STORAGE_KEY, initialStudentsData);
      setStudentList(stored);
    };
    window.addEventListener("ams_students_updated", handleStorageSync);
    return () => window.removeEventListener("ams_students_updated", handleStorageSync);
  }, []);

  // Open add student modal automatically when triggered via quick actions
  useEffect(() => {
    try {
      if (sessionStorage.getItem("ams_open_add_student") === "true") {
        sessionStorage.removeItem("ams_open_add_student");
        setIsAddModalOpen(true);
      }
    } catch {
      // Storage fallback
    }
  }, []);

  // Unique courses from student registry
  const availableCourses = useMemo(() => {
    const courses = new Set<string>();
    studentList.forEach((s) => {
      if (s.course) courses.add(s.course);
    });
    return Array.from(courses).sort((a, b) => a.localeCompare(b));
  }, [studentList]);

  // Unique intakes from student registry
  const availableIntakes = useMemo(() => {
    const intakes = new Set<string>();
    studentList.forEach((s) => {
      if (s.intake) intakes.add(s.intake);
    });
    return Array.from(intakes).sort((a, b) => a.localeCompare(b));
  }, [studentList]);

  // Unique enrollment years from student registry
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    studentList.forEach((s) => {
      const dateStr = s.enrollmentDate || s.joinedDate || s.admissionDate;
      const { year } = getEnrollmentDateParts(dateStr);
      if (year) years.add(year);
    });
    if (years.size === 0) {
      years.add("2026");
      years.add("2025");
      years.add("2024");
    }
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [studentList]);

  // Determine active student type filter: from CollegeTabs prop if present
  const effectiveTypeFilter = useMemo(() => {
    if (statusFilter && statusFilter.toLowerCase() !== "all") {
      const lower = statusFilter.toLowerCase();
      if (lower === "int" || lower === "international students" || lower === "international") {
        return "International";
      }
      if (lower === "loc" || lower === "local students" || lower === "local") {
        return "Local";
      }
      if (lower === "ovs" || lower === "overseas students" || lower === "overseas") {
        return "Overseas";
      }
      return statusFilter;
    }
    return "All";
  }, [statusFilter]);

  // Reset pagination to first page when search or any filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCourse, selectedIntake, selectedStatus, selectedMonth, selectedYear, selectedCountry, effectiveTypeFilter]);

  // Filter students by search, type, and the 6 specific filters
  const filteredStudents = useMemo(() => {
    return studentList.filter((student) => {
      // Search matching across multiple fields
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        student.name.toLowerCase().includes(query) ||
        student.studentId.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query) ||
        (student.passportOrNric && student.passportOrNric.toLowerCase().includes(query)) ||
        (student.country && student.country.toLowerCase().includes(query)) ||
        (student.location && student.location.toLowerCase().includes(query)) ||
        student.nationality.toLowerCase().includes(query) ||
        student.course.toLowerCase().includes(query) ||
        student.courseCode.toLowerCase().includes(query);

      // Student type matching (International / Local / Overseas)
      const matchesType =
        effectiveTypeFilter === "All" ||
        student.studentType?.toLowerCase() === effectiveTypeFilter.toLowerCase() ||
        (effectiveTypeFilter === "International" && student.nationality !== "Mauritius") ||
        (effectiveTypeFilter === "Local" && student.nationality === "Mauritius");

      // 1. Filter by Course
      const matchesCourse =
        selectedCourse === "All Courses" ||
        student.course.toLowerCase() === selectedCourse.toLowerCase() ||
        student.courseCode.toLowerCase() === selectedCourse.toLowerCase();

      // 2. Filter by Intakes
      const matchesIntake = selectedIntake === "All Intakes" || student.intake.toLowerCase() === selectedIntake.toLowerCase();

      // 3. Filter by Status
      const matchesStatus =
        selectedStatus === "All Status" || selectedStatus === "All" || student.status.toLowerCase() === selectedStatus.toLowerCase();

      // 4 & 5. Enrollment Month & Year
      const { month: studentMonth, year: studentYear } = getEnrollmentDateParts(
        student.enrollmentDate || student.joinedDate || student.admissionDate,
      );

      const matchesMonth = selectedMonth === "All Months" || studentMonth.toLowerCase() === selectedMonth.toLowerCase();

      const matchesYear = selectedYear === "All Years" || studentYear === selectedYear;

      // 6. Filter by Country
      const matchesCountry =
        selectedCountry === "All Countries" ||
        student.country?.toLowerCase() === selectedCountry.toLowerCase() ||
        student.nationality?.toLowerCase() === selectedCountry.toLowerCase() ||
        student.location?.toLowerCase().includes(selectedCountry.toLowerCase());

      return matchesSearch && matchesType && matchesCourse && matchesIntake && matchesStatus && matchesMonth && matchesYear && matchesCountry;
    });
  }, [studentList, searchQuery, effectiveTypeFilter, selectedCourse, selectedIntake, selectedStatus, selectedMonth, selectedYear, selectedCountry]);

  // Paginated students slice for current page
  const totalItems = filteredStudents.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredStudents.slice(startIndex, startIndex + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  // Determine active filter count
  const isCourseFiltered = selectedCourse !== "All Courses";
  const isIntakeFiltered = selectedIntake !== "All Intakes";
  const isStatusFiltered = selectedStatus !== "All Status" && selectedStatus !== "All";
  const isMonthFiltered = selectedMonth !== "All Months";
  const isYearFiltered = selectedYear !== "All Years";
  const isCountryFiltered = selectedCountry !== "All Countries";

  const activeFilterCount =
    (isCourseFiltered ? 1 : 0) +
    (isIntakeFiltered ? 1 : 0) +
    (isStatusFiltered ? 1 : 0) +
    (isMonthFiltered ? 1 : 0) +
    (isYearFiltered ? 1 : 0) +
    (isCountryFiltered ? 1 : 0);

  const hasAnyFilters = activeFilterCount > 0 || searchQuery.trim() !== "";

  // Reset all 6 filters, pagination, and search
  const handleResetFilters = () => {
    setSelectedCourse("All Courses");
    setSelectedIntake("All Intakes");
    setSelectedStatus("All Status");
    setSelectedMonth("All Months");
    setSelectedYear("All Years");
    setSelectedCountry("All Countries");
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Handle student deletion
  const handleConfirmDelete = () => {
    if (!studentToDelete) return;

    const target = studentToDelete;
    const updated = studentList.filter((s) => s.id !== target.id);
    setStudentList(updated);
    safeStorage.setItem(STUDENTS_STORAGE_KEY, updated);
    onDelete?.(target.id);
    useAppStore.getState().addActivity({
      id: `act-${Date.now()}`,
      type: 'admission',
      title: 'Student record removed',
      detail: `${target.name} (${target.studentId})`,
      timeAgo: 'Just now',
      timestamp: new Date().toISOString(),
      iconName: 'Trash2',
      badge: 'Admissions',
      performedBy: 'Admissions Desk',
      path: '/college',
      targetTab: 'students',
      status: 'review',
      metadata: {
        'Student ID': target.studentId,
        'Program': target.course,
      },
    });
    toast.success(`Student ${target.name} (${target.studentId}) was removed from the registry.`);
    setStudentToDelete(null);
  };

  // Handle new student enrollment
  const handleAddStudent = (newStudent: CollegeStudent) => {
    const updated = [newStudent, ...studentList];
    setStudentList(updated);
    safeStorage.setItem(STUDENTS_STORAGE_KEY, updated);
    onAddStudent?.(newStudent);
    useAppStore.getState().addActivity({
      id: `act-${Date.now()}`,
      type: 'admission',
      title: 'New student enrolled',
      detail: `${newStudent.name} (${newStudent.course})`,
      timeAgo: 'Just now',
      timestamp: new Date().toISOString(),
      iconName: 'UserPlus',
      badge: 'Admissions',
      performedBy: 'Admissions Desk',
      path: '/college',
      targetTab: 'students',
      status: 'completed',
      metadata: {
        'Student ID': newStudent.studentId,
        'Program': newStudent.course,
        'Campus Intake': newStudent.intake,
        'Status': newStudent.status,
      },
    });
    toast.success(`Student ${newStudent.name} (${newStudent.studentId}) was successfully added!`);
  };

  // Render Status Badge
  const renderStatusBadge = (status: string) => {
    const current = STUDENT_STATUS_CONFIG[status] || {
      bg: "bg-brand-bg",
      text: "text-text-secondary",
      border: "border-brand-border",
      dot: "bg-text-muted",
    };

    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors",
          current.bg,
          current.text,
          current.border,
        )}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full", current.dot)} />
        {status}
      </span>
    );
  };

  // Define Columns exactly matching the prompt:
  // #, Image, Full Name, Passport/NRIC, Country/Location, Course, Admission Date, Enrollment Date, Status, Actions (Delete)
  const columns: ColumnDef<CollegeStudent>[] = useMemo(
    () => [
      {
        key: "index",
        header: "#",
        width: 60,
        minWidth: 50,
        maxWidth: 80,
        headerClassName: "text-center",
        className: "text-center",
        cell: (_student, index) => (
          <span className="font-mono text-xs font-bold text-text-muted">{String((currentPage - 1) * pageSize + index + 1).padStart(2, "0")}</span>
        ),
      },
      {
        key: "image",
        header: "Image",
        width: 80,
        minWidth: 70,
        maxWidth: 100,
        headerClassName: "text-center",
        className: "text-center",
        cell: (student) => (
          <div className="flex justify-center">
            <Link
              to={`/college/students/${student.studentId || student.id}`}
              title={`View ${student.name}'s profile`}
            >
              <Avatar
                src={student.avatar}
                alt={student.name}
                name={student.name}
                size="md"
                className="shadow-2xs ring-2 ring-brand-border/60 transition-transform duration-200 hover:scale-105 hover:ring-burgundy-primary"
              />
            </Link>
          </div>
        ),
      },
      {
        key: "name",
        header: "Full Name",
        width: 220,
        minWidth: 170,
        cell: (student) => (
          <div className="flex flex-col gap-0.5">
            <Link
              to={`/college/students/${student.studentId || student.id}`}
              className="font-bold text-text-primary transition-colors hover:text-burgundy-primary hover:underline"
            >
              {student.name}
            </Link>
            <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
              <span>•</span>
              <span
                className="max-w-[130px]"
                title={student.email}
              >
                {student.email}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "passportOrNric",
        header: "Passport / NRIC",
        width: 170,
        minWidth: 140,
        cell: (student) => {
          const idValue = student.passportOrNric || student.passportNo || student.nric || "N/A";
          return (
            <div className="shadow-2xs inline-flex items-center gap-1.5 rounded-lg border border-brand-border/80 bg-brand-bg/60 px-2 py-1 font-mono text-[11px] font-semibold text-text-primary">
              <CreditCard className="h-3.5 w-3.5 shrink-0 text-burgundy-primary/70" />
              <span>{idValue}</span>
            </div>
          );
        },
      },
      {
        key: "countryLocation",
        header: "Country / Location",
        width: 180,
        minWidth: 140,
        cell: (student) => {
          const loc = student.location || student.country || student.nationality;
          return (
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5 font-medium text-text-primary">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-red/80" />
                <span className="truncate">{loc}</span>
              </div>
              <span className="pl-5 text-[10px] font-medium text-text-muted">{student.studentType || "International"}</span>
            </div>
          );
        },
      },
      {
        key: "course",
        header: "Course",
        width: 240,
        minWidth: 180,
        cell: (student) => (
          <div className="flex flex-col gap-1">
            <span
              className="truncate font-semibold text-text-primary"
              title={student.course}
            >
              {student.course}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="rounded bg-burgundy-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-burgundy-primary">
                {student.courseCode}
              </span>
              <span className="text-[10px] text-text-muted">{student.intake}</span>
            </div>
          </div>
        ),
      },
      {
        key: "admissionDate",
        header: "Admission Date",
        width: 150,
        minWidth: 130,
        cell: (student) => (
          <div className="flex items-center gap-1.5 font-mono text-xs text-text-secondary">
            <Calendar className="h-3.5 w-3.5 text-text-muted" />
            <span>{student.admissionDate || student.joinedDate}</span>
          </div>
        ),
      },
      {
        key: "enrollmentDate",
        header: "Enrollment Date",
        width: 150,
        minWidth: 130,
        cell: (student) => (
          <div className="flex items-center gap-1.5 font-mono text-xs text-text-secondary">
            <Calendar className="h-3.5 w-3.5 text-text-muted" />
            <span>{student.enrollmentDate || student.joinedDate}</span>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        width: 130,
        minWidth: 110,
        cell: (student) => renderStatusBadge(student.status),
      },
      {
        key: "actions",
        header: "Actions",
        width: 110,
        minWidth: 90,
        resizable: false,
        headerClassName: "text-right",
        className: "text-right",
        cell: (student) => (
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setStudentToDelete(student);
              }}
              className="group inline-flex items-center gap-1.5 rounded-lg border border-transparent px-2.5 py-1 text-text-muted transition-all duration-150 hover:border-brand-red/30 hover:bg-brand-light-red hover:text-brand-red active:scale-95"
              title={`Delete student ${student.name}`}
              aria-label={`Delete student ${student.name}`}
            >
              <Trash2 className="h-3.5 w-3.5 transition-transform duration-150 group-hover:scale-110" />
              <span className="text-xs font-semibold text-brand-red">Delete</span>
            </button>
          </div>
        ),
      },
    ],
    [currentPage, pageSize],
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search & Filters Toolbar */}
      <div className="flex flex-col gap-3.5 rounded-2xl border border-brand-border bg-white p-3.5 sm:p-4">
        {/* Top Controls: Search & Action Buttons */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          {/* Search Box */}
          <div className="w-full flex-1 lg:max-w-md">
            <SearchInput
              label="Search Students"
              labelIcon={Search}
              placeholder="Search by student name, ID, passport, or course..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>

          {/* Action Buttons: Bulk Upload & Add Student */}
          <div className="flex items-center gap-2 sm:ml-auto lg:mb-0.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBulkUploadModalOpen(true)}
              className="shadow-xs gap-1.5 rounded-xl border-brand-border bg-white text-xs font-semibold text-text-primary transition-all hover:bg-brand-bg hover:text-burgundy-primary active:scale-95"
              title="Bulk Upload Students from XLSX or CSV spreadsheet"
            >
              <UploadCloud className="h-3.5 w-3.5 text-burgundy-primary" />
              <span>Bulk Upload</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              className="shadow-xs gap-1.5 rounded-xl border-brand-border bg-burgundy-hover text-xs text-white transition-all hover:bg-burgundy-light active:scale-95"
              title="Add New Student"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Add Student</span>
            </Button>
          </div>
        </div>

        {/* Dedicated 5 Filters Section */}
        <div className="flex flex-col gap-2.5 border-t border-brand-border/60 pt-3">
          <div className="flex items-center justify-between">
            {hasAnyFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-red transition-colors hover:underline"
              >
                <RotateCcw className="h-3 w-3" />
                Reset filters
              </button>
            )}
          </div>

          {/* 6 Filters Grid */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {/* 1. Filter by Course */}
            <FilterSelect
              label="Filter by Course"
              icon={GraduationCap}
              value={selectedCourse}
              defaultValue="All Courses"
              searchable={true}
              align="left"
              options={[{ label: "All Courses", value: "All Courses" }, ...availableCourses.map((c) => ({ label: c, value: c }))]}
              onChange={setSelectedCourse}
            />
            {/* 2. Filter by Intakes */}
            <FilterSelect
              label="Filter by Intakes"
              icon={CalendarRange}
              value={selectedIntake}
              defaultValue="All Intakes"
              searchable={false}
              align="left"
              options={[{ label: "All Intakes", value: "All Intakes" }, ...availableIntakes.map((i) => ({ label: i, value: i }))]}
              onChange={setSelectedIntake}
            />
            {/* 3. Filter by Status */}
            <FilterSelect
              label="Filter by Status"
              icon={CheckCircle2}
              value={selectedStatus}
              defaultValue="All Status"
              searchable={false}
              align="left"
              options={[
                { label: "All Status", value: "All Status" },
                { label: "Enrolled", value: "Enrolled", badgeDot: "bg-emerald-500" },
                { label: "Approved", value: "Approved", badgeDot: "bg-sky-500" },
                { label: "Reported", value: "Reported", badgeDot: "bg-purple-500" },
                { label: "Rejected", value: "Rejected", badgeDot: "bg-rose-500" },
              ]}
              onChange={setSelectedStatus}
            />
            {/* 4. Enrollment Month */}
            <FilterSelect
              label="Enrollment Month"
              icon={Calendar}
              value={selectedMonth}
              defaultValue="All Months"
              searchable={true}
              align="right"
              options={[{ label: "All Months", value: "All Months" }, ...ENROLLMENT_MONTHS.map((m) => ({ label: m, value: m }))]}
              onChange={setSelectedMonth}
            />
            {/* 5. Enrollment Year */}
            <FilterSelect
              label="Enrollment Year"
              icon={Clock}
              value={selectedYear}
              defaultValue="All Years"
              searchable={false}
              align="right"
              options={[{ label: "All Years", value: "All Years" }, ...availableYears.map((y) => ({ label: y, value: y }))]}
              onChange={setSelectedYear}
            />
            {/* 6. Filter by Country */}
            <FilterSelect
              label="Filter by Country"
              icon={MapPin}
              value={selectedCountry}
              defaultValue="All Countries"
              searchable={true}
              searchPlaceholder="Search country..."
              align="right"
              options={[
                { label: "All Countries", value: "All Countries" },
                ...countryData.map((c) => ({
                  label: c.name,
                  value: c.name,
                  subLabel: `${c.code} • ${c.nationality}`,
                })),
              ]}
              onChange={setSelectedCountry}
            />
          </div>

          {/* Active Filter Chips & Results Count */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-brand-border/40 pt-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              {activeFilterCount > 0 ? (
                <>
                  <span className="text-[11px] font-medium text-text-muted">Active:</span>
                  {isCourseFiltered && (
                    <span className="inline-flex items-center gap-1 rounded-lg border border-burgundy-primary/25 bg-burgundy-primary/10 px-2 py-0.5 text-[11px] font-semibold text-burgundy-primary">
                      <span>
                        Course: <strong className="font-bold">{selectedCourse}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedCourse("All Courses")}
                        className="ml-0.5 rounded p-0.5 hover:bg-burgundy-primary/20 hover:text-brand-red"
                        title="Remove course filter"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {isIntakeFiltered && (
                    <span className="inline-flex items-center gap-1 rounded-lg border border-burgundy-primary/25 bg-burgundy-primary/10 px-2 py-0.5 text-[11px] font-semibold text-burgundy-primary">
                      <span>
                        Intake: <strong className="font-bold">{selectedIntake}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedIntake("All Intakes")}
                        className="ml-0.5 rounded p-0.5 hover:bg-burgundy-primary/20 hover:text-brand-red"
                        title="Remove intake filter"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {isStatusFiltered && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-burgundy-primary/25 bg-burgundy-primary/10 px-2 py-0.5 text-[11px] font-semibold text-burgundy-primary">
                      {STUDENT_STATUS_CONFIG[selectedStatus]?.dot && (
                        <span className={cn("h-1.5 w-1.5 rounded-full", STUDENT_STATUS_CONFIG[selectedStatus].dot)} />
                      )}
                      <span>
                        Status: <strong className="font-bold">{selectedStatus}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedStatus("All Status")}
                        className="ml-0.5 rounded p-0.5 hover:bg-burgundy-primary/20 hover:text-brand-red"
                        title="Remove status filter"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {isMonthFiltered && (
                    <span className="inline-flex items-center gap-1 rounded-lg border border-burgundy-primary/25 bg-burgundy-primary/10 px-2 py-0.5 text-[11px] font-semibold text-burgundy-primary">
                      <span>
                        Month: <strong className="font-bold">{selectedMonth}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedMonth("All Months")}
                        className="ml-0.5 rounded p-0.5 hover:bg-burgundy-primary/20 hover:text-brand-red"
                        title="Remove month filter"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {isYearFiltered && (
                    <span className="inline-flex items-center gap-1 rounded-lg border border-burgundy-primary/25 bg-burgundy-primary/10 px-2 py-0.5 text-[11px] font-semibold text-burgundy-primary">
                      <span>
                        Year: <strong className="font-bold">{selectedYear}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedYear("All Years")}
                        className="ml-0.5 rounded p-0.5 hover:bg-burgundy-primary/20 hover:text-brand-red"
                        title="Remove year filter"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {isCountryFiltered && (
                    <span className="inline-flex items-center gap-1 rounded-lg border border-burgundy-primary/25 bg-burgundy-primary/10 px-2 py-0.5 text-[11px] font-semibold text-burgundy-primary">
                      <span>
                        Country: <strong className="font-bold">{selectedCountry}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedCountry("All Countries")}
                        className="ml-0.5 rounded p-0.5 hover:bg-burgundy-primary/20 hover:text-brand-red"
                        title="Remove country filter"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="ml-1 text-[11px] font-bold text-brand-red transition-colors hover:underline"
                  >
                    Clear all filters
                  </button>
                </>
              ) : (
                <span className=""></span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Student Records Table */}
      <DataTable<CollegeStudent>
        columns={columns}
        data={paginatedStudents}
        keyExtractor={(student) => student.id}
        layout="fixed"
        density="normal"
        storageKey="ams_college_students_table_widths"
        showResizeGuide={true}
        guideStorageKey="ams_students_tab_resize_guide_v2"
        guideNote={
          <>
            Drag divider lines <span className="font-bold">┊</span> between column headers to resize columns
          </>
        }
        emptyMessage={
          searchQuery ||
          effectiveTypeFilter !== "All" ||
          isCourseFiltered ||
          isIntakeFiltered ||
          isStatusFiltered ||
          isMonthFiltered ||
          isYearFiltered
            ? "No student records match the selected search or filter criteria."
            : "No students registered yet."
        }
      />

      {/* Reusable Pagination Component */}
      {filteredStudents.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={[5, 10, 20]}
          showTotal={true}
          showPageSize={true}
        />
      )}

      {/* Reusable Delete Confirmation Modal */}
      <DeleteModal
        isOpen={Boolean(studentToDelete)}
        onClose={() => setStudentToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Student Record"
        description="Are you sure you want to delete this student record? This action will permanently remove the student profile from Avis World College."
        confirmText="Confirm Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        itemPreview={
          studentToDelete ? (
            <div className="flex items-center gap-3.5 rounded-2xl border border-brand-border/70 bg-brand-bg/50 p-3.5 text-left">
              <Avatar
                src={studentToDelete.avatar}
                alt={studentToDelete.name}
                name={studentToDelete.name}
                size="lg"
                className="shadow-2xs shrink-0 ring-2 ring-brand-border/60"
              />
              <div className="flex-1 overflow-hidden">
                <h4 className="truncate text-sm font-bold text-text-primary">{studentToDelete.name}</h4>
                <div className="mt-0.5 flex items-center gap-2 font-mono text-xs text-text-muted">
                  <span className="font-semibold text-brand-red">{studentToDelete.studentId}</span>
                  <span>•</span>
                  <span>{studentToDelete.passportOrNric || "N/A"}</span>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-text-secondary">
                  <GraduationCap className="h-3.5 w-3.5 shrink-0 text-burgundy-primary" />
                  <span className="truncate">{studentToDelete.course}</span>
                </div>
              </div>
            </div>
          ) : null
        }
      />

      {/* Add New Student Modal */}
      {isAddModalOpen && (
        <AddStudentModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddStudent={handleAddStudent}
        />
      )}

      {/* Bulk Upload Students Modal */}
      {isBulkUploadModalOpen && (
        <BulkUploadModal
          isOpen={isBulkUploadModalOpen}
          onClose={() => setIsBulkUploadModalOpen(false)}
          onSuccess={(newStudents) => {
            const updated = [...newStudents, ...studentList];
            setStudentList(updated);
            safeStorage.setItem(STUDENTS_STORAGE_KEY, updated);
          }}
        />
      )}
    </div>
  );
};

export default StudentsTab;
