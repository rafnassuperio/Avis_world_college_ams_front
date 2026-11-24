import React, { useState, useRef, useEffect, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { InstituteItem, InstituteCategory, InstituteStatus } from "../types";
import { Edit3, Building2, Mail, Phone, MapPin, Upload, Link as LinkIcon, Compass, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dropdown, DropdownOption } from "@/components/ui/Dropdown";
import countriesData from "@/data/country.json";

export interface EditInstituteModalProps {
  isOpen: boolean;
  onClose: () => void;
  institute: InstituteItem | null;
  onSave: (updatedInstitute: InstituteItem) => void | boolean | Promise<void | boolean>;
}

const CATEGORY_OPTIONS: DropdownOption[] = [
  { label: "Main Campus", value: "Main Campus" },
  { label: "Branch Campus", value: "Branch Campus" },
  { label: "Affiliated Institute", value: "Affiliated Institute" },
  { label: "Partner University", value: "Partner University" },
  { label: "Research Center", value: "Research Center" },
];

const STATUS_OPTIONS: DropdownOption[] = [
  { label: "Active", value: "Active" },
  { label: "Pending", value: "Pending" },
  { label: "Inactive", value: "Inactive" },
];

export const EditInstituteModal: React.FC<EditInstituteModalProps> = ({
  isOpen,
  onClose,
  institute,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [country, setCountry] = useState("United Kingdom");
  const [address, setAddress] = useState("");
  const [googleLocation, setGoogleLocation] = useState("");
  const [category, setCategory] = useState<InstituteCategory>("Main Campus");
  const [status, setStatus] = useState<InstituteStatus>("Active");
  const [website, setWebsite] = useState("");
  const [imageUrl, setImageUrl] = useState("/avis-emblem.png");
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (institute) {
      setName(institute.name || "");
      setEmail(institute.email || "");
      setContactNo(institute.contactNo || "");
      setCountry(institute.country || "United Kingdom");
      setAddress(institute.address || "");
      setGoogleLocation(institute.googleLocation || "");
      setCategory(institute.category || "Main Campus");
      setStatus(institute.status || "Active");
      setWebsite(institute.website || "");
      setImageUrl(institute.imageUrl || "/avis-emblem.png");
      setError("");
    }
  }, [institute]);

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
      setError("Institute image size must be less than 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setImageUrl(result);
        if (error) setError("");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAutoGenerateGoogleLocation = () => {
    const query = [name.trim(), address.trim(), country.trim()].filter(Boolean).join(", ");
    if (query) {
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
      setGoogleLocation(mapsUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institute) return;

    if (!name.trim()) {
      setError("Please enter the Institute Name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid official Email ID.");
      return;
    }
    if (!contactNo.trim()) {
      setError("Please enter a Contact Phone Number.");
      return;
    }
    if (!country.trim()) {
      setError("Please select a Country.");
      return;
    }
    if (!address.trim()) {
      setError("Please enter the Campus Physical Address.");
      return;
    }

    let finalGoogleLocation = googleLocation.trim();
    if (!finalGoogleLocation) {
      const query = [name.trim(), address.trim(), country.trim()].filter(Boolean).join(", ");
      finalGoogleLocation = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    }

    const updated: InstituteItem = {
      ...institute,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      contactNo: contactNo.trim(),
      country: country.trim(),
      address: address.trim(),
      googleLocation: finalGoogleLocation,
      status,
      category,
      website: website.trim(),
      imageUrl: imageUrl || "/avis-emblem.png",
    };

    if (await onSave(updated) === false) return;
    onClose();
  };

  if (!institute) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="xl"
      title={
        <div className="flex items-center gap-2">
          <span>Edit Institute Details</span>
          <span className="rounded-full bg-burgundy-primary/10 px-2.5 py-0.5 text-xs font-bold text-burgundy-primary">
            {institute.instituteCode}
          </span>
        </div>
      }
      subtitle={`Modify information and campus credentials for ${institute.name}`}
      headerIcon={
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-burgundy-primary/10 text-burgundy-primary">
          <Edit3 className="h-5 w-5 stroke-[2.2]" />
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* 1. Image & Code Section */}
        <div className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-brand-border/80 bg-brand-bg/40 p-3.5">
          <div className="relative group shrink-0">
            <img
              src={imageUrl}
              alt="Institute Logo Preview"
              className="h-16 w-16 rounded-2xl border-2 border-white object-cover shadow-sm ring-2 ring-brand-border"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/avis-emblem.png";
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
              title="Upload New Logo"
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
            <h4 className="text-xs font-bold text-text-primary">Campus Image / Emblem</h4>
            <p className="mt-0.5 text-[11px] text-text-muted">
              Update the visual emblem or campus picture displayed on directory and records.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 justify-center sm:justify-start">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-brand-border bg-white px-2.5 py-1 text-[11px] font-semibold text-text-secondary hover:border-burgundy-primary hover:text-burgundy-primary"
              >
                Change Image
              </button>
              {imageUrl !== "/avis-emblem.png" && (
                <button
                  type="button"
                  onClick={() => setImageUrl("/avis-emblem.png")}
                  className="text-[11px] font-semibold text-brand-red hover:underline"
                >
                  Reset to Emblem
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2. Core Fields */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {/* Institute Name */}
          <div className="sm:col-span-2">
            <label className="mb-1 block text-[11px] font-bold text-text-secondary">
              Institute Name <span className="text-brand-red">*</span>
            </label>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError("");
                }}
                className="h-9 w-full rounded-xl border border-brand-border bg-white pl-9 pr-3 text-xs font-medium text-text-primary placeholder:text-text-muted/60 focus:border-burgundy-primary focus:outline-none focus:ring-2 focus:ring-burgundy-primary/20"
              />
            </div>
          </div>

          {/* Email ID */}
          <div>
            <label className="mb-1 block text-[11px] font-bold text-text-secondary">
              Email ID <span className="text-brand-red">*</span>
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                className="h-9 w-full rounded-xl border border-brand-border bg-white pl-9 pr-3 text-xs font-medium text-text-primary placeholder:text-text-muted/60 focus:border-burgundy-primary focus:outline-none focus:ring-2 focus:ring-burgundy-primary/20"
              />
            </div>
          </div>

          {/* Contact No */}
          <div>
            <label className="mb-1 block text-[11px] font-bold text-text-secondary">
              Contact No <span className="text-brand-red">*</span>
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                required
                value={contactNo}
                onChange={(e) => {
                  setContactNo(e.target.value);
                  if (error) setError("");
                }}
                className="h-9 w-full rounded-xl border border-brand-border bg-white pl-9 pr-3 text-xs font-medium text-text-primary placeholder:text-text-muted/60 focus:border-burgundy-primary focus:outline-none focus:ring-2 focus:ring-burgundy-primary/20"
              />
            </div>
          </div>

          {/* Country Selection using Dropdown */}
          <div>
            <label className="mb-1 block text-[11px] font-bold text-text-secondary">
              Country <span className="text-brand-red">*</span>
            </label>
            <Dropdown
              value={country}
              options={countryOptions}
              onChange={(val) => {
                setCountry(val);
                if (error) setError("");
              }}
              className="w-full"
              buttonClassName="w-full justify-between h-9 rounded-xl text-xs bg-white border border-brand-border font-medium"
              menuClassName="max-h-56 overflow-y-auto w-full z-50"
            />
          </div>

          {/* Category using Dropdown */}
          <div>
            <label className="mb-1 block text-[11px] font-bold text-text-secondary">
              Campus Category
            </label>
            <Dropdown
              value={category}
              options={CATEGORY_OPTIONS}
              onChange={(val) => setCategory(val as InstituteCategory)}
              className="w-full"
              buttonClassName="w-full justify-between h-9 rounded-xl text-xs bg-white border border-brand-border font-medium"
              menuClassName="w-full z-50"
            />
          </div>

          {/* Address */}
          <div className="sm:col-span-2">
            <label className="mb-1 block text-[11px] font-bold text-text-secondary">
              Physical Address <span className="text-brand-red">*</span>
            </label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-text-muted" />
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (error) setError("");
                }}
                className="w-full rounded-xl border border-brand-border bg-white pl-9 pr-3 py-2 text-xs font-medium text-text-primary placeholder:text-text-muted/60 focus:border-burgundy-primary focus:outline-none focus:ring-2 focus:ring-burgundy-primary/20"
              />
            </div>
          </div>

          {/* Google Location Link */}
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-text-secondary">
                Google Location (Maps URL)
              </label>
              {(name || address) && (
                <button
                  type="button"
                  onClick={handleAutoGenerateGoogleLocation}
                  className="flex items-center gap-1 text-[10.5px] font-semibold text-burgundy-primary hover:underline"
                >
                  <Compass className="h-3 w-3" />
                  Auto-generate from Address
                </button>
              )}
            </div>
            <div className="relative">
              <LinkIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
              <input
                type="url"
                value={googleLocation}
                onChange={(e) => setGoogleLocation(e.target.value)}
                placeholder="https://maps.google.com/?q=..."
                className="h-9 w-full rounded-xl border border-brand-border bg-white pl-9 pr-3 text-xs font-medium text-text-primary placeholder:text-text-muted/60 focus:border-burgundy-primary focus:outline-none focus:ring-2 focus:ring-burgundy-primary/20"
              />
            </div>
          </div>

          {/* Website (Optional) */}
          <div>
            <label className="mb-1 block text-[11px] font-bold text-text-secondary">
              Website URL (Optional)
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://institute.ac.uk"
              className="h-9 w-full rounded-xl border border-brand-border bg-white px-3 text-xs font-medium text-text-primary placeholder:text-text-muted/60 focus:border-burgundy-primary focus:outline-none focus:ring-2 focus:ring-burgundy-primary/20"
            />
          </div>

          {/* Status using Dropdown */}
          <div>
            <label className="mb-1 block text-[11px] font-bold text-text-secondary">
              Status
            </label>
            <Dropdown
              value={status}
              options={STATUS_OPTIONS}
              onChange={(val) => setStatus(val as InstituteStatus)}
              className="w-full"
              buttonClassName="w-full justify-between h-9 rounded-xl text-xs bg-white border border-brand-border font-medium"
              menuClassName="w-full z-50"
            />
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="mt-5 flex items-center justify-end gap-2 border-t border-brand-border/60 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl border-brand-border px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-brand-bg"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="burgundy"
            className="shadow-xs rounded-xl px-4 py-2 text-xs font-bold text-white shadow-burgundy/20 hover:shadow-md"
          >
            <Check className="mr-1.5 h-3.5 w-3.5" />
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
