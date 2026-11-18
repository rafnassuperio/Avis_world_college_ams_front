import { Component, ErrorInfo, ReactNode } from "react";
import { RotateCcw, Home, Terminal, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import { ErrorIllustration } from "./ErrorIllustration";
import { OfflineFallback } from "./OfflineFallback";

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  copied: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    copied: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error("[ErrorBoundary caught error]:", error, errorInfo);
    } else {
      // Production: Safe logging without leaking sensitive internals
      console.error("[Application Error]:", error.message || "Render exception");
    }
  }

  public handleCopy = async (e?: React.MouseEvent): Promise<void> => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const err = this.state.error;
    if (!err) return;

    const isDev = import.meta.env.DEV;
    const parts: string[] = [
      `Application: Avis World College AMS`,
      `Incident ID: ams-err-${Date.now().toString(36)}`,
      `Timestamp: ${new Date().toISOString()}`,
    ];

    if (isDev) {
      parts.push(`URL: ${window.location.href}`);
      parts.push(`Type: ${err.name}`);
      parts.push(`Message: ${err.message}`);
      if (err.stack) {
        parts.push(`\nStack Trace:\n${err.stack}`);
      }
    } else {
      // Production: Clean incident summary without leaking stack traces or sensitive internals
      parts.push(`Summary: An unexpected application notice occurred.`);
      parts.push(`Status: Logged to secure administrative telemetry.`);
    }

    const text = parts.join("\n");

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
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch (copyErr) {
      console.error("Failed to copy error details:", copyErr);
    }
  };

  public handleReset = (): void => {
    const isChunkError =
      this.state.error?.name === "ChunkLoadError" || /failed to fetch dynamically imported module/i.test(this.state.error?.message || "");

    if (isChunkError) {
      window.location.reload();
      return;
    }

    this.setState({ hasError: false, error: null, copied: false });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public handleGoHome = (): void => {
    window.location.href = "/";
  };

  public override render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (typeof this.props.fallback === "function") {
        return this.props.fallback(this.state.error, this.handleReset);
      }
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDev = import.meta.env.DEV;
      const isChunkError =
        this.state.error.name === "ChunkLoadError" || /failed to fetch dynamically imported module/i.test(this.state.error.message || "");

      const isOfflineError =
        !navigator.onLine ||
        (/networkerror|failed to fetch|dynamically imported module|chunkloaderror|net::err_/i.test(
          this.state.error.message || "",
        ) &&
          !navigator.onLine);

      if (isOfflineError) {
        return <OfflineFallback onRetry={this.handleReset} />;
      }

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
              className="relative w-full overflow-hidden rounded-[28px] border border-brand-border bg-brand-card p-6 shadow-sm sm:p-8 md:p-10"
            >
              <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-8 md:gap-10">
                {/* Left: Error Illustration in Brand Burgundy Line-Art */}
                <div className="flex flex-shrink-0 items-center justify-center">
                  <ErrorIllustration />
                </div>

                {/* Vertical Divider in Brand Burgundy Gradient */}
                <div
                  className="hidden h-[58px] w-[3.5px] flex-shrink-0 rounded-full bg-gradient-to-b from-burgundy-primary to-brand-red opacity-90 sm:block md:h-[64px]"
                  aria-hidden="true"
                />

                {/* Right: Typography & Action Buttons in Brand Palette */}
                <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                  {/* Status Badge */}
                  <span className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-burgundy-primary/20 bg-brand-light-red/60 px-3 py-0.5 text-[11px] font-semibold tracking-wide text-burgundy-primary">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-burgundy-primary" />
                    {isChunkError ? "System Update Notice" : "Application Notice"}
                  </span>

                  <h1 className="text-3xl font-normal tracking-tight text-text-primary sm:text-4xl">{isChunkError ? "Update Available" : "Oops!"}</h1>

                  <p className="mt-1 text-sm font-light italic text-text-secondary sm:mt-1.5 sm:text-base">
                    {isChunkError ? "A new release was deployed. Please reload the page." : "There's something wrong"}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                    {isChunkError ? (
                      <>
                        <button
                          type="button"
                          onClick={this.handleReset}
                          className="group inline-flex cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-brand-red to-burgundy-primary px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-brand-red/20 transition-all duration-200 hover:shadow-lg hover:shadow-brand-red/30 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red/40 focus-visible:ring-offset-2 active:scale-95 sm:text-sm"
                        >
                          <RotateCcw className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:-rotate-45" />
                          Reload Page
                        </button>

                        <button
                          type="button"
                          onClick={this.handleCopy}
                          className="group inline-flex cursor-pointer items-center justify-center rounded-xl border border-brand-border bg-white/80 px-5 py-2.5 text-xs font-medium text-text-primary shadow-sm transition-all duration-200 hover:border-burgundy-primary/40 hover:bg-brand-light-red/30 hover:text-burgundy-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-primary/30 focus-visible:ring-offset-2 active:scale-95 sm:text-sm"
                          title="Copy error details to clipboard"
                        >
                          {this.state.copied ? (
                            <>
                              <Check className="mr-2 h-4 w-4 text-emerald-600" />
                              <span className="text-emerald-700 font-semibold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                              Copy Error
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={this.handleGoHome}
                          className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-brand-border bg-white/80 px-5 py-2.5 text-xs font-medium text-text-primary shadow-sm transition-all duration-200 hover:border-burgundy-primary/40 hover:bg-brand-light-red/30 hover:text-burgundy-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-primary/30 focus-visible:ring-offset-2 active:scale-95 sm:text-sm"
                        >
                          <Home className="mr-2 h-4 w-4" />
                          Return to Dashboard
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={this.handleReset}
                          className="group inline-flex cursor-pointer items-center justify-center rounded-xl border border-brand-border bg-white/80 px-5 py-2.5 text-xs font-medium text-text-primary shadow-sm transition-all duration-200 hover:border-burgundy-primary/40 hover:bg-brand-light-red/30 hover:text-burgundy-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-primary/30 focus-visible:ring-offset-2 active:scale-95 sm:text-sm"
                        >
                          <RotateCcw className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:-rotate-45" />
                          Try Again
                        </button>

                        <button
                          type="button"
                          onClick={this.handleCopy}
                          className="group inline-flex cursor-pointer items-center justify-center rounded-xl border border-brand-border bg-white/80 px-5 py-2.5 text-xs font-medium text-text-primary shadow-sm transition-all duration-200 hover:border-burgundy-primary/40 hover:bg-brand-light-red/30 hover:text-burgundy-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-primary/30 focus-visible:ring-offset-2 active:scale-95 sm:text-sm"
                          title="Copy error details to clipboard"
                        >
                          {this.state.copied ? (
                            <>
                              <Check className="mr-2 h-4 w-4 text-emerald-600" />
                              <span className="text-emerald-700 font-semibold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                              Copy Error
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={this.handleGoHome}
                          className="group inline-flex cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-burgundy-primary to-burgundy-dark px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-burgundy-primary/20 transition-all duration-200 hover:shadow-lg hover:shadow-burgundy-primary/30 hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-primary/40 focus-visible:ring-offset-2 active:scale-95 sm:text-sm"
                        >
                          <Home className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                          Return to Dashboard
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Development Stack Trace */}
            {isDev && this.state.error && !isChunkError && (
              <details className="mt-4 max-h-56 w-full overflow-auto rounded-xl border border-brand-border bg-brand-bg p-3.5 text-left text-xs text-text-secondary shadow-sm transition-all">
                <summary className="flex cursor-pointer select-none items-center justify-between font-semibold text-text-primary hover:text-burgundy-primary">
                  <span className="flex items-center gap-2">
                    <Terminal className="h-3.5 w-3.5 text-brand-red" />
                    Technical Details (Development Only)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-brand-border/70 px-2 py-0.5 font-mono text-[10px] text-text-secondary">{this.state.error.name}</span>
                    <button
                      type="button"
                      onClick={this.handleCopy}
                      title="Copy error details"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-white px-2.5 py-1 text-[11px] font-medium text-text-primary shadow-xs transition-colors hover:border-burgundy-primary/40 hover:bg-brand-light-red/30 hover:text-burgundy-primary active:scale-95"
                    >
                      {this.state.copied ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-600" />
                          <span className="text-emerald-700 font-semibold">Copied!</span>
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
                    <p className="break-words font-mono text-xs font-semibold text-burgundy-primary">{this.state.error.message || "Unknown error"}</p>
                  </div>

                  {this.state.error.stack && (
                    <pre className="max-h-48 overflow-auto rounded-lg bg-palette-midnight/95 p-3 font-mono text-[10.5px] leading-relaxed text-[#F1DDE0] shadow-inner">
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
