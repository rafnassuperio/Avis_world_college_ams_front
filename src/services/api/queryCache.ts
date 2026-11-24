// Memory only: never persist authenticated API responses to browser storage.
type Entry = {expires: number; value: unknown};
type Flight = {controller: AbortController; promise: Promise<unknown>; users: number};
const cache = new Map<string, Entry>();
const flights = new Map<string, Flight>();
const activeFlights = new Set<Flight>();
let revision = 0;
let identity: string | null | undefined;
const abortError = () => new DOMException("Request cancelled", "AbortError");
const copy = <T>(value: T): T => structuredClone(value);
export function invalidateApiCache(notify = false) {
  revision++; cache.clear(); flights.clear();
  if (notify && typeof window !== "undefined") window.dispatchEvent(new Event("ams-api-invalidated"));
}
export function resetApiSession(token: string | null) {
  if (identity === token) return;
  for (const flight of activeFlights) flight.controller.abort();
  invalidateApiCache(); identity = token;
}
export function cachedQuery<T>(key: string, loader: (signal: AbortSignal) => Promise<T>, options: {signal?: AbortSignal | null; ttl: number}): Promise<T> {
  if (options.signal?.aborted) return Promise.reject(abortError());
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now() && options.ttl > 0) return Promise.resolve(copy(hit.value as T));
  if (hit) cache.delete(key);
  let flight = flights.get(key);
  if (!flight) {
    const controller = new AbortController();
    const epoch = revision;
    const created: Flight = {controller, users: 0, promise: Promise.resolve()};
    created.promise = Promise.resolve().then(() => loader(controller.signal)).then(value => {
      if (epoch === revision && !controller.signal.aborted && options.ttl > 0) {
        for (const [k, entry] of cache) if (entry.expires <= Date.now()) cache.delete(k);
        if (cache.size >= 100) cache.delete(cache.keys().next().value!);
        cache.set(key, {expires: Date.now() + Math.min(options.ttl, 30000), value: copy(value)});
      }
      return value;
    }).finally(() => { activeFlights.delete(created); if (flights.get(key) === created) flights.delete(key); });
    activeFlights.add(created); flights.set(key, created); flight = created;
  }
  const shared = flight; shared.users++;
  return new Promise<T>((resolve, reject) => {
    let done = false;
    const finish = (action: () => void) => {
      if (done) return; done = true;
      options.signal?.removeEventListener("abort", cancel);
      shared.users--;
      if (shared.users === 0) {
        if (flights.get(key) === shared) flights.delete(key);
        shared.controller.abort();
      }
      action();
    };
    const cancel = () => finish(() => reject(abortError()));
    options.signal?.addEventListener("abort", cancel, {once: true});
    shared.promise.then(value => finish(() => resolve(copy(value as T))), error => finish(() => reject(error)));
  });
}
