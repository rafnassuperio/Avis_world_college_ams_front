import React, { useState, useEffect, useRef, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { AdminRosterItem } from "../types";
import { Edit3, Mail, MapPin, Building, Globe, Lock, Eye, EyeOff, Camera, Upload, User, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dropdown, DropdownOption } from "@/components/ui/Dropdown";
import countriesData from "@/data/country.json";

export interface EditAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin: AdminRosterItem | null;
  onSaveAdmin: (updated: AdminRosterItem) => void | boolean | Promise<void | boolean>;
}

export const EditAdminModal: React.FC<EditAdminModalProps> = ({ isOpen, onClose, admin, onSaveAdmin }) => {
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

  useEffect(() => {
    if (admin) {
      setName(admin.name);
      setAvatarUrl(admin.avatarUrl || "/avis-emblem.png");
      setEmail(admin.email);
      setCountry(admin.country || "India");
      setState(admin.state || "");
      setCity(admin.city || "");
      setPassword("");
      setShowPassword(false);
      setError("");
    }
  }, [admin]);

  if (!admin) return null;

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
    if (!country.trim()) {
      setError("Please select a Country.");
      return;
    }
    if (password.trim() && password.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    const resolvedLocation = city.trim()
      ? `${city.trim()}${state.trim() ? `, ${state.trim()}` : ""}, ${country.trim()}`
      : admin.location || country.trim();

    const updated: AdminRosterItem = {
      ...admin,
      name: name.trim(),
      avatarUrl: avatarUrl || admin.avatarUrl || "/avis-emblem.png",
      email: email.trim(),
      country: country.trim() || admin.country,
      state: state.trim(),
      city: city.trim(),
      // Security: Never persist plaintext passwords to client-side storage
      location: resolvedLocation,
    };

    if (await onSaveAdmin(updated) === false) return;
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2">
          <span>Edit Administrator</span>
          <span className="rounded-full bg-burgundy-primary/10 px-2.5 py-0.5 text-xs font-bold text-burgundy-primary">{admin.employeeId}</span>
        </div>
      }
      subtitle="Modify administrator profile, credentials, and location details"
      headerIcon={
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-burgundy-primary/10 text-burgundy-primary">
          <Edit3 className="h-5 w-5 stroke-[2.2]" />
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
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError("");
                }}
                className="w-full rounded-xl border border-brand-border bg-white py-2 pl-9 pr-3.5 text-xs text-text-primary outline-none transition-all focus:border-burgundy-primary focus:ring-1 focus:ring-burgundy-primary"
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
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                className="w-full rounded-xl border border-brand-border bg-white py-2 pl-9 pr-3.5 text-xs text-text-primary outline-none transition-all focus:border-burgundy-primary focus:ring-1 focus:ring-burgundy-primary"
              />
            </div>
          </div>
        </div>

        {/* 3. Password & Country (Select a Country) */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-text-secondary">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Leave blank to keep unchanged"
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
            <p className="mt-1 text-[10.5px] text-text-muted">Enter only if changing password.</p>
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
            <Check className="mr-1.5 h-3.5 w-3.5" />
            <span>Save Changes</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
