// Service Worker for offline capabilities and caching
// This provides offline functionality for the DhammaStream PWA

const CACHE_NAME = "dhamma-stream-v1";
const STATIC_CACHE_NAME = "dhamma-static-v1";
const AUDIO_CACHE_NAME = "dhamma-audio-v1";

// Static assets to cache immediately
const STATIC_ASSETS = [
  "/",
  "/content",
  "/search",
  "/speakers",
  "/categories",
  "/manifest.json",
  "/favicon.ico",
  "/_next/static/css/app/layout.css",
  "/_next/static/chunks/webpack.js",
  "/_next/static/chunks/main.js",
  "/_next/static/chunks/pages/_app.js"
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log("Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.error("Failed to cache static assets:", error);
      })
  );

  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old cache versions
          if (
            cacheName !== STATIC_CACHE_NAME &&
            cacheName !== CACHE_NAME &&
            cacheName !== AUDIO_CACHE_NAME
          ) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip external requests (except for audio/video content)
  if (url.origin !== self.location.origin && !isMediaContent(url)) {
    return;
  }

  // Handle different types of requests with appropriate strategies
  if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isMediaContent(url)) {
    event.respondWith(handleMediaContent(request));
  } else if (isPageRequest(url)) {
    event.respondWith(handlePageRequest(request));
  }
});

// Strategy: Cache First (for static assets)
async function handleStaticAsset(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    const cache = await caches.open(STATIC_CACHE_NAME);
    cache.put(request, networkResponse.clone());

    return networkResponse;
  } catch (error) {
    console.error("Failed to handle static asset:", error);
    return new Response("Asset not available offline", { status: 503 });
  }
}

// Strategy: Network First with fallback (for API requests)
async function handleAPIRequest(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful API responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (networkError) {
    console.log("Network failed, trying cache for API request:", networkError);

    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline response for failed API calls
    return new Response(
      JSON.stringify({
        error: "Content not available offline",
        offline: true
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}

// Strategy: Cache First with Network Update (for media content)
async function handleMediaContent(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);

    // Only cache smaller audio files (< 50MB) for offline access
    const contentLength = networkResponse.headers.get("content-length");
    if (contentLength && parseInt(contentLength) < 50 * 1024 * 1024) {
      const cache = await caches.open(AUDIO_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error("Failed to handle media content:", error);
    return new Response("Media content not available offline", { status: 503 });
  }
}

// Strategy: Network First with Cache Fallback (for pages)
async function handlePageRequest(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful page responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (networkError) {
    console.log("Network failed, trying cache for page request:", networkError);

    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page
    return caches.match("/").then((response) => {
      return (
        response ||
        new Response("Page not available offline", {
          status: 503,
          headers: { "Content-Type": "text/html" }
        })
      );
    });
  }
}

// Helper functions to identify request types
function isStaticAsset(url) {
  return (
    url.pathname.match(
      /\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/
    ) ||
    url.pathname.startsWith("/_next/static/") ||
    url.pathname === "/manifest.json"
  );
}

function isAPIRequest(url) {
  return (
    url.pathname.startsWith("/api/") ||
    url.pathname.includes("supabase") ||
    url.hostname !== self.location.hostname
  );
}

function isMediaContent(url) {
  return (
    url.pathname.match(/\.(mp3|mp4|wav|m4a|ogg|webm|avi|mov)$/) ||
    url.pathname.includes("audio") ||
    url.pathname.includes("video") ||
    url.search.includes("audio") ||
    url.search.includes("video")
  );
}

function isPageRequest(url) {
  return (
    url.origin === self.location.origin &&
    !isStaticAsset(url) &&
    !isAPIRequest(url) &&
    !isMediaContent(url)
  );
}

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-playlist") {
    event.waitUntil(syncPlaylistData());
  } else if (event.tag === "sync-progress") {
    event.waitUntil(syncProgressData());
  }
});

// Sync playlist data when back online
async function syncPlaylistData() {
  try {
    // Get pending playlist changes from IndexedDB
    const pendingChanges = await getPendingPlaylistChanges();

    for (const change of pendingChanges) {
      try {
        await fetch("/api/playlist", {
          method: change.method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(change.data)
        });

        // Remove from pending changes after successful sync
        await removePendingChange(change.id);
      } catch (error) {
        console.error("Failed to sync playlist change:", error);
      }
    }
  } catch (error) {
    console.error("Failed to sync playlist data:", error);
  }
}

// Sync playback progress when back online
async function syncProgressData() {
  try {
    // Get pending progress updates from localStorage
    const pendingProgress = JSON.parse(
      localStorage.getItem("dhamma-pending-progress") || "[]"
    );

    for (const progress of pendingProgress) {
      try {
        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(progress)
        });
      } catch (error) {
        console.error("Failed to sync progress:", error);
      }
    }

    // Clear pending progress after sync
    localStorage.removeItem("dhamma-pending-progress");
  } catch (error) {
    console.error("Failed to sync progress data:", error);
  }
}

// IndexedDB helpers for offline data management
async function getPendingPlaylistChanges() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("DhammaStreamOffline", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(["pendingChanges"], "readonly");
      const store = transaction.objectStore("pendingChanges");
      const getRequest = store.getAll();

      getRequest.onsuccess = () => resolve(getRequest.result);
      getRequest.onerror = () => reject(getRequest.error);
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("pendingChanges")) {
        db.createObjectStore("pendingChanges", {
          keyPath: "id",
          autoIncrement: true
        });
      }
    };
  });
}

async function removePendingChange(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("DhammaStreamOffline", 1);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(["pendingChanges"], "readwrite");
      const store = transaction.objectStore("pendingChanges");
      const deleteRequest = store.delete(id);

      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

// Message handling for communication with main thread
self.addEventListener("message", (event) => {
  const { type, data } = event.data;

  switch (type) {
    case "SKIP_WAITING":
      self.skipWaiting();
      break;

    case "CACHE_AUDIO":
      cacheAudioFile(data.url);
      break;

    case "CLEAR_CACHE":
      clearAllCaches();
      break;

    case "GET_CACHE_SIZE":
      getCacheSize().then((size) => {
        event.ports[0].postMessage({ type: "CACHE_SIZE", size });
      });
      break;
  }
});

// Cache specific audio file for offline listening
async function cacheAudioFile(url) {
  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    await cache.add(url);
    console.log("Cached audio file:", url);
  } catch (error) {
    console.error("Failed to cache audio file:", error);
  }
}

// Clear all caches
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
    console.log("All caches cleared");
  } catch (error) {
    console.error("Failed to clear caches:", error);
  }
}

// Get total cache size
async function getCacheSize() {
  try {
    const cacheNames = await caches.keys();
    let totalSize = 0;

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();

      for (const request of keys) {
        const response = await cache.match(request);
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }

    return totalSize;
  } catch (error) {
    console.error("Failed to calculate cache size:", error);
    return 0;
  }
}
