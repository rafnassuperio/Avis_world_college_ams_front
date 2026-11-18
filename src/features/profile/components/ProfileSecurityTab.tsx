import React, { useState } from "react";
import { UserProfile } from "@/types";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/common/ToastMessage";
import {
  ShieldCheck,
  KeyRound,
  Smartphone,
  Laptop,
  LogOut,
} from "lucide-react";

export interface ProfileSecurityTabProps {
  user?: UserProfile;
}

export const ProfileSecurityTab: React.FC<ProfileSecurityTabProps> = () => {
  const [sessions, setSessions] = useState([
    {
      id: "sess-1",
      device: "Windows 11 PC • Google Chrome 124",
      location: "Kerala, India",
      ipAddress: "103.248.12.94",
      current: true,
      time: "Active Now",
      icon: Laptop,
    },
    {
      id: "sess-2",
      device: "Avis AMS Mobile PWA • Android 14",
      location: "Kerala, India",
      ipAddress: "103.248.12.112",
      current: false,
      time: "2 hours ago",
      icon: Smartphone,
    },
  ]);

  const [is2FAEnabled, setIs2FAEnabled] = useState(true);

  const handleSignOutOtherSessions = () => {
    setSessions((prev) => prev.filter((s) => s.current));
    toast.success("Sessions Terminated", {
      description: "All other active device sessions have been safely logged out.",
    });
  };

  const handleToggle2FA = () => {
    setIs2FAEnabled((prev) => !prev);
    if (!is2FAEnabled) {
      toast.success("Two-Factor Authentication Enabled", {
        description: "Your super-admin account is now protected with 2FA verification.",
      });
    } else {
      toast.warning("2FA Disabled", {
        description: "Two-factor authentication has been temporarily paused.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Security Overview Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl sm:rounded-[24px] border border-emerald-200/80 bg-gradient-to-r from-emerald-50/90 via-emerald-50/50 to-white p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm flex-shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-emerald-950">High Security Level (Grade A+)</h3>
            <p className="text-xs text-emerald-800/80">
              Your Super Admin account is protected by hardware-grade encryption, 2FA, and strict IP logging.
            </p>
          </div>
        </div>

        <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-xs">
          100% Protected
        </span>
      </div>

      {/* 2. Authentication & Credentials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 2FA Card */}
        <div className="flex flex-col justify-between rounded-2xl sm:rounded-[24px] border border-brand-border/80 bg-white p-5 sm:p-6 shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-brand-border/70">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-light-red text-brand-red">
                  <Smartphone className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-primary">Two-Factor Authentication</h4>
                  <p className="text-xs text-text-muted">TOTP Authenticator App verification</p>
                </div>
              </div>

              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  is2FAEnabled ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {is2FAEnabled ? "Active" : "Disabled"}
              </span>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed mb-4">
              Requires a 6-digit confirmation token from Google Authenticator or Microsoft Authenticator whenever signing in from a new workstation.
            </p>
          </div>

          <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between">
            <span className="text-xs text-text-muted">Method: Authenticator App</span>
            <Button
              type="button"
              variant={is2FAEnabled ? "outline" : "primary"}
              size="sm"
              onClick={handleToggle2FA}
              className="text-xs rounded-xl"
            >
              {is2FAEnabled ? "Configure 2FA" : "Enable 2FA"}
            </Button>
          </div>
        </div>

        {/* Password Card */}
        <div className="flex flex-col justify-between rounded-2xl sm:rounded-[24px] border border-brand-border/80 bg-white p-5 sm:p-6 shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-brand-border/70">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-light-red text-brand-red">
                  <KeyRound className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-primary">Super Admin Password</h4>
                  <p className="text-xs text-text-muted">Managed via secure bcrypt salted hash</p>
                </div>
              </div>

              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                Strong
              </span>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed mb-4">
              Password last updated 14 days ago. Meets all institutional complexity requirements (16+ chars, uppercase, symbols).
            </p>
          </div>

          <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between">
            <span className="text-xs text-text-muted">Last changed: 30 Oct 2026</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                toast.info("Password Change", {
                  description: "Password reset verification sent to acetek1@example.com.",
                });
              }}
              className="text-xs rounded-xl hover:bg-brand-bg"
            >
              Change Password
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Active Sessions */}
      <div className="rounded-2xl sm:rounded-[24px] border border-brand-border/80 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-brand-border/70">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-text-primary">Active Logged-in Devices</h3>
            <p className="text-xs text-text-muted">Devices and browsers currently authenticated as Super Admin</p>
          </div>

          {sessions.length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSignOutOtherSessions}
              className="text-xs font-semibold text-brand-red hover:bg-brand-light-red/30 rounded-xl"
            >
              <LogOut className="h-3.5 w-3.5 mr-1" />
              <span>Log Out Other Devices</span>
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {sessions.map((sess) => {
            const Icon = sess.icon;
            return (
              <div
                key={sess.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-brand-border/70 bg-brand-bg/60 p-3.5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-brand-border text-brand-red flex-shrink-0">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-text-primary">{sess.device}</p>
                      {sess.current && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9.5px] font-bold text-emerald-800">
                          Current Device
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      {sess.location} • IP: {sess.ipAddress} • {sess.time}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  {sess.current ? (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Online</span>
                    </span>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSessions((prev) => prev.filter((s) => s.id !== sess.id));
                        toast.info("Session Revoked", {
                          description: `Disconnected session on ${sess.device}.`,
                        });
                      }}
                      className="text-xs text-text-muted hover:text-brand-red"
                    >
                      Revoke Access
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
