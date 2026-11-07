// Which clicks and which URL hashes open the conversation sheet.
// Pure functions, so tests can cover the rules without a browser.

/** What the sheet is being asked to show. */
export type SheetTarget = 'start' | 'waitlist';

/** The hrefs of this page's own calls to action. Links to /#start from other pages are plain links there (the sheet lives on the home page). */
const HREFS: Readonly<Record<string, SheetTarget>> = {
  '#start': 'start',
  '/#start': 'start',
  '#waitlist': 'waitlist',
  '/#waitlist': 'waitlist',
};

export interface ClickInfo {
  /** The raw href attribute of the link that was clicked, or null if it has none. */
  href: string | null;
  /** MouseEvent.button: 0 is the primary button. */
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  /** Something else already handled this click. */
  defaultPrevented: boolean;
  /** The link's target attribute, if any. */
  target?: string | null;
  /** True when the link has a download attribute. */
  download?: boolean;
}

/**
 * Should this click open the sheet? Only a plain, primary-button click on a link to #start or #waitlist does.
 * A modified click (open in a new tab or window), a non-primary button, a click someone else already handled,
 * a link that opens elsewhere, and any other link are left to the browser.
 */
export function sheetTargetForClick(c: ClickInfo): SheetTarget | null {
  if (c.defaultPrevented) return null;
  if (c.button !== 0) return null;
  if (c.metaKey || c.ctrlKey || c.shiftKey || c.altKey) return null;
  if (c.download) return null;
  if (c.target && c.target !== '_self') return null;
  if (c.href === null) return null;
  return HREFS[c.href.trim()] ?? null;
}

/** Does this location hash ask for the sheet? Used when the home page loads (or the hash changes). */
export function sheetTargetForHash(hash: string): SheetTarget | null {
  if (hash === '#start') return 'start';
  if (hash === '#waitlist') return 'waitlist';
  return null;
}
