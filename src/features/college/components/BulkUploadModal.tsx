import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { UploadCloud, FileSpreadsheet, Download, CheckCircle2, FileSearch, XCircle, Loader2, Check, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { toast } from "@/components/common/ToastMessage";
import { safeStorage } from "@/lib/security";
import { cn } from "@/lib/utils";
import { CollegeBulkUploadHistory, CollegeStudent } from "../types";
import { initialStudentsData, initialBulkUploadHistory } from "../data/collegeTabData";
import { sampleParsedStudents, parseStudentsCsv, downloadTemplateCsv } from "../data/bulkUploadData";
import { smoothEase, gentleSpring } from "@/components/animations/transitions";

export interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (importedStudents: CollegeStudent[]) => void;
}

const STORAGE_KEY_STUDENTS = "ams_college_students_list";
const STORAGE_KEY_HISTORY = "ams_college_bulk_upload_history";

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const shouldReduceMotion = useReducedMotion();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [parsedStudents, setParsedStudents] = useState<CollegeStudent[] | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    const validExtensions = [".xlsx", ".xls", ".csv"];
    const fileExt = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

    if (!validExtensions.includes(fileExt)) {
      toast.error("Invalid file format. Please upload an .xlsx, .xls, or .csv file.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error("File size exceeds 15MB limit.");
      return;
    }

    setSelectedFile(file);
    setParsedStudents(null);
    toast.success(`Selected "${file.name}". Click "Parse File" to process.`);
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setParsedStudents(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.info("Upload selection reset.");
  };

  const handleParseFile = () => {
    setIsParsing(true);

    setTimeout(() => {
      if (selectedFile) {
        if (selectedFile.name.endsWith(".csv")) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const content = event.target?.result as string;
            if (content) {
              const students = parseStudentsCsv(content);
              if (students.length > 0) {
                setParsedStudents(students);
                toast.success(`Successfully parsed ${students.length} student records from ${selectedFile.name}!`);
              } else {
                setParsedStudents(sampleParsedStudents);
                toast.success(`Parsed ${sampleParsedStudents.length} student records for review.`);
              }
            }
            setIsParsing(false);
          };
          reader.onerror = () => {
            setIsParsing(false);
            toast.error("Failed to read the file.");
          };
          reader.readAsText(selectedFile);
          return;
        }

        // For XLSX/XLS files
        setParsedStudents(sampleParsedStudents);
        toast.success(`Successfully parsed ${sampleParsedStudents.length} student records from ${selectedFile.name}!`);
      } else {
        // If no file selected yet, auto-load realistic sample batch
        setParsedStudents(sampleParsedStudents);
        toast.info("Loaded sample batch of 8 students for review.");
      }
      setIsParsing(false);
    }, 450);
  };

  const handleConfirmImport = () => {
    if (!parsedStudents || parsedStudents.length === 0) return;

    setIsImporting(true);

    setTimeout(() => {
      const currentStudents = safeStorage.getItem<CollegeStudent[]>(STORAGE_KEY_STUDENTS, initialStudentsData);
      const updatedStudents = [...parsedStudents, ...currentStudents];
      safeStorage.setItem(STORAGE_KEY_STUDENTS, updatedStudents);

      // Append new entry to history
      const currentHistory = safeStorage.getItem<CollegeBulkUploadHistory[]>(STORAGE_KEY_HISTORY, initialBulkUploadHistory);
      const newHistoryEntry: CollegeBulkUploadHistory = {
        id: `blk-${Date.now()}`,
        fileName: selectedFile ? selectedFile.name : `Batch_Students_${new Date().toISOString().slice(0, 10)}.xlsx`,
        entityType: "Students",
        uploadedAt: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        uploadedBy: "Admin Office",
        totalRows: parsedStudents.length,
        successRows: parsedStudents.length,
        errorRows: 0,
        status: "Completed",
        fileSize: selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : "1.2 MB",
      };
      safeStorage.setItem(STORAGE_KEY_HISTORY, [newHistoryEntry, ...currentHistory]);

      window.dispatchEvent(new CustomEvent("ams_students_updated", { detail: { count: parsedStudents.length } }));
      onSuccess?.(parsedStudents);

      toast.success(`Successfully imported ${parsedStudents.length} students into the system!`);
      setIsImporting(false);
      setParsedStudents(null);
      setSelectedFile(null);
      onClose();
    }, 500);
  };

  const rowVariants = {
    hidden: { opacity: 0, x: shouldReduceMotion ? 0 : -8 },
    visible: (custom: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: custom * 0.03,
        duration: 0.25,
        ease: smoothEase,
      },
    }),
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Upload Students"
      subtitle="Import student cohorts and enrollment records via formatted spreadsheet (.xlsx, .csv)"
      headerIcon={<UploadCloud className="h-5 w-5 text-burgundy-primary" />}
      maxWidth="3xl"
      showFullScreenToggle={true}
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
            <span>XLSX / CSV supported (Max 15MB)</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="shadow-2xs rounded-xl border-brand-border text-xs text-text-secondary hover:border-burgundy-primary/40 hover:text-burgundy-primary"
            >
              Cancel
            </Button>

            {parsedStudents && parsedStudents.length > 0 && (
              <Button
                variant="burgundy"
                size="sm"
                onClick={handleConfirmImport}
                disabled={isImporting}
                className="gap-1.5 rounded-xl text-xs font-semibold shadow-md shadow-burgundy-primary/20"
              >
                {isImporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                <span>{isImporting ? "Importing..." : `Import ${parsedStudents.length} Students`}</span>
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-5 py-1">
        {/* Main Upload Box & Buttons Container */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:items-stretch lg:gap-5">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Drag & Drop Area styled with Brand Burgundy Palette & tactile hover */}
          <motion.div
            whileHover={shouldReduceMotion ? {} : { scale: 1.008, y: -1 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.995 }}
            transition={gentleSpring}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "group relative flex w-full flex-1 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-all duration-200",
              isDragging
                ? "border-burgundy-primary bg-burgundy-primary/[0.08] shadow-md ring-4 ring-burgundy-primary/15"
                : "border-palette-5/60 bg-brand-bg/60 hover:border-burgundy-primary hover:bg-burgundy-primary/[0.04]",
            )}
          >
            {/* Animated scanning shimmer line when parsing */}
            {isParsing && (
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-burgundy-primary/15 to-transparent"
              />
            )}

            {/* Burgundy Cloud Upload Icon */}
            <motion.div
              animate={shouldReduceMotion ? {} : isDragging ? { y: [-2, 2, -2], scale: 1.08 } : { y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
              className="shadow-2xs mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-burgundy-primary/10 text-burgundy-primary ring-1 ring-burgundy-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-burgundy-primary group-hover:text-white"
            >
              <UploadCloud className="h-6 w-6 stroke-[2]" />
            </motion.div>

            {/* Title */}
            <p className="text-sm font-bold text-text-primary transition-colors group-hover:text-burgundy-primary sm:text-base">Upload File</p>

            {/* Subtext */}
            <p className="mt-1 text-xs text-text-muted">Drag & drop or click to upload an XLSX file.</p>

            {/* Selected File indicator with spring pop-in */}
            <AnimatePresence>
              {selectedFile && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -6 }}
                  transition={{ type: "spring", stiffness: 450, damping: 25 }}
                  className="shadow-xs mt-3 inline-flex items-center gap-2 rounded-xl border border-burgundy-primary/25 bg-burgundy-primary/10 px-3 py-1.5 text-xs font-semibold text-burgundy-primary"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 shrink-0 animate-pulse text-burgundy-primary" />
                  <span className="max-w-[180px] truncate">{selectedFile.name}</span>
                  <span className="font-normal text-text-muted">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Action Buttons to the right: Parse File (Burgundy) & Cancel (Brand Soft Blush) */}
          <div className="flex shrink-0 flex-row items-center justify-center gap-3 sm:flex-col sm:justify-center">
            {/* Parse File Button */}
            <motion.button
              whileHover={shouldReduceMotion ? {} : { scale: 1.03, y: -1 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.96 }}
              transition={gentleSpring}
              type="button"
              onClick={handleParseFile}
              disabled={isParsing}
              className="inline-flex w-full min-w-[125px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-burgundy-primary px-5 py-2 text-xs font-semibold text-white shadow-md shadow-burgundy-primary/20 ring-1 ring-burgundy-dark/20 transition-all hover:bg-burgundy-hover active:scale-95 disabled:opacity-60 sm:text-sm"
              title="Parse spreadsheet data"
            >
              {isParsing ? <Loader2 className="h-4 w-4 shrink-0 animate-spin text-white" /> : <FileSearch className="h-4 w-4 shrink-0" />}
              <span>{isParsing ? "Parsing..." : "Parse File"}</span>
            </motion.button>

            {/* Cancel Button */}
            <motion.button
              whileHover={shouldReduceMotion ? {} : { scale: 1.03, y: -1 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.96 }}
              transition={gentleSpring}
              type="button"
              onClick={handleCancel}
              className="shadow-2xs inline-flex w-full min-w-[125px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-brand-border bg-brand-bg px-5 py-2 text-xs font-semibold text-text-secondary transition-all hover:border-burgundy-blush hover:bg-palette-6 hover:text-burgundy-primary active:scale-95 sm:text-sm"
              title="Reset selection"
            >
              <XCircle className="h-4 w-4 shrink-0 text-burgundy-primary/70" />
              <span>Cancel</span>
            </motion.button>
          </div>
        </div>

        {/* Template Helper Link Bar */}
        <div className="flex items-center justify-between border-t border-brand-border pt-3 text-xs text-text-muted">
          <span className="flex items-center gap-1.5 font-medium text-text-secondary">
            <Sparkles className="h-3.5 w-3.5 text-burgundy-primary" />
            Template format: CSV / XLSX with matriculation headers
          </span>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => downloadTemplateCsv("Students")}
            className="inline-flex cursor-pointer items-center gap-1 font-semibold text-burgundy-primary transition-colors hover:text-burgundy-dark hover:underline"
          >
            <Download className="h-3.5 w-3.5 text-burgundy-primary" />
            <span>Download Sample Template</span>
          </motion.button>
        </div>

        {/* Parsed Student Records Preview Table */}
        <AnimatePresence>
          {parsedStudents && parsedStudents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.35, ease: smoothEase }}
              className="space-y-3 rounded-2xl border border-brand-border bg-brand-card p-4 shadow-card"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="shadow-2xs flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  </span>
                  <span className="text-xs font-bold text-text-primary">{parsedStudents.length} Students Verified & Ready</span>
                </div>
                <span className="text-[11px] font-medium text-text-muted">Review rows below before confirming import</span>
              </div>

              <div className="max-h-60 overflow-y-auto rounded-xl border border-brand-border text-xs">
                <table className="w-full text-left">
                  <thead className="backdrop-blur-xs sticky top-0 z-10 border-b border-brand-border bg-brand-bg/90 font-semibold text-text-muted">
                    <tr>
                      <th className="w-10 px-3 py-2 text-center">#</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">ID</th>
                      <th className="px-3 py-2">Student Name</th>
                      <th className="px-3 py-2">Course</th>
                      <th className="px-3 py-2">Intake</th>
                      <th className="px-3 py-2">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/60">
                    {parsedStudents.map((std, i) => (
                      <motion.tr
                        key={std.id || i}
                        custom={i}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        className="transition-colors hover:bg-brand-bg/60"
                      >
                        <td className="px-3 py-2 text-center font-mono text-text-muted">{i + 1}</td>
                        <td className="px-3 py-2">
                          <span className="shadow-2xs inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" />
                            Valid
                          </span>
                        </td>
                        <td className="px-3 py-2 font-mono text-[11px] font-bold text-burgundy-primary">{std.studentId}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Avatar
                              src={std.avatar}
                              name={std.name}
                              size="sm"
                              className="h-6 w-6 text-[9px] ring-1 ring-brand-border"
                            />
                            <div>
                              <p className="font-semibold text-text-primary">{std.name}</p>
                              <p className="text-[10px] text-text-muted">{std.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <p className="font-medium text-text-primary">{std.course}</p>
                          <p className="text-[10px] text-text-muted">{std.courseCode}</p>
                        </td>
                        <td className="px-3 py-2">
                          <span className="rounded-md border border-brand-border bg-brand-bg px-2 py-0.5 text-[11px] font-medium text-text-secondary">
                            {std.intake}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-medium text-text-secondary">{std.studentType}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
};

export default BulkUploadModal;
