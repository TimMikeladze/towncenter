/**
 * A tick of haptic feedback, where the platform has one.
 *
 * Android fires it through the Vibration API. iOS does not implement that API
 * at all, so on an iPhone this is a no-op rather than a fallback — there is no
 * web-exposed Taptic Engine, and the tricks that reach it (a hidden switch
 * control, an audio blip) either break with an OS update or make noise.
 *
 * Kept to single-digit milliseconds: navigation feedback should register as
 * texture, not as the phone buzzing in a pocket.
 */
type Intensity = "tick" | "select" | "commit"

const PATTERNS: Record<Intensity, number> = {
  tick: 4,
  select: 8,
  commit: 12,
}

export function haptic(intensity: Intensity = "select") {
  if (typeof window === "undefined" || typeof navigator === "undefined") return
  // Someone who has asked the system to calm down does not want the phone
  // buzzing at them either.
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return
  navigator.vibrate?.(PATTERNS[intensity])
}
