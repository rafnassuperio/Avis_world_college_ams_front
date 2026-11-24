import React, { useState, useRef, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { AdminRosterItem } from "../types";
import { UserPlus, Mail, MapPin, Building, Globe, Lock, Eye, EyeOff, Camera, Upload, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dropdown, DropdownOption } from "@/components/ui/Dropdown";
import countriesData from "@/data/country.json";

export interface AddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAdmin: (newAdmin: AdminRosterItem) => void | boolean | Promise<void | boolean>;
  nextEmployeeId?: string;
}

export const AddAdminModal: React.FC<AddAdminModalProps> = ({ isOpen, onClose, onAddAdmin, nextEmployeeId = "AWC-ADM-011" }) => {
  // Only the required data fields requested
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("/avis-emblem.png");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [country, setCountry] = useState("India");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Map 240+ countries for Dropdown
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
    setAvatarUrl("/avis-emblem.png");
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setCountry("India");
    setState("");
    setCity("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please provide the administrator's Full Name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please provide a valid official Email ID.");
      return;
    }
    if (!password.trim()) {
      setError("Please provide an initial account Password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!country.trim()) {
      setError("Please select a Country.");
      return;
    }

    const resolvedLocation = city.trim()
      ? `${city.trim()}${state.trim() ? `, ${state.trim()}` : ""}, ${country.trim()}`
      : country.trim() || "Main Campus";

    const newAdmin: AdminRosterItem = {
      id: `adm-${Date.now()}`,
      employeeId: nextEmployeeId || `AWC-ADM-${Math.floor(100 + Math.random() * 900)}`,
      name: name.trim(),
      role: "Administrator",
      department: "Central Administration",
      email: email.trim(),
      phone: "+65 6734 8800",
      avatarUrl: avatarUrl || "/avis-emblem.png",
      country: country.trim() || "India",
      city: city.trim(),
      state: state.trim(),
      // Security: Never persist plaintext passwords to client-side storage
      accessLevel: "Root Governance & Full Ops",
      status: "Active",
      lastActive: "Just now",
      joinedDate: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      location: resolvedLocation,
      twoFactorEnabled: true,
      permissionsCount: 12,
      bio: `Administrator account for ${name.trim()}.`,
      assignedModules: ["DASHBOARD", "COLLEGE REPORT", "STUDENT MANAGEMENT"],
    };

    if (await onAddAdmin(newAdmin) === false) return;
    handleReset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title="Add New Administrator"
      subtitle="Enter administrator credentials and location details"
      headerIcon={
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-burgundy-primary/10 text-burgundy-primary">
          <UserPlus className="h-5 w-5 stroke-[2.2]" />
        </div>
      }
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {error && <div className="rounded-xl border border-brand-red/30 bg-brand-light-red/60 p-3 text-xs font-semibold text-brand-red">{error}</div>}

        {/* 1. img: Profile Photo / Avatar Upload */}
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-brand-border/80 bg-gradient-to-r from-brand-bg/70 via-white to-brand-bg/40 p-3.5 sm:flex-row">
          <div className="group relative shrink-0">
            <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-white bg-white shadow-sm ring-2 ring-brand-border">
              <img
                src={avatarUrl || "/avis-emblem.png"}
                alt="Profile Preview"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/avis-emblem.png";
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100"
              title="Upload Profile Image"
            >
              <Camera className="h-4 w-4" />
              <span className="mt-0.5 text-[9px] font-medium">Change</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl border-brand-border bg-white text-xs font-semibold text-text-primary hover:bg-brand-bg"
              >
                <Upload className="mr-1.5 h-3.5 w-3.5 text-burgundy-primary" />
                <span>Upload Image</span>
              </Button>
              {avatarUrl !== "/avis-emblem.png" && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl("/avis-emblem.png")}
                  className="text-xs text-text-muted transition-colors hover:text-brand-red"
                >
                  Reset
                </button>
              )}
            </div>
            <p className="mt-1 text-[11px] text-text-muted">JPG, PNG, WEBP (Max 5MB)</p>
          </div>
        </div>

        {/* 2. Full Name & Email ID */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-text-secondary">
              Full Name <span className="text-brand-red">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                required
                placeholder="e.g. Dr. Arthur Pendelton"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError("");
                }}
                className="w-full rounded-xl border border-brand-border bg-white py-2 pl-9 pr-3.5 text-xs text-text-primary outline-none transition-all placeholder:text-text-muted focus:border-burgundy-primary focus:ring-1 focus:ring-burgundy-primary"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-text-secondary">
              Email ID <span className="text-brand-red">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
              <input
                type="email"
                required
                placeholder="e.g. name@aviscollege.edu"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                className="w-full rounded-xl border border-brand-border bg-white py-2 pl-9 pr-3.5 text-xs text-text-primary outline-none transition-all placeholder:text-text-muted focus:border-burgundy-primary focus:ring-1 focus:ring-burgundy-primary"
              />
            </div>
          </div>
        </div>

        {/* 3. Password & Country (Select a Country) */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-text-secondary">
              Password <span className="text-brand-red">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter password (min 6 chars)"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                className="w-full rounded-xl border border-brand-border bg-white py-2 pl-9 pr-10 text-xs text-text-primary outline-none transition-all placeholder:text-text-muted focus:border-burgundy-primary focus:ring-1 focus:ring-burgundy-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-text-muted transition-colors hover:text-text-primary"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-text-secondary">
              Country <span className="text-brand-red">*</span>
            </label>
            <div className="relative">
              <Globe className="pointer-events-none absolute left-3 top-1/2 z-10 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
              <Dropdown
                value={country}
                options={countryOptions}
                onChange={(val) => {
                  setCountry(val);
                  if (error) setError("");
                }}
                placeholder="Select a Country"
                className="w-full"
                buttonClassName="w-full h-[35px] pl-9 pr-3 rounded-xl border-brand-border bg-white text-xs font-normal text-text-primary hover:bg-white hover:border-burgundy-primary justify-between"
                menuClassName="w-full left-0 right-0"
              />
            </div>
          </div>
        </div>

        {/* 4. State & City */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-text-secondary">State</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="e.g. Kerala / Central"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full rounded-xl border border-brand-border bg-white py-2 pl-9 pr-3.5 text-xs text-text-primary outline-none transition-all placeholder:text-text-muted focus:border-burgundy-primary focus:ring-1 focus:ring-burgundy-primary"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-text-secondary">City</label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="e.g. Kochi / Singapore"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border border-brand-border bg-white py-2 pl-9 pr-3.5 text-xs text-text-primary outline-none transition-all placeholder:text-text-muted focus:border-burgundy-primary focus:ring-1 focus:ring-burgundy-primary"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 border-t border-brand-border/60 pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-xl px-4"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="burgundy"
            size="sm"
            className="rounded-xl px-4 shadow-sm"
          >
            <UserPlus className="mr-1.5 h-3.5 w-3.5" />
            <span>Create Administrator</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
