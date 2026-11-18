import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const DEV_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "unload=*",
  // In development, allow 'unsafe-inline' and 'unsafe-eval' so Vite's React Fast Refresh preamble,
  // HMR WebSockets, and developer tools/inspectors function seamlessly without CSP violations.
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https: ws: wss: http://localhost:* ws://localhost:*; object-src 'none'; base-uri 'self';",
};

const PREVIEW_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https: ws: wss:; object-src 'none'; base-uri 'self';",
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5174,
    host: true,
    headers: DEV_HEADERS,
  },
  preview: {
    port: 4173,
    headers: PREVIEW_HEADERS,
  },
  build: {
    target: "es2020",
    sourcemap: false, // Security: Never emit source maps in production to protect application internals
    cssCodeSplit: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Normalize Windows backslashes to forward slashes for cross-platform consistency
          const normalized = id.replace(/\\/g, "/");

          if (normalized.includes("/node_modules/")) {
            if (
              normalized.includes("/react/") ||
              normalized.includes("/react-dom/") ||
              normalized.includes("/react-router-dom/") ||
              normalized.includes("/zustand/")
            ) {
              return "vendor-core";
            }
            if (normalized.includes("/recharts/")) {
              return "vendor-charts";
            }
            if (normalized.includes("/framer-motion/") || normalized.includes("/gsap/")) {
              return "vendor-animation";
            }
            if (
              normalized.includes("/react-hook-form/") ||
              normalized.includes("/@hookform/") ||
              normalized.includes("/zod/")
            ) {
              return "vendor-forms";
            }
            if (normalized.includes("/date-fns/")) {
              return "vendor-date";
            }
            if (normalized.includes("/lucide-react/")) {
              return "vendor-icons";
            }
          }
        },
      },
    },
  },
});
