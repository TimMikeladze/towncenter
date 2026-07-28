import type { Unit, UnitCost } from "@/lib/types"
import { accuracyFactor, damagePerHit, damagePerSecond, resourceCost } from "./combat"

/**
 * Deterministic army-vs-army resolution.
 *
 * Both stacks fire in volleys on their own reload clock. Damage lands on one
 * target at a time and overkill is discarded, so high-damage low-rate units
 * (Bombard Cannon, Mangonel) correctly waste damage on cheap targets the way
 * they do in game. Accuracy is applied as an expected fraction of connecting
 * hits rather than a dice roll, which keeps the result reproducible.
 *
 * Deliberately not modelled: kiting after contact, unit collision, blast
 * radius, conversion, healing, hills and terrain.
 */

export interface BattleSide {
  unit: Unit
  count: number
}

export interface BattleTick {
  time: number
  a: number
  b: number
}

export interface BattleSideResult {
  survivors: number
  /** Health left on the damaged front unit, 0-1. */
  frontHp: number
  losses: number
  resourcesLost: UnitCost
  weightedLost: number
  damagePerHit: number
  damagePerSecond: number
  hitsToKill: number
  /** Seconds of free shots before the enemy closes the range gap. */
  freeFireTime: number
}

export interface BattleResult {
  winner: "a" | "b" | "draw"
  elapsed: number
  a: BattleSideResult
  b: BattleSideResult
  timeline: BattleTick[]
  /** Resources destroyed per resource spent, from side A's point of view. */
  tradeRatio: number
  stalemate: boolean
}

const MAX_TIME = 600
/** Cap the walk-in window so a Trebuchet does not "win" a field battle on paper. */
const MAX_CLOSING_TIME = 25

interface Stack {
  unit: Unit
  alive: number
  frontHp: number
  nextShot: number
  damage: number
  hits: number
}

function makeStack(side: BattleSide, enemy: Unit, startDelay: number): Stack {
  return {
    unit: side.unit,
    alive: side.count,
    frontHp: side.unit.stats.hp,
    nextShot: startDelay + (side.unit.stats.attackDelay ?? 0),
    damage: damagePerHit(side.unit, enemy),
    hits: 0,
  }
}

/** Apply a (possibly fractional) number of hits, discarding overkill per hit. */
function applyVolley(target: Stack, hits: number, damage: number) {
  let remaining = hits
  while (remaining > 0 && target.alive > 0) {
    const share = Math.min(1, remaining)
    target.frontHp -= damage * share
    remaining -= share
    if (target.frontHp <= 0) {
      target.alive -= 1
      target.frontHp = target.unit.stats.hp
    }
  }
}

function canFight(unit: Unit): boolean {
  return unit.stats.attackSpeed > 0 && unit.stats.attackBonuses.length > 0
}

function lostResources(unit: Unit, losses: number): UnitCost {
  const cost = unit.cost
  return {
    food: (cost.food ?? 0) * losses || undefined,
    wood: (cost.wood ?? 0) * losses || undefined,
    gold: (cost.gold ?? 0) * losses || undefined,
    stone: (cost.stone ?? 0) * losses || undefined,
  }
}

/**
 * Seconds the longer-ranged side shoots for free while the other walks in.
 * A stationary side (siege with no melee answer) never closes.
 */
function closingTime(shooter: Unit, closer: Unit): number {
  const gap = (shooter.stats.range ?? 0) - (closer.stats.range ?? 0)
  if (gap <= 0) return 0
  const speed = closer.stats.movementSpeed
  if (!speed || speed <= 0) return MAX_CLOSING_TIME
  return Math.min(MAX_CLOSING_TIME, gap / speed)
}

