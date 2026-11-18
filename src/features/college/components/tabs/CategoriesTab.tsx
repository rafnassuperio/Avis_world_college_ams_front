import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Plus, Search, Edit2, Trash2, Layers, Tag, RotateCcw, X } from "lucide-react";
import { initialCategoriesData } from "../../data/collegeTabData";
import { CollegeCategory } from "../../types";
import { DataTable, ColumnDef } from "@/components/ui/Table";
import { SearchInput } from "@/components/ui/SearchInput";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { CategoryModal } from "../CategoryModal";
import { toast } from "@/components/common/ToastMessage";
import { safeStorage } from "@/lib/security";
import { cn } from "@/lib/utils";

export interface CategoriesTabProps {
  categories?: CollegeCategory[];
  className?: string;
  onCategoriesChange?: (categories: CollegeCategory[]) => void;
}

const STORAGE_KEY = "ams_college_categories_list";

export const CategoriesTab: React.FC<CategoriesTabProps> = ({ categories: externalCategories, className, onCategoriesChange }) => {
  // Categories list state with local persistence
  const [categoryList, setCategoryList] = useState<CollegeCategory[]>(() => {
    if (externalCategories && externalCategories.length > 0) return externalCategories;
    const saved = safeStorage.getItem<CollegeCategory[]>(STORAGE_KEY, initialCategoriesData);
    if (Array.isArray(saved) && saved.length > 0 && saved.some((c) => Boolean(c.value))) {
      return saved;
    }
    return initialCategoriesData;
  });

  // Keep in sync if parent passes updated categories
  useEffect(() => {
    if (externalCategories && externalCategories.length > 0) {
      setCategoryList(externalCategories);
    }
  }, [externalCategories]);

  // Persist category changes
  const saveCategories = useCallback(
    (newList: CollegeCategory[]) => {
      setCategoryList(newList);
      safeStorage.setItem(STORAGE_KEY, newList);
      onCategoriesChange?.(newList);
    },
    [onCategoriesChange],
  );

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CollegeCategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<CollegeCategory | null>(null);

  // Reset pagination on search query change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Filter categories by query
  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return categoryList;

    return categoryList.filter((item) => {
      const nameMatch = (item.name || "").toLowerCase().includes(q);
      const valueMatch = (item.value || "").toLowerCase().includes(q);
      return nameMatch || valueMatch;
    });
  }, [categoryList, searchQuery]);

  // Paginated categories
  const totalItems = filteredCategories.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCategories.slice(start, start + pageSize);
  }, [filteredCategories, currentPage, pageSize]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (category: CollegeCategory) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  // Save (Add or Update) Category
  const handleSaveCategory = (savedCategory: CollegeCategory) => {
    if (editingCategory) {
      const updatedList = categoryList.map((c) => (c.id === savedCategory.id ? savedCategory : c));
      saveCategories(updatedList);
      toast.success(`Category "${savedCategory.name}" updated successfully.`);
    } else {
      const updatedList = [...categoryList, savedCategory];
      saveCategories(updatedList);
      toast.success(`Category "${savedCategory.name}" created successfully.`);
    }
  };

  // Delete Category
  const handleConfirmDelete = () => {
    if (!categoryToDelete) return;
    const deletedName = categoryToDelete.name;
    const updatedList = categoryList.filter((c) => c.id !== categoryToDelete.id);
    saveCategories(updatedList);
    setCategoryToDelete(null);
    toast.success(`Category "${deletedName}" deleted successfully.`);
  };

  // Columns definition matching user requirements:
  // # | Categories Name | Categories Value | Actions (edit and delete)
  const columns: ColumnDef<CollegeCategory>[] = useMemo(
    () => [
      {
        key: "index",
        header: "#",
        width: 75,
        minWidth: 60,
        resizable: false,
        cell: (_row, index) => <span className="font-mono text-xs font-semibold text-text-muted">{(currentPage - 1) * pageSize + index + 1}</span>,
      },
      {
        key: "name",
        header: "Categories Name",
        width: 300,
        minWidth: 200,
        cell: (category) => (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-burgundy-primary/10 text-burgundy-primary">
              <Layers className="h-4 w-4" />
            </div>
            <span className="font-bold uppercase tracking-wide text-text-primary">{category.name}</span>
          </div>
        ),
      },
      {
        key: "value",
        header: "Categories Value",
        width: 280,
        minWidth: 180,
        cell: (category) => (
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border/80 bg-brand-bg/70 px-2.5 py-1 font-mono text-xs font-semibold text-burgundy-primary">
            <Tag className="h-3 w-3 shrink-0 text-text-muted" />
            <span>{category.value}</span>
          </div>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        width: 170,
        minWidth: 140,
        resizable: false,
        headerClassName: "text-right",
        className: "text-right",
        cell: (category) => (
          <div className="flex items-center justify-start gap-1.5">
            {/* Edit Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEditModal(category);
              }}
              className="group inline-flex items-center gap-1 rounded-lg border border-transparent px-2.5 py-1 text-text-muted transition-all duration-150 hover:border-burgundy-primary/30 hover:bg-burgundy-primary/10 hover:text-burgundy-primary active:scale-95"
              title={`Edit category ${category.name}`}
              aria-label={`Edit category ${category.name}`}
            >
              <Edit2 className="h-3.5 w-3.5 transition-transform duration-150 group-hover:scale-110" />
              <span className="text-xs font-semibold text-burgundy-primary">Edit</span>
            </button>

            {/* Delete Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCategoryToDelete(category);
              }}
              className="group inline-flex items-center gap-1 rounded-lg border border-transparent px-2.5 py-1 text-text-muted transition-all duration-150 hover:border-brand-red/30 hover:bg-brand-light-red hover:text-brand-red active:scale-95"
              title={`Delete category ${category.name}`}
              aria-label={`Delete category ${category.name}`}
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

  const hasActiveSearch = Boolean(searchQuery.trim());

  return (
    <div className={cn("space-y-4", className)}>
      {/* Top Search & Add Category Toolbar */}
      <div className="flex flex-col gap-3.5 rounded-2xl border border-brand-border bg-white p-3.5 shadow-card sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          {/* Search Box */}
          <div className="w-full flex-1 sm:max-w-md">
            <SearchInput
              label="Search Categories"
              labelIcon={Search}
              placeholder="Search categories by name or value..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>

          {/* Add Category Button */}
          <div className="flex items-center gap-2 sm:ml-auto">
            <Button
              variant="burgundy"
              size="sm"
              onClick={handleOpenAddModal}
              className="shadow-xs gap-1.5 rounded-xl text-xs font-semibold"
              title="Add New Category"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Category</span>
            </Button>
          </div>
        </div>

        {/* Search status & Reset chip */}
        {hasActiveSearch && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-brand-border/60 pt-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-text-muted">Filtered by:</span>
              <span className="inline-flex items-center gap-1 rounded-lg border border-burgundy-primary/25 bg-burgundy-primary/10 px-2 py-0.5 text-[11px] font-semibold text-burgundy-primary">
                <span>
                  Query: <strong className="font-bold">"{searchQuery}"</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="ml-0.5 hover:text-brand-red"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>

              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="ml-1 inline-flex items-center gap-1 text-[11px] font-medium text-text-muted underline underline-offset-2 hover:text-brand-red"
              >
                <RotateCcw className="h-3 w-3" />
                Reset search
              </button>
            </div>

            <span className="text-[11px] text-text-muted">
              Found <strong className="text-text-primary">{filteredCategories.length}</strong>{" "}
              {filteredCategories.length === 1 ? "category" : "categories"}
            </span>
          </div>
        )}
      </div>

      {/* Categories DataTable */}
      <DataTable<CollegeCategory>
        columns={columns}
        data={paginatedCategories}
        keyExtractor={(category) => category.id}
        layout="fixed"
        density="normal"
        storageKey="ams_college_categories_table_widths"
        showResizeGuide={true}
        guideStorageKey="ams_categories_tab_resize_guide_v1"
        guideNote={
          <>
            Drag divider lines <span className="font-bold">┊</span> between column headers to resize columns
          </>
        }
        emptyMessage={
          hasActiveSearch
            ? `No categories match "${searchQuery}". Try a different keyword.`
            : "No categories added yet. Click 'Add Category' to create one."
        }
      />

      {/* Pagination */}
      {filteredCategories.length > 0 && (
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

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <CategoryModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCategory(null);
          }}
          onSave={handleSaveCategory}
          category={editingCategory}
          existingCategories={categoryList}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={Boolean(categoryToDelete)}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
        confirmText="Delete Category"
        itemPreview={
          categoryToDelete ? (
            <div className="rounded-xl border border-brand-border/70 bg-brand-bg/50 p-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase text-text-primary">{categoryToDelete.name}</span>
                <span className="rounded-md border border-brand-border bg-white px-2 py-0.5 font-mono text-[11px] text-burgundy-primary">
                  {categoryToDelete.value}
                </span>
              </div>
            </div>
          ) : null
        }
      />
    </div>
  );
};

export default CategoriesTab;
