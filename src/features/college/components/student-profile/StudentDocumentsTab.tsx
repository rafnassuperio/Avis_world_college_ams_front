import React, { useState, useMemo } from "react";
import { FolderGit2, FileText, Plus, Search, ExternalLink, Copy, Check, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/common/ToastMessage";
import { safeExternalLinkProps, sanitizeUrl } from "@/lib/security";
import { CollegeStudent } from "../../types";

export interface StudentDocumentsTabProps {
  student: CollegeStudent;
  onAddClick: () => void;
  onRemoveLink: (linkId: string) => void;
}

export const StudentDocumentsTab: React.FC<StudentDocumentsTabProps> = ({
  student,
  onAddClick,
  onRemoveLink,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const links = student.googleDriveLinks || [];

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    links.forEach((l) => {
      if (l.category) set.add(l.category);
    });
    return ["All", ...Array.from(set)];
  }, [links]);

  // Filtered links
  const filteredLinks = useMemo(() => {
    return links.filter((link) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        link.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        (link.category && link.category.toLowerCase().includes(searchQuery.toLowerCase().trim()));

      const matchesCat = selectedCategory === "All" || link.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [links, searchQuery, selectedCategory]);

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Drive link copied to clipboard");
    setTimeout(() => {
      setCopiedId((prev) => (prev === id ? null : prev));
    }, 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header & Filter Controls */}
      <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-xs">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-text-primary">Google Drive Attached Documents</h2>
              <span className="rounded-full bg-burgundy-primary/10 px-2.5 py-0.5 text-xs font-bold text-burgundy-primary">
                {links.length} {links.length === 1 ? "file" : "files"}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-text-muted">
              Attached dossiers, immigration passes, passport scans & academic transcripts
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onAddClick}
            className="gap-1.5 rounded-xl bg-burgundy-primary px-4 text-xs font-semibold text-white hover:bg-burgundy-dark"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Google Drive Link</span>
          </Button>
        </div>

        {/* Search & Category Filter Pills */}
        <div className="mt-4 flex flex-col gap-3 pt-3 border-t border-brand-border/60 sm:flex-row sm:items-center sm:justify-between">
          <div className="group relative flex w-full items-center rounded-xl border border-brand-border/80 bg-brand-bg/50 p-1 shadow-2xs transition-all duration-200 focus-within:border-burgundy-primary/60 focus-within:bg-white focus-within:ring-2 focus-within:ring-burgundy-primary/10 hover:border-brand-border hover:bg-white sm:w-80">
            <Search className="ml-2 h-3.5 w-3.5 shrink-0 text-text-muted transition-colors group-focus-within:text-burgundy-primary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents by title or category..."
              className="h-7 w-full bg-transparent px-2.5 text-xs font-medium text-text-primary placeholder:text-text-muted focus:outline-none"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mr-1 rounded-md p-1 text-text-muted transition-colors hover:bg-brand-bg hover:text-text-primary"
                title="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            ) : (
              <span className="mr-1.5 hidden rounded border border-brand-border bg-white px-1.5 py-0.5 font-mono text-[9px] font-semibold text-text-muted sm:inline-block">
                Docs
              </span>
            )}
          </div>

          {categories.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                    selectedCategory === cat
                      ? "bg-burgundy-primary text-white shadow-2xs"
                      : "bg-brand-bg text-text-secondary hover:bg-brand-border/60"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Documents Grid */}
      {filteredLinks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-border bg-white p-10 text-center shadow-xs">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-burgundy-primary/20 bg-burgundy-primary/10 text-burgundy-primary">
            <FolderGit2 className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-text-primary">
            {searchQuery ? "No matching documents found" : "No Google Drive documents attached"}
          </h3>
          <p className="mt-1 max-w-sm text-xs text-text-muted">
            {searchQuery
              ? `No documents matched the search query "${searchQuery}". Clear search or try another keyword.`
              : "Attach student pass IPA letters, matriculation contracts, and official documents from Google Drive."}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddClick}
            className="mt-4 gap-1.5 rounded-xl text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Attach New Document</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredLinks.map((link) => {
            const isCopied = copiedId === link.id;
            const sanitized = sanitizeUrl(link.url);
            return (
              <div
                key={link.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-brand-border bg-white p-4 shadow-xs transition-all hover:border-burgundy-primary/40 hover:shadow-card"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                        <FileText className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="line-clamp-2 text-xs font-bold text-text-primary group-hover:text-burgundy-primary">
                          {link.title}
                        </h4>
                        {link.category && (
                          <span className="mt-1 inline-block rounded-md border border-brand-border bg-brand-bg px-2 py-0.5 text-[10px] font-medium text-text-secondary">
                            {link.category}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveLink(link.id)}
                      title="Remove link"
                      className="rounded-lg p-1 text-text-muted opacity-0 transition-opacity hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {link.addedDate && (
                    <div className="mt-3 text-[10px] text-text-muted">
                      Attached on {link.addedDate}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-brand-border/60 pt-3">
                  <a
                    href={sanitized}
                    {...safeExternalLinkProps}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-burgundy-primary hover:underline"
                  >
                    <span>Open in Drive</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopy(link.url, link.id)}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-text-muted hover:bg-brand-bg hover:text-text-primary"
                    title="Copy share link"
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span className="text-emerald-600 font-semibold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
