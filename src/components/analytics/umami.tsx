import Script from "next/script"
import { umamiConfig } from "@/lib/analytics"

/**
 * Loads the Umami tracker, or renders nothing when it is not configured.
 *
 * `afterInteractive` keeps a third-party request off the critical path: a page
 * view that is recorded a moment late still counts, and one that delays the
 * first paint costs a real reader real time.
 */
export function UmamiAnalytics() {
  if (!umamiConfig) return null

  return (
    <Script
      src={umamiConfig.scriptUrl}
      strategy="afterInteractive"
      data-website-id={umamiConfig.websiteId}
      {...(umamiConfig.domains ? { "data-domains": umamiConfig.domains } : {})}
    />
  )
}
