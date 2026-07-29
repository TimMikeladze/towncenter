import Image from "next/image"
import { cn } from "@/lib/utils"
import { getEntityImagePath } from "@/lib/utils/images"

const SIZES = {
  xs: { box: "h-6 w-6", px: 24 },
  sm: { box: "h-8 w-8", px: 32 },
  md: { box: "h-11 w-11", px: 44 },
  lg: { box: "h-16 w-16", px: 64 },
  xl: { box: "h-24 w-24", px: 96 },
} as const

/** Framed game art. One frame everywhere so icons never look pasted-on. */
export function EntityIcon({
  src,
  alt,
  size = "md",
  className,
}: {
  src: string | null | undefined
  alt: string
  size?: keyof typeof SIZES
  className?: string
}) {
  const { box, px } = SIZES[size]
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/60",
        box,
        className,
      )}
    >
      <Image
        src={getEntityImagePath(src)}
        alt={alt}
        width={px}
        height={px}
        className="h-full w-full object-contain p-0.5"
      />
    </span>
  )
}
