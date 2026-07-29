"use client"

import { useEffect } from "react"

/**
 * Registers the offline worker. Renders nothing.
 *
 * Registration waits for `load`: the worker's job starts on the *second*
 * visit, and fetching and parsing it during the first paint only slows down
 * the visit that cannot benefit from it.
 *
 * In development it does the opposite job — a worker left registered by a
 * production build of the same origin will happily serve yesterday's page over
 * the dev server, which looks exactly like a broken hot reload.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) registration.unregister()
      })
      return
    }

    const register = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((error) => {
        console.error("Service worker registration failed", error)
      })
    }

    if (document.readyState === "complete") {
      register()
      return
    }
    window.addEventListener("load", register, { once: true })
    return () => window.removeEventListener("load", register)
  }, [])

  return null
}
