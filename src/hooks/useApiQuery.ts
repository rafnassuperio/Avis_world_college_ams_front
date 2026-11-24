import { invalidateApiCache } from "@/services/api/queryCache";
import { useCallback, useEffect, useRef, useState, type DependencyList } from "react";
import { apiMessage } from "@/services/ams";

export function useApiQuery<T>(loader: (signal: AbortSignal) => Promise<T>, dependencies: DependencyList = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const latest = useRef(loader); latest.current = loader;
  const generation = useRef(0);
  const active = useRef<AbortController | null>(null);
  const load = useCallback(async () => {
    active.current?.abort();
    const controller = new AbortController(); active.current = controller;
    const request = ++generation.current;
    setLoading(true);
    try { const next = await latest.current(controller.signal); if (!controller.signal.aborted && request === generation.current) { setData(next); setError(null); } }
    catch (error) { if (!(error instanceof DOMException && error.name === "AbortError") && !controller.signal.aborted && request === generation.current) setError(apiMessage(error)); }
    finally { if (request === generation.current) setLoading(false); }
  }, dependencies);
  const reload = useCallback(async () => { invalidateApiCache(); await load(); }, [load]);
  useEffect(() => {
    const refresh = () => { void load(); };
    window.addEventListener("ams-api-invalidated", refresh);
    void load();
    return () => { window.removeEventListener("ams-api-invalidated", refresh); generation.current++; active.current?.abort(); };
  }, [load]);
  return { data, loading, error, reload, setData };
}
