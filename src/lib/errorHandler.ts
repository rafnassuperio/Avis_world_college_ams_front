/**
 * Global Error and Security Handlers
 * Catches unhandled promise rejections and uncaught window errors,
 * cleans sensitive data from error logs, and ensures stable runtime execution.
 */

let initialized = false;

export function initSecurityAndErrorHandlers(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  // Unhandled Promise Rejections (e.g. failed async fetch, unexpected async errors)
  window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    const message = reason instanceof Error ? reason.message : String(reason);

    // Suppress noise for cancelled navigation or intentional aborts
    if (message.includes("AbortError") || message.includes("cancelled")) {
      return;
    }

    if (import.meta.env.DEV) {
      console.error("[Unhandled Promise Rejection]:", reason);
    } else {
      // Production: clean log without leaking potential sensitive data / tokens
      console.error("[Application Error]:", sanitizeErrorMessage(message));
    }
  });

  // Global uncaught runtime errors
  window.addEventListener("error", (event: ErrorEvent) => {
    // Check if error comes from external script / cross-origin
    if (event.message === "Script error.") {
      return;
    }

    if (import.meta.env.DEV) {
      console.error("[Uncaught Window Error]:", event.error || event.message);
    } else {
      console.error("[Application Error]:", sanitizeErrorMessage(event.message));
    }
  });
}

/**
 * Strips potential auth headers, query parameters, passwords, API tokens,
 * database strings, or internal filesystem paths from error messages.
 */
export function sanitizeErrorMessage(message: string): string {
  if (!message) return "An unexpected error occurred.";

  return message
    // Redact bearer tokens and JWT patterns
    .replace(/(bearer\s+[a-zA-Z0-9_\-.]+)/gi, "bearer [REDACTED]")
    .replace(/(eyJ[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+)/g, "[JWT_REDACTED]")
    // Redact query parameter tokens and API keys (handles both query strings ?token= and inline token=)
    .replace(/((?:\b|[?&])(?:token|apiKey|api_key|key|auth|secret)=)[^&\s]+/gi, "$1[REDACTED]")
    .replace(/((?:\b|[?&])(?:password|secret|passcode|creditCard|cvv)=)[^&\s]+/gi, "$1[REDACTED]")
    // Redact database connection strings
    .replace(/(mongodb|postgres|mysql|redis):\/\/[^\s]+/gi, "$1://[REDACTED]")
    // Redact internal local file system absolute paths (Windows & POSIX)
    .replace(/([a-zA-Z]:\\[^:\n\r]+)/g, "[PATH_REDACTED]")
    .replace(/(\/(?:home|Users|var|etc)\/[^\s:]+)/g, "[PATH_REDACTED]");
}
