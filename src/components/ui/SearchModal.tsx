import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Search, X, User, BookOpen, ArrowRight, Shield, Users, Compass, Sparkles, Clock, Trash2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ROUTES } from "@/app/routes";
import { safeStorage } from "@/lib/security";
import { cn } from "@/lib/utils";
import { initialStudentsData } from "@/features/college/data/collegeTabData";
import { initialCoursesData } from "@/features/college/data/collegeTabData";
import { CollegeStudent, CollegeCourse } from "@/features/college/types";
import { getAdminsRoster } from "@/features/admins/data/mockAdminsData";
import { getAgentsList } from "@/features/agents/data/mockAgentsData";
import { getRepresentativesList } from "@/features/representatives/data/mockRepresentativesData";

export type SearchCategory = "All" | "Students" | "Courses" | "Staff" | "Partners" | "Pages";

export interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: "Students" | "Courses" | "Staff" | "Partners" | "Pages";
  path: string;
  meta?: string;
  status?: string;
  avatar?: string;
  code?: string;
  keywords?: string[];
  actionType?: string;
}

export interface RecentSearchItem {
  id: string;
  title: string;
  category: "Students" | "Courses" | "Staff" | "Partners" | "Pages";
  path: string;
  subtitle?: string;
  timestamp: number;
}

const RECENT_SEARCHES_KEY = "ams_recent_searches_v2";

/**
 * Text Highlighting Helper
 * Highlights characters in target text that match query tokens
 */
const HighlightMatch: React.FC<{ text: string; query: string; className?: string }> = ({
  text,
  query,
  className = "font-medium text-text-primary",
}) => {
  if (!query || !query.trim()) {
    return <span className={className}>{text}</span>;
  }

  const trimmed = query.trim();
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));

  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.toLowerCase() === trimmed.toLowerCase() ? (
          <mark
            key={index}
            className="rounded bg-brand-light-red/90 px-0.5 font-bold text-brand-red"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </span>
  );
};

