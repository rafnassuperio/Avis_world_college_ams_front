import React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showStatus?: boolean;
  status?: "online" | "busy" | "away" | "offline";
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "Avatar",
  name = "Vishnu Krishnakumar",
  size = "md",
  showStatus = false,
  status = "online",
  className,
}) => {
  const sizeClasses = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-11 h-11 text-base",
    xl: "w-14 h-14 text-lg",
  };

  const statusColors = {
    online: "bg-emerald-500",
    busy: "bg-rose-500",
    away: "bg-amber-500",
    offline: "bg-slate-400",
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className={cn("relative inline-block select-none rounded-full", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden rounded-full border-2 border-white/80 bg-gradient-to-tr from-burgundy-primary to-brand-red font-semibold text-white shadow-sm",
          sizeClasses[size],
        )}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {showStatus && <span className={cn("absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white", statusColors[status])} />}
    </div>
  );
};
