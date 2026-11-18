import { ApiError } from "./apiError";
import { toast } from "@/components/common/ToastMessage";

export interface HandleErrorOptions {
  showToast?: boolean;
  toastTitle?: string;
  fallbackMessage?: string;
  onUnauthorized?: () => void;
}

/**
 * Global API and Runtime Error Handling Utility
 * Ensures sensitive server details and stack traces are sanitized before presentation.
 */
export function handleApiError(error: unknown, options: HandleErrorOptions = {}): string {
  const {
    showToast = true,
    toastTitle = "Notice",
    fallbackMessage = "An unexpected issue occurred. Please try again.",
    onUnauthorized,
  } = options;

  let message = fallbackMessage;
  let status = 0;

  if (error instanceof ApiError) {
    message = error.userMessage;
    status = error.status;

    if (status === 401 && onUnauthorized) {
      onUnauthorized();
    }
  } else if (error instanceof Error) {
    // Check if error contains sensitive substrings
    if (import.meta.env.DEV) {
      message = error.message;
    } else {
      message = fallbackMessage;
    }
  }

  // Safe developer logging
  if (import.meta.env.DEV) {
    console.error("[API Error Handler]:", error);
  } else {
    console.error(`[API Notice ${status || "Client"}]:`, message);
  }

  if (showToast) {
    toast.error(toastTitle, {
      description: message,
    });
  }

  return message;
}
