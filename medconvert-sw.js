'use strict';

/* ── Cache identity ──────────────────────────────────────────────────────── */
const BUILD_TS_RAW = 'BUILD_TS';
// Guard: if the deploy-time sed replacement never ran, fall back to a hash of
// a fixed seed so the cache name is STABLE between registrations (not a new
// unique string every time, which would leak old caches endlessly).
const BUILD_TS   = BUILD_TS_RAW === 'BUILD_TS' ? 'dev-2025-stable' : BUILD_TS_RAW;
const CACHE_NAME = `medconvert-v4-${BUILD_TS}`;

/* ── Core assets to precache ─────────────────────────────────────────────── */
const PRECACHE_ASSETS = [
    '/Med-Calc/',
    '/Med-Calc/index.html',
    '/Med-Calc/medconvert.css',
    '/Med-Calc/medconvert.js',
    '/Med-Calc/manifest.json',
];

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
              fill="none" stroke="#7db870" stroke-width="2.6"
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
                console.error('[MedConvert SW] Precache failed:', err);
            })
    );
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
    self.clients.claim();
});

/* ── Fetch ───────────────────────────────────────────────────────────────── */
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // Font CSS: network-first with timeout, cache fallback
    if (url.hostname === 'fonts.googleapis.com') {
        event.respondWith(networkFirstWithCache(event.request));
        return;
    }

    // Font files (woff2 etc): cache-first, long-lived
    if (url.hostname === 'fonts.gstatic.com') {
        event.respondWith(cacheFirstWithNetwork(event.request));
        return;
    }

    // App shell & same-origin assets: cache-first
    event.respondWith(cacheFirstWithNetwork(event.request));
});

/* ── Fetch helpers ───────────────────────────────────────────────────────── */

/** Create an AbortController that fires after `ms` milliseconds */
function fetchWithTimeout(request, ms = 6000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ms);
    return fetch(request, { signal: controller.signal })
        .finally(() => clearTimeout(timeoutId));
}

/**
 * Cache-first: serve from cache; fetch+update in background on miss.
 * Falls back to offline shell for navigation requests.
 */
async function cacheFirstWithNetwork(request) {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
        const response = await fetchWithTimeout(request);
        if (response && response.status === 200) {
            if (response.type === 'basic' || response.type === 'cors') {
                const cache = await caches.open(CACHE_NAME);
                cache.put(request, response.clone());
            }
        }
        return response;
    } catch {
        if (request.mode === 'navigate') {
            return new Response(OFFLINE_HTML, {
                status: 503,
                headers: { 'Content-Type': 'text/html; charset=utf-8' },
            });
        }
        return new Response('Offline', { status: 503 });
    }
}

/**
 * Network-first: try network with timeout; fall back to cache.
 */
async function networkFirstWithCache(request) {
    try {
        const response = await fetchWithTimeout(request);
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