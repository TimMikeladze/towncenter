/*
 * Service worker: the difference between an icon on the home screen and an app
 * on the home screen.
 *
 * An installed PWA with no worker is a browser tab in a costume — open it in a
 * tunnel and it shows a dinosaur. This keeps the pages you have already looked
 * at, and every icon in them, available offline, and makes a warm launch
 * instant instead of a round trip.
 *
 * Deliberately absent: `skipWaiting`. A new worker waits for every open window
 * to close before taking over, because the running page is holding script
 * chunks from the build it loaded with, and a worker that starts answering
 * with the *next* build's assets mid-session hands it chunks that no longer
 * match. Updates land on the next cold launch — which is exactly when a native
 * app applies them too.
 */

const VERSION = "v1"
const PAGES = `town-center-pages-${VERSION}`
const ASSETS = `town-center-assets-${VERSION}`
const CURRENT = [PAGES, ASSETS]

const OFFLINE_URL = "/offline"

/** Fingerprinted or immutable by nature — safe to serve from disk forever. */
function isAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/img/") ||
    url.pathname.startsWith("/icons/") ||
    /\.(?:webp|png|svg|ico|woff2?)$/.test(url.pathname)
  )
}

/**
 * Precache the offline page *and the scripts it needs to run*.
 *
 * Storing the HTML alone is a trap: it is a React page, and the one chunk that
 * renders it has never been fetched — it is the only route in the app nobody
 * visits while online. Served with the network down, it loads, fails to find
 * that chunk, and shows the error boundary. So its own markup is read for the
 * build's asset URLs and those are stored too, which keeps this working across
 * rebuilds without a manifest or a build step.
 */
async function precacheOffline() {
  const response = await fetch(OFFLINE_URL, { cache: "reload" })
  if (!response.ok) return

  const html = await response.clone().text()
  const pages = await caches.open(PAGES)
  await pages.put(OFFLINE_URL, response)

  const assets = await caches.open(ASSETS)
  const referenced = new Set([...html.matchAll(/["'\\](\/_next\/static\/[^"'\\]+)["'\\]/g)].map((match) => match[1]))
  await Promise.all([...referenced].map((url) => assets.add(url).catch(() => {})))
}

self.addEventListener("install", (event) => {
  event.waitUntil(precacheOffline())
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !CURRENT.includes(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

/** Pages: fresh when the network allows, last-seen when it does not. */
async function page(request) {
  const cache = await caches.open(PAGES)
  try {
    const response = await fetch(request)
    if (response.ok) cache.put(request, response.clone())
    return response
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached

    // Redirect rather than answer this URL with the offline page's markup.
    // The document carries the server-component payload for the route it was
    // built as; handing /maps a body that says it is /offline leaves the
    // router hydrating a tree that does not match the address bar, and what
    // the reader gets is the error boundary instead of the explanation.
    const url = new URL(request.url)
    if (url.pathname !== OFFLINE_URL) {
      return Response.redirect(new URL(OFFLINE_URL, url.origin).href, 302)
    }
    return (
      (await cache.match(OFFLINE_URL)) ||
      new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } })
    )
  }
}

/** Assets: straight off disk, refilled in the background the first time. */
async function asset(request) {
  const cache = await caches.open(ASSETS)
  const hit = await cache.match(request)
  if (hit) return hit
  const response = await fetch(request)
  if (response.ok || response.type === "opaque") cache.put(request, response.clone())
  return response
}

self.addEventListener("fetch", (event) => {
  const request = event.request
  if (request.method !== "GET") return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Live data and inspection endpoints are never worth a stale answer.
  if (url.pathname.startsWith("/api/")) return

  // React Server Component payloads are keyed to the build that produced them.
  // A cached one handed to a newer build describes components that are no
  // longer there, which fails in ways far worse than being offline.
  if (url.searchParams.has("_rsc") || request.headers.get("RSC") === "1") return

  if (request.mode === "navigate") {
    event.respondWith(page(request))
    return
  }

  if (isAsset(url)) event.respondWith(asset(request))
})
