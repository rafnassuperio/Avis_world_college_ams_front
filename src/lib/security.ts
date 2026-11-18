/**
 * Application Security Utilities
 * Includes URL sanitization, safe storage wrapper, file upload validation,
 * and defenses against common web vulnerabilities (XSS, Prototype Pollution, Tabnabbing).
 */

const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

/**
 * Validates and sanitizes a URL to prevent javascript: or dangerous protocol injection.
 * Disallows protocol-relative URLs (//) and unsafe schemes.
 */
export function sanitizeUrl(url: string | null | undefined, fallback: string = "#"): string {
  if (!url || typeof url !== "string") return fallback;

  const trimmed = url.trim();

  // Disallow protocol-relative URLs (e.g. //evil.com)
  if (trimmed.startsWith("//")) {
    return fallback;
  }

  // Allow safe relative paths starting with /
  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  // Safe anchor on the current page
  if (trimmed.startsWith("#")) {
    return trimmed;
  }

  try {
    const baseOrigin = typeof window !== "undefined" && window.location?.origin ? window.location.origin : "http://localhost";
    const parsed = new URL(trimmed, baseOrigin);
    if (ALLOWED_PROTOCOLS.has(parsed.protocol)) {
      return trimmed;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

/**
 * Generates secure props for external hyperlinks (prevents reverse tabnabbing).
 */
export function safeExternalLinkProps(isExternal: boolean = true) {
  if (!isExternal) return {};
  return {
    target: "_blank",
    rel: "noopener noreferrer",
  };
}

/**
 * Disallowed sensitive keys that must NEVER be persisted in browser local storage.
 */
const SENSITIVE_STORAGE_KEYS = new Set([
  "password",
  "passcode",
  "token",
  "authToken",
  "accessToken",
  "refreshToken",
  "secret",
  "apiKey",
  "credentials",
]);

/**
 * Recursively strips sensitive fields and prototype pollution vectors from objects.
 */
function sanitizeStoredObject<T>(obj: T): T {
  if (!obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeStoredObject(item)) as unknown as T;
  }

  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
    // Prevent prototype pollution
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      continue;
    }
    // Block sensitive credentials from being stored in localStorage
    if (SENSITIVE_STORAGE_KEYS.has(key.toLowerCase())) {
      continue;
    }
    result[key] = typeof val === "object" && val !== null ? sanitizeStoredObject(val) : val;
  }
  return result as unknown as T;
}

/**
 * Safe local storage manager with error resilience, quota protection,
 * deep prototype pollution defense, and active redaction of sensitive credentials.
 */
export const safeStorage = {
  getItem<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;

    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return fallback;

      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return sanitizeStoredObject(parsed) as T;
      }
      return parsed as T;
    } catch {
      return fallback;
    }
  },

  setItem<T>(key: string, value: T): boolean {
    if (typeof window === "undefined") return false;

    try {
      // Disallow persisting values under sensitive top-level storage keys
      if (SENSITIVE_STORAGE_KEYS.has(key.toLowerCase())) {
        console.warn(`[safeStorage] Security Policy: Refusing to store sensitive key "${key}" in localStorage.`);
        return false;
      }

      const sanitizedValue = typeof value === "object" && value !== null ? sanitizeStoredObject(value) : value;
      const serialized = JSON.stringify(sanitizedValue);
      window.localStorage.setItem(key, serialized);
      return true;
    } catch (err) {
      // Handles DOMException (QuotaExceededError) or SecurityError
      console.warn(`[safeStorage] Failed to save key "${key}":`, err);
      return false;
    }
  },

  removeItem(key: string): boolean {
    if (typeof window === "undefined") return false;

    try {
      window.localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
};

export interface FileValidationOptions {
  maxSizeBytes?: number; // Default: 2MB
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
}

const DEFAULT_ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];

const DEFAULT_ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".svg"];

/**
 * Validates a file before processing/upload to prevent storage exhaustion and malicious uploads.
 */
export function validateFileUpload(file: File | null | undefined, options: FileValidationOptions = {}): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: "No file provided" };
  }

  const maxSize = options.maxSizeBytes ?? 2 * 1024 * 1024; // 2MB default
  const allowedMime = options.allowedMimeTypes ?? DEFAULT_ALLOWED_MIME_TYPES;
  const allowedExt = options.allowedExtensions ?? DEFAULT_ALLOWED_EXTENSIONS;

  if (file.size > maxSize) {
    const maxMb = (maxSize / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `File size exceeds the maximum allowed limit of ${maxMb}MB`,
    };
  }

  // Check MIME type
  if (!allowedMime.includes(file.type.toLowerCase())) {
    return {
      isValid: false,
      error: "Invalid file format. Please upload a valid JPG, PNG, WebP, or SVG image.",
    };
  }

  // Defense-in-depth: check file extension
  const fileName = file.name.toLowerCase();
  const hasValidExt = allowedExt.some((ext) => fileName.endsWith(ext));
  if (!hasValidExt) {
    return {
      isValid: false,
      error: "File extension does not match expected image types.",
    };
  }

  return { isValid: true };
}

/**
 * Robust input sanitization to neutralize XSS, strip HTML tags,
 * dangerous URI schemes, and inline script attributes.
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== "string") return "";

  return input
    // Neutralize script/style tags and their contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    // Strip all HTML tags
    .replace(/<[^>]+>/g, "")
    // Strip javascript:, data: (text/html), vbscript: pseudo protocols
    .replace(/(?:javascript|vbscript|data):/gi, "")
    // Strip inline event handlers (e.g. onerror=, onclick=)
    .replace(/on\w+\s*=/gi, "")
    .trim();
}
