import React from "react";
import { Modal } from "@/components/ui/Modal";
import { InstituteItem } from "../types";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  ExternalLink,
  Edit3,
  Calendar,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { sanitizeUrl } from "@/lib/security";
import { toast } from "@/components/common/ToastMessage";
import { cn } from "@/lib/utils";

export interface InstituteDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  institute: InstituteItem | null;
  onEdit?: (institute: InstituteItem) => void;
}

export const InstituteDetailsModal: React.FC<InstituteDetailsModalProps> = ({
  isOpen,
  onClose,
  institute,
  onEdit,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!institute) return null;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(`${institute.name}, ${institute.address}, ${institute.country}`);
    setCopied(true);
    toast.success("Address Copied", {
      description: "Full institute address copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const mapUrl = institute.googleLocation
    ? sanitizeUrl(institute.googleLocation)
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${institute.name}, ${institute.address}, ${institute.country}`,
      )}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2">
          <span className="truncate max-w-[280px] sm:max-w-md">{institute.name}</span>
        </div>
      }
      subtitle={
        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono font-semibold text-text-muted">{institute.instituteCode}</span>
          <span>•</span>
          <span className="text-text-secondary">{institute.category || "Campus"}</span>
        </div>
      }
      headerIcon={
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-burgundy-primary/10 text-burgundy-primary">
          <Building2 className="h-5 w-5 stroke-[2.2]" />
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-[11px] text-text-muted">
            Registered: {institute.createdAt || "Active Directory"}
          </span>
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onEdit(institute);
                }}
                className="rounded-xl border-brand-border text-xs font-semibold text-text-secondary hover:border-burgundy-primary hover:text-burgundy-primary"
              >
                <Edit3 className="mr-1.5 h-3.5 w-3.5 text-burgundy-primary" />
                Edit Details
              </Button>
            )}
            <Button
              type="button"
              variant="burgundy"
              size="sm"
              onClick={onClose}
              className="rounded-xl px-4 text-xs font-bold text-white shadow-burgundy/20"
            >
              Close
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Banner with Image and Key Overview */}
        <div className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-brand-border/80 bg-gradient-to-br from-brand-bg/60 via-white to-brand-bg/40 p-4">
          <div className="relative shrink-0">
            <img
              src={institute.imageUrl}
              alt={institute.name}
              className="h-20 w-20 rounded-2xl border-2 border-white object-cover shadow-md ring-1 ring-brand-border"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/avis-emblem.png";
              }}
            />
            <span
              className={cn(
                "absolute -bottom-1 -right-1 flex h-5 items-center gap-1 rounded-full border-2 border-white px-2 text-[10px] font-bold text-white shadow-sm",
                institute.status === "Active" ? "bg-emerald-600" : "bg-amber-600",
              )}
            >
              {institute.status}
            </span>
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left space-y-1">
            <h3 className="text-base font-bold text-text-primary leading-tight">{institute.name}</h3>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
              <span className="inline-flex items-center gap-1 rounded-md border border-brand-border bg-white px-2 py-0.5 text-[11px] font-semibold text-text-secondary">
                <Globe className="h-3 w-3 text-burgundy-primary" />
                {institute.country}
              </span>
              {institute.category && (
                <span className="rounded-md border border-burgundy-primary/20 bg-burgundy-primary/10 px-2 py-0.5 text-[11px] font-bold text-burgundy-primary">
                  {institute.category}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Email */}
          <div className="rounded-xl border border-brand-border/70 bg-white p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-muted">
              <Mail className="h-3.5 w-3.5 text-burgundy-primary" />
              <span>Email Address</span>
            </div>
            <a
              href={`mailto:${institute.email}`}
              className="block truncate text-xs font-semibold text-burgundy-primary hover:underline"
            >
              {institute.email}
            </a>
          </div>

          {/* Contact No */}
          <div className="rounded-xl border border-brand-border/70 bg-white p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-muted">
              <Phone className="h-3.5 w-3.5 text-burgundy-primary" />
              <span>Contact Phone</span>
            </div>
            <a
              href={`tel:${institute.contactNo}`}
              className="block truncate text-xs font-semibold text-text-primary hover:text-burgundy-primary"
            >
              {institute.contactNo}
            </a>
          </div>

          {/* Established Year / Capacity */}
          <div className="rounded-xl border border-brand-border/70 bg-white p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-muted">
              <Calendar className="h-3.5 w-3.5 text-burgundy-primary" />
              <span>Established</span>
            </div>
            <p className="text-xs font-semibold text-text-primary">
              {institute.establishedYear ? `Year ${institute.establishedYear}` : "Official Partner"}
            </p>
          </div>

          {/* Website */}
          <div className="rounded-xl border border-brand-border/70 bg-white p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-muted">
              <Globe className="h-3.5 w-3.5 text-burgundy-primary" />
              <span>Campus Portal</span>
            </div>
            {institute.website ? (
              <a
                href={sanitizeUrl(institute.website)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 truncate text-xs font-semibold text-burgundy-primary hover:underline"
              >
                <span className="truncate">{institute.website}</span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            ) : (
              <p className="text-xs text-text-muted">None listed</p>
            )}
          </div>
        </div>

        {/* Address & Google Maps Location Card */}
        <div className="rounded-2xl border border-brand-border/80 bg-brand-bg/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
              <MapPin className="h-4 w-4 text-burgundy-primary" />
              <span>Physical Address & Map Location</span>
            </div>
            <button
              type="button"
              onClick={handleCopyAddress}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-text-secondary hover:text-burgundy-primary transition-colors"
              title="Copy address"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-bold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Address</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs font-medium text-text-secondary leading-relaxed bg-white/70 p-2.5 rounded-xl border border-brand-border/60">
            {institute.address}, {institute.country}
          </p>

          <div className="flex items-center justify-end">
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-burgundy-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-xs shadow-burgundy/20 hover:bg-burgundy-hover transition-colors"
            >
              <MapPin className="h-3.5 w-3.5" />
              <span>Open in Google Maps</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
};
