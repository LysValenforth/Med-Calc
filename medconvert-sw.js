/* MedConvert Service Worker — Cache-First Strategy
 * Changes from v2:
 *  - BUILD_TS is stamped at deploy time; bump it to bust the cache automatically
 *    instead of editing CACHE_NAME by hand.
 *  - Google Fonts CSS + woff2 files are now cached (external URLs were previously
 *    filtered out, leaving users with no fonts on offline first-load).
 *  - install catch() now logs the error instead of swallowing it silently.
 *  - Offline fallback returns a real HTML shell instead of a plain-text "Offline".
 */
'use strict';

/* ── Cache identity ──────────────────────────────────────────────────────── */
// Bump BUILD_TS at deploy time (e.g. via a build script: sed -i "s/BUILD_TS/$(date +%s)/" sw.js)
// This avoids the "forgot to update CACHE_NAME" problem entirely.
const BUILD_TS   = 'BUILD_TS';          // replaced at deploy; falls back gracefully if not
const CACHE_NAME = `medconvert-v3-${BUILD_TS}`;

/* ── Core assets to precache ─────────────────────────────────────────────── */
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
];

/* ── Google Fonts URLs to cache ─────────────────────────────────────────── */
// We cache these separately with a network-first + fallback strategy so that
// on first offline visit the fonts degrade gracefully to the system stack
// rather than causing CORS failures that pollute the error log.
const FONT_CSS_URL = 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Nunito:wght@300;400;500;600;700;800&display=swap';

/* ── Offline fallback HTML ───────────────────────────────────────────────── */
const OFFLINE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MedConvert — Offline</title>
  <style>
    :root { --forest: #2d5a27; --cream: #f5f0e8; --bark: #6b5744; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, 'Segoe UI', sans-serif;
      background: var(--cream);
      color: var(--bark);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      text-align: center;
      gap: 1rem;
    }
    svg { color: var(--forest); }
    h1 { font-size: 1.5rem; color: var(--forest); }
    p  { font-size: 0.95rem; max-width: 36ch; line-height: 1.6; }
    button {
      margin-top: 0.5rem;
      padding: 0.75rem 2rem;
      background: var(--forest);
      color: #e8f4e6;
      border: none;
      border-radius: 0.625rem;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
    }
    button:hover { background: #3a7030; }
  </style>
</head>
<body>
  <svg width="56" height="56" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="64" height="64" rx="14" fill="#1e3d1b"/>
    <rect x="28" y="10" width="8" height="44" rx="4" fill="#2d5a27"/>
    <rect x="10" y="28" width="44" height="8" rx="4" fill="#2d5a27"/>
    <polyline points="12,32 21,32 24,24 28,40 32,16 36,32 40,32 52,32"
              fill="none" stroke="#9dc990" stroke-width="2.6"
              stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  <h1>You're offline</h1>
  <p>MedConvert needs to load at least once while connected to cache itself for offline use.</p>
  <button onclick="location.reload()">Try again</button>
</body>
</html>`;

/* ── Install ─────────────────────────────────────────────────────────────── */
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE_ASSETS))
            .catch(err => {
                // Log clearly — silent swallowing makes debugging precache failures very hard
                console.error('[MedConvert SW] Precache failed:', err);
            })
    );
    // Activate immediately — don't wait for existing tabs to close
    self.skipWaiting();
});

/* ── Activate ────────────────────────────────────────────────────────────── */
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(k => k !== CACHE_NAME)
                    .map(k => {
                        console.info('[MedConvert SW] Deleting old cache:', k);
                        return caches.delete(k);
                    })
            )
        )
    );
    // Take control of all open clients immediately
    self.clients.claim();
});

/* ── Fetch ───────────────────────────────────────────────────────────────── */
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // ── Font CSS: network-first, cache fallback ──
    // Fonts may update their woff2 URLs; always try network first so we get
    // the freshest descriptor file, but serve from cache when offline.
    if (url.hostname === 'fonts.googleapis.com') {
        event.respondWith(networkFirstWithCache(event.request));
        return;
    }

    // ── Font files (woff2 etc): cache-first, long-lived ──
    if (url.hostname === 'fonts.gstatic.com') {
        event.respondWith(cacheFirstWithNetwork(event.request));
        return;
    }

    // ── App shell & all other same-origin assets: cache-first ──
    event.respondWith(cacheFirstWithNetwork(event.request));
});

/* ── Strategy helpers ────────────────────────────────────────────────────── */

/**
 * Cache-first: serve from cache immediately; update cache in the background.
 * Falls back to the offline HTML shell for navigation requests.
 */
async function cacheFirstWithNetwork(request) {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
        const response = await fetch(request);
        if (response && response.status === 200) {
            // Only cache same-origin and CORS-ok responses
            if (response.type === 'basic' || response.type === 'cors') {
                const cache = await caches.open(CACHE_NAME);
                cache.put(request, response.clone());
            }
        }
        return response;
    } catch {
        // Navigation request and we have nothing cached — show offline shell
        if (request.mode === 'navigate') {
            return new Response(OFFLINE_HTML, {
                status: 503,
                headers: { 'Content-Type': 'text/html; charset=utf-8' },
            });
        }
        // Non-navigation (CSS, JS, image) — return empty 503
        return new Response('Offline', { status: 503 });
    }
}

/**
 * Network-first: try network, cache the result; fall back to cache if offline.
 */
async function networkFirstWithCache(request) {
    try {
        const response = await fetch(request);
        if (response && response.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        return new Response('', { status: 503 });
    }
}
