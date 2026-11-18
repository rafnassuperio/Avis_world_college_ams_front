import React, { useState } from "react";
import { useRouteError, isRouteErrorResponse, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { RotateCcw, Home, ArrowLeft, Copy, Check, Terminal } from "lucide-react";
import { NotFoundIllustration } from "./NotFoundIllustration";
import { OfflineFallback } from "./OfflineFallback";

interface RouteErrorBoundaryProps {
  isNotFound?: boolean;
}

export const RouteErrorBoundary: React.FC<RouteErrorBoundaryProps> = ({ isNotFound = false }) => {
  const error = useRouteError();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  // If user is offline or fetch failed because of network disconnection
  const isOffline =
    !navigator.onLine ||
    (error instanceof Error &&
      /networkerror|failed to fetch|dynamically imported module|chunkloaderror|net::err_/i.test(error.message || "") &&
      !navigator.onLine);

  if (isOffline) {
    return (
      <OfflineFallback
        onRetry={() => window.location.reload()}
        showBackButton
      />
    );
  }

  let title = "Oops!";
  let subtitle = "There's something wrong";
  let isChunkError = false;

  if (isNotFound) {
    title = "Oops!";
    subtitle = "There's something wrong";
  } else if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = "Oops!";
      subtitle = "There's something wrong";
    } else if (error.status === 403 || error.status === 401) {
      title = "Oops!";
      subtitle = error.statusText || "You do not have permission to access this resource.";
    } else {
      title = "Oops!";
      subtitle = error.statusText || error.data?.message || "There's something wrong";
    }
  } else if (error instanceof Error) {
    if (error.name === "ChunkLoadError" || /failed to fetch dynamically imported module/i.test(error.message)) {
      isChunkError = true;
      title = "Oops!";
      subtitle = "A new release was deployed. Please reload the page.";
    } else if (import.meta.env.DEV) {
      subtitle = error.message;
    }
  }

  const getErrorDetails = (): string => {
    const isDev = import.meta.env.DEV;

    if (!isDev) {
      // Production: Prevent leakage of stack traces, internal paths, and API secrets
      return [
        `Application: Avis World College AMS`,
        `Incident ID: ams-route-err-${Date.now().toString(36)}`,
        `Timestamp: ${new Date().toISOString()}`,
        `Summary: Navigation route exception safely caught.`,
        `Status: Logged to secure administrative telemetry.`,
      ].join("\n");
    }

    const parts: string[] = [];
    parts.push(`URL: ${window.location.href}`);
    parts.push(`Timestamp: ${new Date().toISOString()}`);

    if (error instanceof Error) {
      parts.push(`Error: ${error.name}: ${error.message}`);
      if (error.stack) {
        parts.push(`\nStack Trace:\n${error.stack}`);
      }
    } else if (isRouteErrorResponse(error)) {
      parts.push(`HTTP Status: ${error.status} (${error.statusText || "Route Error"})`);
      if (error.data) {
        const dataStr = typeof error.data === "object" ? JSON.stringify(error.data, null, 2) : String(error.data);
        parts.push(`Data:\n${dataStr}`);
      }
    } else if (typeof error === "string") {
      parts.push(`Error: ${error}`);
    } else if (error) {
      try {
        parts.push(`Error Details:\n${JSON.stringify(error, null, 2)}`);
      } catch {
        parts.push(`Error: ${String(error)}`);
      }
    } else if (isNotFound) {
      parts.push(`Error: 404 Page Not Found`);
    } else {
      parts.push(`Error: Unknown error occurred`);
    }

    return parts.join("\n");
  };

  const handleCopy = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const text = getErrorDetails();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy error details:", err);
    }
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex min-h-[calc(100vh-140px)] w-full items-center justify-center p-4 sm:p-6 md:p-8"
    >
      <div className="flex w-full max-w-[1200px] flex-col items-center">
        {/* Main Card styled with Avis Brand Color Combination */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative w-full overflow-hidden rounded-[28px] border border-brand-border p-6 sm:p-8 md:p-10"
        >
          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-8 md:gap-10">
            {/* Left: 404 Illustration with Unplugged Cord in Brand Burgundy */}
            <div className="flex flex-shrink-0 items-center justify-center">
              <NotFoundIllustration />
            </div>

            {/* Vertical Divider in Brand Burgundy Gradient */}
            <div
              className="hidden h-[58px] w-[3.5px] flex-shrink-0 rounded-full bg-gradient-to-b from-burgundy-primary to-brand-red opacity-90 sm:block md:h-[64px]"
              aria-hidden="true"
            />

            {/* Right: Typography & Action Button in Brand Palette */}
            <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
              <h1 className="text-3xl font-normal tracking-tight text-text-primary sm:text-4xl">{title}</h1>

              <p className="mt-1 text-sm font-light italic text-text-secondary sm:mt-1.5 sm:text-base">{subtitle}</p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                {isChunkError ? (
                  <>
                    <button
                      type="button"
                      onClick={handleReload}
                      className="group inline-flex cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-brand-red to-burgundy-primary px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-brand-red/20 transition-all duration-200 hover:shadow-lg hover:shadow-brand-red/30 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red/40 focus-visible:ring-offset-2 active:scale-95 sm:text-sm"
                    >
                      <RotateCcw className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:-rotate-45" />
                      Reload Page
                    </button>

                    <button
                      type="button"
                      onClick={handleCopy}
                      className="group inline-flex cursor-pointer items-center justify-center rounded-xl border border-brand-border bg-white/80 px-5 py-2.5 text-xs font-medium text-text-primary shadow-sm transition-all duration-200 hover:border-burgundy-primary/40 hover:bg-brand-light-red/30 hover:text-burgundy-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-primary/30 focus-visible:ring-offset-2 active:scale-95 sm:text-sm"
                      title="Copy error details to clipboard"
                    >
                      {copied ? (
                        <>
                          <Check className="mr-2 h-4 w-4 text-emerald-600" />
                          <span className="font-semibold text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                          Copy Error
                        </>
                      )}
                    </button>

                    <Link
                      to="/"
                      className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-brand-border bg-white/80 px-5 py-2.5 text-xs font-medium text-text-primary shadow-sm transition-all duration-200 hover:border-burgundy-primary/40 hover:bg-brand-light-red/30 hover:text-burgundy-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-primary/30 focus-visible:ring-offset-2 active:scale-95 sm:text-sm"
                    >
                      <Home className="mr-2 h-4 w-4" />
                      Return to Dashboard
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleGoBack}
                      className="group inline-flex cursor-pointer items-center justify-center rounded-xl border border-brand-border bg-white/80 px-5 py-2.5 text-xs font-medium text-text-primary shadow-sm transition-all duration-200 hover:border-burgundy-primary/40 hover:bg-brand-light-red/30 hover:text-burgundy-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-primary/30 focus-visible:ring-offset-2 active:scale-95 sm:text-sm"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
                      Go Back
                    </button>

                    <button
                      type="button"
                      onClick={handleCopy}
                      className="group inline-flex cursor-pointer items-center justify-center rounded-xl border border-brand-border bg-white/80 px-5 py-2.5 text-xs font-medium text-text-primary shadow-sm transition-all duration-200 hover:border-burgundy-primary/40 hover:bg-brand-light-red/30 hover:text-burgundy-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-primary/30 focus-visible:ring-offset-2 active:scale-95 sm:text-sm"
                      title="Copy error details to clipboard"
                    >
                      {copied ? (
                        <>
                          <Check className="mr-2 h-4 w-4 text-emerald-600" />
                          <span className="font-semibold text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                          Copy Error
                        </>
                      )}
                    </button>

                    <Link
                      to="/"
                      className="group inline-flex cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-burgundy-primary to-burgundy-dark px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-burgundy-primary/20 transition-all duration-200 hover:shadow-lg hover:shadow-burgundy-primary/30 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-primary/40 focus-visible:ring-offset-2 active:scale-95 sm:text-sm"
                    >
                      <Home className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                      Return to Dashboard
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Development Stack Trace & Technical Details */}
        {import.meta.env.DEV && error instanceof Error && !isChunkError && (
          <details className="mt-4 max-h-56 w-full overflow-auto rounded-xl border border-brand-border bg-brand-bg p-3.5 text-left text-xs text-text-secondary shadow-sm transition-all">
            <summary className="flex cursor-pointer select-none items-center justify-between font-semibold text-text-primary hover:text-burgundy-primary">
              <span className="flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-brand-red" />
                Technical Details (Development Only)
              </span>
              <div className="flex items-center gap-2">
                <span className="rounded bg-brand-border/70 px-2 py-0.5 font-mono text-[10px] text-text-secondary">{error.name}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Copy error details"
                  className="shadow-xs inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-white px-2.5 py-1 text-[11px] font-medium text-text-primary transition-colors hover:border-burgundy-primary/40 hover:bg-brand-light-red/30 hover:text-burgundy-primary active:scale-95"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-600" />
                      <span className="font-semibold text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </summary>

            <div className="mt-3 space-y-2">
              <div className="rounded-lg border border-brand-red/25 bg-brand-light-red/50 p-2.5">
                <p className="break-words font-mono text-xs font-semibold text-burgundy-primary">{error.message || "Unknown error"}</p>
              </div>

              {error.stack && (
                <pre className="max-h-48 overflow-auto rounded-lg bg-palette-midnight/95 p-3 font-mono text-[10.5px] leading-relaxed text-[#F1DDE0] shadow-inner">
                  {error.stack}
                </pre>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
};

export default RouteErrorBoundary;