export const SearchModal: React.FC = () => {
  const isSearchOpen = useAppStore((state) => state.isSearchOpen);
  const setIsSearchOpen = useAppStore((state) => state.setIsSearchOpen);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>("All");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMac, setIsMac] = useState(false);

  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Platform detection for keyboard shortcut display
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform || navigator.userAgent || ""));
    }
  }, []);

  // Body scroll locking when modal is open
  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setSelectedCategory("All");
      setSelectedIndex(0);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSearchOpen]);

  // Global keyboard shortcut listener (Cmd+K / Ctrl+K and '/' when not in input)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
        return;
      }

      if (
        !isSearchOpen &&
        e.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName) &&
        !(e.target as HTMLElement)?.isContentEditable
      ) {
        e.preventDefault();
        setIsSearchOpen(true);
        return;
      }

      if (e.key === "Escape" && isSearchOpen) {
        e.preventDefault();
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  // Load and manage recent searches
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>(() => {
    return safeStorage.getItem<RecentSearchItem[]>(RECENT_SEARCHES_KEY, [
      {
        id: "recent-std-1",
        title: "Aarav Patel",
        subtitle: "BSc Data Science & AI • Roll #AWC-2026-0042",
        category: "Students",
        path: "/college/students/AWC-2026-0042",
        timestamp: Date.now() - 1000 * 60 * 15,
      },
      {
        id: "recent-crs-1",
        title: "BSc Data Science & AI",
        subtitle: "BSc-DS • 4 Years • School of Computing & AI",
        category: "Courses",
        path: "/college/courses/BSc-DS",
        timestamp: Date.now() - 1000 * 60 * 60 * 2,
      },
      {
        id: "recent-page-payment",
        title: "Payment Processing & Cashier Hub",
        subtitle: "Fee collections, pending tuition dues, invoices",
        category: "Pages",
        path: "/payment",
        timestamp: Date.now() - 1000 * 60 * 60 * 5,
      },
    ]);
  });

  const saveToRecent = useCallback(
    (item: SearchItem) => {
      const newItem: RecentSearchItem = {
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        category: item.category,
        path: item.path,
        timestamp: Date.now(),
      };

      const updated = [newItem, ...recentSearches.filter((r) => r.id !== item.id && r.path !== item.path)].slice(0, 8);
      setRecentSearches(updated);
      safeStorage.setItem(RECENT_SEARCHES_KEY, updated);
    },
    [recentSearches],
  );

  const removeFromRecent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter((r) => r.id !== id);
    setRecentSearches(updated);
    safeStorage.setItem(RECENT_SEARCHES_KEY, updated);
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    safeStorage.setItem(RECENT_SEARCHES_KEY, []);
  };

  // Compile Comprehensive Search Index across all system data
  const allSearchItems = useMemo<SearchItem[]>(() => {
    // 1. Students
    const rawStudents = safeStorage.getItem<CollegeStudent[]>("ams_college_students_list", initialStudentsData) || initialStudentsData;
    const studentItems: SearchItem[] = rawStudents.map((s) => ({
      id: `std-${s.studentId || s.id}`,
      title: s.name,
      subtitle: `${s.course || "Academic Program"} • Roll #${s.studentId || s.id}`,
      category: "Students",
      path: ROUTES.COLLEGE.getStudentProfile(s.studentId || s.id),
      meta: `${s.intake || ""} • ${s.studentType || "Student"} • ${s.nationality || ""}`,
      status: s.status || "Enrolled",
      avatar: s.avatar,
      code: s.studentId,
      keywords: [s.email, s.phone, s.courseCode, s.passportOrNric, s.nationality, s.location].filter(Boolean) as string[],
    }));

    // 2. Courses
    const rawCourses = safeStorage.getItem<CollegeCourse[]>("ams_college_courses_list", initialCoursesData) || initialCoursesData;
    const courseItems: SearchItem[] = rawCourses.map((c) => ({
      id: `crs-${c.id || c.code}`,
      title: c.title,
      subtitle: `${c.code} • ${c.duration} • ${c.category}`,
      category: "Courses",
      path: ROUTES.COLLEGE.getCourseDetails(c.id || c.code),
      meta: `${c.seats} Seats • ${c.fee || ""} • ${c.level || ""}`,
      status: c.status || "Active",
      code: c.code,
      keywords: [c.code, c.category, c.department, c.level].filter(Boolean) as string[],
    }));

    // 3. Staff & Administrators
    const rawAdmins = getAdminsRoster() || [];
    const staffItems: SearchItem[] = rawAdmins.map((adm) => ({
      id: `adm-${adm.id}`,
      title: adm.name,
      subtitle: `${adm.role} • ${adm.department}`,
      category: "Staff",
      path: adm.role === "Super Admin" ? ROUTES.PROFILE : ROUTES.getAdminProfile(adm.id),
      meta: `${adm.employeeId} • ${adm.location || adm.country}`,
      status: adm.status || "Active",
      avatar: adm.avatarUrl,
      code: adm.employeeId,
      keywords: [adm.email, adm.phone, adm.department, adm.role, adm.accessLevel].filter(Boolean) as string[],
    }));

    // 4. Partners (Agents & Representatives)
    const rawAgents = getAgentsList() || [];
    const rawReps = getRepresentativesList() || [];

    const partnerItems: SearchItem[] = [
      ...rawAgents.map((ag) => ({
        id: `agent-${ag.id}`,
        title: ag.name,
        subtitle: `Agent Partner • ${ag.country} • ${ag.representative || ""}`,
        category: "Partners" as const,
        path: ROUTES.getPartnerProfile("agent", ag.id),
        meta: `Code: ${ag.agentCode} • ${ag.type || "Partner"}`,
        status: ag.status || "Active",
        avatar: ag.avatarUrl,
        code: ag.agentCode,
        keywords: [ag.email, ag.phone, ag.agencyName, ag.country, ag.representative].filter(Boolean) as string[],
      })),
      ...rawReps.map((rp) => ({
        id: `rep-${rp.id}`,
        title: rp.name,
        subtitle: `Representative • ${rp.region || rp.country} • ${rp.organization || ""}`,
        category: "Partners" as const,
        path: ROUTES.getPartnerProfile("representative", rp.id),
        meta: `Code: ${rp.repCode} • Agents: ${rp.agentCount || 0}`,
        status: rp.status || "Active",
        avatar: rp.avatarUrl,
        code: rp.repCode,
        keywords: [rp.email, rp.phone, rp.organization, rp.country, rp.region].filter(Boolean) as string[],
      })),
    ];

    // 5. System Pages & Navigation
    const pageItems: SearchItem[] = [
      {
        id: "page-dashboard",
        title: "Dashboard Overview",
        subtitle: "Institutional KPIs, student enrollment trends, and recent payments",
        category: "Pages",
        path: ROUTES.HOME,
        meta: "Home / Overview",
        keywords: ["dashboard", "home", "metrics", "analytics", "charts", "stats"],
      },
      {
        id: "page-college",
        title: "College & Academic Management",
        subtitle: "Academic programs, student profiles, cohorts, and curricula",
        category: "Pages",
        path: ROUTES.COLLEGE.ROOT,
        meta: "College / Programs",
        keywords: ["college", "academics", "faculty", "curriculum", "courses", "students"],
      },
      {
        id: "page-students-roster",
        title: "Students Roster & Directory",
        subtitle: "Manage registered student profiles, enrollments and academic standing",
        category: "Pages",
        path: ROUTES.COLLEGE.ROOT,
        meta: "College / Students",
        keywords: ["students", "roster", "directory", "enrollments", "admissions", "profiles"],
        actionType: "tab-students",
      },
      {
        id: "page-courses-catalog",
        title: "Courses & Degree Programs Catalog",
        subtitle: "Accredited degree programs, diplomas, and module specifications",
        category: "Pages",
        path: ROUTES.COLLEGE.ROOT,
        meta: "College / Courses",
        keywords: ["courses", "degrees", "diplomas", "programs", "modules", "syllabi"],
        actionType: "tab-courses",
      },
      {
        id: "page-bulk-upload",
        title: "Bulk CSV Data Upload",
        subtitle: "Mass batch import for students, curriculum data, and intake cohorts",
        category: "Pages",
        path: ROUTES.COLLEGE.ROOT,
        meta: "College / Import",
        keywords: ["bulk upload", "import", "csv", "excel", "students import", "batch"],
        actionType: "tab-bulk-upload",
      },
      {
        id: "page-payment-hub",
        title: "Payment Processing & Cashier Hub",
        subtitle: "Fee collections, pending tuition dues, invoices and payment options",
        category: "Pages",
        path: ROUTES.PAYMENT,
        meta: "Finance / Payments",
        keywords: ["payment", "fees", "tuition", "dues", "invoices", "billing", "receipts"],
      },
      {
        id: "page-settle-payment",
        title: "Settle Payment Terminal",
        subtitle: "Record student tuition settlements, cashier reconciliation and receipts",
        category: "Pages",
        path: ROUTES.SETTLE_PAYMENT_BASE,
        meta: "Finance / Settle",
        keywords: ["settle", "settle payment", "cashier", "receipt", "tuition clearance"],
      },
      {
        id: "page-payment-report",
        title: "Payment Audit & Transaction Reports",
        subtitle: "Daily financial ledger, reconciliation reports, and revenue audit logs",
        category: "Pages",
        path: ROUTES.PAYMENT_REPORT,
        meta: "Finance / Audit",
        keywords: ["payment report", "finance audit", "revenue", "transactions", "ledger"],
      },
      {
        id: "page-reports-analytics",
        title: "Institutional Reports & Analytics",
        subtitle: "Cohort attrition, academic performance analytics, and executive reports",
        category: "Pages",
        path: ROUTES.REPORT,
        meta: "Governance / Reports",
        keywords: ["reports", "analytics", "attrition", "statistics", "governance"],
      },
      {
        id: "page-course-commission",
        title: "Course Commission Configuration",
        subtitle: "Agent and regional representative recruitment fee margins",
        category: "Pages",
        path: ROUTES.COMMISSION_CONFIG,
        meta: "Finance / Commission",
        keywords: ["commission", "course commission", "agent fee", "rates", "margins"],
      },
      {
        id: "page-admins-roster",
        title: "Administrators & Staff Roster",
        subtitle: "Institutional system users, staff profiles, and administrative permissions",
        category: "Pages",
        path: ROUTES.ADMINS,
        meta: "Administration / Users",
        keywords: ["admins", "administrators", "staff", "permissions", "roles", "governance"],
      },
      {
        id: "page-agents-directory",
        title: "Global Agents Directory",
        subtitle: "Verified international recruitment agencies and student counselors",
        category: "Pages",
        path: ROUTES.AGENTS,
        meta: "Partners / Agents",
        keywords: ["agents", "consultants", "partners", "recruitment", "overseas"],
      },
      {
        id: "page-reps-directory",
        title: "Regional Representatives Directory",
        subtitle: "Regional college ambassadors and overseas territory directors",
        category: "Pages",
        path: ROUTES.REPRESENTATIVES,
        meta: "Partners / Representatives",
        keywords: ["representatives", "ambassadors", "territory", "regional liaisons"],
      },
      {
        id: "page-institute",
        title: "Institute Profile & Governance",
        subtitle: "Accreditation credentials, campus facilities, and institutional bylaws",
        category: "Pages",
        path: ROUTES.INSTITUTE,
        meta: "Governance / Institute",
        keywords: ["institute", "college profile", "campus", "accreditation", "facilities"],
      },
      {
        id: "page-admin-profile",
        title: "Super Admin Profile & Security",
        subtitle: "Administrative account credentials, 2FA security, and system preferences",
        category: "Pages",
        path: ROUTES.PROFILE,
        meta: "Account / Settings",
        keywords: ["profile", "admin profile", "security", "credentials", "password", "settings"],
      },
    ];

    return [...studentItems, ...courseItems, ...staffItems, ...partnerItems, ...pageItems];
  }, []);

  // Scoring function for ranking search relevance
  const scoreItem = useCallback((item: SearchItem, searchQ: string): number => {
    const q = searchQ.toLowerCase().trim();
    if (!q) return 0;

    const titleLower = item.title.toLowerCase();
    const codeLower = (item.code || "").toLowerCase();
    const subtitleLower = item.subtitle.toLowerCase();
    const metaLower = (item.meta || "").toLowerCase();

    // Exact match
    if (titleLower === q) return 200;
    if (codeLower === q) return 190;

    let score = 0;

    // Title score
    if (titleLower.startsWith(q)) score += 100;
    else if (titleLower.includes(` ${q}`)) score += 75;
    else if (titleLower.includes(q)) score += 50;

    // Code score
    if (codeLower.startsWith(q)) score += 90;
    else if (codeLower.includes(q)) score += 60;

    // Subtitle score
    if (subtitleLower.startsWith(q)) score += 40;
    else if (subtitleLower.includes(q)) score += 25;

    // Meta score
    if (metaLower.includes(q)) score += 15;

    // Keywords score
    if (item.keywords && item.keywords.some((k) => k.toLowerCase().includes(q))) {
      score += 20;
    }

    return score;
  }, []);

  // Filter and score results
  const filteredResults = useMemo(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      if (selectedCategory === "All") {
        return allSearchItems.slice(0, 15);
      }
      return allSearchItems.filter((item) => item.category === selectedCategory).slice(0, 15);
    }

    const scored = allSearchItems
      .map((item) => ({
        item,
        score: scoreItem(item, trimmed),
      }))
      .filter(({ item, score }) => {
        const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
        return matchesCategory && score > 0;
      });

    scored.sort((a, b) => b.score - a.score);
    return scored.map(({ item }) => item);
  }, [allSearchItems, query, selectedCategory, scoreItem]);

  // Compute live count badges for each category
  const categoryCounts = useMemo(() => {
    const counts: Record<SearchCategory, number> = {
      All: 0,
      Students: 0,
      Courses: 0,
      Staff: 0,
      Partners: 0,
      Pages: 0,
    };

    const trimmed = query.trim();

    allSearchItems.forEach((item) => {
      const isMatch = !trimmed || scoreItem(item, trimmed) > 0;
      if (isMatch) {
        counts.All += 1;
        counts[item.category] += 1;
      }
    });

    return counts;
  }, [allSearchItems, query, scoreItem]);

  // Reset selected index when query or category changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, selectedCategory]);

  // Auto-scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [selectedIndex]);

  // Handle selecting an item
  const handleSelect = (item: SearchItem) => {
    saveToRecent(item);
    setIsSearchOpen(false);

    // If item requests a specific tab on college page
    if (item.actionType === "tab-students") {
      safeStorage.setItem("studentsTableActiveTab", "students");
    } else if (item.actionType === "tab-courses") {
      safeStorage.setItem("studentsTableActiveTab", "courses");
    } else if (item.actionType === "tab-bulk-upload") {
      safeStorage.setItem("studentsTableActiveTab", "bulk-upload");
    }

    navigate(item.path);
  };

  // Keyboard navigation within the modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (filteredResults.length === 0 ? 0 : (prev + 1) % filteredResults.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (filteredResults.length === 0 ? 0 : (prev - 1 + filteredResults.length) % filteredResults.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        handleSelect(filteredResults[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsSearchOpen(false);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const categories: SearchCategory[] = ["All", "Students", "Courses", "Staff", "Partners", "Pages"];
      const currentIndex = categories.indexOf(selectedCategory);
      const nextIndex = e.shiftKey ? (currentIndex - 1 + categories.length) % categories.length : (currentIndex + 1) % categories.length;
      setSelectedCategory(categories[nextIndex]);
    }
  };

  // Category Icon resolver
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Students":
        return <User className="h-4 w-4 text-brand-red" />;
      case "Courses":
        return <BookOpen className="h-4 w-4 text-burgundy-primary" />;
      case "Staff":
        return <Shield className="h-4 w-4 text-purple-700" />;
      case "Partners":
        return <Users className="h-4 w-4 text-amber-700" />;
      case "Pages":
        return <Compass className="h-4 w-4 text-blue-600" />;
      default:
        return <Search className="h-4 w-4 text-text-secondary" />;
    }
  };

  // Category icon background
  const getCategoryIconBg = (category: string) => {
    switch (category) {
      case "Students":
        return "bg-brand-light-red/60 text-brand-red border border-brand-red/20";
      case "Courses":
        return "bg-burgundy-primary/10 text-burgundy-primary border border-burgundy-primary/20";
      case "Staff":
        return "bg-purple-100 text-purple-700 border border-purple-200";
      case "Partners":
        return "bg-amber-100 text-amber-700 border border-amber-200";
      case "Pages":
        return "bg-blue-100 text-blue-700 border border-blue-200";
      default:
        return "bg-brand-bg text-text-secondary border border-brand-border";
    }
  };

  // Status pill indicator
  const renderStatusBadge = (status?: string) => {
    if (!status) return null;
    const s = status.toLowerCase();

    let colorClasses = "bg-gray-100 text-gray-700 border-gray-200";
    if (["enrolled", "active", "approved", "verified", "cleared"].includes(s)) {
      colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-200";
    } else if (["reported", "review", "under review", "away", "pending"].includes(s)) {
      colorClasses = "bg-amber-50 text-amber-800 border-amber-200";
    } else if (["rejected", "suspended", "inactive", "overdue"].includes(s)) {
      colorClasses = "bg-rose-50 text-rose-700 border-rose-200";
    }

    return (
      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${colorClasses}`}>
        {status}
      </span>
    );
  };

  const categoriesList: SearchCategory[] = ["All", "Students", "Courses", "Staff", "Partners", "Pages"];

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Global Search Command Palette"
          className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-16 sm:px-6 md:pt-24"
        >
          {/* Glassmorphic Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsSearchOpen(false)}
            className="fixed inset-0 bg-black/70"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -16 }}
            transition={{ type: "spring", damping: 28, stiffness: 380 }}
            onKeyDown={handleKeyDown}
            className="relative z-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-brand-border/90 bg-white shadow-[0_25px_60px_-15px_rgba(66,27,41,0.25)]"
          >
            {/* Search Input Bar */}
            <div className="relative flex items-center border-b border-brand-border/80 bg-white px-4 py-3.5">
              <Search className="h-5 w-5 flex-shrink-0 text-brand-red transition-transform duration-200" />

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search students, courses, staff, partners, pages..."
                className="ml-3 w-full bg-transparent text-sm font-medium text-text-primary placeholder:text-text-muted focus:outline-none sm:text-base"
                autoComplete="off"
                spellCheck={false}
              />

              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="mr-2 rounded-full p-1 text-text-secondary transition-colors hover:bg-brand-bg hover:text-text-primary"
                  title="Clear search text"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              <kbd className="hidden select-none items-center gap-1 rounded-md border border-brand-border bg-brand-bg px-2 py-0.5 text-[10px] font-semibold text-text-muted sm:inline-flex">
                ESC
              </kbd>
            </div>

            {/* Category Filter Pills Bar */}
            <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto border-b border-brand-border/70 bg-brand-bg/60 px-4 py-2 text-xs">
              {categoriesList.map((cat) => {
                const count = categoryCounts[cat];
                const isSelected = selectedCategory === cat;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "group flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200",
                      isSelected
                        ? "bg-brand-red text-white shadow-sm ring-1 ring-brand-red"
                        : "border border-brand-border bg-white text-text-secondary hover:border-brand-accent/30 hover:bg-white hover:text-text-primary",
                    )}
                  >
                    <span>{cat}</span>
                    <span
                      className={cn(
                        "py-0.2 rounded-full px-1.5 text-[10px] font-bold transition-colors",
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-brand-bg text-text-secondary group-hover:bg-brand-light-red/40 group-hover:text-brand-red",
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Content Body */}
            <div className="max-h-[380px] divide-y divide-brand-border/50 overflow-y-auto p-2 sm:max-h-[420px]">
              {/* Zero-Query State: Recent Searches & Quick Suggested Links */}
              {!query.trim() && selectedCategory === "All" && (
                <div className="space-y-4 p-2">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="mb-2 flex items-center justify-between px-2 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-brand-red" />
                          <span>Recent Searches</span>
                        </div>
                        <button
                          type="button"
                          onClick={clearAllRecent}
                          className="flex items-center gap-1 text-[10px] font-medium text-text-muted transition-colors hover:text-brand-red"
                        >
                          <Trash2 className="h-3 w-3" />
                          Clear all
                        </button>
                      </div>

                      <div className="space-y-1">
                        {recentSearches.map((recent) => (
                          <div
                            key={recent.id}
                            onClick={() => {
                              setIsSearchOpen(false);
                              navigate(recent.path);
                            }}
                            className="group flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 transition-all hover:bg-brand-bg hover:shadow-sm"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand-light-red/40 text-brand-red">
                                <Clock className="h-3.5 w-3.5" />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-xs font-semibold text-text-primary group-hover:text-brand-red">{recent.title}</p>
                                {recent.subtitle && <p className="truncate text-[11px] text-text-secondary">{recent.subtitle}</p>}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="rounded-md border border-brand-border bg-white px-1.5 py-0.5 text-[9px] font-medium text-text-muted">
                                {recent.category}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => removeFromRecent(recent.id, e)}
                                className="rounded p-1 text-text-muted opacity-0 transition-opacity hover:text-brand-red group-hover:opacity-100"
                                title="Remove from recent"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular Quick Suggestions Chips */}
                  <div>
                    <div className="mb-2 flex items-center gap-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      <span>Popular Search Suggestions</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 px-2">
                      {[
                        "BSc Data Science",
                        "Aarav Patel",
                        "Dr. Sarah Jenkins",
                        "Settle Payment",
                        "Bulk Upload",
                        "EduGlobal",
                        "Tuition Fee",
                        "AWC-ADM",
                      ].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setQuery(tag)}
                          className="rounded-full border border-brand-border bg-brand-bg px-2.5 py-1 text-xs font-medium text-text-secondary transition-colors hover:border-brand-accent/40 hover:bg-brand-light-red/30 hover:text-brand-red"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Active Results List */}
              {filteredResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light-red/50 text-brand-red">
                    <Search className="h-6 w-6 opacity-75" />
                  </div>
                  <h4 className="mt-3 text-sm font-semibold text-text-primary">No matching results found</h4>
                  <p className="mt-1 max-w-xs text-xs text-text-secondary">
                    We couldn&apos;t find anything matching &quot;{query}&quot; in {selectedCategory}. Try checking for typos or searching by student
                    ID, course code, or staff name.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                    {["Students", "Courses", "Staff", "Partners"].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => {
                          setQuery("");
                          setSelectedCategory(chip as SearchCategory);
                        }}
                        className="rounded-full border border-brand-border bg-white px-2.5 py-1 text-xs font-medium text-text-secondary shadow-sm hover:border-brand-accent/40 hover:text-brand-red"
                      >
                        Browse {chip}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredResults.map((item, index) => {
                    const isSelected = selectedIndex === index;

                    return (
                      <div
                        key={item.id}
                        ref={(el) => {
                          itemRefs.current[index] = el;
                        }}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={cn(
                          "group relative flex cursor-pointer items-center justify-between rounded-xl p-2.5 transition-all duration-150",
                          isSelected ? "bg-brand-light-red/40 shadow-sm ring-1 ring-brand-red/30" : "hover:bg-brand-bg",
                        )}
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          {/* Item Avatar / Icon */}
                          {item.avatar ? (
                            <img
                              src={item.avatar}
                              alt={item.title}
                              className="h-9 w-9 flex-shrink-0 rounded-lg object-cover ring-1 ring-brand-border"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/avis-emblem.png";
                              }}
                            />
                          ) : (
                            <div
                              className={cn(
                                "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg shadow-sm",
                                getCategoryIconBg(item.category),
                              )}
                            >
                              {getCategoryIcon(item.category)}
                            </div>
                          )}

                          {/* Item Text Information */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-xs font-bold text-text-primary transition-colors group-hover:text-brand-red sm:text-sm">
                                <HighlightMatch
                                  text={item.title}
                                  query={query}
                                />
                              </p>

                              {/* Category Badge */}
                              <span className="py-0.2 hidden select-none rounded bg-brand-bg px-1.5 text-[9px] font-bold text-text-secondary ring-1 ring-brand-border sm:inline-block">
                                {item.category}
                              </span>

                              {/* Status Badge */}
                              {renderStatusBadge(item.status)}
                            </div>

                            <p className="mt-0.5 truncate text-[11px] text-text-secondary sm:text-xs">
                              <HighlightMatch
                                text={item.subtitle}
                                query={query}
                                className="text-text-secondary"
                              />
                            </p>
                          </div>
                        </div>

                        {/* Right Area: Jump Action & Enter Shortcut indicator */}
                        <div className="ml-3 flex flex-shrink-0 items-center gap-2">
                          {isSelected ? (
                            <span className="inline-flex select-none items-center gap-1 rounded bg-brand-red px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                              <span>↵</span>
                              <span>Select</span>
                            </span>
                          ) : (
                            <ArrowRight className="h-4 w-4 text-text-muted opacity-40 transition-transform duration-150 group-hover:translate-x-1 group-hover:text-brand-red group-hover:opacity-100" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Keyboard Helper Footer */}
            <div className="flex select-none items-center justify-between border-t border-brand-border/80 bg-brand-bg/80 px-4 py-2.5 text-[11px] text-text-secondary">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <kbd className="shadow-2xs rounded border border-brand-border bg-white px-1.5 py-0.5 font-mono text-[10px]">↑</kbd>
                  <kbd className="shadow-2xs rounded border border-brand-border bg-white px-1.5 py-0.5 font-mono text-[10px]">↓</kbd>
                  <span className="ml-0.5 text-text-muted">navigate</span>
                </span>

                <span className="inline-flex items-center gap-1">
                  <kbd className="shadow-2xs rounded border border-brand-border bg-white px-1.5 py-0.5 font-mono text-[10px]">↵</kbd>
                  <span className="ml-0.5 text-text-muted">select</span>
                </span>

                <span className="hidden items-center gap-1 sm:inline-flex">
                  <kbd className="shadow-2xs rounded border border-brand-border bg-white px-1.5 py-0.5 font-mono text-[10px]">Tab</kbd>
                  <span className="ml-0.5 text-text-muted">switch category</span>
                </span>
              </div>

              <div className="flex items-center gap-2 text-text-muted">
                <span>
                  {filteredResults.length} {filteredResults.length === 1 ? "match" : "matches"}
                </span>
                <span>•</span>
                <span>{isMac ? "⌘K" : "Ctrl+K"} to toggle</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
