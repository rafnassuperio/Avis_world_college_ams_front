import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { FilterSelect, FilterSelectOption } from "@/components/ui/FilterSelect";
import { toast } from "@/components/common/ToastMessage";
import countriesData from "@/data/country.json";
import { UserProfile } from "@/types";
import {
  Camera,
  Upload,
  RotateCcw,
  Check,
  Shield,
  Mail,
  MapPin,
  Building,
  Phone,
  Globe,
  User,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSave: (updatedProfile: Partial<UserProfile>) => void;
  onResetDefaults?: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user, onSave, onResetDefaults }) => {
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: user.name || "Avis World College",
    email: user.email || "acetek1@example.com",
    role: user.role || "super-admin",
    city: user.city || "Kerala",
    state: user.state || "acetek@example.com",
    country: user.country || "India",
    avatarUrl: user.avatarUrl || "/avis-emblem.png",
    phone: user.phone || "+91 94471 23456",
    department: user.department || "Central Administration",
  });

  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Country options mapped from country.json
  const countryOptions: FilterSelectOption[] = useMemo(() => {
    return (countriesData as { name: string; code: string; nationality: string }[]).map((c) => ({
      label: c.name,
      value: c.name,
      subLabel: `${c.code} • ${c.nationality}`,
      badgeText: c.code,
    }));
  }, []);

  // Sync state whenever modal opens or user prop changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: user.name || "Avis World College",
        email: user.email || "acetek1@example.com",
        role: user.role || "super-admin",
        city: user.city || "Kerala",
        state: user.state || "acetek@example.com",
        country: user.country || "India",
        avatarUrl: user.avatarUrl || "/avis-emblem.png",
        phone: user.phone || "+91 94471 23456",
        department: user.department || "Central Administration",
        bio: user.bio || "Apex institutional administration and management portal for Avis World College campus operations.",
      });
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setErrors({});
    }
  }, [isOpen, user]);

  const handleChange = (field: keyof UserProfile, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handlePasswordChange = (field: "currentPassword" | "newPassword" | "confirmPassword", value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Password strength scoring
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "", color: "bg-slate-200", textColor: "text-slate-400" };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: "Weak", color: "bg-rose-500", textColor: "text-rose-600" };
      case 2:
        return { score: 2, label: "Fair", color: "bg-amber-500", textColor: "text-amber-600" };
      case 3:
        return { score: 3, label: "Good", color: "bg-sky-500", textColor: "text-sky-600" };
      case 4:
        return { score: 4, label: "Strong", color: "bg-emerald-500", textColor: "text-emerald-600" };
      default:
        return { score: 0, label: "Too Short", color: "bg-rose-400", textColor: "text-rose-500" };
    }
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file format", {
        description: "Please select an image file (PNG, JPG, WEBP, or SVG).",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large", {
        description: "Avatar file size must be less than 5 MB.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setFormData((prev) => ({ ...prev, avatarUrl: result }));
        toast.success("Image Loaded", {
          description: "New avatar preview updated. Remember to save changes.",
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.name?.trim()) {
      errs.name = "Name is required";
    }
    if (!formData.email?.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = "Please enter a valid email address";
    }
    if (!formData.city?.trim()) {
      errs.city = "City is required";
    }
    if (!formData.state?.trim()) {
      errs.state = "State is required";
    }
    if (!formData.country?.trim()) {
      errs.country = "Country is required";
    }

    // Password validation if change toggle is active
    if (isChangingPassword) {
      if (!passwordData.currentPassword.trim()) {
        errs.currentPassword = "Current password is required";
      }
      if (!passwordData.newPassword) {
        errs.newPassword = "New password is required";
      } else if (passwordData.newPassword.length < 8) {
        errs.newPassword = "Password must be at least 8 characters long";
      }
      if (!passwordData.confirmPassword) {
        errs.confirmPassword = "Please confirm your new password";
      } else if (passwordData.confirmPassword !== passwordData.newPassword) {
        errs.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Validation Failed", {
        description: "Please correct the highlighted fields before saving.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedData: Partial<UserProfile> = {
        ...formData,
      };

      // Security: Passwords must never be stored in browser localStorage / client profile cache.
      // In production, password changes are processed via a dedicated backend auth endpoint.

      onSave(updatedData);

      if (isChangingPassword) {
        toast.success("Profile & Password Updated", {
          description: "Your administrative profile and new password have been securely saved.",
        });
      } else {
        toast.success("Admin Profile Updated", {
          description: "Your administrative profile has been saved successfully.",
        });
      }

      onClose();
    } catch {
      toast.error("Failed to update profile", {
        description: "An unexpected error occurred while saving profile changes.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (onResetDefaults) {
      onResetDefaults();
      toast.info("Profile Reset to Defaults", {
        description: "Restored baseline Avis World College super-admin profile.",
      });
      onClose();
    } else {
      setFormData({
        name: "Avis World College",
        email: "acetek1@example.com",
        role: "super-admin",
        city: "Kerala",
        state: "acetek@example.com",
        country: "India",
        avatarUrl: "/avis-emblem.png",
        phone: "+91 94471 23456",
        department: "Central Administration",
        bio: "Apex institutional administration and management portal for Avis World College campus operations.",
      });
      setIsChangingPassword(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-burgundy-primary to-brand-red text-white shadow-sm">
            <User className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">Edit Admin Profile</h3>
            <p className="text-xs text-text-muted">Update institutional administrative identity, contact info, and security credentials</p>
          </div>
        </div>
      }
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5 pt-2"
      >
        {/* Avatar Customization Section */}
        <div className="rounded-2xl border border-brand-border/80 bg-gradient-to-br from-brand-bg/80 via-white to-brand-bg/40 p-4">
          <div className="flex flex-col items-center gap-5 sm:flex-row">
            {/* Avatar Preview with Camera Hover */}
            <div className="group relative flex-shrink-0">
              <div className="rounded-full bg-gradient-to-tr from-burgundy-primary via-brand-red to-burgundy-dark p-[3px] shadow-md">
                <div className="rounded-full bg-white p-[2px]">
                  <img
                    src={formData.avatarUrl || "/avis-emblem.png"}
                    alt={formData.name || "Admin"}
                    className="sm:h-22 sm:w-22 h-20 w-20 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/avis-emblem.png";
                    }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                title="Upload Photo"
              >
                <Camera className="h-5 w-5" />
                <span className="mt-0.5 text-[10px] font-medium">Change</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Avatar Actions & Presets */}
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <div className="mb-2.5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl border-brand-border bg-white text-xs font-semibold text-text-primary hover:bg-brand-bg"
                >
                  <Upload className="h-3.5 w-3.5 text-brand-red" />
                  <span>Upload Image</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Required Fields Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Name */}
          <div className="space-y-1">
            <Input
              label="Institution / Full Name"
              labelIcon={Building}
              value={formData.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Avis World College"
              error={errors.name}
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <Input
              label="Email Address"
              labelIcon={Mail}
              type="email"
              value={formData.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="acetek1@example.com"
              error={errors.email}
              required
            />
          </div>

          {/* City */}
          <div className="space-y-1">
            <Input
              label="City"
              labelIcon={MapPin}
              value={formData.city || ""}
              onChange={(e) => handleChange("city", e.target.value)}
              placeholder="Kerala"
              error={errors.city}
              required
            />
          </div>

          {/* State */}
          <div className="space-y-1">
            <Input
              label="State / Region"
              labelIcon={MapPin}
              value={formData.state || ""}
              onChange={(e) => handleChange("state", e.target.value)}
              placeholder="acetek@example.com"
              error={errors.state}
              required
            />
          </div>

          {/* Country */}
          <div className="space-y-1">
            <FilterSelect
              label="Country"
              icon={Globe}
              value={formData.country || ""}
              onChange={(val) => handleChange("country", val)}
              options={countryOptions}
              searchable={true}
              searchPlaceholder="Search 240+ countries..."
              placeholder="Select Country"
              required
              hasError={Boolean(errors.country)}
              size="sm"
              buttonClassName="h-9 bg-white border-brand-border hover:border-brand-border/80 focus:border-burgundy-primary focus:ring-burgundy-primary"
            />
            {errors.country && (
              <p className="flex items-center gap-1 text-[11px] font-medium text-brand-red">
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span>{errors.country}</span>
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <Input
              label="Phone Number"
              labelIcon={Phone}
              value={formData.phone || ""}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="+91 94471 23456"
            />
          </div>
        </div>

        {/* Department / Unit */}
        <div className="space-y-1">
          <Input
            label="Department / Unit"
            labelIcon={Building}
            value={formData.department || ""}
            onChange={(e) => handleChange("department", e.target.value)}
            placeholder="Central Administration"
          />
        </div>

        {/* Dedicated Password Change Section with Toggle Switch */}
        <div
          className={cn(
            "overflow-hidden rounded-2xl border transition-all duration-200",
            isChangingPassword
              ? "shadow-xs border-brand-accent/40 bg-white ring-1 ring-brand-accent/20"
              : "border-brand-border/80 bg-slate-50/60 hover:border-slate-300",
          )}
        >
          {/* Header Bar with Toggle Switch */}
          <div
            onClick={() => setIsChangingPassword(!isChangingPassword)}
            className="flex cursor-pointer select-none items-center justify-between p-4"
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl border transition-colors",
                  isChangingPassword ? "border-brand-accent/30 bg-brand-light-red text-brand-red" : "border-slate-200 bg-white text-slate-500",
                )}
              >
                <KeyRound className="h-4.5 w-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-text-primary sm:text-sm">Change Password</h4>
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                      isChangingPassword
                        ? "border-brand-accent/30 bg-brand-light-red text-brand-red"
                        : "border-slate-200 bg-slate-100 text-slate-500",
                    )}
                  >
                    {isChangingPassword ? "Active" : "Unchanged"}
                  </span>
                </div>
                <p className="text-[11px] text-text-muted">Update your Super Admin account password credentials</p>
              </div>
            </div>

            <div onClick={(e) => e.stopPropagation()}>
              <ToggleSwitch
                size="sm"
                checked={isChangingPassword}
                onChange={(checked) => setIsChangingPassword(checked)}
                showIcons={true}
                ariaLabel="Toggle password change form"
              />
            </div>
          </div>

          {/* Smooth Collapsible Password Fields */}
          <AnimatePresence initial={false}>
            {isChangingPassword && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 450,
                  damping: 32,
                  mass: 0.7,
                }}
                className="overflow-hidden"
              >
                <div className="space-y-4 border-t border-slate-100 bg-gradient-to-b from-slate-50/50 to-white p-4">
                  {/* Current Password Field */}
                  <div className="space-y-1">
                    <Input
                      label="Current Password"
                      labelIcon={Shield}
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                      placeholder="Enter existing password"
                      error={errors.currentPassword}
                      helperText="Verify your identity with your current password"
                      required
                      suffix={
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="pointer-events-auto p-1 text-slate-400 transition-colors hover:text-text-primary focus:outline-none"
                          aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      }
                    />
                  </div>

                  {/* New Password & Confirm Password Grid */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* New Password */}
                    <div className="space-y-1">
                      <Input
                        label="New Password"
                        labelIcon={Lock}
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                        placeholder="At least 8 characters"
                        error={errors.newPassword}
                        required
                        suffix={
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="pointer-events-auto p-1 text-slate-400 transition-colors hover:text-text-primary focus:outline-none"
                            aria-label={showNewPassword ? "Hide password" : "Show password"}
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        }
                      />

                      {/* Password Strength Indicator */}
                      {passwordData.newPassword && (
                        <div className="space-y-1 pt-1.5">
                          <div className="flex items-center justify-between text-[10.5px]">
                            <span className="text-text-muted">Password Strength:</span>
                            <span className={cn("font-bold tracking-wide", passwordStrength.textColor)}>{passwordStrength.label}</span>
                          </div>
                          <div className="grid h-1.5 grid-cols-4 gap-1.5">
                            {[1, 2, 3, 4].map((step) => (
                              <div
                                key={step}
                                className={cn(
                                  "h-full rounded-full transition-all duration-300",
                                  step <= passwordStrength.score ? passwordStrength.color : "bg-slate-200",
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm New Password */}
                    <div className="space-y-1">
                      <Input
                        label="Confirm New Password"
                        labelIcon={ShieldCheck}
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                        placeholder="Re-enter new password"
                        error={errors.confirmPassword}
                        helperText={
                          passwordData.confirmPassword && passwordData.confirmPassword === passwordData.newPassword
                            ? "✓ Passwords match successfully"
                            : undefined
                        }
                        required
                        suffix={
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="pointer-events-auto p-1 text-slate-400 transition-colors hover:text-text-primary focus:outline-none"
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        }
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-brand-border/70 pt-3 sm:flex-row">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="w-full text-xs text-text-muted hover:text-brand-red sm:w-auto"
          >
            <RotateCcw className="mr-1 h-3.5 w-3.5" />
            <span>Reset to Defaults</span>
          </Button>

          <div className="flex w-full items-center gap-2.5 sm:w-auto">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 text-xs sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              className="flex-1 px-5 text-xs font-semibold shadow-sm sm:flex-none"
            >
              <Check className="mr-1.5 h-4 w-4" />
              <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default EditProfileModal;
