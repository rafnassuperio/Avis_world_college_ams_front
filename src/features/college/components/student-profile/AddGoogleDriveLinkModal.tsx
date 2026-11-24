import React, { useState } from "react";
import { Link2, Plus, AlertCircle, FileText, Globe } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FilterSelect, FilterSelectOption } from "@/components/ui/FilterSelect";
import { toast } from "@/components/common/ToastMessage";
import { sanitizeUrl } from "@/lib/security";

export interface AddGoogleDriveLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLink: (link: { title: string; url: string; category?: string }) => void | boolean | Promise<void | boolean>;
}

export const DRIVE_CATEGORY_OPTIONS: FilterSelectOption[] = [
  { value: "Pass / Visa", label: "Pass / Visa", badgeDot: "bg-sky-500", subLabel: "ICA Student Pass, IPA & Visa" },
  { value: "Academic Transcripts", label: "Academic Transcripts", badgeDot: "bg-purple-500", subLabel: "Certificates, Diplomas & Grade Sheets" },
  { value: "Contract & FPS", label: "Contract & FPS", badgeDot: "bg-emerald-500", subLabel: "Advisory Note, PEI-Student Contract & FPS" },
  { value: "Identification", label: "Identification", badgeDot: "bg-amber-500", subLabel: "Passport Scans, NRIC, FIN & Photos" },
  { value: "Medical", label: "Medical", badgeDot: "bg-rose-500", subLabel: "Health Screening & Medical Reports" },
  { value: "Financial & Receipts", label: "Financial & Receipts", badgeDot: "bg-blue-500", subLabel: "Tuition Invoices, Receipts & Escrow" },
  { value: "General Documents", label: "General Documents", badgeDot: "bg-slate-500", subLabel: "Official Letters & Correspondence" },
];

export const AddGoogleDriveLinkModal: React.FC<AddGoogleDriveLinkModalProps> = ({ isOpen, onClose, onAddLink }) => {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("Pass / Visa");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please provide a title for this Google Drive resource.");
      return;
    }

    if (!url.trim()) {
      setError("Please provide a valid Google Drive URL or share link.");
      return;
    }

    const sanitized = sanitizeUrl(url.trim());
    if (sanitized === "#" || !url.startsWith("http")) {
      setError("Please provide a valid URL starting with https:// or http://");
      return;
    }

    if (await onAddLink({
      title: title.trim(),
      url: sanitized,
      category: category.trim(),
    }) === false) return;

    toast.success(`Google Drive link "${title.trim()}" added successfully`);
    setTitle("");
    setUrl("");
    setCategory("Documents");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Google Drive Link"
      subtitle="Attach documents, dossiers, or folders from Google Drive to this student profile"
      headerIcon={
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-burgundy-primary/20 bg-burgundy-primary/10 text-burgundy-primary">
          <Link2 className="h-5 w-5" />
        </div>
      }
      maxWidth="md"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-4 pt-2"
      >
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Title Input */}
        <Input
          label="Document Title"
          required
          icon={FileText}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Student Pass Application & Form 16"
          autoFocus
        />

        {/* URL Input */}
        <Input
          label="Google Drive URL / Folder Link"
          type="url"
          required
          isMono
          icon={Globe}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://drive.google.com/drive/folders/..."
          helperText="Make sure the Google Drive link has proper sharing permissions (e.g. AceTek College domain or viewer access)."
        />

        {/* Category Selector using FilterSelect */}
        <div>
          <FilterSelect
            label="Category"
            value={category}
            options={DRIVE_CATEGORY_OPTIONS}
            onChange={setCategory}
            buttonClassName="bg-white border-brand-border py-2 px-3 text-xs rounded-xl"
            menuClassName="w-full min-w-full max-w-none"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            className="gap-1.5 bg-burgundy-hover text-xs font-semibold text-white shadow-md shadow-burgundy-hover/20 hover:bg-burgundy-light"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Link
          </Button>
        </div>
      </form>
    </Modal>
  );
};
