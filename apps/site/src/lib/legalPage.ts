// Picks the legal page content for the build mode. Only the privacy page has a here.now variant (three sections).
// Relative imports on purpose: the tests load this file without the @/ alias.
import { legal, type LegalPageContent, type LegalSection } from '../content/legal';
import type { BuildMode } from './buildMode';

/**
 * In the here.now build, replaces the privacy sections that have a variant with it, matching on the heading.
 * In the default build, and for every other page, returns the page as it is.
 */
export function legalPageForMode(page: LegalPageContent, mode: BuildMode): LegalPageContent {
  if (mode !== 'herenow' || page.slug !== 'privacy') return page;
  const variants = new Map<string, LegalSection>(legal.privacyHerenow.sections.map((s) => [s.h, s]));
  return { ...page, sections: page.sections.map((s) => variants.get(s.h) ?? s) };
}
