import type { Unit } from "@/lib/types"
import { BASE_MELEE_CLASS, BASE_PIERCE_CLASS } from "./classes"

/** Gold is the scarce resource; weight it above food/wood when pricing a unit. */
const GOLD_WEIGHT = 1.5
const STONE_WEIGHT = 1.5

export function resourceCost(unit: Unit): number {
  const { food = 0, wood = 0, gold = 0, stone = 0 } = unit.cost
  return food + wood + gold * GOLD_WEIGHT + stone * STONE_WEIGHT
}

function armourAgainst(defender: Unit, classId: number): number {
  if (classId === BASE_MELEE_CLASS) return defender.stats.meleeArmor
  if (classId === BASE_PIERCE_CLASS) return defender.stats.pierceArmor
  const armour = defender.stats.armorClasses.find((ac) => ac.id === classId)
  return armour ? armour.amount : Number.NEGATIVE_INFINITY
}

/**
 * Damage per hit, following the game's rules: every attack class the attacker
 * has is matched against the defender's armour of that class, and a hit always
 * lands for at least 1.
 */
export function damagePerHit(attacker: Unit, defender: Unit): number {
  let total = 0
  for (const attack of attacker.stats.attackBonuses) {
    const armour = armourAgainst(defender, attack.classId)
    if (armour === Number.NEGATIVE_INFINITY) continue
    total += Math.max(0, attack.bonus - armour)
  }
  return Math.max(1, total)
}

/** Projectile hit chance as a 0-1 multiplier; melee attacks always connect. */
export function accuracyFactor(attacker: Unit): number {
  const accuracy = attacker.stats.accuracy ?? 100
  return Math.min(100, Math.max(0, accuracy)) / 100
}

/** Sustained damage per second, discounted by projectile accuracy. */
export function damagePerSecond(attacker: Unit, defender: Unit): number {
  const reload = attacker.stats.attackSpeed
  if (!reload || reload <= 0) return 0
  return (damagePerHit(attacker, defender) * accuracyFactor(attacker)) / reload
}

/** Landed hits needed to kill, ignoring misses. */
export function hitsToKill(attacker: Unit, defender: Unit): number {
  const damage = damagePerHit(attacker, defender)
  if (damage <= 0) return Number.POSITIVE_INFINITY
  return Math.ceil(defender.stats.hp / damage)
}

/**
 * Seconds for one attacker to kill one defender: the first swing lands after
 * the attack delay, every later one after a full reload, and misses cost a
 * whole reload cycle.
 */
export function timeToKill(attacker: Unit, defender: Unit): number {
  const hits = hitsToKill(attacker, defender)
  if (!Number.isFinite(hits)) return Number.POSITIVE_INFINITY
  const accuracy = accuracyFactor(attacker)
  if (accuracy <= 0) return Number.POSITIVE_INFINITY
  const swings = hits / accuracy
  return (attacker.stats.attackDelay ?? 0) + (swings - 1) * attacker.stats.attackSpeed
}

function canAttack(unit: Unit): boolean {
  return unit.stats.attackBonuses.length > 0 && unit.stats.attackSpeed > 0
}

const NAVAL_TYPES = new Set(["Naval"])

/** Ships and land units never meet, so they are not counters for each other. */
function sameDomain(a: Unit, b: Unit): boolean {
  return NAVAL_TYPES.has(a.type) === NAVAL_TYPES.has(b.type)
}

export interface Matchup {
  unitId: string
  score: number
}

/**
 * How decisively `attacker` beats `defender`, normalized by resource cost.
 * Above 1 means the attacker wins the trade; below 1 means it loses it.
 */
export function matchupScore(attacker: Unit, defender: Unit): number | null {
  if (!canAttack(attacker) || !canAttack(defender)) return null
  const attackerDps = damagePerSecond(attacker, defender)
  const defenderDps = damagePerSecond(defender, attacker)
  if (attackerDps <= 0 || defenderDps <= 0) return null

  const timeToKillDefender = defender.stats.hp / attackerDps
  const timeToKillAttacker = attacker.stats.hp / defenderDps
  if (timeToKillDefender <= 0) return null

  const costRatio = resourceCost(defender) / Math.max(1, resourceCost(attacker))
  return (timeToKillAttacker / timeToKillDefender) * costRatio
}

const COUNTER_LIMIT = 6
/** A matchup has to be lopsided before it is worth calling a counter. */
const STRONG_THRESHOLD = 1.5
const WEAK_THRESHOLD = 1 / STRONG_THRESHOLD

/**
 * Derive, for every unit, the units it beats and the units that beat it,
 * purely from attack/armour/cost data.
 */
export function deriveCounters(units: Unit[]): Map<string, { goodAgainst: string[]; counters: string[] }> {
  const pool = units.filter((unit) => unit.type !== "Economy" && canAttack(unit))
  const result = new Map<string, { goodAgainst: string[]; counters: string[] }>()

  for (const unit of units) {
    if (!canAttack(unit)) {
      result.set(unit.id, { goodAgainst: [], counters: [] })
      continue
    }

    const scored: Matchup[] = []
    for (const other of pool) {
      if (other.id === unit.id || !sameDomain(unit, other)) continue
      const score = matchupScore(unit, other)
      if (score === null) continue
      scored.push({ unitId: other.id, score })
    }

    const goodAgainst = scored
      .filter((m) => m.score >= STRONG_THRESHOLD)
      .sort((a, b) => b.score - a.score)
      .slice(0, COUNTER_LIMIT)
      .map((m) => m.unitId)

    const counters = scored
      .filter((m) => m.score <= WEAK_THRESHOLD)
      .sort((a, b) => a.score - b.score)
      .slice(0, COUNTER_LIMIT)
      .map((m) => m.unitId)

    result.set(unit.id, { goodAgainst, counters })
  }

  return result
}

/** HP + damage output per resource spent, for cost-efficiency ranking. */
export function costEfficiency(unit: Unit): number {
  const cost = resourceCost(unit)
  if (cost <= 0) return 0
  const dps = unit.stats.attackSpeed > 0 ? unit.stats.attack / unit.stats.attackSpeed : 0
  return (unit.stats.hp + dps * 20) / cost
}
