# Dependency refresh and social cards

1. Refresh the Bun manifest and lockfile with the current releases. Keep TypeScript at the existing resolution and run the app checks against the updated dependencies.
2. Keep the App Router's shared `/api/og` endpoint. Give each section its own palette and artwork. Use the entity's artwork and existing SEO copy on detail cards, with section artwork as a fallback. Generate 1200 × 630 PNGs on demand and cache each image URL.
3. Check metadata and image rendering in a production build, including pages with long copy and missing artwork. Commit the changes and push to `main`.
