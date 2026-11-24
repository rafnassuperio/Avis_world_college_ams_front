import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CollegeDetails } from "../types";
import { Building2, MapPin, Phone, Mail, Upload, RotateCcw, Image as ImageIcon } from "lucide-react";
import { smoothEase } from "@/components/animations/transitions";
import { validateFileUpload } from "@/lib/security";

export interface EditCollegeModalProps {
  isOpen: boolean;
  onClose: () => void;
  college: CollegeDetails;
  onSave: (updated: CollegeDetails) => void | boolean | Promise<void | boolean>;
}

const formContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

const formItemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: smoothEase },
  },
};

export const EditCollegeModal: React.FC<EditCollegeModalProps> = ({ isOpen, onClose, college, onSave }) => {
  const [formData, setFormData] = useState<CollegeDetails>({ ...college });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize internal state whenever the modal opens or `college` prop updates
  useEffect(() => {
    if (isOpen) {
      setFormData({ ...college });
      setErrors({});
    }
  }, [isOpen, college]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "College name is required";
    }
    if (!formData.place.trim()) {
      newErrors.place = "Place is required";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Mail ID is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (await onSave(formData) === false) return;
    onClose();
  };

  // Handle secure local file upload (with size/mime validation)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateFileUpload(file, { maxSizeBytes: 2 * 1024 * 1024 });
      if (!validation.isValid) {
        setErrors((prev) => ({ ...prev, image: validation.error || "Invalid file" }));
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setFormData((prev) => ({ ...prev, image: reader.result as string }));
          if (errors.image) {
            setErrors((prev) => {
              const updated = { ...prev };
              delete updated.image;
              return updated;
            });
          }
        }
      };
      reader.onerror = () => {
        setErrors((prev) => ({ ...prev, image: "Failed to read file. Please try another image." }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetImage = () => {
    setFormData((prev) => ({ ...prev, image: college.image }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit College Details"
      subtitle="Update the college profile details and image"
      maxWidth="lg"
    >
      <motion.form
        variants={formContainerVariants}
        initial="hidden"
        animate="visible"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {/* College Image Section */}
        <motion.div variants={formItemVariants}>
          <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-text-primary">
            <span className="flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-brand-red" />
              College Image
            </span>
            <button
              type="button"
              onClick={handleResetImage}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-red transition-opacity hover:underline hover:opacity-80"
            >
              <RotateCcw className="h-3 w-3" />
              Reset to Default
            </button>
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Image Preview */}
            <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-brand-border bg-brand-bg shadow-sm">
              <motion.img
                key={formData.image}
                initial={{ opacity: 0.5, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                src={formData.image}
                alt="Preview"
                className="h-full w-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80";
                }}
              />
            </div>

            {/* Image URL input & upload button */}
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={formData.image}
                onChange={(e) => {
                  setFormData({ ...formData, image: e.target.value });
                  if (errors.image) {
                    setErrors((prev) => ({ ...prev, image: "" }));
                  }
                }}
                placeholder="Paste Image URL..."
                className="w-full rounded-xl border border-brand-border px-3 py-2 text-xs text-text-primary transition-all placeholder:text-text-muted focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
              />

              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="college-image-upload"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full text-xs"
                >
                  <Upload className="mr-1 h-3.5 w-3.5 text-brand-red" />
                  Upload from Device
                </Button>
              </div>
            </div>
          </div>
          <AnimatePresence>
            {errors.image && (
              <motion.p
                initial={{ opacity: 0, y: -4, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -4, height: 0 }}
                transition={{ duration: 0.18 }}
                className="mt-1 overflow-hidden text-[11px] text-red-500"
              >
                {errors.image}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* College Name */}
        <motion.div variants={formItemVariants}>
          <label className="mb-1 block text-xs font-semibold text-text-primary">
            College Name <span className="text-brand-red">*</span>
          </label>
          <div className="relative">
            <Building2 className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
              }}
              placeholder="e.g. Avis World College"
              className="w-full rounded-xl border border-brand-border py-2 pl-9 pr-3 text-xs text-text-primary transition-all placeholder:text-text-muted focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
            />
          </div>
          <AnimatePresence>
            {errors.name && (
              <motion.p
                initial={{ opacity: 0, y: -4, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -4, height: 0 }}
                transition={{ duration: 0.18 }}
                className="mt-1 overflow-hidden text-[11px] text-red-500"
              >
                {errors.name}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Place */}
        <motion.div variants={formItemVariants}>
          <label className="mb-1 block text-xs font-semibold text-text-primary">
            Place <span className="text-brand-red">*</span>
          </label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
            <input
              type="text"
              required
              value={formData.place}
              onChange={(e) => {
                setFormData({ ...formData, place: e.target.value });
                if (errors.place) setErrors((prev) => ({ ...prev, place: "" }));
              }}
              placeholder="e.g. Kochi, Kerala, India"
              className="w-full rounded-xl border border-brand-border py-2 pl-9 pr-3 text-xs text-text-primary transition-all placeholder:text-text-muted focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
            />
          </div>
          <AnimatePresence>
            {errors.place && (
              <motion.p
                initial={{ opacity: 0, y: -4, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -4, height: 0 }}
                transition={{ duration: 0.18 }}
                className="mt-1 overflow-hidden text-[11px] text-red-500"
              >
                {errors.place}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Phone No & Mail ID */}
        <motion.div
          variants={formItemVariants}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          {/* Phone No */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-primary">
              Phone No <span className="text-brand-red">*</span>
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                }}
                placeholder="e.g. +91 98765 43210"
                className="w-full rounded-xl border border-brand-border py-2 pl-9 pr-3 text-xs text-text-primary transition-all placeholder:text-text-muted focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
              />
            </div>
            <AnimatePresence>
              {errors.phone && (
                <motion.p
                  initial={{ opacity: 0, y: -4, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -4, height: 0 }}
                  transition={{ duration: 0.18 }}
                  className="mt-1 overflow-hidden text-[11px] text-red-500"
                >
                  {errors.phone}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Mail ID */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-primary">
              Mail ID <span className="text-brand-red">*</span>
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                }}
                placeholder="e.g. info@avisworld.edu"
                className="w-full rounded-xl border border-brand-border py-2 pl-9 pr-3 text-xs text-text-primary transition-all placeholder:text-text-muted focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
              />
            </div>
            <AnimatePresence>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -4, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -4, height: 0 }}
                  transition={{ duration: 0.18 }}
                  className="mt-1 overflow-hidden text-[11px] text-red-500"
                >
                  {errors.email}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Modal Actions */}
        <motion.div
          variants={formItemVariants}
          className="flex items-center justify-end gap-2.5 border-t border-brand-border pt-4"
        >
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            className="text-xs shadow-md shadow-brand-red/20"
          >
            Save Changes
          </Button>
        </motion.div>
      </motion.form>
    </Modal>
  );
};

export default EditCollegeModal;
