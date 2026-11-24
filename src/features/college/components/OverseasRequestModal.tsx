import React, { useState } from "react";
import {
  Globe2,
  Mail,
  Calendar,
  FileCheck2,
  FileText,
  CreditCard,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  Link2,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { CollegeOverseasRequest } from "../types";
import { toast } from "@/components/common/ToastMessage";
import { cn } from "@/lib/utils";

export interface OverseasRequestModalProps {
  isOpen: boolean;
  onClose: () => void | boolean | Promise<void | boolean>;
  request: CollegeOverseasRequest | null;
  onUpdateStatus?: (requestId: string, newStatus: CollegeOverseasRequest["status"]) => void | boolean | Promise<void | boolean>;
}

const STATUS_OPTIONS: CollegeOverseasRequest["status"][] = [
  "Pending Review",
  "Documents Verified",
  "Visa In Process",
  "Approved",
  "Rejected",
];

const STATUS_CONFIG: Record<
  CollegeOverseasRequest["status"],
  { bg: string; text: string; border: string; dot: string; icon: React.ComponentType<{ className?: string }> }
> = {
  "Pending Review": {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
    icon: Clock,
  },
  "Documents Verified": {
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
    dot: "bg-sky-500",
    icon: FileCheck2,
  },
  "Visa In Process": {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    dot: "bg-purple-500",
    icon: Globe2,
  },
  Approved: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  Rejected: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    dot: "bg-rose-500",
    icon: AlertCircle,
  },
};

