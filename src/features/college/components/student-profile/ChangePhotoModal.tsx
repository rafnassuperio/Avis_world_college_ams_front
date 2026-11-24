import React, { useState, useRef } from "react";
import { Camera, Image as ImageIcon, Upload, Check, RefreshCw } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "@/components/common/ToastMessage";

export interface ChangePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhoto: string;
  studentName: string;
  onSavePhoto: (newUrl: string) => void | boolean | Promise<void | boolean>;
}

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&auto=format&fit=crop&q=80",
];

export const ChangePhotoModal: React.FC<ChangePhotoModalProps> = ({
  isOpen,
  onClose,
  currentPhoto,
  studentName,
  onSavePhoto,
}) => {
  const [photoUrl, setPhotoUrl] = useState(currentPhoto || "");
  const [previewError, setPreviewError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setPhotoUrl(result);
        setPreviewError(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!photoUrl.trim()) {
      toast.error("Please provide an image URL or choose a file");
      return;
    }
    if (await onSavePhoto(photoUrl.trim()) === false) return;
    toast.success("Student photo updated successfully");
    onClose();
  };

  const handleReset = () => {
    setPhotoUrl(currentPhoto || "");
    setPreviewError(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Student Photo"
      subtitle={`Change profile avatar for ${studentName}`}
      headerIcon={
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-burgundy-primary/20 bg-burgundy-primary/10 text-burgundy-primary">
          <Camera className="h-5 w-5" />
        </div>
      }
      maxWidth="md"
    >
      <div className="space-y-5 pt-2">
        {/* Preview Area */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-border bg-brand-bg/50 p-6 text-center">
          <div className="relative mb-3 h-28 w-28 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-md ring-1 ring-brand-border">
            {photoUrl && !previewError ? (
              <img
                src={photoUrl}
                alt={studentName}
                onError={() => setPreviewError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-burgundy-primary/10 text-2xl font-bold text-burgundy-primary">
                {studentName ? studentName.slice(0, 2).toUpperCase() : "ST"}
              </div>
            )}
          </div>
          <p className="text-xs font-semibold text-text-primary">{studentName}</p>
          <p className="text-[11px] text-text-muted">Recommended: Square image, 300x300 px or higher</p>
        </div>

        {/* Input Methods */}
        <div className="space-y-3">
          <Input
            label="Image URL"
            icon={ImageIcon}
            value={photoUrl.startsWith("data:") ? "(Local File Uploaded)" : photoUrl}
            onChange={(e) => {
              setPhotoUrl(e.target.value);
              setPreviewError(false);
            }}
            placeholder="https://example.com/avatar.jpg"
            disabled={photoUrl.startsWith("data:")}
          />

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 gap-2 rounded-xl border-brand-border bg-white text-xs font-semibold text-text-primary hover:bg-brand-bg"
            >
              <Upload className="h-3.5 w-3.5 text-burgundy-primary" />
              <span>Upload Local Photo</span>
            </Button>

            {photoUrl !== currentPhoto && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                title="Reset to current photo"
                className="rounded-xl border-brand-border px-3 text-xs text-text-muted hover:text-text-primary"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Preset Avatars Selection */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Or Choose Preset Avatar</label>
          <div className="grid grid-cols-6 gap-2">
            {PRESET_AVATARS.map((url, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setPhotoUrl(url);
                  setPreviewError(false);
                }}
                className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all hover:scale-105 ${
                  photoUrl === url ? "border-burgundy-primary ring-2 ring-burgundy-primary/20" : "border-brand-border hover:border-text-muted"
                }`}
              >
                <img
                  src={url}
                  alt={`Preset ${i + 1}`}
                  className="h-full w-full object-cover"
                />
                {photoUrl === url && (
                  <div className="absolute inset-0 flex items-center justify-center bg-burgundy-primary/40 text-white">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 border-t border-brand-border/60 pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-xl border-brand-border px-4 text-xs font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSave}
            className="rounded-xl bg-burgundy-primary px-5 text-xs font-semibold text-white hover:bg-burgundy-dark"
          >
            Save Photo
          </Button>
        </div>
      </div>
    </Modal>
  );
};
