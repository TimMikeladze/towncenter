/**
 * `unit_attacks`, `unit_armours`, `building_attacks` and `building_armours` are
 * all (entity, class, amount) tables. The queries aggregate them into a single
 * "class:amount,class:amount" string so one row comes back per entity; this
 * unpacks that, keeping the first amount seen for a repeated class.
 */
export function parseClassPairs(raw: string | null): { key: number; amount: number }[] {
  if (!raw) return []
  const seen = new Map<number, number>()
  for (const entry of raw.split(",")) {
    const [key, amount] = entry.split(":")
    const id = Number(key)
    if (Number.isNaN(id) || seen.has(id)) continue
    seen.set(id, Number(amount))
  }
  return [...seen].map(([key, amount]) => ({ key, amount }))
}
