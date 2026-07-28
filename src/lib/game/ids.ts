/** Civilizations are keyed by name upstream; URLs use a slug. */
export function civId(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-")
}
