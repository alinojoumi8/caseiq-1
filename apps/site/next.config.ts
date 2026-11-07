import type { NextConfig } from "next";
import path from "node:path";

// Two build modes.
//
//   default   `npm run build` / `next start`: the API routes, Resend delivery, .data/leads.jsonl in development.
//   here.now  `npm run build:herenow`: a static export in out/. here.now hosts static files only, so the form posts go
//             to its Site Data endpoints and the preview is hidden from search engines. See README.md.
//
// scripts/build-herenow.mjs switches the mode on with NEXT_PUBLIC_HERENOW=1. The NEXT_PUBLIC_ prefix is what lets the
// browser code read the same flag (src/lib/buildMode.ts).
const herenow = process.env.NEXT_PUBLIC_HERENOW === "1";

const nextConfig: NextConfig = {
  /* config options here */
  // The static export cannot prerender the metadata routes (robots, sitemap, the Open Graph image) while Cache Components
  // is on: it asks for `export const dynamic = "force-static"`, and that export is not allowed with Cache Components.
  // So the here.now build turns both off. (Partial Prefetching requires Cache Components.) The default build keeps them.
  cacheComponents: !herenow,
  partialPrefetching: !herenow,
  turbopack: {
    // A stray lockfile above the repo made Next pick the wrong root; pin it to this app.
    // The here.now build runs in a staging copy inside the app folder (see scripts/build-herenow.mjs) and points this at the app folder.
    root: process.env.CASEIQ_APP_ROOT ?? path.resolve(process.cwd()),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  ...(herenow
    ? {
        // Static export. Every page becomes name/index.html, and next/link hrefs get the trailing slash.
        output: "export" as const,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
