import { describe, expect, test } from "bun:test"
import { resolveUmamiConfig } from "../src/lib/analytics"

describe("resolveUmamiConfig", () => {
  test("is off without a website id", () => {
    expect(resolveUmamiConfig({})).toBeNull()
    expect(resolveUmamiConfig({ scriptUrl: "https://umami.example.com/script.js" })).toBeNull()
  })

  test("treats a blank website id as unset", () => {
    expect(resolveUmamiConfig({ websiteId: "   " })).toBeNull()
  })

  test("falls back to the default instance", () => {
    const config = resolveUmamiConfig({ websiteId: "abc-123" })
    expect(config).toEqual({ websiteId: "abc-123", scriptUrl: "https://linesofcode-umami.vercel.app/script.js" })
  })

  test("accepts an instance origin as well as a script URL", () => {
    expect(resolveUmamiConfig({ websiteId: "abc", scriptUrl: "https://umami.example.com/" })?.scriptUrl).toBe(
      "https://umami.example.com/script.js",
    )
    expect(resolveUmamiConfig({ websiteId: "abc", scriptUrl: "https://umami.example.com/custom.js" })?.scriptUrl).toBe(
      "https://umami.example.com/custom.js",
    )
  })

  test("passes a domain allowlist through, and omits an empty one", () => {
    expect(resolveUmamiConfig({ websiteId: "abc", domains: "towncenter.dev" })?.domains).toBe("towncenter.dev")
    expect(resolveUmamiConfig({ websiteId: "abc", domains: "  " })).not.toHaveProperty("domains")
  })
})
