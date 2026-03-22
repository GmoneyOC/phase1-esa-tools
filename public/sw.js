// Phase I ESA Tools — Service Worker
// Cache-first for static assets, network-first for HTML pages

var CACHE_NAME = "esa-tools-v1";

// Core assets to pre-cache on install
var PRECACHE_URLS = [
    "/",
    "/index.html",
    "/generator.html",
    "/dashboard.html",
    "/manifest.json",
    "/icons/icon-192.svg",
    "/icons/icon-512.svg",
    "/templates/Phase_I_ESA_Report_Template.docx",
    "/templates/Phase_I_ESA_Checklist.docx",
    "/templates/Phase_I_ESA_Scope_of_Work.docx",
    "/templates/Phase_I_ESA_Proposal_Template.docx"
];

// CDN assets to cache on first use
var CDN_HOSTS = [
    "cdn.jsdelivr.net"
];

// Install: pre-cache core assets
self.addEventListener("install", function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(PRECACHE_URLS);
        }).then(function() {
            return self.skipWaiting();
        })
    );
});

// Activate: clean up old caches
self.addEventListener("activate", function(event) {
    event.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(
                keys.filter(function(key) { return key !== CACHE_NAME; })
                    .map(function(key) { return caches.delete(key); })
            );
        }).then(function() {
            return self.clients.claim();
        })
    );
});

// Fetch: strategy depends on request type
self.addEventListener("fetch", function(event) {
    var url = new URL(event.request.url);

    // Skip non-GET requests
    if (event.request.method !== "GET") return;

    // HTML pages: network-first (always try to get fresh content)
    if (event.request.mode === "navigate" || event.request.headers.get("accept").indexOf("text/html") >= 0) {
        event.respondWith(
            fetch(event.request).then(function(response) {
                // Cache the fresh response
                var clone = response.clone();
                caches.open(CACHE_NAME).then(function(cache) {
                    cache.put(event.request, clone);
                });
                return response;
            }).catch(function() {
                // Offline: serve from cache
                return caches.match(event.request).then(function(cached) {
                    return cached || caches.match("/index.html");
                });
            })
        );
        return;
    }

    // CDN assets: cache-first (they have SRI hashes, safe to cache long-term)
    var isCDN = CDN_HOSTS.some(function(host) { return url.hostname === host; });
    if (isCDN) {
        event.respondWith(
            caches.match(event.request).then(function(cached) {
                if (cached) return cached;
                return fetch(event.request).then(function(response) {
                    var clone = response.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(event.request, clone);
                    });
                    return response;
                });
            })
        );
        return;
    }

    // All other static assets: cache-first with network fallback
    event.respondWith(
        caches.match(event.request).then(function(cached) {
            if (cached) return cached;
            return fetch(event.request).then(function(response) {
                // Only cache successful same-origin responses
                if (response.ok && url.origin === self.location.origin) {
                    var clone = response.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(event.request, clone);
                    });
                }
                return response;
            });
        })
    );
});
