"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="touch-target">
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="touch-target"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

/**
 * The same control shaped as a list row, for the phone's "More" sheet. The
 * header's icon button has no room there, and a bare icon in a list of labelled
 * destinations reads as a section rather than a switch.
 */
export function ThemeToggleRow({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Until the client knows the resolved theme, the row would name the wrong
  // target. Reserve its height rather than render a lie that flips on mount.
  const isDark = mounted && resolvedTheme === "dark"
  const Icon = isDark ? Sun : Moon

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn("press flex w-full items-start gap-3 rounded-md px-3 py-3 text-left active:bg-muted", className)}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      <span className="min-w-0">
        <span className="block text-sm font-medium">Theme</span>
        <span className="block text-xs text-muted-foreground">
          {mounted ? `Switch to ${isDark ? "light" : "dark"} mode` : " "}
        </span>
      </span>
    </button>
  )
}
