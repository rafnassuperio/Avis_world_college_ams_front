import React, { useState, useEffect } from "react";
import { Layers, Tag, Info } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { sanitizeInput } from "@/lib/security";
import { toast } from "@/components/common/ToastMessage";
import { CollegeCategory } from "../types";

export interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: CollegeCategory) => void | boolean | Promise<void | boolean>;
  category?: CollegeCategory | null;
  existingCategories?: CollegeCategory[];
}

/** Formats text into lowercase snake_case for slug values */
const formatSlugValue = (input: string): string => {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
};

export const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onSave, category, existingCategories = [] }) => {
  const isEditing = Boolean(category);

  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [isCustomValue, setIsCustomValue] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; value?: string }>({});

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setName(category.name || "");
        setValue(category.value || "");
        setIsCustomValue(true);
      } else {
        setName("");
        setValue("");
        setIsCustomValue(false);
      }
      setErrors({});
    }
  }, [isOpen, category]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }

    // Auto-generate value if not custom-edited
    if (!isEditing && !isCustomValue) {
      setValue(formatSlugValue(newName));
      if (errors.value) {
        setErrors((prev) => ({ ...prev, value: undefined }));
      }
    }
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCustomValue(true);
    setValue(e.target.value);
    if (errors.value) {
      setErrors((prev) => ({ ...prev, value: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const formattedValue = formatSlugValue(value);

    const newErrors: { name?: string; value?: string } = {};

    if (!trimmedName) {
      newErrors.name = "Categories Name is required.";
    }

    if (!formattedValue) {
      newErrors.value = "Categories Value is required.";
    }

    // Duplicate checks against other categories
    const isDuplicateName = existingCategories.some((c) => c.id !== category?.id && c.name.trim().toLowerCase() === trimmedName.toLowerCase());
    if (isDuplicateName) {
      newErrors.name = "A category with this name already exists.";
    }

    const isDuplicateValue = existingCategories.some((c) => c.id !== category?.id && c.value.trim().toLowerCase() === formattedValue.toLowerCase());
    if (isDuplicateValue) {
      newErrors.value = "A category with this value already exists.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      if (firstError) toast.error(firstError);
      return;
    }

    const savedCategory: CollegeCategory = {
      id: category?.id || `cat-${Date.now()}`,
      name: sanitizeInput(trimmedName.toUpperCase()),
      value: sanitizeInput(formattedValue),
      status: category?.status || "Active",
      code: category?.code || trimmedName.slice(0, 4).toUpperCase(),
    };

    if (await onSave(savedCategory) === false) return;
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Category" : "Add Category"}
      subtitle={isEditing ? "Update the category title and system slug value" : "Create a new course category level and corresponding slug value"}
      headerIcon={<Layers className="h-5 w-5 text-burgundy-primary" />}
      maxWidth="md"
      footer={
        <div className="flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-xl border border-brand-border px-4 text-xs font-semibold text-text-secondary hover:bg-brand-bg hover:text-text-primary"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="category-form"
            variant="burgundy"
            size="sm"
            className="shadow-xs gap-1.5 rounded-xl px-5 text-xs font-semibold"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>{isEditing ? "Save Changes" : "Add Category"}</span>
          </Button>
        </div>
      }
    >
      <form
        id="category-form"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {/* Categories Name */}
        <div>
          <label className="mb-1.5 flex items-center justify-between text-xs font-bold text-text-primary">
            <span>
              Categories Name <span className="text-brand-red">*</span>
            </span>
            <span className="text-[10px] font-normal text-text-muted">e.g. DIPLOMA, CERTIFICATE</span>
          </label>
          <input
            type="text"
            required
            autoFocus
            value={name}
            onChange={handleNameChange}
            placeholder="e.g. POST GRADUATION"
            className="w-full rounded-xl border border-brand-border bg-white px-3.5 py-2.5 text-xs font-medium uppercase tracking-wide text-text-primary transition-all placeholder:normal-case placeholder:tracking-normal placeholder:text-text-muted focus:border-burgundy-primary focus:outline-none focus:ring-1 focus:ring-burgundy-primary"
          />
          {errors.name && <p className="mt-1 text-[11px] font-semibold text-brand-red">{errors.name}</p>}
        </div>

        {/* Categories Value */}
        <div>
          <label className="mb-1.5 flex items-center justify-between text-xs font-bold text-text-primary">
            <span>
              Categories Value <span className="text-brand-red">*</span>
            </span>
            <span className="text-[10px] font-normal text-text-muted">System identifier (slug)</span>
          </label>
          <div className="relative flex items-center">
            <Tag className="pointer-events-none absolute left-3.5 h-3.5 w-3.5 text-text-muted" />
            <input
              type="text"
              required
              value={value}
              onChange={handleValueChange}
              placeholder="e.g. post_graduation"
              className="w-full rounded-xl border border-brand-border bg-brand-bg/30 py-2.5 pl-9 pr-3.5 font-mono text-xs text-text-primary transition-all placeholder:text-text-muted focus:border-burgundy-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-burgundy-primary"
            />
          </div>
          {errors.value && <p className="mt-1 text-[11px] font-semibold text-brand-red">{errors.value}</p>}
          <div className="mt-1.5 flex items-start gap-1.5 text-[11px] text-text-muted">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-burgundy-primary/70" />
            <span>
              Standardized value used across student records and course filters (e.g.,{" "}
              <code className="rounded bg-brand-bg px-1 py-0.5 font-mono text-[10px] text-burgundy-primary">diploma</code>,{" "}
              <code className="rounded bg-brand-bg px-1 py-0.5 font-mono text-[10px] text-burgundy-primary">higher_diploma</code>).
            </span>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryModal;
