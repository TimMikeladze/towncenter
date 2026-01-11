export function getEntityImagePath(imagePath: string | null | undefined, fallback: string = '/img/missing.webp'): string {
  if (!imagePath) return fallback
  // Image path from DB is like "img/Civs/armenians.webp"
  // Prepend / to make it absolute
  return `/${imagePath}`
}
