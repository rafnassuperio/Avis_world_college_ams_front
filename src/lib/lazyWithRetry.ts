import React from "react";

/**
 * Resilient React.lazy wrapper with automatic chunk load failure recovery.
 * Resolves stale bundle hash errors following new deployments or temporary network drops.
 *
 * @param importer Dynamic import function, e.g. () => import('./MyComponent')
 * @param exportName Optional named export key if the module does not use `default`
 */
export function lazyWithRetry<T extends React.ComponentType<any>>(importer: () => Promise<any>, exportName?: string): React.LazyExoticComponent<T> {
  return React.lazy(async () => {
    const REFRESH_KEY = "ams_chunk_force_refresh";

    try {
      const module = await importer();

      // Reset refresh marker on successful import
      try {
        window.sessionStorage.removeItem(REFRESH_KEY);
      } catch {
        // Ignore storage access errors
      }

      if (exportName && module && module[exportName]) {
        return { default: module[exportName] };
      }

      if (module && module.default) {
        return module;
      }

      return { default: module };
    } catch (error: any) {
      const errorMessage = String(error?.message || "");
      const isChunkLoadError =
        error?.name === "ChunkLoadError" ||
        /failed to fetch dynamically imported module/i.test(errorMessage) ||
        /importing a module script failed/i.test(errorMessage) ||
        /loading chunk [\d\w]+ failed/i.test(errorMessage);

      let alreadyRefreshed = false;
      try {
        alreadyRefreshed = window.sessionStorage.getItem(REFRESH_KEY) === "true";
      } catch {
        // ignore
      }

      // Auto-reload once on deployment/chunk hash mismatch
      if (isChunkLoadError && !alreadyRefreshed) {
        try {
          window.sessionStorage.setItem(REFRESH_KEY, "true");
        } catch {
          // ignore
        }
        window.location.reload();
        // Return an unresolved promise to prevent further error bubbling while reload occurs
        return new Promise(() => {});
      }

      console.error("[lazyWithRetry] Module failed to load:", error);
      throw error;
    }
  });
}