export const OverseasRequestModal: React.FC<OverseasRequestModalProps> = ({
  isOpen,
  onClose,
  request,
  onUpdateStatus,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!request) return null;

  const currentStatusStyle = STATUS_CONFIG[request.status] || STATUS_CONFIG["Pending Review"];
  const StatusIcon = currentStatusStyle.icon;

  const handleCopyApplicationLink = async () => {
    const link = import.meta.env.VITE_PUBLIC_APPLICATION_URL;
    if (!link) { toast.error("The public overseas application URL has not been configured."); return; }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = link;
        textarea.style.position = "fixed";
        textarea.style.left = "-999999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiedLink(true);
      toast.success("Overseas application link copied to clipboard!");
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error("Failed to copy link to clipboard.");
    }
  };

  const handleCopyEmail = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(request.email);
      }
      setCopiedEmail(true);
      toast.success("Applicant email copied!");
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      toast.error("Failed to copy email.");
    }
  };

  const handleStatusSelect = async (newStatus: CollegeOverseasRequest["status"]) => {
    if (newStatus === request.status) return;
    if (await onUpdateStatus?.(request.id, newStatus) === false) return;
    toast.success(`Applicant status updated to "${newStatus}"`);
  };

  const documentChecklist = request.documents || [];

  const completionPct = request.documentsTotal ? Math.round((request.documentsSubmitted / request.documentsTotal) * 100) : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="3xl"
      title="Overseas Applicant Dossier"
      subtitle={`Application ID: ${request.requestId} • Submitted ${request.submissionDate}`}
      headerIcon={
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-burgundy-primary/10 text-burgundy-primary">
          <Globe2 className="h-5 w-5" />
        </div>
      }
      headerActions={
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyApplicationLink}
          className="gap-1.5 rounded-xl text-xs font-semibold"
          title="Copy direct application link"
        >
          {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Link2 className="h-3.5 w-3.5 text-burgundy-primary" />}
          <span>{copiedLink ? "Copied" : "Copy Link"}</span>
        </Button>
      }
    >
      <div className="space-y-5 p-1">
        {/* Applicant Header Card */}
        <div className="flex flex-col gap-4 rounded-2xl border border-brand-border bg-brand-bg/40 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <Avatar
              src={request.avatar}
              name={request.applicantName}
              size="lg"
              className="shrink-0 ring-2 ring-burgundy-primary/20"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-text-primary">{request.applicantName}</h3>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                    currentStatusStyle.bg,
                    currentStatusStyle.text,
                    currentStatusStyle.border,
                  )}
                >
                  <StatusIcon className="h-3 w-3" />
                  {request.status}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-text-muted" />
                  {request.country} ({request.countryCode})
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <CreditCard className="h-3.5 w-3.5 text-text-muted" />
                  {request.passportNo}
                </span>
              </div>
            </div>
          </div>

          {/* Quick email action */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyEmail}
              className="inline-flex items-center gap-1.5 rounded-xl border border-brand-border bg-white px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-burgundy-primary/40 hover:text-burgundy-primary"
              title="Copy applicant email"
            >
              {copiedEmail ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Mail className="h-3.5 w-3.5 text-text-muted" />}
              <span className="truncate max-w-[160px]">{request.email}</span>
            </button>
          </div>
        </div>

        {/* Two-Column Grid: Course & Dossier Details */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Desired Program & Intake */}
          <div className="rounded-2xl border border-brand-border bg-white p-4 shadow-2xs">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
              <FileText className="h-4 w-4 text-burgundy-primary" />
              Program Application
            </h4>
            <div className="mt-3 space-y-2.5 text-xs">
              <div>
                <span className="text-[11px] text-text-muted">Course Applied</span>
                <p className="font-semibold text-text-primary text-sm">{request.requestedCourse}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-brand-border/60">
                <div>
                  <span className="text-[11px] text-text-muted">Target Intake</span>
                  <p className="font-semibold text-text-primary">{request.requestedIntake}</p>
                </div>
                <div>
                  <span className="text-[11px] text-text-muted">Application Date</span>
                  <p className="font-semibold text-text-primary flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-text-muted" />
                    {request.submissionDate}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Identity & Legal Information */}
          <div className="rounded-2xl border border-brand-border bg-white p-4 shadow-2xs">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
              <Globe2 className="h-4 w-4 text-burgundy-primary" />
              Applicant Identification
            </h4>
            <div className="mt-3 space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-text-muted">Nationality</span>
                  <p className="font-semibold text-text-primary">{request.country}</p>
                </div>
                <div>
                  <span className="text-[11px] text-text-muted">Country Code</span>
                  <p className="font-mono font-semibold text-text-primary">{request.countryCode}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-brand-border/60">
                <div>
                  <span className="text-[11px] text-text-muted">Passport Number</span>
                  <p className="font-mono font-semibold text-text-primary">{request.passportNo}</p>
                </div>
                <div>
                  <span className="text-[11px] text-text-muted">Reference ID</span>
                  <p className="font-mono font-semibold text-burgundy-primary">{request.requestId}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Checklist */}
        <div className="rounded-2xl border border-brand-border bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
              <FileCheck2 className="h-4 w-4 text-burgundy-primary" />
              Document Verification Dossier
            </h4>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-burgundy-primary">
                {request.documentsSubmitted} of {request.documentsTotal} Verified
              </span>
              <span className="text-text-muted">({completionPct}%)</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-brand-bg">
            <div
              className="h-full rounded-full bg-gradient-to-r from-burgundy-primary to-brand-red transition-all duration-300"
              style={{ width: `${completionPct}%` }}
            />
          </div>

          {/* Document list */}
          <div className="mt-4 divide-y divide-brand-border/60">
            {documentChecklist.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between py-2.5 text-xs">
                <div className="min-w-0 pr-2">
                  <p className="font-semibold text-text-primary truncate">{doc.name}</p>
                  <p className="text-[11px] text-text-muted truncate">{doc.detail}</p>
                </div>
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center rounded-lg px-2 py-0.5 text-[11px] font-semibold",
                    doc.status === "Verified"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200",
                  )}
                >
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Decision Controls */}
        <div className="rounded-2xl border border-brand-border bg-brand-bg/40 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold text-text-primary">Update Application Status</p>
              <p className="text-[11px] text-text-muted">Move applicant along the admission pipeline</p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {STATUS_OPTIONS.map((status) => {
                const isActive = request.status === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleStatusSelect(status)}
                    className={cn(
                      "rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all shadow-2xs",
                      isActive
                        ? "bg-burgundy-primary text-white shadow-sm ring-1 ring-burgundy-primary"
                        : "bg-white text-text-secondary border border-brand-border hover:bg-brand-bg hover:text-text-primary active:scale-95",
                    )}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-brand-border/60 pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyApplicationLink}
            className="gap-1.5 rounded-xl text-xs font-semibold"
          >
            {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-burgundy-primary" />}
            <span>{copiedLink ? "Link Copied" : "Copy Application Link"}</span>
          </Button>

          <Button
            variant="burgundy"
            size="sm"
            onClick={onClose}
            className="rounded-xl px-5 text-xs font-semibold"
          >
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};

