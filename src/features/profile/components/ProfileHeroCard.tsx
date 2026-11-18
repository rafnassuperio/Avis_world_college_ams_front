import React, { useState } from "react";
import { UserProfile } from "@/types";
import { toast } from "@/components/common/ToastMessage";
import { Mail, MapPin, Globe, ShieldCheck, CheckCircle2, Copy, Check, Camera } from "lucide-react";

export interface ProfileHeroCardProps {
  user: UserProfile;
  onEditClick: () => void;
}

export const ProfileHeroCard: React.FC<ProfileHeroCardProps> = ({ user, onEditClick }) => {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    if (user.email) {
      navigator.clipboard.writeText(user.email);
      setCopiedEmail(true);
      toast.success("Email Copied", {
        description: `${user.email} copied to clipboard.`,
      });
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-brand-border/80 bg-white shadow-sm transition-all duration-300 hover:shadow-md sm:rounded-[26px] md:rounded-[30px]">
      {/* 1. Luxury Header Banner */}
      <div className="relative h-24 w-full overflow-hidden bg-gradient-to-r from-burgundy-primary via-[#571D2F] to-burgundy-dark sm:h-44 md:h-24">
        {/* Ambient 3D Radial Glow and Geometric Grid */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(210,139,150,0.35)_0%,_transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,_rgba(166,76,97,0.25)_0%,_transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:28px_28px] opacity-10" />

        {/* Institutional Watermark Badge */}
        <div className="pointer-events-none absolute -bottom-10 -right-6 select-none opacity-10 sm:-bottom-8 sm:-right-8">
          <img
            src="/avis-emblem.png"
            alt="Emblem Watermark"
            className="h-40 w-40 object-contain sm:h-40 sm:w-40"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        </div>
      </div>

      {/* 2. Hero Body with Floating Avatar & Profile Metadata */}
      <div className="relative px-4 pb-6 sm:px-8 sm:pb-8">
        <div className="sm:-mt-18 -mt-16 mb-4 flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-end">
          {/* Avatar Container with Active Glow & Camera Hover */}
          <div className="group relative flex-shrink-0">
            <div className="rounded-full bg-gradient-to-tr from-burgundy-primary via-brand-red to-burgundy-dark p-[3.5px] shadow-lg shadow-burgundy-primary/20">
              <div className="rounded-full bg-white p-[3px]">
                <img
                  src={user.avatarUrl || "/avis-emblem.png"}
                  alt={user.name}
                  className="group-hover:scale-102 h-24 w-24 rounded-full object-cover transition-transform duration-300 sm:h-28 sm:w-28 md:h-28 md:w-28"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/avis-emblem.png";
                  }}
                />
              </div>
            </div>

            {/* Quick Change Avatar Trigger */}
            <button
              type="button"
              onClick={onEditClick}
              className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-burgundy-primary text-white shadow-md transition-all duration-200 hover:scale-110 hover:bg-brand-red active:scale-95"
              title="Change Profile Picture"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>

            {/* Online Pulser Status Dot */}
            <span className="absolute right-2 top-2 flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
            </span>
          </div>
        </div>

        {/* 3. Name, Role, Email & Location Badges */}
        <div className="space-y-2.5 text-center sm:text-left">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <h1 className="text-xl font-extrabold tracking-tight text-text-primary sm:text-xl md:text-[22px]">{user.name || "Avis World College"}</h1>

            {/* Role Badge */}
            <div className="flex items-center justify-center gap-1.5 sm:justify-start">
              <span className="shadow-xs inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-burgundy-primary to-brand-red px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{user.role || "super-admin"}</span>
              </span>

              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                <span>Active</span>
              </span>
            </div>
          </div>

          {/* Metadata Row: Email, City, State, Country */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-text-secondary sm:justify-start">
            {/* Email with copy button */}
            <div className="flex items-center gap-1.5 rounded-lg border border-brand-border/70 bg-brand-bg/90 px-2.5 py-1">
              <Mail className="h-3.5 w-3.5 text-brand-red" />
              <span className="font-semibold text-text-primary">{user.email || "acetek1@example.com"}</span>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="ml-1 rounded p-0.5 text-text-muted transition-colors hover:text-brand-red"
                title="Copy Email"
              >
                {copiedEmail ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* City */}
            <div className="flex items-center gap-1.5 rounded-lg border border-brand-border/70 bg-brand-bg/90 px-2.5 py-1">
              <MapPin className="h-3.5 w-3.5 text-brand-red" />
              <span className="text-text-muted">City:</span>
              <span className="font-semibold text-text-primary">{user.city || "Kerala"}</span>
            </div>

            {/* State */}
            <div className="flex items-center gap-1.5 rounded-lg border border-brand-border/70 bg-brand-bg/90 px-2.5 py-1">
              <MapPin className="h-3.5 w-3.5 text-brand-red" />
              <span className="text-text-muted">State:</span>
              <span className="font-semibold text-text-primary">{user.state || "acetek@example.com"}</span>
            </div>

            {/* Country */}
            <div className="flex items-center gap-1.5 rounded-lg border border-brand-border/70 bg-brand-bg/90 px-2.5 py-1">
              <Globe className="h-3.5 w-3.5 text-brand-red" />
              <span className="text-text-muted">Country:</span>
              <span className="font-semibold text-text-primary">{user.country || "India"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
