import React from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "@/components/ui/Modal";
import { AdminRosterItem, AdminStatus } from "../types";
import {
  ShieldCheck,
  Mail,
  Phone,
  Building2,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  Layers,
  Edit3,
  UserCheck,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface AdminDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin: AdminRosterItem | null;
  onEdit?: (admin: AdminRosterItem) => void;
  onStatusChange?: (adminId: string, newStatus: AdminStatus) => void;
}

export const AdminDetailsModal: React.FC<AdminDetailsModalProps> = ({
  isOpen,
  onClose,
  admin,
  onEdit,
  onStatusChange,
}) => {
  const navigate = useNavigate();
  if (!admin) return null;

  const isSuperAdmin = admin.role.toLowerCase().includes("super admin");

  const getStatusBadge = (status: AdminStatus) => {
    switch (status) {
      case "Active":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
        };
      case "Away":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
        };
      case "Offline":
        return {
          bg: "bg-slate-100 text-slate-600 border-slate-200",
          dot: "bg-slate-400",
        };
      case "Suspended":
        return {
          bg: "bg-red-50 text-red-700 border-red-200",
          dot: "bg-red-500",
        };
    }
  };

  const statusStyle = getStatusBadge(admin.status);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2">
          <span>Administrator Profile Dossier</span>
          <span className="rounded-full bg-burgundy-primary/10 px-2.5 py-0.5 text-xs font-bold text-burgundy-primary">
            {admin.employeeId}
          </span>
        </div>
      }
      subtitle="Institutional administrative credentials, access governance, and department scope"
      headerIcon={
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-burgundy-primary/10 text-burgundy-primary">
          <ShieldCheck className="h-5 w-5 stroke-[2.2]" />
        </div>
      }
      footer={
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Clock className="h-3.5 w-3.5" />
            <span>Last active: {admin.lastActive}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                navigate(`/profile?id=${encodeURIComponent(admin.id)}`, { state: { admin } });
              }}
              className="rounded-xl px-3 hover:border-burgundy-primary hover:text-burgundy-primary"
            >
              <ExternalLink className="mr-1.5 h-3.5 w-3.5 text-burgundy-primary" />
              <span>Full Profile</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-xl px-4"
            >
              Close
            </Button>
            {onEdit && (
              <Button
                type="button"
                variant="burgundy"
                size="sm"
                onClick={() => {
                  onClose();
                  onEdit(admin);
                }}
                className="rounded-xl px-4"
              >
                <Edit3 className="mr-1.5 h-3.5 w-3.5" />
                <span>Edit Administrator</span>
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Top Header Card */}
        <div className="relative overflow-hidden rounded-2xl border border-brand-border/80 bg-gradient-to-br from-brand-bg/80 via-white to-brand-bg/30 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={admin.avatarUrl}
                  alt={admin.name}
                  className="h-16 w-16 rounded-2xl border-2 border-white object-cover shadow-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/avis-emblem.png";
                  }}
                />
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                  <span
                    className={cn(
                      "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
                      statusStyle.dot,
                    )}
                  />
                  <span
                    className={cn(
                      "relative inline-flex h-4 w-4 rounded-full border-2 border-white",
                      statusStyle.dot,
                    )}
                  />
                </span>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-text-primary">{admin.name}</h3>
                  {isSuperAdmin && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-burgundy-primary/30 bg-burgundy-primary px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                      <ShieldCheck className="h-3 w-3" />
                      Root Admin
                    </span>
                  )}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-burgundy-primary/10 px-2 py-0.5 text-xs font-bold text-burgundy-primary">
                    {admin.role}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-xs font-semibold",
                      statusStyle.bg,
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full", statusStyle.dot)} />
                    {admin.status}
                  </span>
                </div>

                <p className="mt-1.5 text-xs text-text-secondary flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-burgundy-primary" />
                  <span>{admin.department}</span>
                </p>
              </div>
            </div>

            {/* Quick Status Toggle */}
            {onStatusChange && (
              <div className="flex sm:flex-col items-center sm:items-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-brand-border/60">
                <span className="text-[11px] font-medium text-text-muted">Account Status:</span>
                <div className="inline-flex rounded-xl border border-brand-border bg-white p-0.5 shadow-2xs">
                  {(["Active", "Away", "Offline"] as AdminStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => onStatusChange(admin.id, st)}
                      className={cn(
                        "rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all",
                        admin.status === st
                          ? "bg-burgundy-primary text-white shadow-2xs"
                          : "text-text-secondary hover:text-text-primary",
                      )}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {admin.bio && (
            <p className="mt-3.5 rounded-xl border border-brand-border/60 bg-white/60 p-3 text-xs leading-relaxed text-text-secondary">
              {admin.bio}
            </p>
          )}
        </div>

        {/* 2-Column Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Contact Details Card */}
          <div className="rounded-2xl border border-brand-border/80 bg-white p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-burgundy-primary" />
              <span>Contact & Office Location</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between rounded-xl bg-brand-bg/50 px-3 py-2">
                <span className="text-text-muted flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> Email:
                </span>
                <a
                  href={`mailto:${admin.email}`}
                  className="font-semibold text-burgundy-primary hover:underline truncate max-w-[190px]"
                  title={admin.email}
                >
                  {admin.email}
                </a>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-brand-bg/50 px-3 py-2">
                <span className="text-text-muted flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> Direct Line:
                </span>
                <a
                  href={`tel:${admin.phone}`}
                  className="font-semibold text-text-primary hover:text-burgundy-primary"
                >
                  {admin.phone}
                </a>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-brand-bg/50 px-3 py-2">
                <span className="text-text-muted flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Country / Region:
                </span>
                <span className="font-semibold text-text-primary truncate max-w-[180px]">
                  {admin.country || "India"}
                  {(admin.city || admin.state) && ` (${[admin.city, admin.state].filter(Boolean).join(", ")})`}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-brand-bg/50 px-3 py-2">
                <span className="text-text-muted flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" /> Campus Office:
                </span>
                <span className="font-semibold text-text-primary truncate max-w-[180px]" title={admin.location}>
                  {admin.location}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-brand-bg/50 px-3 py-2">
                <span className="text-text-muted flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Appointment:
                </span>
                <span className="font-semibold text-text-primary">
                  {admin.joinedDate}
                </span>
              </div>
            </div>
          </div>

          {/* Security & Access Level Card */}
          <div className="rounded-2xl border border-brand-border/80 bg-white p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-burgundy-primary" />
              <span>Governance & Security Scope</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between rounded-xl bg-brand-bg/50 px-3 py-2">
                <span className="text-text-muted">Access Level:</span>
                <span className="font-bold text-burgundy-primary text-right truncate max-w-[180px]" title={admin.accessLevel}>
                  {admin.accessLevel}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-brand-bg/50 px-3 py-2">
                <span className="text-text-muted">Two-Factor Authentication:</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <CheckCircle2 className="h-3 w-3" />
                  Enforced & Active
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-brand-bg/50 px-3 py-2">
                <span className="text-text-muted">Active Permission Scopes:</span>
                <span className="rounded-md bg-burgundy-primary/10 px-2 py-0.5 font-bold text-burgundy-primary">
                  {admin.permissionsCount} Systems Configured
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-brand-bg/50 px-3 py-2">
                <span className="text-text-muted">Audit Logging:</span>
                <span className="font-semibold text-text-primary">
                  Full Session Capture
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned System Modules Section */}
        {admin.assignedModules && admin.assignedModules.length > 0 && (
          <div className="rounded-2xl border border-brand-border/80 bg-white p-4">
            <div className="mb-2.5 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-burgundy-primary" />
                <span>Assigned Administrative Modules ({admin.assignedModules.length})</span>
              </h4>
              <span className="text-[11px] text-text-muted">RBAC Role-Enforced</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {admin.assignedModules.map((mod) => (
                <span
                  key={mod}
                  className="inline-flex items-center gap-1 rounded-lg border border-brand-border bg-brand-bg/60 px-2.5 py-1 text-[11px] font-semibold text-text-primary transition-colors hover:border-burgundy-primary/40 hover:bg-white"
                >
                  <UserCheck className="h-3 w-3 text-burgundy-primary" />
                  <span>{mod}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
