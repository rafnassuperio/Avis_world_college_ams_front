import React, { useState, useRef, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { RepresentativeItem } from "../types";
import { UserPlus, Mail, Users, Phone, Upload, Building2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dropdown, DropdownOption } from "@/components/ui/Dropdown";
import countriesData from "@/data/country.json";

export interface AddRepresentativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newRep: RepresentativeItem) => void;
  nextRepCode?: string;
}

export const AddRepresentativeModal: React.FC<AddRepresentativeModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  nextRepCode = "AWC-REP-011",
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("India");
  const [agentCount, setAgentCount] = useState<number>(0);
  const [organization, setOrganization] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [avatarUrl, setAvatarUrl] = useState("/avis-emblem.png");
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const countryOptions: DropdownOption[] = useMemo(() => {
    return (countriesData as { name: string; code: string }[]).map((c) => ({
      label: c.name,
      value: c.name,
    }));
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Avatar file size must be less than 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setAvatarUrl(result);
        if (error) setError("");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setName("");
    setEmail("");
    setPhone("");
    setCountry("India");
    setAgentCount(0);
    setOrganization("");
    setStatus("Active");
    setAvatarUrl("/avis-emblem.png");
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter the representative's Full Name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please provide a valid official Email ID.");
      return;
    }
    if (!country.trim()) {
      setError("Please select a Country.");
      return;
    }

    const todayStr = new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date());

    const newRep: RepresentativeItem = {
      id: `rep-${Date.now()}`,
      repCode: nextRepCode,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || "+65 6734 8800",
      country: country.trim(),
      agentCount: Number(agentCount) || 0,
      organization: organization.trim() || "Regional Representative",
      status,
      avatarUrl: avatarUrl || "/avis-emblem.png",
      joinedDate: todayStr,
    };

    onAdd(newRep);
    handleReset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        handleReset();
        onClose();
      }}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2">
          <span>Add Institutional Representative</span>
          <span className="rounded-full bg-burgundy-primary/10 px-2.5 py-0.5 text-xs font-bold text-burgundy-primary">
            {nextRepCode}
          </span>
        </div>
      }
      subtitle="Register an official regional representative or institutional partnership director"
      headerIcon={
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-burgundy-primary/10 text-burgundy-primary">
          <UserPlus className="h-5 w-5 stroke-[2.2]" />
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* Profile Picture & Code Card */}
        <div className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-brand-border/80 bg-brand-bg/40 p-3.5">
          <div className="relative group shrink-0">
            <img
              src={avatarUrl}
              alt="Avatar Preview"
              className="h-16 w-16 rounded-full border-2 border-white object-cover shadow-sm ring-2 ring-brand-border"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/avis-emblem.png";
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100"
              title="Upload Photo"
            >
              <Upload className="h-4 w-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <h4 className="text-xs font-bold text-text-primary">Institutional Representative Profile</h4>
            <p className="mt-0.5 text-[11px] text-text-muted">
              Upload a clear professional headshot or logo (PNG/JPG, max 5MB).
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 justify-center sm:justify-start">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-brand-border bg-white px-2.5 py-1 text-[11px] font-semibold text-text-secondary hover:border-burgundy-primary hover:text-burgundy-primary"
              >
                Change Avatar
              </button>
              {avatarUrl !== "/avis-emblem.png" && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl("/avis-emblem.png")}
                  className="text-[11px] font-semibold text-brand-red hover:underline"
                >
                  Reset Default
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {/* Full Name */}
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-bold text-text-secondary">
              Full Name <span className="text-brand-red">*</span>
            </label>
            <div className="relative">
              <UserPlus className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError("");
                }}
                placeholder="e.g. Dr. Sarah Jenkins"
                className="w-full rounded-xl border border-brand-border bg-white py-2 pl-9 pr-3 text-xs font-medium text-text-primary placeholder:text-text-muted focus:border-burgundy-primary focus:outline-none focus:ring-2 focus:ring-burgundy-primary/20"
                required
              />
            </div>
          </div>

          {/* Email ID */}
          <div>
            <label className="mb-1 block text-xs font-bold text-text-secondary">
              Email ID <span className="text-brand-red">*</span>
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                placeholder="sarah.jenkins@avisworld.edu"
                className="w-full rounded-xl border border-brand-border bg-white py-2 pl-9 pr-3 text-xs font-medium text-text-primary placeholder:text-text-muted focus:border-burgundy-primary focus:outline-none focus:ring-2 focus:ring-burgundy-primary/20"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1 block text-xs font-bold text-text-secondary">Phone Number</label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 94471 23456"
                className="w-full rounded-xl border border-brand-border bg-white py-2 pl-9 pr-3 text-xs font-medium text-text-primary placeholder:text-text-muted focus:border-burgundy-primary focus:outline-none focus:ring-2 focus:ring-burgundy-primary/20"
              />
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="mb-1 block text-xs font-bold text-text-secondary">
              Country <span className="text-brand-red">*</span>
            </label>
            <div className="w-full">
              <Dropdown
                value={country}
                options={countryOptions}
                onChange={(val) => {
                  setCountry(val);
                  if (error) setError("");
                }}
                className="w-full"
                buttonClassName="w-full justify-between h-[36px] rounded-xl text-xs bg-white border border-brand-border"
                menuClassName="max-h-56 overflow-y-auto w-full z-50"
              />
            </div>
          </div>

          {/* Agent Count */}
          <div>
            <label className="mb-1 block text-xs font-bold text-text-secondary">Initial Agent Count</label>
            <div className="relative">
              <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="number"
                min="0"
                value={agentCount}
                onChange={(e) => setAgentCount(Math.max(0, parseInt(e.target.value) || 0))}
                placeholder="0"
                className="w-full rounded-xl border border-brand-border bg-white py-2 pl-9 pr-3 text-xs font-medium text-text-primary placeholder:text-text-muted focus:border-burgundy-primary focus:outline-none focus:ring-2 focus:ring-burgundy-primary/20"
              />
            </div>
          </div>

          {/* Organization / Division */}
          <div>
            <label className="mb-1 block text-xs font-bold text-text-secondary">Organization / Division</label>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. South Asia Regional Liaison"
                className="w-full rounded-xl border border-brand-border bg-white py-2 pl-9 pr-3 text-xs font-medium text-text-primary placeholder:text-text-muted focus:border-burgundy-primary focus:outline-none focus:ring-2 focus:ring-burgundy-primary/20"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="mb-1 block text-xs font-bold text-text-secondary">Active Status</label>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setStatus("Active")}
                className={`flex-1 rounded-xl border py-2 text-xs font-bold transition-all ${
                  status === "Active"
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700 shadow-xs"
                    : "border-brand-border bg-white text-text-secondary hover:bg-brand-bg"
                }`}
              >
                ● Active
              </button>
              <button
                type="button"
                onClick={() => setStatus("Inactive")}
                className={`flex-1 rounded-xl border py-2 text-xs font-bold transition-all ${
                  status === "Inactive"
                    ? "border-amber-300 bg-amber-50 text-amber-700 shadow-xs"
                    : "border-brand-border bg-white text-text-secondary hover:bg-brand-bg"
                }`}
              >
                ○ Inactive
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-brand-border/70 pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="rounded-xl px-4 text-xs font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="burgundy"
            size="sm"
            className="rounded-xl px-5 text-xs font-bold shadow-md shadow-burgundy/15"
          >
            <UserPlus className="mr-1.5 h-3.5 w-3.5" />
            <span>Create Representative</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
