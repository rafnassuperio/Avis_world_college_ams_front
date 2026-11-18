import React, { useState } from "react";
import { ExternalLink, Plus, Trash2, Copy, Check, FolderGit2, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { safeExternalLinkProps, sanitizeUrl } from "@/lib/security";
import { toast } from "@/components/common/ToastMessage";
import { cn } from "@/lib/utils";

export interface DriveLinkItem {
  id: string;
  title: string;
  url: string;
  addedDate?: string;
  category?: string;
}

export interface GoogleDriveLinksCardProps {
  links: DriveLinkItem[];
  onAddClick: () => void;
  onRemoveLink: (linkId: string) => void;
  className?: string;
}

export const GoogleDriveLinksCard: React.FC<GoogleDriveLinksCardProps> = ({ links, onAddClick, onRemoveLink, className }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Drive link copied to clipboard");
    setTimeout(() => {
      setCopiedId((prev) => (prev === id ? null : prev));
    }, 2000);
  };

  return (
    <div className={cn("shadow-xs overflow-hidden rounded-2xl border border-brand-border bg-white transition-shadow hover:shadow-sm", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-brand-border/60 bg-gradient-to-r from-brand-bg/40 to-white px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="shadow-2xs flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-600">
            {/* Google Drive styled tri-color shape / folder icon */}
            <svg
              className="h-4 w-4"
              viewBox="0 0 87.3 78"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z"
                fill="#0066DA"
              />
              <path
                d="M43.65 25 29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44C.4 50 0 51.55 0 53.1h27.5z"
                fill="#00AC47"
              />
              <path
                d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.85 10.15z"
                fill="#EA4335"
              />
              <path
                d="M43.65 25 57.4 1.2C56.05.4 54.5 0 52.9 0H34.4c-1.6 0-3.15.4-4.5 1.2z"
                fill="#00832D"
              />
              <path
                d="M59.8 53.1H27.5L13.75 76.9c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.4 4.5-1.2z"
                fill="#2684FC"
              />
              <path
                d="M73.4 26.5 60.7 4.5c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25 57.4 48.8h27.45c0-1.55-.4-3.1-1.2-4.5z"
                fill="#FFBA00"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-text-primary">Google Drive Links</h2>
          </div>
        </div>

        {/* Add Link Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddClick}
          className="shadow-2xs h-8 rounded-xl border-brand-border bg-brand-bg/60 px-3 text-xs font-semibold text-burgundy-primary transition-all hover:border-burgundy-primary/40 hover:bg-brand-light-red/30"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add Link
        </Button>
      </div>

      {/* Body: Links List */}
      <div className="p-4 sm:p-5">
        {links.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-brand-border/80 bg-brand-bg/40 p-8 text-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl border border-burgundy-primary/20 bg-burgundy-primary/10 text-burgundy-primary">
              <FolderGit2 className="h-6 w-6" />
            </div>
            <p className="text-xs font-semibold text-text-primary">No Google Drive links attached</p>
            <p className="mt-0.5 max-w-xs text-[11px] text-text-muted">
              Link relevant dossiers, visa approval in-principle (IPA), and matriculation files.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAddClick}
              className="mt-3.5 h-8 rounded-xl text-xs font-semibold"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add First Link
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {links.map((link) => {
              const isCopied = copiedId === link.id;
              const sanitized = sanitizeUrl(link.url);
              return (
                <div
                  key={link.id}
                  className="hover:shadow-2xs group relative flex flex-col justify-between rounded-xl border border-brand-border bg-brand-bg/30 p-3.5 transition-all hover:border-burgundy-primary/30 hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-burgundy-primary/20 bg-burgundy-primary/10 text-burgundy-primary">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="line-clamp-1 text-xs font-bold text-text-primary transition-colors group-hover:text-burgundy-primary">
                          {link.title}
                        </div>
                        {link.category && (
                          <span className="py-0.2 inline-block rounded border border-brand-border bg-brand-bg px-1.5 text-[10px] font-medium text-text-secondary">
                            {link.category}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveLink(link.id)}
                      title="Remove this link"
                      className="rounded-md p-1 text-text-muted opacity-0 transition-opacity hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* URL preview & Actions */}
                  <div className="mt-3 flex items-center justify-between border-t border-brand-border/60 pt-2.5 text-[11px]">
                    <span
                      className="max-w-[130px] truncate font-mono text-text-muted"
                      title={link.url}
                    >
                      {link.url.replace(/^https?:\/\/(www\.)?/, "")}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleCopy(link.url, link.id)}
                        title="Copy URL"
                        className="rounded p-1 text-text-muted transition-colors hover:text-text-primary"
                      >
                        {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>

                      <a
                        href={sanitized}
                        {...safeExternalLinkProps(true)}
                        className="inline-flex items-center gap-1 rounded-md bg-burgundy-primary/10 px-2 py-1 text-[10px] font-semibold text-burgundy-primary transition-colors hover:bg-burgundy-primary hover:text-white"
                      >
                        <span>Open</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
