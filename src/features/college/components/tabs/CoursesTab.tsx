import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Edit2, Trash2, Clock, DollarSign, Layers, RotateCcw, X } from "lucide-react";

import { CollegeCourse } from "../../types";
import { DataTable, ColumnDef } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { SearchInput } from "@/components/ui/SearchInput";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { Pagination } from "@/components/ui/Pagination";
import { CourseModal } from "../CourseModal";
import { toast } from "@/components/common/ToastMessage";
import { courses } from "@/services/ams";
import { useApiCollection } from "@/hooks/useApiCollection";
import { AsyncStateView } from "@/components/common/AsyncStateView";
import { cn } from "@/lib/utils";

export interface CoursesTabProps {
  courses?: CollegeCourse[];
  className?: string;
  levelFilter?: string;
  onCoursesChange?: (courses: CollegeCourse[]) => void;
}

export const CoursesTab: React.FC<CoursesTabProps> = ({ className, levelFilter }) => {
  const { data: courseList, saveList: saveCourses, loading, error, reload } = useApiCollection(courses);


  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Modals State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CollegeCourse | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<CollegeCourse | null>(null);

  // Available categories derived dynamically from both category dataset and courses list
  const availableCategories = useMemo(() => {
    const categoriesSet = new Set<string>();


    courseList.forEach((c) => {
      if (c.category) categoriesSet.add(c.category);
    });
    return Array.from(categoriesSet).sort((a, b) => a.localeCompare(b));
  }, [courseList]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, levelFilter]);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courseList.filter((course) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        course.title.toLowerCase().includes(query) ||
        course.code.toLowerCase().includes(query) ||
        course.category.toLowerCase().includes(query) ||
        course.duration.toLowerCase().includes(query) ||
        (course.department && course.department.toLowerCase().includes(query));

      const matchesCategory = selectedCategory === "All Categories" || course.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesLevel = !levelFilter || levelFilter.toLowerCase() === "all" || course.level.toLowerCase() === levelFilter.toLowerCase();

      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [courseList, searchQuery, selectedCategory, levelFilter]);

  // Paginated slice
  const totalItems = filteredCourses.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredCourses.slice(startIndex, startIndex + pageSize);
  }, [filteredCourses, currentPage, pageSize]);

  const isCategoryFiltered = selectedCategory !== "All Categories";
  const hasActiveFilters = isCategoryFiltered || searchQuery.trim() !== "";

  const handleResetFilters = () => {
    setSelectedCategory("All Categories");
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Add / Edit Handlers
  const handleOpenAddModal = () => {
    setEditingCourse(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (course: CollegeCourse) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  const handleSaveCourse = async (savedCourse: CollegeCourse) => {
    if (editingCourse) {
      // Edit mode
      const updatedList = courseList.map((c) => (c.id === savedCourse.id ? savedCourse : c));
      if (!await saveCourses(updatedList)) return false;
      toast.success(`Course "${savedCourse.code}" updated successfully.`);
    } else {
      // Add mode
      const updatedList = [savedCourse, ...courseList];
      if (!await saveCourses(updatedList)) return false;
      toast.success(`Course "${savedCourse.code} - ${savedCourse.title}" created successfully.`);
    }
  };

  // Delete Handler
  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    const target = courseToDelete;
    const updatedList = courseList.filter((c) => c.id !== target.id);
    if (!await saveCourses(updatedList)) return false;
    toast.success(`Course "${target.code}" was successfully removed.`);
    setCourseToDelete(null);
  };

  // Table Columns Definition matching:
  // #, Course Code, Course, Duration, Application Fees, Actions( Edit and Delete)
  const columns: ColumnDef<CollegeCourse>[] = useMemo(
    () => [
      {
        key: "index",
        header: "#",
        width: 60,
        minWidth: 50,
        maxWidth: 80,
        headerClassName: "text-center",
        className: "text-center",
        cell: (_course, index) => (
          <span className="font-mono text-xs font-bold text-text-muted">{String((currentPage - 1) * pageSize + index + 1).padStart(2, "0")}</span>
        ),
      },
      {
        key: "code",
        header: "Course Code",
        width: 140,
        minWidth: 120,
        cell: (course) => (
          <div className="flex items-center">
            <Link
              to={`/college/courses/${course.code || course.id}`}
              className="shadow-2xs inline-flex items-center rounded-lg border border-burgundy-primary/20 bg-burgundy-primary/10 px-2.5 py-1 font-mono text-xs font-bold text-burgundy-primary transition-all hover:bg-burgundy-primary hover:text-white"
              title={`View ${course.code} course details`}
            >
              {course.code}
            </Link>
          </div>
        ),
      },
      {
        key: "title",
        header: "Course",
        width: 300,
        minWidth: 220,
        cell: (course) => (
          <div className="flex flex-col gap-1">
            <Link
              to={`/college/courses/${course.code || course.id}`}
              className="line-clamp-2 font-bold text-text-primary transition-colors hover:text-burgundy-primary hover:underline"
              title={`View ${course.title} details`}
            >
              {course.title}
            </Link>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="inline-flex items-center rounded-full border border-brand-border bg-brand-bg px-2 py-0.5 font-semibold text-text-secondary">
                {course.courseType || course.level}
              </span>
              <span className="text-text-muted">•</span>
              <span
                className="max-w-[200px] truncate text-text-muted"
                title={course.category}
              >
                {course.category}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "duration",
        header: "Duration",
        width: 180,
        minWidth: 150,
        cell: (course) => (
          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
            <Clock className="h-3.5 w-3.5 shrink-0 text-text-muted" />
            <span className="font-medium">{course.duration}</span>
          </div>
        ),
      },
      {
        key: "applicationFee",
        header: "Application Fees",
        width: 180,
        minWidth: 150,
        cell: (course) => {
          const appFee = course.applicationFee || "$150";
          return (
            <div className="flex flex-col gap-0.5">
              <div className="shadow-2xs inline-flex w-fit items-center gap-1 rounded-lg border border-burgundy-primary/20 bg-burgundy-primary/10 px-2.5 py-1 text-xs font-bold text-burgundy-primary">
                <DollarSign className="h-3.5 w-3.5 shrink-0 text-burgundy-primary" />
                <span>{appFee}</span>
              </div>
              {course.fee && <span className="pl-0.5 text-[10px] text-text-muted">Tuition: {course.fee}</span>}
            </div>
          );
        },
      },
      {
        key: "actions",
        header: "Actions",
        width: 160,
        minWidth: 140,
        resizable: false,
        headerClassName: "text-right",
        className: "text-right",
        cell: (course) => (
          <div className="flex items-center justify-start gap-1.5">
            {/* Edit Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEditModal(course);
              }}
              className="group inline-flex items-center gap-1 rounded-lg border border-transparent px-2.5 py-1 text-text-muted transition-all duration-150 hover:border-burgundy-primary/30 hover:bg-burgundy-primary/10 hover:text-burgundy-primary active:scale-95"
              title={`Edit course ${course.code}`}
              aria-label={`Edit course ${course.code}`}
            >
              <Edit2 className="h-3.5 w-3.5 transition-transform duration-150 group-hover:scale-110" />
              <span className="text-xs font-semibold text-burgundy-primary">Edit</span>
            </button>

            {/* Delete Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCourseToDelete(course);
              }}
              className="group inline-flex items-center gap-1 rounded-lg border border-transparent px-2.5 py-1 text-text-muted transition-all duration-150 hover:border-brand-red/30 hover:bg-brand-light-red hover:text-brand-red active:scale-95"
              title={`Delete course ${course.code}`}
              aria-label={`Delete course ${course.code}`}
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

  if (loading || error) return <AsyncStateView isLoading={loading} error={error} onRetry={() => void reload()}>{null}</AsyncStateView>;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search & Filters Toolbar */}
      <div className="flex flex-col gap-3.5 rounded-2xl border border-brand-border bg-white p-3.5 shadow-card sm:p-4">
        {/* Top Controls: Search, Filter by Category, and Add Course Action */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
            {/* Search Box */}
            <div className="w-full flex-1 sm:max-w-md">
              <SearchInput
                label="Search Courses"
                labelIcon={Search}
                placeholder="Search courses by title, code, category or duration..."
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </div>

            {/* Filter by Category */}
            <div className="w-full sm:w-64">
              <FilterSelect
                label="Filter by Category"
                icon={Layers}
                value={selectedCategory}
                defaultValue="All Categories"
                searchable={true}
                searchPlaceholder="Search category..."
                align="left"
                options={[{ label: "All Categories", value: "All Categories" }, ...availableCategories.map((c) => ({ label: c, value: c }))]}
                onChange={setSelectedCategory}
              />
            </div>
          </div>

          {/* Add Course Button */}
          <div className="flex items-center gap-2 sm:ml-auto md:mb-0.5">
            <Button
              variant="burgundy"
              size="sm"
              onClick={handleOpenAddModal}
              className="shadow-xs gap-1.5 rounded-xl text-xs font-semibold"
              title="Add New Course"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Course</span>
            </Button>
          </div>
        </div>

        {/* Active Filter Chips / Reset */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-brand-border/60 pt-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-text-muted">Active:</span>

              {isCategoryFiltered && (
                <span className="inline-flex items-center gap-1 rounded-lg border border-burgundy-primary/25 bg-burgundy-primary/10 px-2 py-0.5 text-[11px] font-semibold text-burgundy-primary">
                  <span>
                    Category: <strong className="font-bold">{selectedCategory}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("All Categories")}
                    className="ml-0.5 rounded p-0.5 hover:bg-burgundy-primary/20 hover:text-brand-red"
                    title="Remove category filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {searchQuery && (
                <span className="inline-flex items-center gap-1 rounded-lg border border-burgundy-primary/25 bg-burgundy-primary/10 px-2 py-0.5 text-[11px] font-semibold text-burgundy-primary">
                  <span>
                    Search: &ldquo;<strong className="font-bold">{searchQuery}</strong>&rdquo;
                  </span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="ml-0.5 rounded p-0.5 hover:bg-burgundy-primary/20 hover:text-brand-red"
                    title="Clear search filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={handleResetFilters}
                className="ml-1 inline-flex items-center gap-1 text-[11px] font-semibold text-brand-red transition-colors hover:underline"
              >
                <RotateCcw className="h-3 w-3" />
                Reset filters
              </button>
            </div>

            <span className="text-[11px] text-text-muted">
              Found <strong className="text-text-primary">{filteredCourses.length}</strong> course{filteredCourses.length === 1 ? "" : "s"}
            </span>
          </div>
        )}
      </div>

      {/* Main Courses DataTable */}
      <DataTable<CollegeCourse>
        columns={columns}
        data={paginatedCourses}
        keyExtractor={(course) => course.id}
        layout="fixed"
        density="normal"
        storageKey="ams_college_courses_table_widths"
        showResizeGuide={true}
        guideStorageKey="ams_courses_tab_resize_guide_v1"
        guideNote={
          <>
            Drag divider lines <span className="font-bold">┊</span> between column headers to resize columns
          </>
        }
        emptyMessage={
          hasActiveFilters
            ? `No courses match your search or category filter. Try clearing filters.`
            : "No courses enrolled yet. Click 'Add Course' to create one."
        }
      />

      {/* Reusable Pagination */}
      {filteredCourses.length > 0 && (
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
          pageSizeOptions={[5, 8, 12, 20]}
          showTotal={true}
          showPageSize={true}
        />
      )}

      {/* Add / Edit Course Modal */}
      <CourseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCourse(null);
        }}
        onSave={handleSaveCourse}
        course={editingCourse}
        availableCategories={availableCategories}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={Boolean(courseToDelete)}
        onClose={() => setCourseToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Course"
        description="Are you sure you want to delete this course from the college catalog? This action cannot be undone."
        confirmText="Delete Course"
        itemPreview={
          courseToDelete ? (
            <div className="rounded-xl border border-brand-border/70 bg-brand-bg/50 p-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="rounded bg-burgundy-primary/10 px-1.5 py-0.5 font-mono text-xs font-bold text-burgundy-primary">
                  {courseToDelete.code}
                </span>
                <span className="font-bold text-text-primary">{courseToDelete.title}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-text-muted">
                <span>{courseToDelete.category}</span>
                <span className="font-semibold text-burgundy-primary">App Fee: {courseToDelete.applicationFee || "$150"}</span>
              </div>
            </div>
          ) : undefined
        }
      />
    </div>
  );
};

export default CoursesTab;
