/**
 * Standardized API Error for Avis Management System
 * Normalizes HTTP status codes, network dropouts, timeouts, and validation failures
 * without leaking sensitive infrastructure details, secrets, or raw server traces to end users.
 */

export interface ApiErrorOptions {
  status: number;
  statusText?: string;
  code?: string;
  data?: unknown;
  url?: string;
  isNetworkError?: boolean;
  isTimeout?: boolean;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly statusText: string;
  public readonly code?: string;
  public readonly data?: unknown;
  public readonly url?: string;
  public readonly isNetworkError: boolean;
  public readonly isTimeout: boolean;
  public readonly userMessage: string;
  public readonly timestamp: string;

  constructor(message: string, options: ApiErrorOptions) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.statusText = options.statusText || "HTTP Error";
    this.code = options.code;
    this.data = options.data;
    this.url = options.url;
    this.isNetworkError = Boolean(options.isNetworkError);
    this.isTimeout = Boolean(options.isTimeout);
    this.timestamp = new Date().toISOString();
    this.userMessage = getFriendlyUserMessage(this);

    // Maintains proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Returns a secure, friendly, localized user-facing message corresponding to standard HTTP status codes.
 * Ensures internal backend stack traces and database errors are NEVER displayed.
 */
export function getFriendlyUserMessage(error: { status: number; isNetworkError?: boolean; isTimeout?: boolean }): string {
  if (error.isNetworkError) {
    return "Network connectivity lost. Please verify your internet connection and try again.";
  }
  if (error.isTimeout) {
    return "The request took too long to complete. Please try again or check your network.";
  }

  switch (error.status) {
    case 400:
      return "Invalid request. Please verify the submitted information and try again.";
    case 401:
      return "Your session has expired or is unauthenticated. Please sign in to continue.";
    case 403:
      return "Access denied. You do not possess administrative permissions for this action.";
    case 404:
      return "The requested record, course, or resource could not be found.";
    case 409:
      return "A conflict occurred with an existing record. Please review existing entries.";
    case 422:
      return "Validation failed. Please correct the highlighted form fields.";
    case 429:
      return "Too many requests. For security, please wait a moment before trying again.";
    case 500:
      return "An unexpected server error occurred. Institutional IT administrators have been notified.";
    case 502:
      return "Upstream college gateway is temporarily unreachable. Please retry shortly.";
    case 503:
      return "The service is temporarily undergoing scheduled maintenance. Please check back soon.";
    case 504:
      return "The campus server gateway timed out. Please refresh or try again in a moment.";
    default:
      return "An unexpected error occurred while communicating with the server.";
  }
}
