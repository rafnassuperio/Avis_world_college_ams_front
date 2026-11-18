/**
 * Avis World College - Admission Management System (AMS)
 * Progressive Web App (PWA) Service Worker
 */

const CACHE_NAME = "avis-ams-cache-v2";

const STATIC_PRECACHE = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/manifest.json",
  "/pwa-192x192.png",
  "/pwa-512x512.png",
  "/pwa-maskable-192x192.png",
  "/pwa-maskable-512x512.png",
  "/apple-touch-icon.png",
  "/favicon-32x32.png",
  "/favicon-16x16.png",
  "/avis-emblem.png",
  "/favicon.svg",
];

// Install event: Precache core shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_PRECACHE).catch((err) => {
          // Precache failure should not break service worker installation
          console.warn("[SW] Precache incomplete:", err);
        });
      })
      .then(() => self.skipWaiting()),
  );
});

// Activate event: Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
          }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// Fetch event: Network-first for navigation/HTML, Stale-while-revalidate for static assets
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests and cross-origin external requests (except google fonts)
  if (request.method !== "GET") return;
  if (!url.protocol.startsWith("http")) return;

  // Navigation requests: Network first with cached index fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          const indexFallback = await caches.match("/index.html");
          if (indexFallback) return indexFallback;
          return new Response("Offline - please check your internet connection", {
            status: 503,
            statusText: "Service Unavailable",
            headers: { "Content-Type": "text/plain" },
          });
        }),
    );
    return;
  }

  // Static assets (CSS, JS, images, fonts, webmanifest)
  const isStaticAsset =
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/assets/") || url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|webp|woff2?|ttf|ico|webmanifest|json)$/i));

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      }),
    );
    return;
  }

  // Default fetch
  event.respondWith(fetch(request).catch(() => caches.match(request)));
});

// Handle incoming messages
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
