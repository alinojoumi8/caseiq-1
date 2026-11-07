// Fills the {tokens} in the copy from src/content/site.ts (siteConfig).
// A placeholder never renders. While a value is unset, the fragment that needs it is left out:
// a sentence, a list point, or a clause. These helpers are pure: pass a config in tests, the real one is the default.
// Relative imports on purpose: the tests load this file without the @/ alias.
import { siteConfig, type SiteConfig } from '../content/site';

type Vars = Record<string, string | null | undefined>;

/** Replaces {name} with its value. A token whose value is missing is left as it is, so callers drop those first. */
export function fillTokens(template: string, vars: Vars): string {
  return template.replace(/\{(\w+)\}/g, (whole, name: string) => vars[name] ?? whole);
}

function hasMissingToken(text: string, vars: Vars): boolean {
  for (const m of text.matchAll(/\{(\w+)\}/g)) if (vars[m[1]] == null) return true;
  return false;
}

/** Fills the tokens, and drops every sentence that needs a value that is unset. A question and its answer ("Nothing by Monday? Write to ...") count as one sentence. */
export function fillSentences(template: string, vars: Vars): string {
  return template
    .split(/(?<=[.!])\s+/)
    .filter((sentence) => !hasMissingToken(sentence, vars))
    .map((sentence) => fillTokens(sentence, vars))
    .join(' ')
    .trim();
}

/** S6 points. The turnaround point is left out while its value is unset. */
export interface FoundingPoint {
  text: string;
  needs?: 'turnaroundDays';
}
export function foundingPoints(points: readonly FoundingPoint[], cfg: SiteConfig = siteConfig): string[] {
  const out: string[] = [];
  for (const p of points) {
    if (p.needs === 'turnaroundDays' && cfg.turnaroundDays == null) continue;
    out.push(fillTokens(p.text, { days: cfg.turnaroundDays == null ? null : String(cfg.turnaroundDays) }));
  }
  return out;
}

/** S5 step body, with its turnaround sentence added only while the number of days is set. */
export function stepBody(step: { body: string; turnaround?: string }, cfg: SiteConfig = siteConfig): string {
  if (!step.turnaround || cfg.turnaroundDays == null) return step.body;
  return `${step.body} ${fillTokens(step.turnaround, { days: String(cfg.turnaroundDays) })}`;
}

export interface FaqSource {
  id: string;
  q: string;
  a: string;
  aNoDays?: string;
}
/** S11 items. FAQ 4 switches to its no-days answer while the turnaround is unset. */
export function faqItems(items: readonly FaqSource[], cfg: SiteConfig = siteConfig): { id: string; q: string; a: string }[] {
  const days = cfg.turnaroundDays == null ? null : String(cfg.turnaroundDays);
  return items.map((it) => ({
    id: it.id,
    q: it.q,
    a: it.aNoDays && days == null ? it.aNoDays : fillTokens(it.a, { days }),
  }));
}

/** The "Prefer email?" line, or null while there is no contact email. */
export function emailLine(template: string, cfg: SiteConfig = siteConfig): string | null {
  return cfg.contactEmail ? fillTokens(template, { email: cfg.contactEmail }) : null;
}

/** "Case IQ Inc., 123 Main St, hello@..." with whatever parts are set (the brand stands in for an unset legal entity), or an empty string when neither is. */
export function senderLine(brand: string, cfg: SiteConfig = siteConfig): string {
  if (!cfg.mailingAddress && !cfg.contactEmail) return '';
  return [cfg.legalEntity ?? brand, cfg.mailingAddress, cfg.contactEmail].filter(Boolean).join(', ');
}

/** A CASL consent text: the wording, then the sender line when there is one to show. */
export function consentText(base: string, brand: string, cfg: SiteConfig = siteConfig): string {
  const sender = senderLine(brand, cfg);
  return sender ? `${base} ${sender}` : base;
}

/** The send-failed message, with the email fallback only while an address is set. */
export function submitError(en: { submit: string; submitNoEmail: string }, cfg: SiteConfig = siteConfig): string {
  return cfg.contactEmail ? fillTokens(en.submit, { email: cfg.contactEmail }) : en.submitNoEmail;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

/** The weekday name of the next business day after `from` (Monday to Friday, holidays ignored). */
export function nextBusinessDay(from: Date): string {
  const d = new Date(from.getTime());
  do {
    d.setDate(d.getDate() + 1);
  } while (d.getDay() === 0 || d.getDay() === 6);
  return DAYS[d.getDay()];
}

/** The success message. {method} and {nextBusinessDay} are filled; the "Write to" sentence is dropped while there is no email. */
export function successBody(
  template: string,
  method: string,
  nextDay: string,
  cfg: SiteConfig = siteConfig,
): string {
  return fillSentences(template, { method, nextBusinessDay: nextDay, email: cfg.contactEmail });
}

export function copyrightLine(template: string, brand: string, cfg: SiteConfig = siteConfig): string {
  return fillTokens(template, { entity: cfg.legalEntity ?? brand });
}

/** Legal page paragraphs: {contactLine} and {addressLine} become the real line, or its "to be confirmed" version. {entityLine} becomes the real line, or is dropped while there is no legal entity. */
export function legalParas(
  paras: readonly string[],
  lines: { entityLine: string; contactLine: string; contactTbc: string; addressLine: string; addressTbc: string },
  cfg: SiteConfig = siteConfig,
): string[] {
  const out: string[] = [];
  for (const p of paras) {
    if (p === '{entityLine}') {
      if (cfg.legalEntity) out.push(fillTokens(lines.entityLine, { entity: cfg.legalEntity }));
    } else if (p === '{contactLine}') {
      out.push(cfg.contactEmail ? fillTokens(lines.contactLine, { email: cfg.contactEmail }) : lines.contactTbc);
    } else if (p === '{addressLine}') {
      out.push(cfg.mailingAddress ? fillTokens(lines.addressLine, { address: cfg.mailingAddress }) : lines.addressTbc);
    } else {
      out.push(p);
    }
  }
  return out;
}
