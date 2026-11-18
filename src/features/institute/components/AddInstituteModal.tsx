import React, { useState, useRef, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { InstituteItem, InstituteCategory, InstituteStatus } from "../types";
import { Building2, Mail, Phone, MapPin, Upload, Link as LinkIcon, Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dropdown, DropdownOption } from "@/components/ui/Dropdown";
import countriesData from "@/data/country.json";

export interface AddInstituteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newInstitute: InstituteItem) => void;
  nextInstituteCode?: string;
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

export const AddInstituteModal: React.FC<AddInstituteModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  nextInstituteCode = "AWC-INST-013",
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

  const handleReset = () => {
    setName("");
    setEmail("");
    setContactNo("");
    setCountry("United Kingdom");
    setAddress("");
    setGoogleLocation("");
    setCategory("Main Campus");
    setStatus("Active");
    setWebsite("");
    setImageUrl("/avis-emblem.png");
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

    const todayStr = new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date());

    const newInstitute: InstituteItem = {
      id: `inst-${Date.now()}`,
      instituteCode: nextInstituteCode,
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
      createdAt: todayStr,
    };

    onAdd(newInstitute);
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
      maxWidth="xl"
      title={
        <div className="flex items-center gap-2">
          <span>Add New Institute</span>
          <span className="rounded-full bg-burgundy-primary/10 px-2.5 py-0.5 text-xs font-bold text-burgundy-primary">
            {nextInstituteCode}
          </span>
        </div>
      }
      subtitle="Register an affiliated campus, partner university, or international institute location"
      headerIcon={
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-burgundy-primary/10 text-burgundy-primary">
          <Building2 className="h-5 w-5 stroke-[2.2]" />
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
              title="Upload Institute Logo"
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
            <h4 className="text-xs font-bold text-text-primary">Institute Image / Emblem</h4>
            <p className="mt-0.5 text-[11px] text-text-muted">
              Upload a high-resolution logo or campus facade photo (PNG/JPG, max 5MB).
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 justify-center sm:justify-start">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-brand-border bg-white px-2.5 py-1 text-[11px] font-semibold text-text-secondary hover:border-burgundy-primary hover:text-burgundy-primary"
              >
                Upload Image
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
                placeholder="e.g. Avis World College - Central London Campus"
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
                placeholder="admissions@institute.ac.uk"
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
                placeholder="+44 20 7946 0912"
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
                placeholder="e.g. 45 Bloomsbury Square, Holborn, London WC1A 2LS"
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
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="rounded-xl border-brand-border px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-brand-bg"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="burgundy"
            className="shadow-xs rounded-xl px-4 py-2 text-xs font-bold text-white shadow-burgundy/20 hover:shadow-md"
          >
            <Building2 className="mr-1.5 h-3.5 w-3.5" />
            Add Institute
          </Button>
        </div>
      </form>
    </Modal>
  );
};
