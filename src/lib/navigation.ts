import {
  Building2,
  Castle,
  Crosshair,
  GitCompareArrows,
  Home,
  Map as MapIcon,
  Network,
  Scroll,
  Shield,
  Sparkles,
  Swords,
  TrendingUp,
} from "lucide-react"

export interface NavItem {
  href: string
  label: string
  shortLabel?: string
  description: string
  icon: typeof Swords
}

/** Single source of truth for the header, the mobile tab bar and the home grid. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/units", label: "Units", description: "Stats, costs and matchups for every unit", icon: Swords },
  {
    href: "/civilizations",
    label: "Civilizations",
    shortLabel: "Civs",
    description: "Bonuses, unique units and tech tree gaps",
    icon: Castle,
  },
  { href: "/buildings", label: "Buildings", description: "Structures, defences and what they train", icon: Building2 },
  {
    href: "/technologies",
    label: "Technologies",
    shortLabel: "Techs",
    description: "Every upgrade with cost, time and effect",
    icon: Scroll,
  },
  { href: "/tech-tree", label: "Tech Tree", description: "What a civ can train, build and research", icon: Network },
  { href: "/counters", label: "Counters", description: "Both sides of a unit's matchups", icon: Shield },
  {
    href: "/battle",
    label: "Battle",
    description: "Simulate any fight, with upgrades and unit counts",
    icon: Crosshair,
  },
  { href: "/compare", label: "Compare", description: "Up to four units side by side", icon: GitCompareArrows },
  { href: "/maps", label: "Maps", description: "Map types and recommended civs", icon: MapIcon },
  { href: "/changes", label: "Changes", description: "Stat differences from the last data export", icon: Sparkles },
  {
    href: "/competitive",
    label: "Competitive",
    description: "Matchups, build orders and calculators",
    icon: TrendingUp,
  },
]

/**
 * The three destinations that earn a slot in the mobile tab bar. The other two
 * slots are fixed: search, which every page needs and no page owns, and
 * "More", which opens a sheet onto everything left over.
 */
export const MOBILE_TAB_HREFS = ["/units", "/civilizations", "/tech-tree"]

/**
 * The front page. Kept out of `NAV_ITEMS` because it is not a section — it is
 * the page that lists them — but it still needs to be reachable from the
 * chrome, which on a phone means the "More" sheet and nowhere else.
 */
export const HOME_ITEM: NavItem = {
  href: "/",
  label: "Home",
  description: "Everything the app can do, on one page",
  icon: Home,
}

/**
 * Whether a nav entry should read as current.
 *
 * The root is matched exactly, because every path in the app starts with "/" —
 * a prefix test lights up Home on every screen and, in the tab bar, lights up
 * "More" along with it.
 */
export function isRouteActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}
