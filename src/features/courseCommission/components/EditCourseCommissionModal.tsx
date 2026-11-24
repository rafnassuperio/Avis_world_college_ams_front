import React, { useState, useEffect, useId, useRef } from "react";
import { Plus, Trash2, ChevronDown, Check, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Dropdown, DropdownOption } from "@/components/ui/Dropdown";
import {
  CalcType,
  CommissionTypeItem,
  CourseCommissionConfig,
} from "../types";
import { courses } from "@/services/ams";
import { useApiCollection } from "@/hooks/useApiCollection";
import { cn } from "@/lib/utils";

const calcTypeOptions: DropdownOption[] = [
  { label: "Percent (%)", value: "Percent (%)" },
  { label: "Fixed ($)", value: "Fixed ($)" },
];

export interface EditCourseCommissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CourseCommissionConfig | null;
  onSave: (updatedConfig: CourseCommissionConfig) => void | boolean | Promise<void | boolean>;
}

export const EditCourseCommissionModal: React.FC<EditCourseCommissionModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const { data: initialCoursesData } = useApiCollection(courses);
  const formId = useId();

  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [courseName, setCourseName] = useState("");
  const [code, setCode] = useState("");
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const courseDropdownRef = useRef<HTMLDivElement>(null);

  const [commissionTypes, setCommissionTypes] = useState<CommissionTypeItem[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  // Sync state when config changes or modal opens
  useEffect(() => {
    if (config) {
      setCourseName(config.courseName);
      setCode(config.code);
      setSelectedCourseId(config.courseId || "");
      setCommissionTypes(
        config.commissionTypes ? JSON.parse(JSON.stringify(config.commissionTypes)) : []
      );
      setErrorMessage("");
    }
  }, [config, isOpen]);

  // Close course dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        courseDropdownRef.current &&
        !courseDropdownRef.current.contains(e.target as Node)
      ) {
        setIsCourseDropdownOpen(false);
      }
    };
    if (isCourseDropdownOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isCourseDropdownOpen]);

  if (!config) return null;

  // Add new commission type rule
  const handleAddCommissionType = () => {
    const newType: CommissionTypeItem = {
      id: `ct-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      typeName: "",
      agentShare: {
        calcType: "Percent (%)",
        value: 0,
      },
      repShare: {
        calcType: "Percent (%)",
        value: 0,
      },
    };
    setCommissionTypes([...commissionTypes, newType]);
  };

  // Remove commission type rule
  const handleRemoveCommissionType = (id: string) => {
    if (commissionTypes.length <= 1) {
      setErrorMessage("At least one commission type rule is required.");
      return;
    }
    setCommissionTypes(commissionTypes.filter((t) => t.id !== id));
  };

  // Update Type Name
  const handleUpdateTypeName = (id: string, name: string) => {
    setCommissionTypes(
      commissionTypes.map((t) => (t.id === id ? { ...t, typeName: name } : t))
    );
  };

  // Update Agent Share
  const handleUpdateAgentShare = (
    id: string,
    field: "calcType" | "value",
    val: CalcType | number
  ) => {
    setCommissionTypes(
      commissionTypes.map((t) =>
        t.id === id
          ? {
              ...t,
              agentShare: {
                ...t.agentShare,
                [field]: val,
              },
            }
          : t
      )
    );
  };

  // Update Rep Share
  const handleUpdateRepShare = (
    id: string,
    field: "calcType" | "value",
    val: CalcType | number
  ) => {
    setCommissionTypes(
      commissionTypes.map((t) =>
        t.id === id
          ? {
              ...t,
              repShare: {
                ...t.repShare,
                [field]: val,
              },
            }
          : t
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const hasEmptyName = commissionTypes.some((t) => !t.typeName.trim());
    if (hasEmptyName) {
      setErrorMessage("Please enter a Type Name for all configured commission types (e.g. Standard).");
      return;
    }

    const updatedConfig: CourseCommissionConfig = {
      ...config,
      courseId: selectedCourseId || config.courseId,
      courseName,
      code,
      commissionTypes,
      lastUpdated: new Date().toISOString().split("T")[0],
    };

    if (await onSave(updatedConfig) === false) return;
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="3xl"
      title={
        <div className="flex items-center gap-2.5">
          <h2 className="text-base font-bold text-text-primary">
            Edit Course Commission Config
          </h2>
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={formId} variant="burgundy" size="sm">
            Save Changes
          </Button>
        </div>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-6 py-2">
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700 animate-fadeIn">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. SELECT COURSE (Matching Screenshot) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-primary">
            1. Select Course
          </label>

          <div ref={courseDropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setIsCourseDropdownOpen((prev) => !prev)}
              className="relative flex w-full items-center justify-between rounded-xl border border-brand-border bg-white py-2.5 pl-4 pr-3 text-left transition-all hover:border-brand-red/40 focus:outline-none focus:ring-2 focus:ring-brand-red/20 shadow-2xs"
            >
              <span className="absolute bottom-0 left-0 top-0 w-1 rounded-l-xl bg-brand-red" />

              <span className="truncate text-xs font-semibold text-text-primary">
                [{code}] {courseName}
              </span>

              <div className="flex items-center gap-2 pl-2 border-l border-brand-border text-text-muted">
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isCourseDropdownOpen && "rotate-180 text-brand-red"
                  )}
                />
              </div>
            </button>

            {isCourseDropdownOpen && (
              <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-brand-border bg-white p-1.5 shadow-xl">
                {initialCoursesData.map((course) => {
                  const isSelected = course.code === code;
                  return (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => {
                        setSelectedCourseId(course.id);
                        setCourseName(course.title);
                        setCode(course.code);
                        setIsCourseDropdownOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors",
                        isSelected
                          ? "bg-brand-light-red/80 text-brand-red font-bold"
                          : "text-text-primary hover:bg-brand-bg font-medium"
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-burgundy-primary">
                            [{course.code}]
                          </span>
                          <span className="truncate">{course.title}</span>
                        </div>
                        <div className="text-[10px] text-text-muted pt-0.5">
                          {course.level} • {course.fee}
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="h-4 w-4 shrink-0 text-brand-red" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 2. COMMISSION TYPES & SPLIT RULES (Matching Screenshot) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
              2. COMMISSION TYPES & SPLIT RULES
            </h3>

            <button
              type="button"
              onClick={handleAddCommissionType}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-red px-4 py-2 text-xs font-bold text-white shadow-sm shadow-brand-red/20 transition-all hover:bg-burgundy-primary active:scale-95"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Add Commission Type</span>
            </button>
          </div>

          <div className="space-y-4">
            {commissionTypes.map((type) => (
              <div
                key={type.id}
                className="relative rounded-2xl border border-brand-border bg-brand-bg/60 p-4 sm:p-5 space-y-4 shadow-2xs"
              >
                {/* Type Name Input with underline & remove button */}
                <div className="flex items-center justify-between gap-3 border-b border-brand-red/30 pb-2">
                  <div className="min-w-0 flex-1">
                    <input
                      type="text"
                      value={type.typeName}
                      onChange={(e) => handleUpdateTypeName(type.id, e.target.value)}
                      placeholder="Enter Type Name (e.g. Standard)"
                      className="w-full bg-transparent text-sm font-bold text-text-primary placeholder:text-text-muted focus:outline-none"
                    />
                  </div>

                  {commissionTypes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCommissionType(type.id)}
                      title="Remove commission type"
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-brand-light-red/50 hover:text-brand-red"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Side-by-side Share Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* LEFT: AGENT SHARE (Brand Red Left Accent Bar & Theme) */}
                  <div className="relative rounded-xl border border-brand-border bg-white p-4 shadow-2xs">
                    <span className="absolute bottom-0 left-0 top-0 w-1 rounded-l-xl bg-brand-red" />

                    <div className="flex items-center justify-between border-b border-brand-border/60 pb-2.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-red">
                        AGENT SHARE
                      </span>
                      <span className="rounded border border-brand-red/20 bg-brand-light-red/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-red">
                        UNDER AGENT
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3">
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-text-muted">
                          CALC TYPE
                        </label>
                        <Dropdown
                          value={type.agentShare.calcType}
                          options={calcTypeOptions}
                          onChange={(val) =>
                            handleUpdateAgentShare(
                              type.id,
                              "calcType",
                              val as CalcType
                            )
                          }
                          className="w-full"
                          usePortal={true}
                          buttonClassName="w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-xs font-medium text-text-primary hover:border-brand-red/40 focus:border-brand-red focus:ring-1 focus:ring-brand-red/20 justify-between"
                          menuClassName="w-full left-0 right-auto z-50 border border-brand-border bg-white shadow-xl"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-text-muted">
                          VALUE
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={type.agentShare.value || ""}
                          onChange={(e) =>
                            handleUpdateAgentShare(
                              type.id,
                              "value",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="0"
                          className="w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-xs font-bold text-text-primary transition-colors focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red/20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: REPRESENTATIVE SHARE (Burgundy Primary Left Accent Bar & Theme) */}
                  <div className="relative rounded-xl border border-brand-border bg-white p-4 shadow-2xs">
                    <span className="absolute bottom-0 left-0 top-0 w-1 rounded-l-xl bg-burgundy-primary" />

                    <div className="flex items-center justify-between border-b border-brand-border/60 pb-2.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-burgundy-primary">
                        REPRESENTATIVE SHARE
                      </span>
                      <span className="rounded border border-burgundy-primary/20 bg-burgundy-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-burgundy-primary">
                        UNDER REP
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3">
                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-text-muted">
                          CALC TYPE
                        </label>
                        <Dropdown
                          value={type.repShare.calcType}
                          options={calcTypeOptions}
                          onChange={(val) =>
                            handleUpdateRepShare(
                              type.id,
                              "calcType",
                              val as CalcType
                            )
                          }
                          className="w-full"
                          usePortal={true}
                          buttonClassName="w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-xs font-medium text-text-primary hover:border-burgundy-primary/40 focus:border-burgundy-primary focus:ring-1 focus:ring-burgundy-primary/20 justify-between"
                          menuClassName="w-full left-0 right-auto z-50 border border-brand-border bg-white shadow-xl"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-text-muted">
                          VALUE
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={type.repShare.value || ""}
                          onChange={(e) =>
                            handleUpdateRepShare(
                              type.id,
                              "value",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="0"
                          className="w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-xs font-bold text-text-primary transition-colors focus:border-burgundy-primary focus:outline-none focus:ring-1 focus:ring-burgundy-primary/20"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
};