export function simulateBattle(
  sideA: BattleSide,
  sideB: BattleSide,
  options: { allowFreeFire?: boolean } = {},
): BattleResult {
  const allowFreeFire = options.allowFreeFire ?? true
  const aFights = canFight(sideA.unit)
  const bFights = canFight(sideB.unit)

  const freeA = allowFreeFire && aFights ? closingTime(sideA.unit, sideB.unit) : 0
  const freeB = allowFreeFire && bFights ? closingTime(sideB.unit, sideA.unit) : 0

  const a = makeStack(sideA, sideB.unit, 0)
  const b = makeStack(sideB, sideA.unit, 0)
  // Only one side can be out-ranged, so at most one start delay is non-zero.
  a.nextShot += freeB
  b.nextShot += freeA

  const accA = accuracyFactor(sideA.unit)
  const accB = accuracyFactor(sideB.unit)

  const timeline: BattleTick[] = [{ time: 0, a: a.alive, b: b.alive }]
  let time = 0

  while (a.alive > 0 && b.alive > 0 && time < MAX_TIME) {
    const nextA = aFights && a.damage > 0 ? a.nextShot : Number.POSITIVE_INFINITY
    const nextB = bFights && b.damage > 0 ? b.nextShot : Number.POSITIVE_INFINITY
    const next = Math.min(nextA, nextB)
    if (!Number.isFinite(next)) break

    time = next
    // Simultaneous volleys resolve together, so a mutual kill is a mutual kill.
    const firesA = nextA === next
    const firesB = nextB === next
    const aliveA = a.alive
    const aliveB = b.alive

    if (firesA) {
      applyVolley(b, aliveA * accA, a.damage)
      a.hits += aliveA
      a.nextShot = time + a.unit.stats.attackSpeed
    }
    if (firesB) {
      applyVolley(a, aliveB * accB, b.damage)
      b.hits += aliveB
      b.nextShot = time + b.unit.stats.attackSpeed
    }

    timeline.push({ time: Number(time.toFixed(2)), a: a.alive, b: b.alive })
  }

  const stalemate = a.alive > 0 && b.alive > 0
  const winner = a.alive > 0 && b.alive === 0 ? "a" : b.alive > 0 && a.alive === 0 ? "b" : "draw"

  const lossesA = sideA.count - a.alive
  const lossesB = sideB.count - b.alive
  const weightedA = lossesA * resourceCost(sideA.unit)
  const weightedB = lossesB * resourceCost(sideB.unit)

  const result = (
    stack: Stack,
    side: BattleSide,
    enemy: Unit,
    losses: number,
    weighted: number,
    free: number,
  ): BattleSideResult => ({
    survivors: stack.alive,
    frontHp: stack.alive > 0 ? Math.max(0, stack.frontHp) / side.unit.stats.hp : 0,
    losses,
    resourcesLost: lostResources(side.unit, losses),
    weightedLost: Math.round(weighted),
    damagePerHit: stack.damage,
    damagePerSecond: Number(damagePerSecond(side.unit, enemy).toFixed(2)),
    hitsToKill: stack.damage > 0 ? Math.ceil(enemy.stats.hp / stack.damage) : Number.POSITIVE_INFINITY,
    freeFireTime: Number(free.toFixed(1)),
  })

  return {
    winner,
    elapsed: Number(time.toFixed(1)),
    a: result(a, sideA, sideB.unit, lossesA, weightedA, freeA),
    b: result(b, sideB, sideA.unit, lossesB, weightedB, freeB),
    timeline,
    tradeRatio: weightedA > 0 ? Number((weightedB / weightedA).toFixed(2)) : weightedB > 0 ? Infinity : 1,
    stalemate,
  }
}

/**
 * The largest enemy stack `sideA` still beats. Answers "how many Pikemen does
 * it take to stop 10 Paladins" without hand-tuning counts.
 */
export function breakEvenCount(
  sideA: BattleSide,
  enemy: Unit,
  options: { allowFreeFire?: boolean; max?: number } = {},
): number | null {
  const max = options.max ?? 200
  let low = 1
  let high = max
  let best: number | null = null

  // Monotone in enemy count: more enemies never helps side A.
  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    const outcome = simulateBattle(sideA, { unit: enemy, count: mid }, options)
    if (outcome.winner === "a") {
      best = mid
      low = mid + 1
    } else {
      high = mid - 1
    }
  }

  return best
}

/** Count of `unit` that a given weighted-resource budget buys, at least one. */
export function countForBudget(unit: Unit, budget: number): number {
  const cost = resourceCost(unit)
  if (cost <= 0) return 1
  return Math.max(1, Math.round(budget / cost))
}
