import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { UploadCloud, FileSpreadsheet, Download, CheckCircle2, FileSearch, XCircle, Eye, Loader2, Check, Users } from "lucide-react";

import { parseUpload, importUpload, downloadStudentTemplate as downloadTemplateCsv } from "@/services/bulkUpload";
import { apiMessage } from "@/services/ams";
import { CollegeBulkUploadHistory, CollegeStudent } from "../../types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { toast } from "@/components/common/ToastMessage";

import { cn } from "@/lib/utils";
import { smoothEase, gentleSpring } from "@/components/animations/transitions";

export interface BulkUploadTabProps {
  history?: CollegeBulkUploadHistory[];
  className?: string;
  onImportComplete?: (importedCount: number, entity: string) => void;
}


export const BulkUploadTab: React.FC<BulkUploadTabProps> = ({ className, onImportComplete }) => {
  const shouldReduceMotion = useReducedMotion();

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Parsed students data state
  const [parsedStudents, setParsedStudents] = useState<CollegeStudent[] | null>(null);

  // Modal review state using Modal.tsx
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Drag & Drop
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
    toast.success(`Selected file "${file.name}". Click "Parse File" to process.`);
  };

  // Cancel action: clears selected file and parsed data
  const handleCancel = () => {
    setSelectedFile(null);
    setParsedStudents(null);
    setIsPreviewModalOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.info("Upload selection cancelled.");
  };

  // Parse File action
  const handleParseFile = async () => {
    if (!selectedFile) { toast.error("Select a file first."); return; }
    setIsParsing(true);
    try {
      const rows = await parseUpload(selectedFile); setParsedStudents(rows);
      setIsPreviewModalOpen(true);
      toast.success(`Parsed ${rows.length} student records for review.`);
    } catch (error) { toast.error("Unable to parse file", { description: apiMessage(error) }); }
    finally { setIsParsing(false); }
  };

  const handleConfirmImport = async () => {
    if (!selectedFile || !parsedStudents?.length || isImporting) return;
    setIsImporting(true);
    try {
      const result = await importUpload(selectedFile);
      if (result.errors.length) toast.warning("Students imported with warnings", { description: JSON.stringify(result.errors).slice(0, 500) });
      else toast.success(`Imported ${result.count} students.`);
      onImportComplete?.(result.count, "Students"); setIsPreviewModalOpen(false);
      setParsedStudents(null); setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) { toast.error("Import failed", { description: apiMessage(error) }); }
    finally { setIsImporting(false); }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: smoothEase,
        staggerChildren: 0.08,
      },
    },
  };

  const itemFadeVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: smoothEase },
    },
  };

  const tableRowVariants = {
    hidden: { opacity: 0, x: shouldReduceMotion ? 0 : -8 },
    visible: (custom: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: custom * 0.035,
        duration: 0.28,
        ease: smoothEase,
      },
    }),
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn("space-y-6", className)}
    >
      {/* Upload Zone Card customized with Avis World College brand colors & motion */}
      <motion.div
        variants={itemFadeVariants}
        className="relative overflow-hidden rounded-2xl border border-brand-border bg-brand-card p-6 shadow-card sm:p-8"
      >
        {/* Top Brand Accent Gradient Bar with subtle shimmer */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, ease: smoothEase }}
          className="pointer-events-none absolute inset-x-0 top-0 h-[3px] origin-left bg-gradient-to-r from-transparent via-burgundy-primary/80 to-transparent"
        />

        {/* Centered Heading */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.08, duration: 0.3, ease: smoothEase }}
            className="shadow-2xs mb-2.5 inline-flex items-center gap-1.5 rounded-full bg-burgundy-primary/10 px-3 py-1 text-[11px] font-semibold tracking-wider text-burgundy-primary ring-1 ring-burgundy-primary/20"
          >
            <Users className="h-3 w-3 animate-pulse" />
            <span>STUDENT BATCH ENROLLMENT</span>
          </motion.div>
          <motion.h2
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.12, duration: 0.35, ease: smoothEase }}
            className="text-xl font-bold tracking-tight text-text-primary sm:text-xl"
          >
            Bulk Upload Students
          </motion.h2>
          <motion.p
            initial={{ y: 6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.16, duration: 0.35, ease: smoothEase }}
            className="mx-auto mt-1 max-w-md text-xs text-text-secondary"
          >
            Upload an Excel (.xlsx) or CSV spreadsheet to validate and batch register students.
          </motion.p>
        </div>

        {/* Main Upload Box */}
        <motion.div
          variants={itemFadeVariants}
          className="mt-6 flex flex-col items-center justify-center gap-4"
        >
          {/* Hidden HTML File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Drag & Drop Area styled with Brand Burgundy Palette & interactive hover */}
          <motion.div
            whileHover={shouldReduceMotion ? {} : { scale: 1.008, y: -2 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.995 }}
            transition={gentleSpring}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "group relative flex w-full max-w-2xl cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed px-6 py-9 text-center transition-all duration-200",
              isDragging
                ? "border-burgundy-primary bg-burgundy-primary/[0.08] shadow-md ring-4 ring-burgundy-primary/15"
                : "border-palette-5/60 bg-brand-bg/60 hover:border-burgundy-primary hover:bg-burgundy-primary/[0.04] hover:shadow-card-hover",
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

            {/* Burgundy Cloud Upload Icon with gentle float */}
            <motion.div
              animate={shouldReduceMotion ? {} : isDragging ? { y: [-3, 3, -3], scale: 1.1 } : { y: [0, -5, 0] }}
              transition={{
                repeat: Infinity,
                duration: 2.8,
                ease: "easeInOut",
              }}
              className="h-13 w-13 shadow-2xs mb-2.5 flex items-center justify-center rounded-2xl bg-burgundy-primary/10 text-burgundy-primary ring-1 ring-burgundy-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-burgundy-primary group-hover:text-white group-hover:ring-burgundy-dark/30"
            >
              <UploadCloud className="h-7 w-7 stroke-[2]" />
            </motion.div>

            {/* Title */}
            <p className="text-base font-bold text-text-primary transition-colors group-hover:text-burgundy-primary">Upload File</p>

            {/* Subtext */}
            <p className="mt-1 text-xs text-text-muted">Drag & drop or click to upload an XLSX file.</p>

            {/* Selected File indicator with spring pop-in */}
            <AnimatePresence>
              {selectedFile && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -8 }}
                  transition={{ type: "spring", stiffness: 450, damping: 25 }}
                  className="shadow-xs mt-3.5 inline-flex items-center gap-2 rounded-xl border border-burgundy-primary/25 bg-burgundy-primary/10 px-3.5 py-1.5 text-xs font-semibold text-burgundy-primary"
                >
                  <FileSpreadsheet className="h-4 w-4 shrink-0 animate-pulse text-burgundy-primary" />
                  <span className="max-w-[240px] truncate">{selectedFile.name}</span>
                  <span className="font-normal text-text-muted">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Action Buttons with tactile spring hover */}
        <motion.div
          variants={itemFadeVariants}
          className="mt-4 flex shrink-0 items-center justify-center gap-3"
        >
          {/* Parse File Button */}
          <motion.button
            whileHover={shouldReduceMotion ? {} : { scale: 1.03, y: -1 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.96 }}
            transition={gentleSpring}
            type="button"
            onClick={handleParseFile}
            disabled={isParsing}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-burgundy-primary px-5 py-2 text-xs font-semibold text-white shadow-md shadow-burgundy-primary/20 ring-1 ring-burgundy-dark/20 transition-all hover:bg-burgundy-hover active:scale-95 disabled:opacity-60 sm:text-sm"
            title="Parse and validate uploaded spreadsheet"
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
            className="shadow-2xs inline-flex cursor-pointer items-center gap-2 rounded-xl border border-brand-border bg-brand-bg px-5 py-2 text-xs font-semibold text-text-secondary transition-all hover:border-burgundy-blush hover:bg-palette-6 hover:text-burgundy-primary active:scale-95 sm:text-sm"
            title="Cancel file selection and reset"
          >
            <XCircle className="h-4 w-4 shrink-0 text-burgundy-primary/70" />
            <span>Cancel</span>
          </motion.button>
        </motion.div>

        {/* Template & Guidelines Footer Bar */}
        <motion.div
          variants={itemFadeVariants}
          className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-brand-border pt-4 text-xs text-text-muted"
        >
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1 font-semibold text-burgundy-primary">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Supported: XLSX, XLS, CSV (Max 15MB)
            </span>
            <span className="text-brand-border">•</span>
            <span>UTF-8 encoded</span>
          </div>

          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadTemplateCsv("Students")}
                className="shadow-2xs gap-1.5 rounded-xl border-brand-border bg-white text-xs font-semibold text-text-secondary transition-all hover:border-burgundy-primary/40 hover:bg-brand-bg hover:text-burgundy-primary"
              >
                <Download className="h-3.5 w-3.5 text-burgundy-primary" />
                <span>Download Students Template</span>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Parsed Data Preview Section with smooth AnimatePresence */}
      <AnimatePresence>
        {parsedStudents && parsedStudents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.4, ease: smoothEase }}
            className="space-y-4 rounded-2xl border border-brand-border bg-brand-card p-5 shadow-card sm:p-6"
          >
            {/* Header Summary */}
            <div className="flex flex-col gap-3 border-b border-brand-border pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    className="shadow-2xs flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
                  >
                    <Check className="h-4 w-4 stroke-[2.5]" />
                  </motion.span>
                  <h3 className="text-sm font-bold text-text-primary">Parsed Student Records ({parsedStudents.length} Ready to Import)</h3>
                </div>
                <p className="mt-0.5 text-xs text-text-muted">
                  All records verified against course catalog and matriculation rules. Review before committing.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPreviewModalOpen(true)}
                    className="shadow-2xs gap-1.5 rounded-xl border-brand-border text-xs font-semibold text-text-secondary hover:border-burgundy-primary/40 hover:text-burgundy-primary"
                  >
                    <Eye className="h-3.5 w-3.5 text-burgundy-primary" />
                    <span>Modal View</span>
                  </Button>
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => setParsedStudents(null)}
                  className="shadow-2xs cursor-pointer rounded-xl border border-brand-border px-3.5 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:bg-brand-bg hover:text-burgundy-primary"
                >
                  Clear Preview
                </motion.button>

                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <Button
                    variant="burgundy"
                    size="sm"
                    onClick={handleConfirmImport}
                    disabled={isImporting}
                    className="gap-1.5 rounded-xl text-xs font-semibold shadow-md shadow-burgundy-primary/20"
                  >
                    {isImporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                    <span>{isImporting ? "Importing..." : `Confirm & Import ${parsedStudents.length} Students`}</span>
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Parsed Student Records Table with staggered row slide-in */}
            <div className="overflow-x-auto rounded-xl border border-brand-border">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-brand-border bg-brand-bg/80 font-semibold text-text-muted">
                  <tr>
                    <th className="w-12 px-3.5 py-2.5 text-center">#</th>
                    <th className="px-3.5 py-2.5">Status</th>
                    <th className="px-3.5 py-2.5">Student ID</th>
                    <th className="px-3.5 py-2.5">Full Name & Email</th>
                    <th className="px-3.5 py-2.5">Passport / NRIC</th>
                    <th className="px-3.5 py-2.5">Course</th>
                    <th className="px-3.5 py-2.5">Intake</th>
                    <th className="px-3.5 py-2.5">Type & Country</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/70">
                  {parsedStudents.map((std, idx) => (
                    <motion.tr
                      key={std.id || idx}
                      custom={idx}
                      variants={tableRowVariants}
                      initial="hidden"
                      animate="visible"
                      className="transition-colors hover:bg-brand-bg/60"
                    >
                      <td className="px-3.5 py-2.5 text-center font-mono text-text-muted">{String(idx + 1).padStart(2, "0")}</td>
                      <td className="px-3.5 py-2.5">
                        <span className="shadow-2xs inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" />
                          Valid
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 font-mono font-bold text-burgundy-primary">{std.studentId}</td>
                      <td className="px-3.5 py-2.5">
                        <div className="flex items-center gap-2">
                          <Avatar
                            src={std.avatar}
                            name={std.name}
                            size="sm"
                            className="h-7 w-7 text-[10px] ring-1 ring-brand-border"
                          />
                          <div>
                            <p className="font-bold text-text-primary">{std.name}</p>
                            <p className="text-[10px] text-text-muted">{std.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3.5 py-2.5 font-mono text-[11px] text-text-secondary">
                        <span className="rounded-lg border border-brand-border bg-brand-bg px-2 py-0.5 font-medium">
                          {std.passportOrNric || "N/A"}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5">
                        <div>
                          <p className="font-semibold text-text-primary">{std.course}</p>
                          <p className="text-[10px] text-text-muted">{std.courseCode}</p>
                        </div>
                      </td>
                      <td className="px-3.5 py-2.5">
                        <span className="rounded-md border border-brand-border bg-brand-bg px-2 py-0.5 text-[11px] font-medium text-text-secondary">
                          {std.intake}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5">
                        <div className="text-[11px]">
                          <span className="font-semibold text-text-primary">{std.studentType}</span>
                          <span className="text-text-muted"> • {std.nationality}</span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Parsed Data Review Modal using Modal.tsx with Avis brand styling */}
      {isPreviewModalOpen && parsedStudents && (
        <Modal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          title="Bulk Upload Students - Verified Records"
          subtitle={`Successfully parsed ${parsedStudents.length} student records from ${selectedFile ? selectedFile.name : "batch spreadsheet"}`}
          headerIcon={<FileSpreadsheet className="h-5 w-5 text-burgundy-primary" />}
          maxWidth="4xl"
          showFullScreenToggle={true}
          footer={
            <div className="flex w-full items-center justify-between">
              <span className="text-xs text-text-muted">{parsedStudents.length} records ready to import</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="shadow-2xs rounded-xl border-brand-border text-xs text-text-secondary hover:border-burgundy-primary/40 hover:text-burgundy-primary"
                >
                  Close
                </Button>
                <Button
                  variant="burgundy"
                  size="sm"
                  onClick={handleConfirmImport}
                  disabled={isImporting}
                  className="gap-1.5 rounded-xl text-xs font-semibold shadow-md shadow-burgundy-primary/20"
                >
                  {isImporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  <span>{isImporting ? "Importing..." : `Confirm & Import ${parsedStudents.length} Students`}</span>
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>All {parsedStudents.length} student records have passed format checks and are ready for matriculation.</span>
            </div>

            <div className="max-h-[55vh] overflow-y-auto rounded-xl border border-brand-border">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 border-b border-brand-border bg-brand-bg font-semibold text-text-muted">
                  <tr>
                    <th className="w-10 px-3 py-2 text-center">#</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Student</th>
                    <th className="px-3 py-2">Passport / NRIC</th>
                    <th className="px-3 py-2">Course</th>
                    <th className="px-3 py-2">Intake</th>
                    <th className="px-3 py-2">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {parsedStudents.map((std, idx) => (
                    <tr
                      key={std.id || idx}
                      className="transition-colors hover:bg-brand-bg/40"
                    >
                      <td className="px-3 py-2 text-center font-mono text-text-muted">{idx + 1}</td>
                      <td className="px-3 py-2">
                        <span className="shadow-2xs inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" />
                          Valid
                        </span>
                      </td>
                      <td className="px-3 py-2 font-mono font-bold text-burgundy-primary">{std.studentId}</td>
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
                      <td className="px-3 py-2 font-mono text-[11px] text-text-secondary">{std.passportOrNric || "N/A"}</td>
                      <td className="px-3 py-2">
                        <p className="font-medium text-text-primary">{std.course}</p>
                        <p className="text-[10px] text-text-muted">{std.courseCode}</p>
                      </td>
                      <td className="px-3 py-2 text-text-secondary">{std.intake}</td>
                      <td className="px-3 py-2 font-medium text-text-secondary">{std.studentType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      )}
    </motion.div>
  );
};

export default BulkUploadTab;
