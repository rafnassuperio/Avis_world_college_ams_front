import React from "react";
import { UserProfile } from "@/types";
import { Button } from "@/components/ui/Button";
import { Building, Mail, Shield, MapPin, Globe, Phone, Calendar, CheckCircle2, Edit3, Award } from "lucide-react";

export interface ProfileDetailsTabProps {
  user: UserProfile;
  onEditClick: () => void;
}

export const ProfileDetailsTab: React.FC<ProfileDetailsTabProps> = ({ user, onEditClick }) => {
  return (
    <div className="space-y-6">
      {/* 1. Profile Information Grid */}
      <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12">
        {/* Left Column: Core Administrative Details */}
        <div className="shadow-xs flex flex-col justify-between rounded-2xl border border-brand-border/80 bg-white p-5 sm:rounded-[24px] sm:p-6 lg:col-span-7">
          <div>
            <div className="mb-4 flex items-center justify-between border-b border-brand-border/70 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-light-red text-brand-red">
                  <Building className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary sm:text-base">Administrative Details</h3>
                  <p className="text-xs text-text-muted">Core profile identity and system configuration</p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onEditClick}
                className="rounded-xl text-xs font-semibold hover:bg-brand-bg"
              >
                <Edit3 className="mr-1 h-3.5 w-3.5" />
                <span>Edit</span>
              </Button>
            </div>

            {/* Key-Value Pairs Grid */}
            <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
              {/* Full Name */}
              <div className="rounded-xl border border-brand-border/60 bg-brand-bg/70 p-3">
                <span className="flex items-center gap-1.5 font-medium text-text-muted">
                  <Building className="h-3.5 w-3.5 text-brand-red" />
                  <span>Name / Institution</span>
                </span>
                <p className="mt-1 truncate text-sm font-bold text-text-primary">{user.name || "—"}</p>
              </div>

              {/* Email Address */}
              <div className="rounded-xl border border-brand-border/60 bg-brand-bg/70 p-3">
                <span className="flex items-center gap-1.5 font-medium text-text-muted">
                  <Mail className="h-3.5 w-3.5 text-brand-red" />
                  <span>Email Address</span>
                </span>
                <p className="mt-1 truncate text-sm font-bold text-text-primary">{user.email || "—"}</p>
              </div>

              {/* Assigned Role */}
              <div className="rounded-xl border border-brand-border/60 bg-brand-bg/70 p-3">
                <span className="flex items-center gap-1.5 font-medium text-text-muted">
                  <Shield className="h-3.5 w-3.5 text-brand-red" />
                  <span>System Role</span>
                </span>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="rounded-md bg-burgundy-primary/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-burgundy-primary">
                    {user.role || "—"}
                  </span>
                  <span className="text-[10px] text-text-muted">(Level 1 Privileges)</span>
                </div>
              </div>

              {/* College */}
              <div className="rounded-xl border border-brand-border/60 bg-brand-bg/70 p-3">
                <span className="flex items-center gap-1.5 font-medium text-text-muted">
                  <Award className="h-3.5 w-3.5 text-brand-red" />
                  <span>Institution College</span>
                </span>
                <p className="mt-1 truncate text-sm font-bold text-text-primary">{user.college || "—"}</p>
              </div>

              {/* Department */}
              <div className="rounded-xl border border-brand-border/60 bg-brand-bg/70 p-3">
                <span className="flex items-center gap-1.5 font-medium text-text-muted">
                  <Building className="h-3.5 w-3.5 text-brand-red" />
                  <span>Department</span>
                </span>
                <p className="mt-1 truncate text-sm font-bold text-text-primary">{user.department || "—"}</p>
              </div>

              {/* Version & Joined */}
              <div className="rounded-xl border border-brand-border/60 bg-brand-bg/70 p-3">
                <span className="flex items-center gap-1.5 font-medium text-text-muted">
                  <Calendar className="h-3.5 w-3.5 text-brand-red" />
                  <span>AMS Software Version</span>
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-md border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                    {user.amsVersion || "—"}
                  </span>
                  <span className="text-[11px] text-text-muted">Updated Nov 2026</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-brand-border/60 pt-3 text-xs text-text-muted">
            <span>Account Registered: {user.joinedDate || "—"}</span>
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Full Operational Status</span>
            </span>
          </div>
        </div>

        {/* Right Column: Geographic & Institutional Location */}
        <div className="shadow-xs flex flex-col justify-between rounded-2xl border border-brand-border/80 bg-white p-5 sm:rounded-[24px] sm:p-6 lg:col-span-5">
          <div>
            <div className="mb-4 flex items-center justify-between border-b border-brand-border/70 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-light-red text-brand-red">
                  <MapPin className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary sm:text-base">Location & Contact</h3>
                  <p className="text-xs text-text-muted">Campus regional office and dispatch points</p>
                </div>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* City */}
              <div className="flex items-center justify-between rounded-xl border border-brand-border/60 bg-brand-bg/60 p-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-brand-border bg-white text-brand-red">
                    <MapPin className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-text-muted">City</p>
                    <p className="text-sm font-bold text-text-primary">{user.city || "—"}</p>
                  </div>
                </div>
                <span className="rounded-full bg-brand-light-red/60 px-2.5 py-0.5 text-[10px] font-bold text-brand-red">Campus City</span>
              </div>

              {/* State */}
              <div className="flex items-center justify-between rounded-xl border border-brand-border/60 bg-brand-bg/60 p-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-brand-border bg-white text-brand-red">
                    <MapPin className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-text-muted">State / Region ID</p>
                    <p className="truncate text-sm font-bold text-text-primary">{user.state || "—"}</p>
                  </div>
                </div>
                <span className="rounded-full bg-brand-light-red/60 px-2.5 py-0.5 text-[10px] font-bold text-brand-red">State Identifier</span>
              </div>

              {/* Country */}
              <div className="flex items-center justify-between rounded-xl border border-brand-border/60 bg-brand-bg/60 p-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-brand-border bg-white text-brand-red">
                    <Globe className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-text-muted">Country</p>
                    <p className="text-sm font-bold text-text-primary">{user.country || "—"}</p>
                  </div>
                </div>
                <span className="rounded-full bg-brand-light-red/60 px-2.5 py-0.5 text-[10px] font-bold text-brand-red">Headquarters</span>
              </div>

              {/* Phone */}
              <div className="flex items-center justify-between rounded-xl border border-brand-border/60 bg-brand-bg/60 p-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-brand-border bg-white text-brand-red">
                    <Phone className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-text-muted">Contact Phone</p>
                    <p className="text-sm font-bold text-text-primary">{user.phone || "—"}</p>
                  </div>
                </div>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                  Verified
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-brand-border/60 pt-3 text-center text-[11px] text-text-muted sm:text-left">
            Institutional Address: Avis World College Campus, Kerala, India
          </div>
        </div>
      </div>
    </div>
  );
};
