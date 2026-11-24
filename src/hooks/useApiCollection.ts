import { useCallback, useEffect, useRef, useState } from "react";
import type { Repository } from "@/services/ams";
import { apiMessage } from "@/services/ams";
import { toast } from "@/components/common/ToastMessage";

/** Server-confirmed mutations; failed requests never become successful local edits. */
export function useApiCollection<T extends { id: string }>(repository: Repository<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const current = useRef<T[]>([]);
  const sequence = useRef(0);
  const busy = useRef(false);
  const reload = useCallback(async () => {
    const request = ++sequence.current;
    setLoading(true);
    try {
      const rows = await repository.list();
      if (request !== sequence.current) return;
      current.current = rows; setData(rows); setError(null);
    } catch (error) { if (request === sequence.current) setError(apiMessage(error)); }
    finally { if (request === sequence.current) setLoading(false); }
  }, [repository]);
  useEffect(() => {
    void reload();
    const refresh = (event: Event) => { if (!busy.current && (event as CustomEvent).detail === repository.key) void reload(); };
    window.addEventListener("ams-data-updated", refresh);
    return () => { sequence.current++; window.removeEventListener("ams-data-updated", refresh); };
  }, [reload, repository]);
  const saveList = useCallback(async (updated: T[]) => {
    if (busy.current) return false;
    busy.current = true;
    try {
      const before = current.current;
      for (const row of updated) {
        const old = before.find(item => item.id === row.id);
        if (!old || JSON.stringify(old) !== JSON.stringify(row)) await repository.save(row, !old);
      }
      for (const row of before) if (!updated.some(item => item.id === row.id)) await repository.remove(row.id);
      await reload();
      window.dispatchEvent(new CustomEvent("ams-data-updated", { detail: repository.key }));
      return true;
    } catch (error) {
      toast.error("Unable to save changes", { description: apiMessage(error) });
      await reload();
      return false;
    } finally { busy.current = false; }
  }, [reload, repository]);
  return { data, setData, saveList, reload, loading, error };
}
