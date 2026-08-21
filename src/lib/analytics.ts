/**
 * Umami page analytics — optional, and off unless configured.
 *
 * The whole feature hangs off one variable: with no `NEXT_PUBLIC_UMAMI_WEBSITE_ID`
 * nothing renders, no third-party script is fetched, and the app behaves exactly
 * as it did before. That keeps local development and forks free of a dependency
 * on someone else's analytics instance.
 *
 * The values are read as literal `process.env.NEXT_PUBLIC_*` property accesses
 * because that is the only form Next inlines into the client bundle at build
 * time — a dynamic lookup (`process.env[name]`) reaches the browser as
 * `undefined`. Being build-time inlined also means changing them on Vercel
 * requires a redeploy, not just a restart.
 */

/** The instance this project ships against; override with the script URL var. */
const DEFAULT_SCRIPT_URL = "https://linesofcode-umami.vercel.app/script.js"

export interface UmamiConfig {
  /** The website's UUID in the Umami dashboard. */
  websiteId: string
  /** Absolute URL of the tracker script. */
  scriptUrl: string
  /**
   * Comma-separated hostnames the tracker will report from. Left unset, every
   * deployment counts — including each Vercel preview URL, which pollutes the
   * numbers for the domain people actually visit.
   */
  domains?: string
}

export interface UmamiEnv {
  websiteId?: string
  scriptUrl?: string
  domains?: string
}

/**
 * Accepts either the script URL or the instance's origin, since the dashboard
 * shows the former and people remember the latter.
 */
function normalizeScriptUrl(value: string): string {
  const trimmed = value.replace(/\/+$/, "")
  return trimmed.endsWith(".js") ? trimmed : `${trimmed}/script.js`
}

/** Returns null when analytics is not configured, which is a valid state. */
export function resolveUmamiConfig(env: UmamiEnv): UmamiConfig | null {
  const websiteId = env.websiteId?.trim()
  if (!websiteId) return null

  const scriptUrl = env.scriptUrl?.trim()
  const domains = env.domains?.trim()

  return {
    websiteId,
    scriptUrl: scriptUrl ? normalizeScriptUrl(scriptUrl) : DEFAULT_SCRIPT_URL,
    ...(domains ? { domains } : {}),
  }
}

export const umamiConfig = resolveUmamiConfig({
  websiteId: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
  scriptUrl: process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL,
  domains: process.env.NEXT_PUBLIC_UMAMI_DOMAINS,
})

declare global {
  interface Window {
    umami?: {
      track: (event: string, data?: Record<string, unknown>) => void
    }
  }
}

/**
 * Records a custom event, or does nothing at all — the tracker is absent when
 * analytics is unconfigured, still loading, or blocked by the reader's browser,
 * and none of those are worth an exception in a call site that only wants to
 * count something.
 */
export function track(event: string, data?: Record<string, unknown>): void {
  if (typeof window === "undefined") return
  window.umami?.track(event, data)
}
