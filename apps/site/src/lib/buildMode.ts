// Which way this site was built.
//
//   default  the normal Next.js build: API routes, Resend delivery, indexable.
//   herenow  the static export for here.now (npm run build:herenow): forms post to here.now Site Data, and the preview is
//            hidden from search engines.
//
// scripts/build-herenow.mjs sets NEXT_PUBLIC_HERENOW=1. Next inlines the value into the browser code at build time,
// so it must be read as the literal expression below. Pure helpers take the mode as an argument so tests can pass either.

export type BuildMode = 'default' | 'herenow';

export const BUILD_MODE: BuildMode = process.env.NEXT_PUBLIC_HERENOW === '1' ? 'herenow' : 'default';
export const IS_HERENOW: boolean = BUILD_MODE === 'herenow';

/** The robots meta content for the here.now preview, or null in the default build (no tag is added). */
export function robotsMeta(mode: BuildMode): string | null {
  return mode === 'herenow' ? 'noindex, nofollow' : null;
}
